<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TaxonomySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Gujarat', 'name_gu' => 'ગુજરાત', 'slug' => 'gujarat', 'color' => '#b91c1c', 'icon' => 'MapPin', 'order' => 1],
            ['name' => 'Ahmedabad', 'name_gu' => 'અમદાવાદ', 'slug' => 'ahmedabad', 'color' => '#dc2626', 'icon' => 'Building2', 'order' => 2],
            ['name' => 'Surat', 'name_gu' => 'સુરત', 'color' => '#ea580c', 'slug' => 'surat', 'icon' => 'Gem', 'order' => 3],
            ['name' => 'Vadodara', 'name_gu' => 'વડોદરા', 'slug' => 'vadodara', 'color' => '#d97706', 'icon' => 'Landmark', 'order' => 4],
            ['name' => 'Rajkot', 'name_gu' => 'રાજકોટ', 'slug' => 'rajkot', 'color' => '#ca8a04', 'icon' => 'Sun', 'order' => 5],
            ['name' => 'Gandhinagar', 'name_gu' => 'ગાંધીનગર', 'slug' => 'gandhinagar', 'color' => '#16a34a', 'icon' => 'TreePine', 'order' => 6],
            ['name' => 'India', 'name_gu' => 'રાષ્ટ્રીય', 'slug' => 'india', 'color' => '#0284c7', 'icon' => 'Flag', 'order' => 7],
            ['name' => 'World', 'name_gu' => 'વિશ્વ', 'slug' => 'world', 'color' => '#2563eb', 'icon' => 'Globe', 'order' => 8],
            ['name' => 'Politics', 'name_gu' => 'રાજકારણ', 'slug' => 'politics', 'color' => '#4f46e5', 'icon' => 'Vote', 'order' => 9],
            ['name' => 'Business', 'name_gu' => 'વેપાર', 'slug' => 'business', 'color' => '#059669', 'icon' => 'Briefcase', 'order' => 10],
            ['name' => 'Stock Market', 'name_gu' => 'શેરબજાર', 'slug' => 'stock-market', 'color' => '#10b981', 'icon' => 'TrendingUp', 'order' => 11],
            ['name' => 'Sports', 'name_gu' => 'રમતગમત', 'slug' => 'sports', 'color' => '#0d9488', 'icon' => 'Trophy', 'order' => 12],
            ['name' => 'Entertainment', 'name_gu' => 'મનોરંજન', 'slug' => 'entertainment', 'color' => '#db2777', 'icon' => 'Film', 'order' => 13],
            ['name' => 'Technology', 'name_gu' => 'ટેકનોલોજી', 'slug' => 'technology', 'color' => '#7c3aed', 'icon' => 'Cpu', 'order' => 14],
            ['name' => 'Education', 'name_gu' => 'શિક્ષણ', 'slug' => 'education', 'color' => '#9333ea', 'icon' => 'GraduationCap', 'order' => 15],
            ['name' => 'Jobs', 'name_gu' => 'રોજગાર', 'slug' => 'jobs', 'color' => '#c026d3', 'icon' => 'UserCheck', 'order' => 16],
            ['name' => 'Lifestyle', 'name_gu' => 'જીવનશૈલી', 'slug' => 'lifestyle', 'color' => '#e11d48', 'icon' => 'HeartHandshake', 'order' => 17],
            ['name' => 'Health & Wellness', 'name_gu' => 'આરોગ્ય', 'slug' => 'health-wellness', 'color' => '#059669', 'icon' => 'Activity', 'order' => 18],
            ['name' => 'Special Report', 'name_gu' => 'વિશેષ અહેવાલ', 'slug' => 'special-report', 'color' => '#991b1b', 'icon' => 'FileText', 'order' => 19],
            ['name' => 'Explainers', 'name_gu' => 'એક્સપ્લેનર', 'slug' => 'explainers', 'color' => '#0284c7', 'icon' => 'HelpCircle', 'order' => 20],
            ['name' => 'Opinion', 'name_gu' => 'ઓપિનિયન', 'slug' => 'opinion', 'color' => '#374151', 'icon' => 'MessageSquare', 'order' => 21],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], [
                'name' => $cat['name'],
                'name_gu' => $cat['name_gu'],
                'color' => $cat['color'],
                'icon' => $cat['icon'],
                'sort_order' => $cat['order'],
                'is_active' => true,
                'show_in_menu' => true,
            ]);
        }

        $topics = [
            ['name' => 'Gujarat Budget 2026', 'name_gu' => 'ગુજરાત બજેટ ૨૦૨૬', 'slug' => 'gujarat-budget-2026', 'is_featured' => true],
            ['name' => 'GIFT City Expansion', 'name_gu' => 'ગિફ્ટ સિટી પ્રોજેક્ટ', 'slug' => 'gift-city-expansion', 'is_featured' => true],
            ['name' => 'Monsoon Updates', 'name_gu' => 'ચોમાસુ અપડેટ્સ', 'slug' => 'monsoon-updates', 'is_featured' => true],
            ['name' => 'Indian Premier League', 'name_gu' => 'IPL ક્રિકેટ', 'slug' => 'ipl-cricket', 'is_featured' => true],
            ['name' => 'Artificial Intelligence', 'name_gu' => 'આર્ટિફિશિયલ ઇન્ટેલિજન્સ (AI)', 'slug' => 'ai-technology', 'is_featured' => false],
        ];

        foreach ($topics as $t) {
            Topic::firstOrCreate(['slug' => $t['slug']], $t);
        }

        $tags = [
            ['name' => 'NIFTY', 'name_gu' => 'નિફ્ટી', 'slug' => 'nifty', 'is_trending' => true],
            ['name' => 'Sensex', 'name_gu' => 'સેન્સેક્સ', 'slug' => 'sensex', 'is_trending' => true],
            ['name' => 'Ahmedabad Metro', 'name_gu' => 'અમદાવાદ મેટ્રો', 'slug' => 'ahmedabad-metro', 'is_trending' => true],
            ['name' => 'Surat Diamond Bourse', 'name_gu' => 'સુરત ડાયમંડ બુર્સ', 'slug' => 'surat-diamond-bourse', 'is_trending' => true],
            ['name' => 'Stock Market', 'name_gu' => 'શેરબજાર', 'slug' => 'stock-market-tag', 'is_trending' => true],
            ['name' => 'Gujarat Police', 'name_gu' => 'ગુજરાત પોલીસ', 'slug' => 'gujarat-police', 'is_trending' => false],
            ['name' => 'ISRO', 'name_gu' => 'ઈસરો', 'slug' => 'isro', 'is_trending' => false],
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(['slug' => $tag['slug']], $tag);
        }
    }
}
