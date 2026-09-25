<?php

namespace App\Services\Market\Providers;

use App\Services\Market\Exceptions\MarketProviderInvalidResponseException;
use App\Services\Market\Exceptions\MarketProviderRateLimitException;
use App\Services\Market\Exceptions\MarketProviderTimeoutException;
use App\Services\Market\Exceptions\MarketProviderUnauthorizedException;
use App\Services\Market\Exceptions\MarketProviderUnavailableException;
use App\Services\Market\MarketDataTransformer;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ConfiguredMarketProvider extends ProviderAdapter
{
    protected ?string $apiUrl;
    protected ?string $apiKey;
    protected ?string $apiSecret;
    protected int $timeout;
    protected int $delayedMinutes;
    protected bool $isRealtime;
    protected string $providerName;

    public function __construct(
        ?string $apiUrl = null,
        ?string $apiKey = null,
        ?string $apiSecret = null,
        int $timeout = 5,
        int $delayedMinutes = 15,
        bool $isRealtime = false,
        string $providerName = 'Authorized Exchange Market Feed'
    ) {
        $this->apiUrl = $apiUrl ?? config('services.market.url');
        $this->apiKey = $apiKey ?? config('services.market.key');
        $this->apiSecret = $apiSecret ?? config('services.market.secret');
        $this->timeout = $timeout ?: (int) config('services.market.timeout', 5);
        $this->delayedMinutes = $delayedMinutes ?: (int) config('services.market.delayed_minutes', 15);
        $this->isRealtime = $isRealtime;
        $this->providerName = $providerName;
    }

    public function fetchMarketData(): array
    {
        if (empty($this->apiUrl)) {
            throw new MarketProviderUnavailableException('Configured market API URL is not set in environment or settings.');
        }

        try {
            $client = Http::timeout($this->timeout);

            $headers = [];
            if (!empty($this->apiKey)) {
                $headers['Authorization'] = 'Bearer ' . $this->apiKey;
                $headers['X-API-KEY'] = $this->apiKey;
            }
            if (!empty($this->apiSecret)) {
                $headers['X-API-SECRET'] = $this->apiSecret;
            }
            if (!empty($headers)) {
                $client = $client->withHeaders($headers);
            }

            $endpoint = rtrim($this->apiUrl, '/');
            if (!str_contains($endpoint, '/overview') && !str_contains($endpoint, '/market') && !str_contains($endpoint, '/quotes') && !str_contains($endpoint, '/chart')) {
                $endpoint .= '/overview';
            }
            $response = $client->get($endpoint);

            if ($response->status() === 401 || $response->status() === 403) {
                throw new MarketProviderUnauthorizedException("Market provider authentication failed (HTTP {$response->status()}).");
            }

            if ($response->status() === 429) {
                throw new MarketProviderRateLimitException('Market provider rate limit exceeded.');
            }

            if ($response->serverError()) {
                throw new MarketProviderUnavailableException("Market provider service is unavailable (HTTP {$response->status()}).");
            }

            if (!$response->successful()) {
                throw new MarketProviderUnavailableException("Market provider returned HTTP {$response->status()}.");
            }

            $payload = $response->json();
            if (!is_array($payload)) {
                throw new MarketProviderInvalidResponseException('Market provider returned invalid or non-JSON response.');
            }

            $indicesRaw = $payload['indices'] ?? $payload['data']['indices'] ?? [];
            $stocksRaw = $payload['stocks'] ?? $payload['data']['stocks'] ?? [];

            if (!is_array($indicesRaw)) {
                throw new MarketProviderInvalidResponseException("Market provider response is missing 'indices' array.");
            }

            $context = [
                'provider_name' => $payload['provider_name'] ?? $payload['data_source'] ?? $this->getProviderName(),
                'is_delayed' => isset($payload['is_delayed']) ? (bool)$payload['is_delayed'] : !$this->isRealtime,
                'is_realtime' => isset($payload['is_realtime']) ? (bool)$payload['is_realtime'] : $this->isRealtime,
                'delay_minutes' => isset($payload['delay_minutes']) ? (int)$payload['delay_minutes'] : $this->delayedMinutes,
                'market_status' => $payload['market_status'] ?? $this->calculateMarketStatus(),
                'currency' => $payload['currency'] ?? 'INR',
                'last_updated' => $payload['last_updated'] ?? now()->toIso8601String(),
            ];

            $indices = MarketDataTransformer::transformQuotes($indicesRaw, $context);
            $stocks = MarketDataTransformer::transformQuotes($stocksRaw, $context);

            return [
                'provider_name' => $context['provider_name'],
                'data_source' => $context['provider_name'],
                'is_delayed' => $context['is_delayed'],
                'is_realtime' => $context['is_realtime'],
                'delay_minutes' => $context['delay_minutes'],
                'market_status' => $context['market_status'],
                'currency' => $context['currency'],
                'last_updated' => $context['last_updated'],
                'indices' => $indices,
                'stocks' => $stocks,
                'is_demo' => false,
            ];
        } catch (ConnectionException $e) {
            Log::error('ConfiguredMarketProvider timeout: ' . $e->getMessage());
            throw new MarketProviderTimeoutException('Connection timed out after ' . $this->timeout . 's.');
        } catch (RequestException $e) {
            Log::error('ConfiguredMarketProvider request error: ' . $e->getMessage());
            throw new MarketProviderUnavailableException('HTTP request failed: ' . $e->getMessage());
        }
    }

    public function getProviderName(): string
    {
        return $this->providerName;
    }

    public function isDelayed(): bool
    {
        return !$this->isRealtime;
    }

    public function getDelayMinutes(): int
    {
        return $this->delayedMinutes;
    }

    public function isRealtime(): bool
    {
        return $this->isRealtime;
    }
}
