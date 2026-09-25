<?php

namespace App\Services\Market;

use App\Models\MarketSetting;
use App\Models\MarketSnapshot;
use App\Services\Market\DTO\MarketQuoteDTO;
use App\Services\Market\Exceptions\MarketProviderException;
use App\Services\Market\Exceptions\MarketProviderInvalidResponseException;
use App\Services\Market\Exceptions\MarketProviderRateLimitException;
use App\Services\Market\Exceptions\MarketProviderTimeoutException;
use App\Services\Market\Exceptions\MarketProviderUnauthorizedException;
use App\Services\Market\Exceptions\MarketProviderUnavailableException;
use App\Services\Market\Providers\MarketProviderFactory;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class MarketDataService
{
    protected MarketProviderFactory $factory;
    protected int $cacheTtl;
    protected int $staleThreshold;

    public const CACHE_KEY = 'market_overview_cache_v3';
    public const STALE_CACHE_KEY = 'market_overview_last_known_good_v3';

    public function __construct(?MarketProviderFactory $factory = null)
    {
        $this->factory = $factory ?? new MarketProviderFactory();
        $this->cacheTtl = (int) (MarketSetting::get('market_cache_ttl') ?: config('services.market.cache_ttl', 60));
        $this->staleThreshold = (int) (MarketSetting::get('market_stale_threshold') ?: config('services.market.stale_threshold', 300));
    }

    /**
     * Retrieve market overview with caching, stale evaluation, and error resilience.
     */
    public function getMarketOverview(): array
    {
        $data = Cache::remember(self::CACHE_KEY, $this->cacheTtl, function () {
            return $this->fetchAndProcess();
        });

        // Evaluate stale condition (Section 16)
        if (isset($data['fetched_at'])) {
            $fetchedAt = Carbon::parse($data['fetched_at']);
            $ageSeconds = now()->diffInSeconds($fetchedAt);
            if ($ageSeconds > $this->staleThreshold) {
                $data['is_stale'] = true;
                $data['is_realtime'] = false;
                $data['notice'] = "Data may be stale. Last verified at {$data['last_updated']}.";
            }
        }

        return $data;
    }

    /**
     * Force refresh bypassing cache.
     */
    public function refreshMarketOverview(): array
    {
        Cache::forget(self::CACHE_KEY);
        return $this->getMarketOverview();
    }

    /**
     * Get indices list directly.
     */
    public function getIndices(): array
    {
        $overview = $this->getMarketOverview();
        return $overview['indices'] ?? [];
    }

    /**
     * Get top gainers directly.
     */
    public function getTopGainers(): array
    {
        $overview = $this->getMarketOverview();
        return $overview['top_gainers'] ?? $overview['gainers'] ?? [];
    }

    /**
     * Get top losers directly.
     */
    public function getTopLosers(): array
    {
        $overview = $this->getMarketOverview();
        return $overview['top_losers'] ?? $overview['losers'] ?? [];
    }

    /**
     * Get market operational status directly.
     */
    public function getMarketStatus(): array
    {
        $overview = $this->getMarketOverview();
        $statusStr = is_string($overview['market_status'] ?? null)
            ? $overview['market_status']
            : ($overview['market_status']['status'] ?? 'closed');

        return [
            'status' => $statusStr,
            'is_open' => $statusStr === 'open',
            'session' => $statusStr,
            'exchange' => 'NSE/BSE',
            'timezone' => 'Asia/Kolkata',
            'last_updated' => $overview['last_updated'] ?? now()->toIso8601String(),
            'data_source' => $overview['data_source'] ?? 'Market Data Feed',
            'is_realtime' => $overview['is_realtime'] ?? false,
            'is_delayed' => $overview['is_delayed'] ?? true,
            'delay_minutes' => $overview['delay_minutes'] ?? 15,
        ];
    }

    /**
     * Get single quote by symbol.
     */
    public function getQuote(string $symbol): ?array
    {
        $overview = $this->getMarketOverview();
        $all = array_merge($overview['indices'] ?? [], $overview['symbols'] ?? []);
        $target = strtoupper(trim($symbol));

        foreach ($all as $item) {
            if (strtoupper($item['symbol'] ?? '') === $target) {
                return $item;
            }
        }

        return null;
    }

    /**
     * Get multiple quotes by symbols.
     */
    public function getQuotes(array $symbols): array
    {
        $overview = $this->getMarketOverview();
        $all = array_merge($overview['indices'] ?? [], $overview['symbols'] ?? []);
        $search = array_map('strtoupper', array_map('trim', $symbols));

        return array_values(array_filter($all, function ($q) use ($search) {
            return in_array(strtoupper($q['symbol'] ?? ''), $search);
        }));
    }

    /**
     * Get timestamp of last market update.
     */
    public function getLastUpdated(): ?string
    {
        $overview = $this->getMarketOverview();
        return $overview['last_updated'] ?? null;
    }

    /**
     * Fetch from provider, validate, dynamically compute gainers/losers, record snapshot, or handle failure.
     */
    public function fetchAndProcess(): array
    {
        $provider = $this->factory->make();

        try {
            $raw = $provider->fetchMarketData();

            $isDelayed = isset($raw['is_delayed']) ? (bool)$raw['is_delayed'] : $provider->isDelayed();
            $isRealtime = isset($raw['is_realtime']) ? (bool)$raw['is_realtime'] : (!$isDelayed);
            $delayMinutes = isset($raw['delay_minutes']) ? (int)$raw['delay_minutes'] : $provider->getDelayMinutes();
            $providerName = $raw['provider_name'] ?? $raw['data_source'] ?? $provider->getProviderName();
            $marketStatus = strtolower($raw['market_status'] ?? 'closed');
            $currency = $raw['currency'] ?? 'INR';
            $lastUpdated = $raw['last_updated'] ?? now()->toIso8601String();
            $isDemo = (bool) ($raw['is_demo'] ?? false);

            $context = [
                'provider_name' => $providerName,
                'is_delayed' => $isDelayed,
                'is_realtime' => $isRealtime,
                'delay_minutes' => $delayMinutes,
                'market_status' => $marketStatus,
                'currency' => $currency,
                'last_updated' => $lastUpdated,
            ];

            // 1. Normalize Indices
            $normalizedIndices = MarketDataTransformer::transformQuotes($raw['indices'] ?? [], $context);

            // 2. Normalize Stocks
            $normalizedStocks = MarketDataTransformer::transformQuotes($raw['stocks'] ?? [], $context);

            // 3. Section 9: Dynamically compute top gainers and top losers from valid provider stocks
            $topGainers = MarketDataTransformer::extractTopGainers($normalizedStocks, 5);
            $topLosers = MarketDataTransformer::extractTopLosers($normalizedStocks, 5);

            $notice = $isDemo
                ? 'DEMO DATA: Live external market provider is not configured. Displaying simulated market quotes for local development only.'
                : ($isDelayed
                    ? "DELAYED DATA: Quotes are delayed by {$delayMinutes} minutes as per exchange terms."
                    : 'LIVE DATA: Real-time quotes directly from exchange provider.');

            $result = [
                'status' => 'success',
                'is_available' => true,
                'is_demo' => $isDemo,
                'is_delayed' => $isDelayed,
                'is_realtime' => $isRealtime,
                'delay_minutes' => $delayMinutes,
                'market_status' => $marketStatus,
                'provider' => $providerName,
                'data_source' => $providerName,
                'last_updated' => $lastUpdated,
                'fetched_at' => now()->toIso8601String(),
                'is_stale' => false,
                'notice' => $notice,
                'indices' => $normalizedIndices,
                'top_gainers' => $topGainers,
                'top_losers' => $topLosers,
                // Backwards-compatible aliases
                'gainers' => $topGainers,
                'losers' => $topLosers,
                'symbols' => $normalizedStocks,
            ];

            // Store in stale fallback cache (valid for 24h in case provider goes down)
            Cache::put(self::STALE_CACHE_KEY, $result, now()->addHours(24));

            // Section 18: Record snapshot with retention rules
            $this->recordSnapshot($result);

            return $result;
        } catch (MarketProviderTimeoutException $e) {
            Log::warning('Market provider timeout: ' . $e->getMessage());
            return $this->handleProviderFailure('Market provider connection timed out.');
        } catch (MarketProviderUnauthorizedException $e) {
            Log::error('Market provider unauthorized: ' . $e->getMessage());
            return $this->handleProviderFailure('Market provider authentication failed.');
        } catch (MarketProviderRateLimitException $e) {
            Log::warning('Market provider rate limited: ' . $e->getMessage());
            return $this->handleProviderFailure('Market provider rate limit reached.');
        } catch (MarketProviderInvalidResponseException $e) {
            Log::error('Market provider returned invalid payload: ' . $e->getMessage());
            return $this->handleProviderFailure('Market provider payload was malformed or incomplete.');
        } catch (MarketProviderUnavailableException $e) {
            Log::error('Market provider unavailable: ' . $e->getMessage());
            return $this->handleProviderFailure('Market provider is currently unavailable.');
        } catch (Throwable $e) {
            Log::critical('Unexpected market service error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return $this->handleProviderFailure('An unexpected error occurred while fetching market quotes.');
        }
    }

    /**
     * Handle provider failure without inventing fake numbers.
     */
    protected function handleProviderFailure(string $internalReason): array
    {
        // Check if we have stale/cached data from an earlier successful fetch
        $stale = Cache::get(self::STALE_CACHE_KEY);

        if (is_array($stale) && !empty($stale['indices'])) {
            $stale['status'] = 'stale';
            $stale['is_available'] = true;
            $stale['is_stale'] = true;
            $stale['is_realtime'] = false;
            $stale['notice'] = "Market data temporarily unavailable. Displaying last verified data as of {$stale['last_updated']}.";
            return $stale;
        }

        // Section 15: If provider fails: DO NOT show fake numbers.
        return [
            'status' => 'unavailable',
            'is_available' => false,
            'is_stale' => true,
            'is_demo' => false,
            'is_delayed' => true,
            'is_realtime' => false,
            'delay_minutes' => 15,
            'market_status' => 'closed',
            'provider' => config('services.market.provider', 'Market Data Provider'),
            'data_source' => 'Market Data Feed',
            'last_updated' => null,
            'fetched_at' => null,
            'notice' => 'Market data temporarily unavailable.',
            'message' => 'Market data temporarily unavailable.',
            'error_reason' => app()->environment('production') ? null : $internalReason,
            'indices' => [],
            'top_gainers' => [],
            'top_losers' => [],
            'gainers' => [],
            'losers' => [],
            'symbols' => [],
        ];
    }

    /**
     * Section 18: Record snapshot and prune old records to avoid unchecked database growth.
     */
    protected function recordSnapshot(array $payload): void
    {
        try {
            MarketSnapshot::create([
                'provider' => $payload['provider'] ?? 'Market Data Provider',
                'data_payload' => $payload,
                'is_demo' => (bool) ($payload['is_demo'] ?? false),
                'fetched_at' => now(),
            ]);

            // Retention rule: Retain only snapshots from the last 7 days and prune remainder
            MarketSnapshot::where('created_at', '<', now()->subDays(7))->delete();
        } catch (Throwable $e) {
            Log::warning('Failed to record market snapshot: ' . $e->getMessage());
        }
    }
}
