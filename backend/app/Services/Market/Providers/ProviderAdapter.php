<?php

namespace App\Services\Market\Providers;

use App\Services\Market\Contracts\MarketDataProviderInterface;
use App\Services\Market\MarketDataTransformer;

abstract class ProviderAdapter implements MarketDataProviderInterface
{
    protected ?array $cachedSnapshot = null;

    /**
     * Get snapshot array from provider (internal helper).
     */
    protected function getSnapshot(): array
    {
        if ($this->cachedSnapshot === null) {
            $this->cachedSnapshot = $this->fetchMarketData();
        }
        return $this->cachedSnapshot;
    }

    public function getIndices(): array
    {
        $data = $this->getSnapshot();
        return $data['indices'] ?? [];
    }

    public function getQuote(string $symbol): ?array
    {
        $quotes = $this->getQuotes([$symbol]);
        return $quotes[0] ?? null;
    }

    public function getQuotes(array $symbols): array
    {
        $data = $this->getSnapshot();
        $all = array_merge($data['indices'] ?? [], $data['stocks'] ?? []);
        $search = array_map('strtoupper', array_map('trim', $symbols));

        return array_values(array_filter($all, function ($q) use ($search) {
            return in_array(strtoupper($q['symbol'] ?? ''), $search);
        }));
    }

    public function getTopGainers(): array
    {
        $data = $this->getSnapshot();
        $stocks = $data['stocks'] ?? [];
        return MarketDataTransformer::extractTopGainers($stocks, 5);
    }

    public function getTopLosers(): array
    {
        $data = $this->getSnapshot();
        $stocks = $data['stocks'] ?? [];
        return MarketDataTransformer::extractTopLosers($stocks, 5);
    }

    public function getMarketStatus(): array
    {
        $data = $this->getSnapshot();
        $status = strtolower($data['market_status'] ?? $this->calculateMarketStatus());
        return [
            'status' => $status,
            'is_open' => $status === 'open',
            'session' => $status,
            'exchange' => 'NSE/BSE',
            'timezone' => 'Asia/Kolkata',
            'last_updated' => $this->getLastUpdated(),
        ];
    }

    public function getLastUpdated(): ?string
    {
        $data = $this->getSnapshot();
        return $data['last_updated'] ?? now()->toIso8601String();
    }

    public function isRealtime(): bool
    {
        return !$this->isDelayed();
    }

    /**
     * Standard IST market hours calculation (09:15 - 15:30 IST Mon-Fri).
     */
    protected function calculateMarketStatus(): string
    {
        $now = now()->timezone('Asia/Kolkata');
        $day = (int) $now->format('w'); // 0=Sun, 6=Sat

        if ($day === 0 || $day === 6) {
            return 'closed';
        }

        $time = $now->format('H:i');
        if ($time >= '09:00' && $time < '09:15') {
            return 'pre-open';
        }
        if ($time >= '09:15' && $time <= '15:30') {
            return 'open';
        }
        if ($time > '15:30' && $time <= '16:00') {
            return 'post-market';
        }

        return 'closed';
    }
}
