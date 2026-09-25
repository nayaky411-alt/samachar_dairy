<?php

namespace App\Services\Market\Providers;

use App\Models\MarketSetting;
use App\Services\Market\Contracts\MarketDataProviderInterface;
use App\Services\Market\Exceptions\MarketProviderUnavailableException;

class MarketProviderFactory
{
    protected static ?MarketDataProviderInterface $customProvider = null;

    /**
     * For automated testing: inject a custom/mock provider.
     */
    public static function setCustomProvider(?MarketDataProviderInterface $provider): void
    {
        self::$customProvider = $provider;
    }

    /**
     * Resolve the appropriate market data provider according to environment, database settings, and .env.
     */
    public function make(): MarketDataProviderInterface
    {
        if (self::$customProvider !== null) {
            return self::$customProvider;
        }

        $isProduction = app()->environment('production');

        // Check if Channel Head configured a provider in database settings first
        $configuredProvider = MarketSetting::get('market_provider');
        $providerType = strtolower(trim((string) ($configuredProvider ?: config('services.market.provider', 'yahoo'))));

        $apiUrl = MarketSetting::get('market_api_url') ?: config('services.market.url');
        $apiKey = config('services.market.key');
        $apiSecret = config('services.market.secret');
        $timeout = (int) (MarketSetting::get('market_api_timeout') ?: config('services.market.timeout', 6));
        $delayedMinutes = (int) config('services.market.delayed_minutes', 15);
        $demoMode = filter_var(config('services.market.demo_mode', false), FILTER_VALIDATE_BOOLEAN);

        // Section 30: Production must NEVER automatically use demo provider.
        if ($isProduction) {
            if ($providerType === 'demo' || $demoMode) {
                throw new MarketProviderUnavailableException(
                    'Configuration Error: Demo market provider is strictly forbidden in production. Please configure an authorized market provider in .env.'
                );
            }

            if (empty($providerType)) {
                throw new MarketProviderUnavailableException(
                    'Configuration Error: MARKET_DATA_PROVIDER is missing in production.'
                );
            }

            if ($providerType === 'yahoo') {
                return new YahooFinanceMarketProvider(timeout: $timeout);
            }

            return new ConfiguredMarketProvider(
                apiUrl: $apiUrl,
                apiKey: $apiKey,
                apiSecret: $apiSecret,
                timeout: $timeout,
                delayedMinutes: $delayedMinutes
            );
        }

        // Local development mode
        if ($providerType === 'demo' || $demoMode) {
            return new DemoMarketProvider();
        }

        if (!empty($apiUrl) || in_array($providerType, ['rest', 'configured', 'api'])) {
            return new ConfiguredMarketProvider(
                apiUrl: $apiUrl,
                apiKey: $apiKey,
                apiSecret: $apiSecret,
                timeout: $timeout,
                delayedMinutes: $delayedMinutes
            );
        }

        if ($providerType === 'yahoo') {
            return new YahooFinanceMarketProvider(timeout: $timeout);
        }

        return new YahooFinanceMarketProvider(timeout: $timeout);
    }
}
