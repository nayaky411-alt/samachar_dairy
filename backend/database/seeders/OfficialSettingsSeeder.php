<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class OfficialSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds with verified official company details.
     */
    public function run(): void
    {
        $officialSettings = [
            // Website / Organization Information
            'site_name' => [
                'value' => 'Samachar Diary',
                'group' => 'general',
                'is_public' => true,
            ],
            'site_name_en' => [
                'value' => 'Samachar Diary',
                'group' => 'general',
                'is_public' => true,
            ],
            'site_tagline' => [
                'value' => 'ગુજરાતનું અગ્રણી અને સૌથી વિશ્વસનીય ડિજિટલ સમાચાર માધ્યમ. તથ્યપૂર્ણ પત્રકારત્વ અને નિષ્પક્ષ અહેવાલો.',
                'group' => 'general',
                'is_public' => true,
            ],
            'site_logo_url' => [
                'value' => '',
                'group' => 'general',
                'is_public' => true,
            ],

            // Business / Office Address
            'office_address' => [
                'value' => 'Shop No 11, SWARNIM DHARTI, 60 Meter Road, Sardar Patel Ring Rd, Near Sardardham, Ahmedabad, Khodiyar, Gujarat - 382501, India',
                'group' => 'contact',
                'is_public' => true,
            ],
            'city' => [
                'value' => 'Ahmedabad, Khodiyar',
                'group' => 'contact',
                'is_public' => true,
            ],
            'state' => [
                'value' => 'Gujarat',
                'group' => 'contact',
                'is_public' => true,
            ],
            'pincode' => [
                'value' => '382501',
                'group' => 'contact',
                'is_public' => true,
            ],
            'country' => [
                'value' => 'India',
                'group' => 'contact',
                'is_public' => true,
            ],
            'google_maps_url' => [
                'value' => 'https://www.google.com/maps/search/?api=1&query=Shop+No+11+SWARNIM+DHARTI+60+Meter+Road+Sardar+Patel+Ring+Rd+Near+Sardardham+Ahmedabad+Khodiyar+Gujarat+382501+India',
                'group' => 'contact',
                'is_public' => true,
            ],

            // Official Contact
            'contact_email' => [
                'value' => 'samachardiaryx7@gmail.com',
                'group' => 'contact',
                'is_public' => true,
            ],
            'contact_phone' => [
                'value' => '+91 79 2658 9000',
                'group' => 'contact',
                'is_public' => true,
            ],

            // Official Social Media
            'social_instagram' => [
                'value' => 'https://www.instagram.com/samachardiary/',
                'group' => 'social',
                'is_public' => true,
            ],
            'social_youtube' => [
                'value' => 'https://www.youtube.com/@SamacharDiary24x7',
                'group' => 'social',
                'is_public' => true,
            ],
            'social_facebook' => [
                'value' => 'https://facebook.com/samachardairy247',
                'group' => 'social',
                'is_public' => true,
            ],
            'social_x' => [
                'value' => 'https://x.com/samachardairy247',
                'group' => 'social',
                'is_public' => true,
            ],
            'social_whatsapp' => [
                'value' => 'https://whatsapp.com/channel/samachardairy247',
                'group' => 'social',
                'is_public' => true,
            ],
            'social_telegram' => [
                'value' => 'https://t.me/samachardairy247',
                'group' => 'social',
                'is_public' => true,
            ],

            // Footer & Legal
            'footer_description' => [
                'value' => 'સમાચાર ડેરી ૨૪x૭ - ગુજરાત અને દેશ-વિદેશના તાજા સમાચાર, બ્રેકિંગ ન્યૂઝ, શેરબજાર અને ગ્રાઉન્ડ રિપોર્ટ્સનું વિશ્વસનીય ડિજિટલ પ્લેટફોર્મ.',
                'group' => 'footer',
                'is_public' => true,
            ],
            'copyright_text' => [
                'value' => '© {year} Samachar Diary. All Rights Reserved.',
                'group' => 'footer',
                'is_public' => true,
            ],
        ];

        foreach ($officialSettings as $key => $data) {
            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $data['value'],
                    'group' => $data['group'],
                    'is_public' => $data['is_public'],
                ]
            );
        }
    }
}
