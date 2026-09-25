<?php

namespace Tests\Feature;

use App\Services\Market\Contracts\MarketDataProviderInterface;
use App\Services\Market\Providers\ProviderAdapter;
use App\Services\Market\Exceptions\MarketProviderTimeoutException;
use App\Services\Market\Exceptions\MarketProviderUnavailableException;
use App\Services\Market\MarketDataService;
use App\Services\Market\Providers\DemoMarketProvider;
use App\Services\Market\Providers\MarketProviderFactory;
use App\Services\Market\Providers\RestApiMarketProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MarketDataServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        MarketProviderFactory::setCustomProvider(null);
    }

    protected function tearDown(): void
    {
        MarketProviderFactory::setCustomProvider(null);
        Cache::flush();
        parent::tearDown();
    }

    /**
     * Requirement 6 & 7: Successful market response with all normalized fields.
     */
    public function test_successful_market_response_with_normalized_fields(): void
    {
        Http::fake([
            '*/overview*' => Http::response([
                'provider_name' => 'NSE Official Rest Feed',
                'is_delayed' => true,
                'delay_minutes' => 15,
                'market_status' => 'open',
                'currency' => 'INR',
                'last_updated' => '2026-09-23T11:00:00+05:30',
                'indices' => [
                    [
                        'symbol' => 'NIFTY 50',
                        'display_name' => 'NSE NIFTY 50',
                        'value' => 25345.60,
                        'absolute_change' => 125.40,
                        'percentage_change' => 0.50,
                        'previous_close' => 25220.20,
                        'open' => 25250.00,
                        'day_high' => 25380.00,
                        'day_low' => 25230.00,
                        'exchange' => 'NSE',
                    ],
                    [
                        'symbol' => 'SENSEX',
                        'display_name' => 'BSE Sensex 30',
                        'value' => 82950.10,
                        'absolute_change' => 410.20,
                        'percentage_change' => 0.50,
                        'previous_close' => 82539.90,
                        'open' => 82600.00,
                        'day_high' => 83050.00,
                        'day_low' => 82550.00,
                        'exchange' => 'BSE',
                    ],
                    [
                        'symbol' => 'BANK NIFTY',
                        'display_name' => 'Nifty Bank Index',
                        'value' => 52180.00,
                        'absolute_change' => -60.00,
                        'percentage_change' => -0.11,
                        'previous_close' => 52240.00,
                        'exchange' => 'NSE',
                    ],
                    [
                        'symbol' => 'NIFTY IT',
                        'display_name' => 'Nifty IT Index',
                        'value' => 41920.00,
                        'absolute_change' => 310.00,
                        'percentage_change' => 0.75,
                        'previous_close' => 41610.00,
                        'exchange' => 'NSE',
                    ],
                ],
                'stocks' => [
                    [
                        'symbol' => 'INFY',
                        'display_name' => 'Infosys Ltd.',
                        'value' => 1930.50,
                        'absolute_change' => 45.20,
                        'percentage_change' => 2.40,
                        'previous_close' => 1885.30,
                    ],
                    [
                        'symbol' => 'TCS',
                        'display_name' => 'Tata Consultancy Services',
                        'value' => 4250.00,
                        'absolute_change' => -35.00,
                        'percentage_change' => -0.82,
                        'previous_close' => 4285.00,
                    ],
                ],
            ], 200),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.key', 'test-key-12345');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertEquals('success', $response['status']);
        $this->assertTrue($response['is_available']);
        $this->assertFalse($response['is_demo']);
        $this->assertTrue($response['is_delayed']);
        $this->assertEquals(15, $response['delay_minutes']);
        $this->assertEquals('open', $response['market_status']);
        $this->assertEquals('NSE Official Rest Feed', $response['data_source']);

        $indices = $response['indices'];
        $this->assertCount(4, $indices);

        $nifty = collect($indices)->firstWhere('symbol', 'NIFTY 50');
        $this->assertNotNull($nifty);
        $this->assertEquals('NSE NIFTY 50', $nifty['display_name']);
        $this->assertEquals(25345.60, $nifty['value']);
        $this->assertEquals(125.40, $nifty['absolute_change']);
        $this->assertEquals(0.50, $nifty['percentage_change']);
        $this->assertEquals(25220.20, $nifty['previous_close']);
        $this->assertEquals(25250.00, $nifty['open']);
        $this->assertEquals(25380.00, $nifty['day_high']);
        $this->assertEquals(25230.00, $nifty['day_low']);
        $this->assertEquals('open', $nifty['market_status']);
        $this->assertEquals('NSE', $nifty['exchange']);
        $this->assertEquals('INR', $nifty['currency']);
        $this->assertTrue($nifty['is_delayed']);
        $this->assertEquals('NSE Official Rest Feed', $nifty['data_source']);
    }

    /**
     * Requirement 8 & 9: Timeout handling returns unavailable without inventing numbers.
     */
    public function test_provider_timeout_returns_unavailable_without_invented_numbers(): void
    {
        $mockProvider = new class extends ProviderAdapter {
            public function fetchMarketData(): array
            {
                throw new MarketProviderTimeoutException('Connection timed out after 5 seconds.');
            }
            public function getProviderName(): string { return 'Timeout Provider'; }
            public function isDelayed(): bool { return true; }
            public function getDelayMinutes(): int { return 15; }
        };

        MarketProviderFactory::setCustomProvider($mockProvider);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertEquals('unavailable', $response['status']);
        $this->assertFalse($response['is_available']);
        $this->assertNull($response['last_updated']);
        $this->assertEquals('Market data temporarily unavailable.', $response['message']);
        $this->assertEmpty($response['indices']);
        $this->assertEmpty($response['gainers']);
        $this->assertEmpty($response['losers']);
    }

    /**
     * Requirement 8: Authentication error handling.
     */
    public function test_provider_unauthorized_error_handled(): void
    {
        Http::fake([
            '*/overview*' => Http::response(['error' => 'Invalid API key'], 401),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.key', 'bad-key');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertEquals('unavailable', $response['status']);
        $this->assertFalse($response['is_available']);
        $this->assertEquals('Market data temporarily unavailable.', $response['message']);
        $this->assertEmpty($response['indices']);
    }

    /**
     * Requirement 8: Rate limit error handling.
     */
    public function test_provider_rate_limit_error_handled(): void
    {
        Http::fake([
            '*/overview*' => Http::response(['error' => 'Too Many Requests'], 429),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.key', 'test-key');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertEquals('unavailable', $response['status']);
        $this->assertFalse($response['is_available']);
        $this->assertEquals('Market data temporarily unavailable.', $response['message']);
        $this->assertEmpty($response['indices']);
    }

    /**
     * Requirement 11: Market closed status is properly preserved with latest available value.
     */
    public function test_market_closed_status_and_value_preserved(): void
    {
        Http::fake([
            '*/overview*' => Http::response([
                'provider_name' => 'NSE Official Feed',
                'is_delayed' => true,
                'delay_minutes' => 15,
                'market_status' => 'closed',
                'currency' => 'INR',
                'indices' => [
                    [
                        'symbol' => 'NIFTY 50',
                        'value' => 25300.00,
                        'absolute_change' => -50.00,
                        'percentage_change' => -0.20,
                        'market_status' => 'closed',
                    ],
                ],
                'stocks' => [],
            ], 200),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.key', 'test-key');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertEquals('success', $response['status']);
        $this->assertEquals('closed', $response['market_status']);
        $this->assertEquals('closed', $response['indices'][0]['market_status']);
        $this->assertEquals(25300.00, $response['indices'][0]['value']);
    }

    /**
     * Requirement 10: Delayed data indicator and notice.
     */
    public function test_delayed_data_flag_and_delay_minutes(): void
    {
        Http::fake([
            '*/overview*' => Http::response([
                'provider_name' => 'Delayed Market Provider',
                'is_delayed' => true,
                'delay_minutes' => 15,
                'market_status' => 'open',
                'indices' => [
                    ['symbol' => 'NIFTY 50', 'value' => 25300.00],
                ],
                'stocks' => [],
            ], 200),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.key', 'test-key');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertTrue($response['is_delayed']);
        $this->assertEquals(15, $response['delay_minutes']);
        $this->assertStringContainsString('DELAYED DATA', $response['notice']);
        $this->assertStringContainsString('15 minutes', $response['notice']);
    }

    /**
     * Requirement 16: Malformed provider quotes are rejected without crashing.
     */
    public function test_empty_or_malformed_provider_payload_validated(): void
    {
        Http::fake([
            '*/overview*' => Http::response([
                'provider_name' => 'NSE Feed',
                'is_delayed' => true,
                'indices' => [
                    ['symbol' => '', 'value' => 25000.0], // Invalid empty symbol
                    ['symbol' => 'NIFTY 50', 'value' => 'not-a-number'], // Invalid non-numeric value
                    ['symbol' => 'NIFTY 50', 'value' => -500], // Invalid negative value
                    ['symbol' => 'SENSEX', 'value' => 83000.00], // Valid
                ],
                'stocks' => [],
            ], 200),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.key', 'test-key');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertEquals('success', $response['status']);
        $this->assertCount(1, $response['indices']);
        $this->assertEquals('SENSEX', $response['indices'][0]['symbol']);
    }

    /**
     * Requirement 14 & 15: Demo mode must NEVER be enabled in production.
     */
    public function test_demo_mode_cannot_be_enabled_in_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');

        $demoProvider = new DemoMarketProvider();
        $this->expectException(MarketProviderUnavailableException::class);
        $this->expectExceptionMessage('Demo market provider is strictly forbidden in production');

        $demoProvider->fetchMarketData();
    }

    /**
     * Requirement 13: Top Gainers and Losers must be dynamically generated from the same source.
     */
    public function test_gainers_and_losers_are_dynamically_sorted_and_generated(): void
    {
        Http::fake([
            '*/overview*' => Http::response([
                'provider_name' => 'NSE Feed',
                'is_delayed' => true,
                'indices' => [
                    ['symbol' => 'NIFTY 50', 'value' => 25300.00],
                ],
                'stocks' => [
                    ['symbol' => 'STOCK_A', 'display_name' => 'Company A', 'value' => 100.0, 'percentage_change' => 3.5],
                    ['symbol' => 'STOCK_B', 'display_name' => 'Company B', 'value' => 200.0, 'percentage_change' => -2.1],
                    ['symbol' => 'STOCK_C', 'display_name' => 'Company C', 'value' => 300.0, 'percentage_change' => 5.2],
                    ['symbol' => 'STOCK_D', 'display_name' => 'Company D', 'value' => 400.0, 'percentage_change' => -4.8],
                    ['symbol' => 'STOCK_E', 'display_name' => 'Company E', 'value' => 500.0, 'percentage_change' => 1.2],
                ],
            ], 200),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.key', 'test-key');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $gainers = $response['gainers'];
        $losers = $response['losers'];

        // Highest gainer first: STOCK_C (5.2%), then STOCK_A (3.5%), then STOCK_E (1.2%)
        $this->assertEquals('STOCK_C', $gainers[0]['symbol']);
        $this->assertEquals(5.2, $gainers[0]['percentage_change']);
        $this->assertEquals('STOCK_A', $gainers[1]['symbol']);
        $this->assertEquals(3.5, $gainers[1]['percentage_change']);
        $this->assertEquals('STOCK_E', $gainers[2]['symbol']);

        // Worst loser first: STOCK_D (-4.8%), then STOCK_B (-2.1%)
        $this->assertEquals('STOCK_D', $losers[0]['symbol']);
        $this->assertEquals(-4.8, $losers[0]['percentage_change']);
        $this->assertEquals('STOCK_B', $losers[1]['symbol']);
        $this->assertEquals(-2.1, $losers[1]['percentage_change']);
    }

    /**
     * Sub-endpoints: /market/indices, /market/gainers, /market/losers, /market/status
     */
    public function test_specialized_market_endpoints(): void
    {
        Http::fake([
            '*/overview*' => Http::response([
                'provider_name' => 'NSE Sub-Feed',
                'is_delayed' => true,
                'indices' => [
                    ['symbol' => 'NIFTY 50', 'value' => 25300.00],
                ],
                'stocks' => [
                    ['symbol' => 'STOCK_UP', 'value' => 100.0, 'percentage_change' => 2.5],
                    ['symbol' => 'STOCK_DOWN', 'value' => 100.0, 'percentage_change' => -2.5],
                ],
            ], 200),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.demo_mode', false);

        $resIndices = $this->getJson('/api/v1/market/indices');
        $resIndices->assertStatus(200)->assertJsonPath('success', true);
        $this->assertNotEmpty($resIndices->json('data'));

        $resGainers = $this->getJson('/api/v1/market/gainers');
        $resGainers->assertStatus(200)->assertJsonPath('success', true);
        $this->assertEquals('STOCK_UP', $resGainers->json('data.0.symbol'));

        $resLosers = $this->getJson('/api/v1/market/losers');
        $resLosers->assertStatus(200)->assertJsonPath('success', true);
        $this->assertEquals('STOCK_DOWN', $resLosers->json('data.0.symbol'));

        $resStatus = $this->getJson('/api/v1/market/status');
        $resStatus->assertStatus(200)->assertJsonPath('success', true);
        $this->assertArrayHasKey('status', $resStatus->json('data'));
    }

    /**
     * Requirement 8: 403 Forbidden handling.
     */
    public function test_provider_403_forbidden_handled(): void
    {
        Http::fake([
            '*/overview*' => Http::response(['error' => 'Forbidden IP'], 403),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertEquals('unavailable', $response['status']);
        $this->assertFalse($response['is_available']);
    }

    /**
     * Requirement 8: 429 Rate Limit handling.
     */
    public function test_provider_429_rate_limit_handled(): void
    {
        Http::fake([
            '*/overview*' => Http::response(['error' => 'Too Many Requests'], 429),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertEquals('unavailable', $response['status']);
        $this->assertFalse($response['is_available']);
    }

    /**
     * Requirement 8: 500 Internal Server Error handling.
     */
    public function test_provider_500_server_error_handled(): void
    {
        Http::fake([
            '*/overview*' => Http::response(['error' => 'Internal Server Error'], 500),
        ]);

        Config::set('services.market.url', 'https://api.marketdata.com');
        Config::set('services.market.demo_mode', false);

        $service = new MarketDataService();
        $response = $service->getMarketOverview();

        $this->assertEquals('unavailable', $response['status']);
        $this->assertFalse($response['is_available']);
    }

    /**
     * Section 31: Admin market settings.
     */
    public function test_admin_market_settings_requires_channel_head_role(): void
    {
        $res = $this->getJson('/api/v1/admin/market/settings');
        $res->assertStatus(401);
    }
}
