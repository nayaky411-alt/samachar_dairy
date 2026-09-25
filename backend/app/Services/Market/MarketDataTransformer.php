<?php

namespace App\Services\Market;

use App\Services\Market\DTO\MarketQuoteDTO;
use Illuminate\Support\Facades\Log;

class MarketDataTransformer
{
    /**
     * Transform an array of raw quote payloads into normalized MarketQuoteDTO arrays.
     */
    public static function transformQuotes(array $rawQuotes, array $context = []): array
    {
        $normalized = [];
        foreach ($rawQuotes as $raw) {
            if (!is_array($raw)) {
                continue;
            }

            try {
                $merged = array_merge($raw, [
                    'market_status' => $context['market_status'] ?? $raw['market_status'] ?? 'closed',
                    'currency' => $raw['currency'] ?? $context['currency'] ?? 'INR',
                    'last_updated' => $raw['last_updated'] ?? $context['last_updated'] ?? now()->toIso8601String(),
                    'is_delayed' => $context['is_delayed'] ?? $raw['is_delayed'] ?? true,
                    'is_realtime' => $context['is_realtime'] ?? $raw['is_realtime'] ?? false,
                    'delay_minutes' => $context['delay_minutes'] ?? $raw['delay_minutes'] ?? 15,
                    'data_source' => $context['provider_name'] ?? $raw['data_source'] ?? 'Market Data Feed',
                ]);

                $dto = MarketQuoteDTO::fromArray($merged);
                $normalized[] = $dto->toArray();
            } catch (\InvalidArgumentException $e) {
                Log::warning('MarketDataTransformer skipped quote: ' . $e->getMessage(), ['raw' => $raw]);
            }
        }

        return $normalized;
    }

    /**
     * Dynamically compute top gainers from a list of normalized quotes.
     */
    public static function extractTopGainers(array $quotes, int $limit = 5): array
    {
        return collect($quotes)
            ->filter(fn ($q) => isset($q['change_percent']) && (float)$q['change_percent'] > 0)
            ->sortByDesc(fn ($q) => (float)$q['change_percent'])
            ->take($limit)
            ->values()
            ->toArray();
    }

    /**
     * Dynamically compute top losers from a list of normalized quotes.
     */
    public static function extractTopLosers(array $quotes, int $limit = 5): array
    {
        return collect($quotes)
            ->filter(fn ($q) => isset($q['change_percent']) && (float)$q['change_percent'] < 0)
            ->sortBy(fn ($q) => (float)$q['change_percent'])
            ->take($limit)
            ->values()
            ->toArray();
    }
}
