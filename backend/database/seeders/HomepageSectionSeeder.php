<?php

namespace Database\Seeders;

use App\Models\HomepageSection;
use Illuminate\Database\Seeder;

class HomepageSectionSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            [
                'section_key' => 'breaking_news',
                'title' => 'Breaking News',
                'title_gu' => 'બ્રેકિંગ ન્યૂઝ',
                'sort_order' => 1,
                'is_active' => true,
                'card_limit' => 5,
            ],
            [
                'section_key' => 'hero_section',
                'title' => 'Hero & Top Stories',
                'title_gu' => 'મુખ્ય સમાચાર',
                'sort_order' => 2,
                'is_active' => true,
                'card_limit' => 5,
            ],
            [
                'section_key' => 'market_ticker',
                'title' => 'Indian Stock Market Strip',
                'title_gu' => 'શેરબજાર લાઈવ ટિકર',
                'sort_order' => 3,
                'is_active' => true,
                'card_limit' => 6,
            ],
            [
                'section_key' => 'gujarat_interactive_map',
                'title' => 'Interactive Gujarat Map',
                'title_gu' => 'ગુજરાત નકશો અને જિલ્લાવાર સમાચાર',
                'sort_order' => 4,
                'is_active' => true,
                'card_limit' => 6,
            ],
            [
                'section_key' => 'featured_stories',
                'title' => 'Editor Picks & Special Reports',
                'title_gu' => 'સંપાદકની પસંદ & વિશેષ અહેવાલ',
                'sort_order' => 5,
                'is_active' => true,
                'card_limit' => 4,
            ],
            [
                'section_key' => 'latest_news',
                'title' => 'Latest Updates',
                'title_gu' => 'તાજા સમાચાર (૨૪x૭)',
                'sort_order' => 6,
                'is_active' => true,
                'card_limit' => 8,
            ],
            [
                'section_key' => 'city_news',
                'title' => 'Gujarat City News',
                'title_gu' => 'તમારા શહેરના સમાચાર',
                'sort_order' => 7,
                'is_active' => true,
                'card_limit' => 6,
            ],
            [
                'section_key' => 'instagram_reels',
                'title' => 'Official Instagram Reels',
                'title_gu' => 'શોર્ટ વિડીયો & રીલ્સ',
                'sort_order' => 8,
                'is_active' => true,
                'card_limit' => 6,
            ],
            [
                'section_key' => 'youtube_videos',
                'title' => 'Official YouTube Videos',
                'title_gu' => 'વિડીયો બુલેટિન',
                'sort_order' => 9,
                'is_active' => true,
                'card_limit' => 4,
            ],
            [
                'section_key' => 'photo_gallery',
                'title' => 'Photo Stories & Galleries',
                'title_gu' => 'ફોટો ગેલેરી',
                'sort_order' => 10,
                'is_active' => true,
                'card_limit' => 4,
            ],
            [
                'section_key' => 'business_market',
                'title' => 'Business & Economy',
                'title_gu' => 'બિઝનેસ & અર્થતંત્ર',
                'sort_order' => 11,
                'is_active' => true,
                'card_limit' => 4,
            ],
            [
                'section_key' => 'sports_entertainment',
                'title' => 'Sports & Entertainment',
                'title_gu' => 'રમતગમત અને મનોરંજન',
                'sort_order' => 12,
                'is_active' => true,
                'card_limit' => 4,
            ],
        ];

        foreach ($sections as $s) {
            HomepageSection::firstOrCreate(['section_key' => $s['section_key']], $s);
        }
    }
}
