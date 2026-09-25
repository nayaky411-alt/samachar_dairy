<?php

namespace Database\Seeders;

use App\Models\Advertisement;
use Illuminate\Database\Seeder;

class AdvertisementSeeder extends Seeder
{
    public function run(): void
    {
        $ads = [
            [
                'title' => 'ગુજરાત ટુરિઝમ - ખુશ્બૂ ગુજરાત કી',
                'placement' => 'desktop_banner',
                'image_url' => 'https://images.unsplash.com/photo-1596405835955-4606f75f8507?auto=format&fit=crop&w=1200&q=80',
                'destination_url' => 'https://www.gujarattourism.com',
                'code_html' => null,
                'start_date' => now()->subDays(1),
                'end_date' => now()->addDays(30),
                'status' => 'active',
                'impressions_count' => 1240,
                'clicks_count' => 180,
            ],
            [
                'title' => 'GIFT City FinTech સમિટ ૨૦૨૬',
                'placement' => 'sidebar',
                'image_url' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
                'destination_url' => 'https://giftgujarat.in',
                'code_html' => null,
                'start_date' => now()->subDays(2),
                'end_date' => now()->addDays(45),
                'status' => 'active',
                'impressions_count' => 840,
                'clicks_count' => 95,
            ],
            [
                'title' => 'સુરત ડાયમંડ એક્સપો - ૨૦૨૬',
                'placement' => 'article_inline',
                'image_url' => 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
                'destination_url' => 'https://example.com/expo',
                'code_html' => null,
                'start_date' => now()->subDays(1),
                'end_date' => now()->addDays(20),
                'status' => 'active',
                'impressions_count' => 620,
                'clicks_count' => 45,
            ],
            [
                'title' => 'અમદાવાદ મેટ્રો મોબાઇલ ઍપ ડાઉનલોડ કરો',
                'placement' => 'mobile_banner',
                'image_url' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
                'destination_url' => 'https://example.com/metro-app',
                'code_html' => null,
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(60),
                'status' => 'active',
                'impressions_count' => 2450,
                'clicks_count' => 310,
            ],
        ];

        foreach ($ads as $ad) {
            Advertisement::firstOrCreate(['title' => $ad['title']], $ad);
        }
    }
}
