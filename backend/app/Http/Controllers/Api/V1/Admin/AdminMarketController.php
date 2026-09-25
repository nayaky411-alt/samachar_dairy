<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\MarketSetting;
use App\Models\MarketSymbol;
use App\Services\Market\MarketDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminMarketController extends Controller
{
    /**
     * Get market configuration and provider diagnostics.
     */
    public function settings(MarketDataService $marketService): JsonResponse
    {
        $providerType = MarketSetting::get('market_provider', config('services.market.provider', 'yahoo'));
        $apiUrl = MarketSetting::get('market_api_url', config('services.market.url', ''));
        $cacheTtl = (int) (MarketSetting::get('market_cache_ttl') ?: config('services.market.cache_ttl', 60));
        $refreshInterval = (int) (MarketSetting::get('market_refresh_interval') ?: config('services.market.refresh_interval', 30));
        $staleThreshold = (int) (MarketSetting::get('market_stale_threshold') ?: config('services.market.stale_threshold', 300));
        $apiTimeout = (int) (MarketSetting::get('market_api_timeout') ?: config('services.market.timeout', 6));

        // Diagnostics from active service
        $overview = $marketService->getMarketOverview();

        return response()->json([
            'success' => true,
            'data' => [
                'provider' => $providerType,
                'api_url' => $apiUrl,
                'cache_ttl' => $cacheTtl,
                'refresh_interval' => $refreshInterval,
                'stale_threshold' => $staleThreshold,
                'api_timeout' => $apiTimeout,
                'is_production' => app()->environment('production'),
                'diagnostics' => [
                    'provider_name' => $overview['data_source'] ?? $overview['provider'] ?? 'Market Data Provider',
                    'market_status' => $overview['market_status'] ?? 'closed',
                    'is_available' => $overview['is_available'] ?? false,
                    'is_delayed' => $overview['is_delayed'] ?? true,
                    'is_realtime' => $overview['is_realtime'] ?? false,
                    'delay_minutes' => $overview['delay_minutes'] ?? 15,
                    'is_demo' => $overview['is_demo'] ?? false,
                    'is_stale' => $overview['is_stale'] ?? false,
                    'last_updated' => $overview['last_updated'] ?? null,
                    'notice' => $overview['notice'] ?? null,
                ],
            ],
        ]);
    }

    /**
     * Update market settings (strictly without fake prices).
     */
    public function updateSettings(Request $request, MarketDataService $marketService): JsonResponse
    {
        $validated = $request->validate([
            'provider' => 'required|string|in:yahoo,configured,rest,api,demo',
            'api_url' => 'nullable|string',
            'cache_ttl' => 'required|integer|min:5|max:3600',
            'refresh_interval' => 'required|integer|min:10|max:3600',
            'stale_threshold' => 'required|integer|min:30|max:86400',
            'api_timeout' => 'nullable|integer|min:1|max:60',
        ]);

        // Section 30: Block demo provider in production
        if (app()->environment('production') && $validated['provider'] === 'demo') {
            return response()->json([
                'success' => false,
                'message' => 'Demo provider cannot be enabled in production environment.',
            ], 422);
        }

        MarketSetting::set('market_provider', $validated['provider'], 'Selected market data feed provider adapter');
        MarketSetting::set('market_api_url', $validated['api_url'] ?? '', 'Configured external REST feed URL');
        MarketSetting::set('market_cache_ttl', $validated['cache_ttl'], 'Cache time-to-live in seconds');
        MarketSetting::set('market_refresh_interval', $validated['refresh_interval'], 'Frontend auto-refresh interval in seconds');
        MarketSetting::set('market_stale_threshold', $validated['stale_threshold'], 'Stale cache warning threshold in seconds');
        if (isset($validated['api_timeout'])) {
            MarketSetting::set('market_api_timeout', $validated['api_timeout'], 'Provider HTTP timeout in seconds');
        }

        // Purge market cache so new settings immediately take effect
        Cache::forget(MarketDataService::CACHE_KEY);

        return response()->json([
            'success' => true,
            'message' => 'Market settings updated successfully.',
        ]);
    }

    /**
     * List all tracked symbols and indices.
     */
    public function symbols(): JsonResponse
    {
        $symbols = MarketSymbol::orderBy('sort_order')->orderBy('symbol')->get();

        return response()->json([
            'success' => true,
            'data' => $symbols,
        ]);
    }

    /**
     * Add a new tracked instrument (strictly metadata, NO prices).
     */
    public function storeSymbol(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'symbol' => 'required|string|max:50|unique:market_symbols,symbol',
            'name' => 'required|string|max:100',
            'display_name' => 'nullable|string|max:100',
            'exchange' => 'required|string|in:NSE,BSE,MCX',
            'instrument_type' => 'required|string|in:index,stock,etf',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $symbol = MarketSymbol::create([
            'symbol' => strtoupper(trim($validated['symbol'])),
            'name' => trim($validated['name']),
            'display_name' => !empty($validated['display_name']) ? trim($validated['display_name']) : trim($validated['name']),
            'exchange' => strtoupper(trim($validated['exchange'])),
            'instrument_type' => $validated['instrument_type'],
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        Cache::forget(MarketDataService::CACHE_KEY);

        return response()->json([
            'success' => true,
            'message' => "Instrument {$symbol->symbol} registered successfully.",
            'data' => $symbol,
        ]);
    }

    /**
     * Update tracked instrument metadata.
     */
    public function updateSymbol(Request $request, int $id): JsonResponse
    {
        $symbol = MarketSymbol::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'display_name' => 'nullable|string|max:100',
            'exchange' => 'sometimes|required|string|in:NSE,BSE,MCX',
            'instrument_type' => 'sometimes|required|string|in:index,stock,etf',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $symbol->update($validated);
        Cache::forget(MarketDataService::CACHE_KEY);

        return response()->json([
            'success' => true,
            'message' => "Instrument {$symbol->symbol} updated successfully.",
            'data' => $symbol,
        ]);
    }

    /**
     * Toggle instrument active status.
     */
    public function toggleSymbol(int $id): JsonResponse
    {
        $symbol = MarketSymbol::findOrFail($id);
        $symbol->is_active = !$symbol->is_active;
        $symbol->save();

        Cache::forget(MarketDataService::CACHE_KEY);

        return response()->json([
            'success' => true,
            'message' => "Instrument {$symbol->symbol} status toggled.",
            'data' => $symbol,
        ]);
    }

    /**
     * Remove instrument from registry.
     */
    public function destroySymbol(int $id): JsonResponse
    {
        $symbol = MarketSymbol::findOrFail($id);
        $symbolName = $symbol->symbol;
        $symbol->delete();

        Cache::forget(MarketDataService::CACHE_KEY);

        return response()->json([
            'success' => true,
            'message' => "Instrument {$symbolName} removed.",
        ]);
    }

    /**
     * Trigger immediate cache bypass and feed refresh.
     */
    public function refreshFeed(MarketDataService $marketService): JsonResponse
    {
        $refreshed = $marketService->refreshMarketOverview();

        return response()->json([
            'success' => true,
            'message' => 'Market cache cleared and feed refreshed.',
            'data' => $refreshed,
        ]);
    }
}
