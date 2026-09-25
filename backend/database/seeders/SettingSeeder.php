<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'સમાચાર ડેરી ૨૪x૭', 'group' => 'general', 'is_public' => true],
            ['key' => 'site_name_en', 'value' => 'Samachar Dairy 247', 'group' => 'general', 'is_public' => true],
            ['key' => 'site_tagline', 'value' => 'ગુજરાતનું અગ્રણી અને વિશ્વસનીય ડિજિટલ સમાચાર માધ્યમ', 'group' => 'general', 'is_public' => true],
            ['key' => 'contact_email', 'value' => 'contact@samachardairy247.com', 'group' => 'contact', 'is_public' => true],
            ['key' => 'contact_phone', 'value' => '+91 79 2658 9000', 'group' => 'contact', 'is_public' => true],
            ['key' => 'office_address', 'value' => '૪૦૧, સમાચાર ભવન, એસ.જી. હાઇવે, બોડકદેવ, અમદાવાદ, ગુજરાત - ૩૮૦૦૫૪', 'group' => 'contact', 'is_public' => true],
            
            // Social Links
            ['key' => 'social_instagram', 'value' => 'https://instagram.com/samachardairy247', 'group' => 'social', 'is_public' => true],
            ['key' => 'social_youtube', 'value' => 'https://youtube.com/@samachardairy247', 'group' => 'social', 'is_public' => true],
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/samachardairy247', 'group' => 'social', 'is_public' => true],
            ['key' => 'social_x', 'value' => 'https://x.com/samachardairy247', 'group' => 'social', 'is_public' => true],
            ['key' => 'social_whatsapp', 'value' => 'https://whatsapp.com/channel/samachardairy247', 'group' => 'social', 'is_public' => true],
            ['key' => 'social_telegram', 'value' => 'https://t.me/samachardairy247', 'group' => 'social', 'is_public' => true],

            // SEO Defaults
            ['key' => 'meta_title_default', 'value' => 'સમાચાર ડેરી ૨૪x૭ | ગુજરાત અને દેશ-વિદેશના તાજા સમાચાર', 'group' => 'seo', 'is_public' => true],
            ['key' => 'meta_description_default', 'value' => 'ગુજરાતના તમામ જિલ્લાઓ, અમદાવાદ, સુરત, વડોદરા, રાજકોટના તાજા સમાચાર, શેરબજાર, રાજકારણ અને રમતગમતના લાઈવ અપડેટ્સ.', 'group' => 'seo', 'is_public' => true],
            ['key' => 'meta_keywords_default', 'value' => 'gujarati news, gujarat samachar, ahmedabad news, surat news, stock market gujarati, breaking news gujarat', 'group' => 'seo', 'is_public' => true],

            // Financial Market
            ['key' => 'market_provider_name', 'value' => 'National Stock Exchange / Financial API (Delayed 15 min)', 'group' => 'market', 'is_public' => true],
            ['key' => 'market_disclaimer', 'value' => 'માર્કેટ ડેટા ૧૫ મિનિટ વિલંબિત છે. આ માહિતી માત્ર શૈક્ષણિક અને માહિતીના હેતુ માટે છે.', 'group' => 'market', 'is_public' => true],
        ];

        foreach ($settings as $s) {
            Setting::updateOrCreate(['key' => $s['key']], $s);
        }
    }
}
