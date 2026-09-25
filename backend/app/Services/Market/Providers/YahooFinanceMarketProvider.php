<?php

namespace App\Services\Market\Providers;

use App\Models\MarketSymbol;
use App\Services\Market\DTO\MarketQuoteDTO;
use App\Services\Market\Exceptions\MarketProviderTimeoutException;
use App\Services\Market\Exceptions\MarketProviderUnavailableException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class YahooFinanceMarketProvider extends ProviderAdapter
{
    protected int $timeout;

    /**
     * Standard tracked indices mapping: Display Name => Yahoo ticker.
     */
    protected array $indexMap = [
        'NIFTY 50' => '^NSEI',
        'SENSEX' => '^BSESN',
        'BANK NIFTY' => '^NSEBANK',
        'NIFTY IT' => '^CNXIT',
    ];

    /**
     * Standard constituent NSE stock symbols.
     */
    protected array $defaultStockSymbols = [
        'RELIANCE' => 'RELIANCE.NS',
        'TCS' => 'TCS.NS',
        'HDFCBANK' => 'HDFCBANK.NS',
        'INFY' => 'INFY.NS',
        'ICICIBANK' => 'ICICIBANK.NS',
        'BHARTIARTL' => 'BHARTIARTL.NS',
        'SBIN' => 'SBIN.NS',
        'ITC' => 'ITC.NS',
        'HINDUNILVR' => 'HINDUNILVR.NS',
        'LT' => 'LT.NS',
        'BAJFINANCE' => 'BAJFINANCE.NS',
        'TATAMOTORS' => 'TATAMOTORS.NS',
        'SUNPHARMA' => 'SUNPHARMA.NS',
        'MARUTI' => 'MARUTI.NS',
        'WIPRO' => 'WIPRO.NS',
        'TATASTEEL' => 'TATASTEEL.NS',
        'TECHM' => 'TECHM.NS',
    ];

    public function __construct(int $timeout = 6)
    {
        $this->timeout = $timeout ?: (int) config('services.market.timeout', 6);
    }

    public function fetchMarketData(): array
    {
        try {
            // Load active symbols from database if available, else use default list
            $activeStocks = MarketSymbol::where('instrument_type', 'stock')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->pluck('symbol')
                ->toArray();

            $symbolsToFetch = !empty($activeStocks) ? $activeStocks : array_keys($this->defaultStockSymbols);

            $allRequests = [];
            foreach ($this->indexMap as $displayName => $ticker) {
                $allRequests[$displayName] = [
                    'ticker' => $ticker,
                    'is_index' => true,
                    'displayName' => $displayName,
                ];
            }

            foreach ($symbolsToFetch as $symbol) {
                $ticker = $this->defaultStockSymbols[$symbol] ?? ($symbol . '.NS');
                $allRequests[$symbol] = [
                    'ticker' => $ticker,
                    'is_index' => false,
                    'displayName' => $symbol,
                ];
            }

            // Perform concurrent requests using HTTP pool
            $responses = Http::pool(function (Pool $pool) use ($allRequests) {
                $headers = [
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ];

                $calls = [];
                foreach ($allRequests as $key => $meta) {
                    $encodedTicker = urlencode($meta['ticker']);
                    $calls[$key] = $pool->as($key)
                        ->withHeaders($headers)
                        ->timeout($this->timeout)
                        ->get("https://query1.finance.yahoo.com/v8/finance/chart/{$encodedTicker}?interval=1d&range=1d");
                }
                return $calls;
            });

            $indices = [];
            $stocks = [];
            $marketStatus = $this->calculateMarketStatus();
            $nowIso = now()->toIso8601String();

            foreach ($allRequests as $key => $meta) {
                $resp = $responses[$key] ?? null;
                if (!$resp || !$resp->successful()) {
                    continue;
                }

                $json = $resp->json();
                $chartMeta = $json['chart']['result'][0]['meta'] ?? null;
                if (!$chartMeta) {
                    continue;
                }

                $price = $chartMeta['regularMarketPrice'] ?? $chartMeta['fulldayPrice'] ?? null;
                if ($price === null || !is_numeric($price) || (float)$price <= 0) {
                    continue;
                }

                $prevClose = $chartMeta['chartPreviousClose'] ?? $chartMeta['previousClose'] ?? null;
                $change = $chartMeta['fulldayChange'] ?? (isset($prevClose) ? ($price - $prevClose) : 0);
                $changePct = $chartMeta['regularMarketChangePercent'] ?? $chartMeta['fulldayChangePercent'] ?? null;
                if ($changePct === null && isset($prevClose) && $prevClose > 0) {
                    $changePct = (($price - $prevClose) / $prevClose) * 100;
                }

                $exchange = !empty($chartMeta['fullExchangeName'])
                    ? $chartMeta['fullExchangeName']
                    : (!empty($chartMeta['exchangeName']) ? $chartMeta['exchangeName'] : 'NSE');

                $quoteData = [
                    'symbol' => $meta['is_index'] ? $key : ($chartMeta['symbol'] ?? $key),
                    'name' => $meta['is_index'] ? ($chartMeta['shortName'] ?? $key) : ($chartMeta['longName'] ?? $chartMeta['shortName'] ?? $key),
                    'exchange' => $exchange,
                    'currency' => $chartMeta['currency'] ?? 'INR',
                    'ltp' => (float)$price,
                    'previous_close' => isset($prevClose) ? (float)$prevClose : null,
                    'change' => (float)$change,
                    'change_percent' => (float)$changePct,
                    'open' => isset($chartMeta['regularMarketOpen']) ? (float)$chartMeta['regularMarketOpen'] : null,
                    'high' => isset($chartMeta['regularMarketDayHigh']) ? (float)$chartMeta['regularMarketDayHigh'] : null,
                    'low' => isset($chartMeta['regularMarketDayLow']) ? (float)$chartMeta['regularMarketDayLow'] : null,
                    'volume' => isset($chartMeta['regularMarketVolume']) ? (int)$chartMeta['regularMarketVolume'] : null,
                    'year_high' => isset($chartMeta['fiftyTwoWeekHigh']) ? (float)$chartMeta['fiftyTwoWeekHigh'] : null,
                    'year_low' => isset($chartMeta['fiftyTwoWeekLow']) ? (float)$chartMeta['fiftyTwoWeekLow'] : null,
                    'market_status' => $marketStatus,
                    'is_realtime' => false,
                    'is_delayed' => true,
                    'delay_minutes' => 15,
                    'data_source' => $this->getProviderName(),
                    'last_updated' => $nowIso,
                ];

                try {
                    $dto = MarketQuoteDTO::fromArray($quoteData);
                    if ($meta['is_index']) {
                        $indices[] = $dto->toArray();
                    } else {
                        $stocks[] = $dto->toArray();
                    }
                } catch (\InvalidArgumentException $e) {
                    Log::warning('Skipping invalid quote from Yahoo Finance: ' . $e->getMessage());
                }
            }

            if (empty($indices)) {
                throw new MarketProviderUnavailableException('Yahoo Finance feed returned empty indices data.');
            }

            return [
                'provider_name' => $this->getProviderName(),
                'data_source' => $this->getProviderName(),
                'is_delayed' => true,
                'is_realtime' => false,
                'delay_minutes' => 15,
                'market_status' => $marketStatus,
                'currency' => 'INR',
                'last_updated' => $nowIso,
                'indices' => $indices,
                'stocks' => $stocks,
                'is_demo' => false,
            ];
        } catch (ConnectionException $e) {
            Log::error('YahooFinance connection timeout: ' . $e->getMessage());
            throw new MarketProviderTimeoutException('Connection to market data feed timed out: ' . $e->getMessage());
        } catch (MarketProviderUnavailableException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('YahooFinance provider error: ' . $e->getMessage());
            throw new MarketProviderUnavailableException('Failed to retrieve live market data: ' . $e->getMessage());
        }
    }

    public function getProviderName(): string
    {
        return 'NSE / BSE Data Feed (Delayed 15m)';
    }

    public function isDelayed(): bool
    {
        return true;
    }

    public function getDelayMinutes(): int
    {
        return 15;
    }

    public function isRealtime(): bool
    {
        return false;
    }
}
