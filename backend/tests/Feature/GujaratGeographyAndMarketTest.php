<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GujaratGeographyAndMarketTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_districts_endpoint_returns_33_districts(): void
    {
        $response = $this->getJson('/api/v1/districts');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $districts = $response->json('data');
        $this->assertCount(33, $districts);

        // Check for major districts
        $slugs = collect($districts)->pluck('slug')->toArray();
        $this->assertContains('ahmedabad', $slugs);
        $this->assertContains('surat', $slugs);
        $this->assertContains('rajkot', $slugs);
        $this->assertContains('vadodara', $slugs);
    }

    public function test_district_news_endpoint_returns_news_for_ahmedabad(): void
    {
        $response = $this->getJson('/api/v1/districts/ahmedabad/news');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.district.slug', 'ahmedabad');
    }

    public function test_market_endpoint_returns_nifty_sensex_with_disclosure(): void
    {
        $response = $this->getJson('/api/v1/market');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'provider',
                    'is_delayed',
                    'notice',
                    'indices',
                    'gainers',
                    'losers',
                ],
            ]);

        $indices = collect($response->json('data.indices'))->pluck('symbol')->toArray();
        $this->assertContains('NIFTY 50', $indices);
        $this->assertContains('SENSEX', $indices);
    }
}
