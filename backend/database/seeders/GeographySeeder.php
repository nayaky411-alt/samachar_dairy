<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\District;
use App\Models\State;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GeographySeeder extends Seeder
{
    public function run(): void
    {
        $state = State::firstOrCreate(['code' => 'GJ'], [
            'name' => 'Gujarat',
            'name_gu' => 'ગુજરાત',
            'slug' => 'gujarat',
        ]);

        $districtsData = [
            ['name' => 'Ahmedabad', 'name_gu' => 'અમદાવાદ', 'code' => 'GJ-AH', 'hq' => 'Ahmedabad', 'svg' => 'gj-ahmedabad', 'cities' => ['Ahmedabad', 'Sanand', 'Dholka', 'Viramgam', 'Bavla', 'Dhandhuka']],
            ['name' => 'Surat', 'name_gu' => 'સુરત', 'code' => 'GJ-SR', 'hq' => 'Surat', 'svg' => 'gj-surat', 'cities' => ['Surat', 'Bardoli', 'Olpad', 'Mandvi', 'Kamrej']],
            ['name' => 'Vadodara', 'name_gu' => 'વડોદરા', 'code' => 'GJ-VD', 'hq' => 'Vadodara', 'svg' => 'gj-vadodara', 'cities' => ['Vadodara', 'Padra', 'Karjan', 'Dabhoi', 'Savli']],
            ['name' => 'Rajkot', 'name_gu' => 'રાજકોટ', 'code' => 'GJ-RK', 'hq' => 'Rajkot', 'svg' => 'gj-rajkot', 'cities' => ['Rajkot', 'Gondal', 'Jetpur', 'Dhoraji', 'Upleta']],
            ['name' => 'Bhavnagar', 'name_gu' => 'ભાવનગર', 'code' => 'GJ-BV', 'hq' => 'Bhavnagar', 'svg' => 'gj-bhavnagar', 'cities' => ['Bhavnagar', 'Palitana', 'Mahuva', 'Sihor', 'Talaja']],
            ['name' => 'Jamnagar', 'name_gu' => 'જામનગર', 'code' => 'GJ-JM', 'hq' => 'Jamnagar', 'svg' => 'gj-jamnagar', 'cities' => ['Jamnagar', 'Kalavad', 'Dhrol', 'Jodiya']],
            ['name' => 'Junagadh', 'name_gu' => 'જૂનાગઢ', 'code' => 'GJ-JN', 'hq' => 'Junagadh', 'svg' => 'gj-junagadh', 'cities' => ['Junagadh', 'Keshod', 'Mangrol', 'Manavadar', 'Visavadar']],
            ['name' => 'Gandhinagar', 'name_gu' => 'ગાંધીનગર', 'code' => 'GJ-GN', 'hq' => 'Gandhinagar', 'svg' => 'gj-gandhinagar', 'cities' => ['Gandhinagar', 'Kalol', 'Dehgam', 'Mansa']],
            ['name' => 'Kutch', 'name_gu' => 'કચ્છ', 'code' => 'GJ-KU', 'hq' => 'Bhuj', 'svg' => 'gj-kutch', 'cities' => ['Bhuj', 'Gandhidham', 'Mandvi', 'Anjar', 'Mundra', 'Nakhatrana']],
            ['name' => 'Banaskantha', 'name_gu' => 'બનાસકાંઠા', 'code' => 'GJ-BK', 'hq' => 'Palanpur', 'svg' => 'gj-banaskantha', 'cities' => ['Palanpur', 'Deesa', 'Tharad', 'Dhanera', 'Ambaji']],
            ['name' => 'Sabarkantha', 'name_gu' => 'સાબરકાંઠા', 'code' => 'GJ-SK', 'hq' => 'Himmatnagar', 'svg' => 'gj-sabarkantha', 'cities' => ['Himmatnagar', 'Idar', 'Prantij', 'Khedbrahma']],
            ['name' => 'Mehsana', 'name_gu' => 'મહેસાણા', 'code' => 'GJ-MH', 'hq' => 'Mehsana', 'svg' => 'gj-mehsana', 'cities' => ['Mehsana', 'Kadi', 'Visnagar', 'Unjha', 'Vadnagar']],
            ['name' => 'Patan', 'name_gu' => 'પાટણ', 'code' => 'GJ-PA', 'hq' => 'Patan', 'svg' => 'gj-patan', 'cities' => ['Patan', 'Sidhpur', 'Chanasma', 'Radhanpur']],
            ['name' => 'Aravalli', 'name_gu' => 'અરવલ્લી', 'code' => 'GJ-AR', 'hq' => 'Modasa', 'svg' => 'gj-aravalli', 'cities' => ['Modasa', 'Bayad', 'Dhansura', 'Malpur', 'Bhiloda']],
            ['name' => 'Kheda', 'name_gu' => 'ખેડા', 'code' => 'GJ-KH', 'hq' => 'Nadiad', 'svg' => 'gj-kheda', 'cities' => ['Nadiad', 'Kheda', 'Kapadvanj', 'Mahudha', 'Matar', 'Thasra']],
            ['name' => 'Anand', 'name_gu' => 'આણંદ', 'code' => 'GJ-AN', 'hq' => 'Anand', 'svg' => 'gj-anand', 'cities' => ['Anand', 'Petlad', 'Khambhat', 'Umreth', 'Borsad', 'Tarapur']],
            ['name' => 'Panchmahal', 'name_gu' => 'પંચમહાલ', 'code' => 'GJ-PM', 'hq' => 'Godhra', 'svg' => 'gj-panchmahal', 'cities' => ['Godhra', 'Halol', 'Kalol', 'Shehra']],
            ['name' => 'Dahod', 'name_gu' => 'દાહોદ', 'code' => 'GJ-DH', 'hq' => 'Dahod', 'svg' => 'gj-dahod', 'cities' => ['Dahod', 'Jhalod', 'Limkheda', 'Devgadh Baria']],
            ['name' => 'Mahisagar', 'name_gu' => 'મહીસાગર', 'code' => 'GJ-MS', 'hq' => 'Lunawada', 'svg' => 'gj-mahisagar', 'cities' => ['Lunawada', 'Santrampur', 'Balasinor', 'Virpur']],
            ['name' => 'Chhota Udaipur', 'name_gu' => 'છોટા ઉદેપુર', 'code' => 'GJ-CU', 'hq' => 'Chhota Udaipur', 'svg' => 'gj-chhota-udepur', 'cities' => ['Chhota Udaipur', 'Bodeli', 'Sankheda', 'Jetpur Pavi']],
            ['name' => 'Narmada', 'name_gu' => 'નર્મદા', 'code' => 'GJ-NR', 'hq' => 'Rajpipla', 'svg' => 'gj-narmada', 'cities' => ['Rajpipla', 'Dediyapada', 'Kevadia', 'Tilakwada']],
            ['name' => 'Bharuch', 'name_gu' => 'ભરૂચ', 'code' => 'GJ-BR', 'hq' => 'Bharuch', 'svg' => 'gj-bharuch', 'cities' => ['Bharuch', 'Ankleshwar', 'Jambusar', 'Hansot', 'Amod']],
            ['name' => 'Tapi', 'name_gu' => 'તાપી', 'code' => 'GJ-TP', 'hq' => 'Vyara', 'svg' => 'gj-tapi', 'cities' => ['Vyara', 'Songadh', 'Valod', 'Uchhal']],
            ['name' => 'Dang', 'name_gu' => 'ડાંગ', 'code' => 'GJ-DG', 'hq' => 'Ahwa', 'svg' => 'gj-dang', 'cities' => ['Ahwa', 'Saputara', 'Subir', 'Waghai']],
            ['name' => 'Navsari', 'name_gu' => 'નવસારી', 'code' => 'GJ-NV', 'hq' => 'Navsari', 'svg' => 'gj-navsari', 'cities' => ['Navsari', 'Bilimora', 'Gandevi', 'Jalalpore', 'Chikhli']],
            ['name' => 'Valsad', 'name_gu' => 'વલસાડ', 'code' => 'GJ-VL', 'hq' => 'Valsad', 'svg' => 'gj-valsad', 'cities' => ['Valsad', 'Vapi', 'Pardi', 'Dharampur', 'Umbergaon']],
            ['name' => 'Amreli', 'name_gu' => 'અમરેલી', 'code' => 'GJ-AM', 'hq' => 'Amreli', 'svg' => 'gj-amreli', 'cities' => ['Amreli', 'Savarkundla', 'Dhari', 'Bagasara', 'Rajula', 'Jafrabad']],
            ['name' => 'Gir Somnath', 'name_gu' => 'ગીર સોમનાથ', 'code' => 'GJ-GS', 'hq' => 'Veraval', 'svg' => 'gj-gir-somnath', 'cities' => ['Veraval', 'Patan-Somnath', 'Kodinar', 'Una', 'Talala']],
            ['name' => 'Botad', 'name_gu' => 'બોટાદ', 'code' => 'GJ-BT', 'hq' => 'Botad', 'svg' => 'gj-botad', 'cities' => ['Botad', 'Gadhada', 'Barwala', 'Ranpur']],
            ['name' => 'Morbi', 'name_gu' => 'મોરબી', 'code' => 'GJ-MB', 'hq' => 'Morbi', 'svg' => 'gj-morbi', 'cities' => ['Morbi', 'Wankaner', 'Halvad', 'Tankara', 'Maliya']],
            ['name' => 'Devbhumi Dwarka', 'name_gu' => 'દેવભૂમિ દ્વારકા', 'code' => 'GJ-DD', 'hq' => 'Khambhalia', 'svg' => 'gj-devbhumi-dwarka', 'cities' => ['Dwarka', 'Khambhalia', 'Kalyanpur', 'Bhanvad']],
            ['name' => 'Porbandar', 'name_gu' => 'પોરબંદર', 'code' => 'GJ-PO', 'hq' => 'Porbandar', 'svg' => 'gj-porbandar', 'cities' => ['Porbandar', 'Ranavav', 'Kutiyana']],
            ['name' => 'Surendranagar', 'name_gu' => 'સુરેન્દ્રનગર', 'code' => 'GJ-SN', 'hq' => 'Surendranagar', 'svg' => 'gj-surendranagar', 'cities' => ['Surendranagar', 'Wadhwan', 'Dhrangadhra', 'Limbdi', 'Chotila']],
        ];

        foreach ($districtsData as $d) {
            $district = District::firstOrCreate([
                'state_id' => $state->id,
                'slug' => Str::slug($d['name']),
            ], [
                'name' => $d['name'],
                'name_gu' => $d['name_gu'],
                'code' => $d['code'],
                'headquarters' => $d['hq'],
                'svg_path_id' => $d['svg'],
                'is_active' => true,
            ]);

            foreach ($d['cities'] as $cityName) {
                $baseSlug = Str::slug($cityName);
                $existing = City::where('slug', $baseSlug)->exists();
                $citySlug = $existing ? "{$baseSlug}-" . Str::slug($d['name']) : $baseSlug;

                City::firstOrCreate([
                    'district_id' => $district->id,
                    'slug' => $citySlug,
                ], [
                    'name' => $cityName,
                    'name_gu' => $cityName === $d['name'] ? $d['name_gu'] : $cityName,
                    'is_major' => in_array($cityName, ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar']),
                    'is_active' => true,
                ]);
            }
        }
    }
}
