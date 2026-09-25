<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\BreakingNews;
use App\Models\Category;
use App\Models\City;
use App\Models\District;
use App\Models\GalleryImage;
use App\Models\InstagramReel;
use App\Models\PhotoGallery;
use App\Models\Tag;
use App\Models\User;
use App\Models\YouTubeVideo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArticleAndMediaSeeder extends Seeder
{
    public function run(): void
    {
        $channelHead = User::where('role', 'channel_head')->first() ?? User::first();
        $staffReporter = User::where('role', 'staff')->first() ?? $channelHead;

        $catGujarat = Category::where('slug', 'gujarat')->first();
        $catAhmedabad = Category::where('slug', 'ahmedabad')->first();
        $catSurat = Category::where('slug', 'surat')->first();
        $catVadodara = Category::where('slug', 'vadodara')->first();
        $catRajkot = Category::where('slug', 'rajkot')->first();
        $catBusiness = Category::where('slug', 'business')->first();
        $catMarket = Category::where('slug', 'stock-market')->first();
        $catSports = Category::where('slug', 'sports')->first();
        $catTech = Category::where('slug', 'technology')->first();
        $catSpecial = Category::where('slug', 'special-report')->first();

        $distAhmedabad = District::where('slug', 'ahmedabad')->first();
        $distSurat = District::where('slug', 'surat')->first();
        $distVadodara = District::where('slug', 'vadodara')->first();
        $distRajkot = District::where('slug', 'rajkot')->first();
        $distGandhinagar = District::where('slug', 'gandhinagar')->first();

        $cityAhmedabad = City::where('slug', 'ahmedabad')->first();
        $citySurat = City::where('slug', 'surat')->first();
        $cityVadodara = City::where('slug', 'vadodara')->first();
        $cityRajkot = City::where('slug', 'rajkot')->first();

        // 1. HERO ARTICLE (Published, Featured)
        $hero = Article::create([
            'title' => 'ગુજરાતમાં સેમિકન્ડક્ટર અને ઇલેક્ટ્રોનિક્સ હબનું વિસ્તરણ: ₹૧૫,૦૦૦ કરોડના નવા રોકાણોની જાહેરાત',
            'subtitle' => 'સાણંદ અને ધોલેરા સ્પેશિયલ ઇન્વેસ્ટમેન્ટ રિજનમાં વૈશ્વિક કંપનીઓ શરૂ કરશે હાઈ-ટેક મેન્યુફેક્ચરિંગ પ્લાન્ટ',
            'slug' => 'gujarat-semiconductor-electronics-hub-expansion-investment',
            'short_description' => 'ગુજરાતમાં સાણંદ અને ધોલેરા ખાતે અદ્યતન સેમિકન્ડક્ટર પ્લાન્ટ્સની સ્થાપના સાથે હજારો કુશળ યુવાનો માટે રોજગારીની નવી તકો ઉભી થશે.',
            'content' => "<h3>સાણંદ અને ધોલેરામાં ઔદ્યોગિક ક્રાંતિ</h3>
<p>ગુજરાત સરકારે સેમિકન્ડક્ટર ક્ષેત્રે વૈશ્વિક અગ્રેસર બનવાની દિશામાં મોટું પગલું ભર્યું છે. સાણંદ અને ધોલેરા સ્પેશિયલ ઇન્વેસ્ટમેન્ટ રિજન (SIR) ખાતે ₹૧૫,૦૦૦ કરોડના નવા એમઓયુ પર હસ્તાક્ષર કરવામાં આવ્યા છે.</p>
<blockquote>\"ગુજરાત હવે માત્ર ભારતનું મેન્યુફેક્ચરિંગ પાટનગર નથી, પરંતુ વૈશ્વિક હાઈ-ટેક સેમિકન્ડક્ટર ઇકોસિસ્ટમનું કેન્દ્ર બની રહ્યું છે.\" - ઉદ્યોગ વિભાગ સચિવ</blockquote>
<p>આ નવી સુવિધાઓ શરૂ થવાથી પ્રથમ તબક્કામાં ૧૨,૦૦૦ થી વધુ પ્રત્યક્ષ અને પરોક્ષ નોકરીઓનું સર્જન થશે. રાજ્ય સરકારે પાણી, વીજળી અને અત્યાધુનિક લોજિસ્ટિક્સ કનેક્ટિવિટી આપવાની ખાતરી આપી છે.</p>
<h3>અદ્યતન માળખાગત સુવિધાઓ</h3>
<p>અમદાવાદ-ધોલેરા એક્સપ્રેસવે અને ધોલેરા ઇન્ટરનેશનલ એરપોર્ટનું કાર્ય પૂર્ણતાના આરે છે, જે આ પ્લાન્ટ્સ માટે મહત્વપૂર્ણ સાબિત થશે.</p>",
            'category_id' => $catBusiness->id,
            'district_id' => $distAhmedabad->id,
            'city_id' => $cityAhmedabad->id,
            'author_id' => $staffReporter->id,
            'editor_id' => $channelHead->id,
            'source_name' => 'રાજ્ય માહિતી વિભાગ અને બ્યુરો રિપોર્ટ',
            'content_type' => 'Original Reporting',
            'featured_image' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
            'featured_image_caption' => 'સાણંદ સેમિકન્ડક્ટર સંકુલની પ્રતિકાત્મક તસવીર',
            'featured_image_credit' => 'સમય પિક્ચર્સ',
            'reading_time' => 3,
            'status' => 'published',
            'approval_status' => 'approved',
            'is_featured' => true,
            'published_at' => now()->subHours(2),
            'views_count' => 3840,
            'shares_count' => 420,
            'seo_title' => 'ગુજરાતમાં સેમિકન્ડક્ટર હબનું વિસ્તરણ | સમાચાર ડેરી ૨૪x૭',
            'seo_description' => 'ગુજરાતમાં સેમિકન્ડક્ટર અને ઇલેક્ટ્રોનિક્સ ક્ષેત્રે ₹૧૫,૦૦૦ કરોડના રોકાણ અને રોજગારના તાજા સમાચાર.',
        ]);

        // 2. ARTICLE: Ahmedabad Metro (Published)
        Article::create([
            'title' => 'અમદાવાદ મેટ્રો ફેઝ-૨: મોટેરાથી ગાંધીનગર સેક્ટર-૧ સુધીનું ટ્રાયલ રન સફળ, ટૂંક સમયમાં મુસાફરો માટે ખુલ્લી મુકાશે',
            'subtitle' => 'મેટ્રો રેલ પ્રોજેક્ટના વિસ્તરણથી ટ્વિન સિટી વચ્ચેનો પ્રવાસ માત્ર ૪૦ મિનિટમાં શક્ય બનશે',
            'slug' => 'ahmedabad-gandhinagar-metro-phase-2-trial-run-successful',
            'short_description' => 'મોટેરા સ્ટેડિયમથી ગિફ્ટ સિટી અને મહાત્મા મંદિર સુધી મેટ્રો લાઇનનું કાર્ય પૂર્ણ થતાં મુસાફરો માટે પરિવહન વધુ સરળ બનશે.',
            'content' => "<p>અમદાવાદ અને ગાંધીનગર વચ્ચે દૈનિક અવરજવર કરતા હજારો કર્મચારીઓ અને વિદ્યાર્થીઓ માટે સારા સમાચાર છે. અમદાવાદ મેટ્રો રેલ પ્રોજેક્ટના બીજા તબક્કા અંતર્ગત મોટેરાથી ગાંધીનગર સેક્ટર-૧ સુધીનું સુપરવાઇઝરી ટ્રાયલ રન સફળતાપૂર્વક સંપન્ન થયું છે.</p>
<p>રેલવે સેફ્ટી કમિશનર (CMRS) દ્વારા આ રૂટનું અંતિમ નિરીક્ષણ આગામી સપ્તાહે કરવામાં આવશે, જેના પછી વ્યાપારી ધોરણે સેવા શરૂ કરવાની મંજૂરી મળશે.</p>",
            'category_id' => $catAhmedabad->id,
            'district_id' => $distAhmedabad->id,
            'city_id' => $cityAhmedabad->id,
            'author_id' => $staffReporter->id,
            'editor_id' => $channelHead->id,
            'source_name' => 'GMRC પ્રેસ રીલીઝ',
            'content_type' => 'Staff Report',
            'featured_image' => 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=1200&q=80',
            'reading_time' => 2,
            'status' => 'published',
            'approval_status' => 'approved',
            'is_featured' => true,
            'published_at' => now()->subHours(4),
            'views_count' => 2190,
            'shares_count' => 185,
        ]);

        // 3. ARTICLE: Surat Diamond Bourse (Published)
        Article::create([
            'title' => 'સુરત ડાયમંડ બુર્સમાં વૈશ્વિક વેપારીઓનું આગમન: હીરા ઉદ્યોગમાં નવી તેજીના સંકેતો',
            'subtitle' => 'અમેરિકા અને બેલ્જિયમથી આવેલા ખરીદદારો સાથે અબજો રૂપિયાના સોદા પાર પડ્યા',
            'slug' => 'surat-diamond-bourse-global-buyers-trade-growth',
            'short_description' => 'ખજોદ સ્થિત સુરત ડાયમંડ બુર્સમાં વિદેશી ખરીદદારોના પ્રવાસથી સ્થાનિક રત્નકલાકારો અને વેપારીઓમાં ઉત્સાહ જોવા મળ્યો.',
            'content' => "<p>વિશ્વના સૌથી મોટા ઓફિસ સંકુલ તરીકે ખ્યાતિ પામેલા સુરત ડાયમંડ બુર્સ (SDB) માં આંતરરાષ્ટ્રીય સ્તરની લેવડદેવડ તેજ બની છે. યુરોપ અને યુએસએના ૨૫ થી વધુ મોટા ખરીદદારોએ ખાસ સેમિનારમાં ભાગ લીધો હતો.</p>
<p>લેબગ્રોન ડાયમંડ અને નેચરલ પોલિશ્ડ ડાયમંડ બંને સેગમેન્ટમાં ૨૦ ટકાથી વધુ વૃદ્ધિ નોંધાઈ છે.</p>",
            'category_id' => $catSurat->id,
            'district_id' => $distSurat->id,
            'city_id' => $citySurat->id,
            'author_id' => $staffReporter->id,
            'editor_id' => $channelHead->id,
            'source_name' => 'સુરત ડાયમંડ એસોસિયેશન',
            'content_type' => 'Original Reporting',
            'featured_image' => 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
            'reading_time' => 3,
            'status' => 'published',
            'approval_status' => 'approved',
            'is_featured' => true,
            'published_at' => now()->subHours(6),
            'views_count' => 1950,
            'shares_count' => 140,
        ]);

        // 4. ARTICLE: Stock Market Nifty (Published)
        Article::create([
            'title' => 'શેરબજારમાં રેકોર્ડબ્રેક તેજી: નિફ્ટી ૨૫,૪૦૦ ની સર્વોચ્ચ સપાટી વટાવી, સેન્સેક્સમાં ૪૭૦ પોઈન્ટનો ઉછાળો',
            'subtitle' => 'આઈટી અને બેન્કિંગ શેરોમાં જોરદાર લેવાલી, વિદેશી સંસ્થાકીય રોકાણકારો (FII) ની ચોખ્ખી ખરીદી',
            'slug' => 'stock-market-rally-nifty-crosses-record-high-sensex-gains',
            'short_description' => 'ભારતીય શેરબજારમાં રોકાણકારોની સંપત્તિમાં ₹૩.૫ લાખ કરોડનો વધારો નોંધાયો. TCS અને રિલાયન્સ માર્કેટ લીડર રહ્યા.',
            'content' => "<p>સપ્તાહના પ્રથમ કારોબારી દિવસે સ્થાનિક શેરબજારે નવો ઈતિહાસ રચ્યો છે. એનએસઈ નિફ્ટી ૫૦ ઇન્ડેક્સ ૨૫,૪૨૦ ની સપાટી કૂદાવી ગયો છે. જ્યારે બીએસઈ સેન્સેક્સ ૮૩,૧૮૦ પોઈન્ટની નજીક ટ્રેડ કરી રહ્યો છે.</p>
<p>વિદેશી રોકાણકારો દ્વારા સતત મૂડીપ્રવાહ અને જીડીપી વૃદ્ધિના સકારાત્મક અંદાજોને કારણે બજારમાં આશાવાદ જોવા મળી રહ્યો છે.</p>",
            'category_id' => $catMarket->id,
            'author_id' => $staffReporter->id,
            'editor_id' => $channelHead->id,
            'source_name' => 'NSE/BSE માર્કેટ બુલેટિન',
            'content_type' => 'Staff Report',
            'featured_image' => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
            'reading_time' => 2,
            'status' => 'published',
            'approval_status' => 'approved',
            'published_at' => now()->subHours(8),
            'views_count' => 3120,
            'shares_count' => 290,
        ]);

        // 5. ARTICLE: Rajkot AIIMS (Published)
        Article::create([
            'title' => 'રાજકોટ એઈમ્સ (AIIMS) માં અદ્યતન સુપર સ્પેશિયાલિટી વિંગ કાર્યરત: સૌરાષ્ટ્રના દર્દીઓને મળશે રાહત',
            'subtitle' => 'કાર્ડિયોલોજી અને ન્યુરોલોજીના જટિલ ઓપરેશન્સ હવે રાજકોટમાં નજીવા દરે ઉપલબ્ધ બનશે',
            'slug' => 'rajkot-aiims-super-speciality-wing-operational-saurashtra',
            'short_description' => 'સૌરાષ્ટ્ર અને કચ્છના લાખો દર્દીઓને હવે અમદાવાદ કે મુંબઈ સુધી લાંબા થવું નહીં પડે.',
            'content' => "<p>રાજકોટના ખંડેરી સ્થિત ઓલ ઈન્ડિયા ઈન્સ્ટીટ્યુટ ઓફ મેડિકલ સાયન્સિસ (AIIMS) ખાતે તમામ સુપર સ્પેશિયાલિટી સેવાઓ પૂર્ણ ક્ષમતા સાથે શરૂ થઈ ચૂકી છે.</p>
<p>હોસ્પિટલ તંત્રના જણાવ્યા અનુસાર દૈનિક ઓપીડીમાં ૧,૫૦૦ થી વધુ દર્દીઓ લાભ લઈ રહ્યા છે.</p>",
            'category_id' => $catRajkot->id,
            'district_id' => $distRajkot->id,
            'city_id' => $cityRajkot->id,
            'author_id' => $staffReporter->id,
            'editor_id' => $channelHead->id,
            'content_type' => 'Original Reporting',
            'featured_image' => 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
            'reading_time' => 2,
            'status' => 'published',
            'approval_status' => 'approved',
            'published_at' => now()->subHours(12),
            'views_count' => 1430,
            'shares_count' => 98,
        ]);

        // 6. DRAFT ARTICLE (Staff only, not visible publicly)
        Article::create([
            'title' => '[ડ્રાફ્ટ] વડોદરા સ્માર્ટ સિટી પ્રોજેક્ટ: વિશ્વામિત્રી નદી શુદ્ધિકરણ યોજનાનો પ્રારંભિક અહેવાલ',
            'subtitle' => 'વરસાદી પૂર નિયંત્રણ અને નદી કિનારાના નવીનીકરણ માટે તૈયાર કરાયેલ દરખાસ્ત',
            'slug' => 'draft-vadodara-vishwamitri-river-rejuvenation-project',
            'short_description' => 'આ અહેવાલ હજી ડ્રાફ્ટ અવસ્થામાં છે અને સ્ટાફ રિપોર્ટર દ્વારા માહિતી એકત્રિત થઈ રહી છે.',
            'content' => '<p>આ ડ્રાફ્ટ લેખ છે. વડોદરા મ્યુનિસિપલ કોર્પોરેશનના અધિકારીઓ પાસેથી ડેટા મેળવવાનો બાકી છે.</p>',
            'category_id' => $catVadodara->id,
            'district_id' => $distVadodara->id,
            'city_id' => $cityVadodara->id,
            'author_id' => $staffReporter->id,
            'status' => 'draft',
            'approval_status' => 'draft',
            'reading_time' => 1,
        ]);

        // 7. PENDING APPROVAL ARTICLE (In Channel Head Queue)
        Article::create([
            'title' => 'ગીર સોમનાથમાં એશિયાટિક સિંહોની સંખ્યામાં ઉત્સાહજનક વધારો: વન વિભાગનો સર્વે રિપોર્ટ',
            'subtitle' => 'ગીર રાષ્ટ્રીય ઉદ્યાન ઉપરાંત રેવન્યુ વિસ્તારોમાં પણ સિંહોનું સલામત સંરક્ષણ',
            'slug' => 'gir-somnath-asiatic-lions-population-census-report',
            'short_description' => 'સ્થાનિક માલધારીઓ અને વન્યજીવ પ્રેમીઓના સહયોગથી સિંહોના વસવાટમાં અનુકૂળ વાતાવરણ સર્જાયું છે.',
            'content' => '<p>વન વિભાગ દ્વારા હાથ ધરવામાં આવેલા સેટેલાઇટ ટ્રેકિંગ અને કેમેરા ટ્રેપિંગ આધારિત સર્વેક્ષણમાં ગીરમાં સિંહ પરિવારની સંખ્યામાં નોંધપાત્ર વૃદ્ધિ જોવા મળી છે.</p>',
            'category_id' => $catGujarat->id,
            'author_id' => $staffReporter->id,
            'status' => 'pending_review',
            'approval_status' => 'pending',
            'reading_time' => 2,
            'featured_image' => 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
        ]);

        // 8. REJECTED ARTICLE (With reason)
        Article::create([
            'title' => 'અમદાવાદ એસ.જી. હાઇવે પર ટ્રાફિક વ્યવસ્થાપન માટે નવો ફ્લાયઓવર પ્રોજેક્ટ',
            'subtitle' => 'મ્યુનિસિપલ કોર્પોરેશનની સંભવિત દરખાસ્ત',
            'slug' => 'rejected-ahmedabad-sg-highway-flyover-proposal',
            'short_description' => 'સૂત્રો દ્વારા મળતી અપ્રમાણિત માહિતી આધારે તૈયાર થયેલ લેખ.',
            'content' => '<p>આ લેખમાં સત્તાવાર પક્ષની પ્રતિક્રિયા લેવામાં આવી ન હતી.</p>',
            'category_id' => $catAhmedabad->id,
            'district_id' => $distAhmedabad->id,
            'city_id' => $cityAhmedabad->id,
            'author_id' => $staffReporter->id,
            'status' => 'rejected',
            'approval_status' => 'rejected',
            'rejection_reason' => 'તથ્યોની પુષ્ટિ બાકી છે. મ્યુનિસિપલ કમિશનર અથવા સંબંધી ઈજનેરનું સત્તાવાર નિવેદન ઉમેર્યા બાદ પુનઃ રજૂ કરો.',
            'reading_time' => 1,
        ]);

        // BREAKING NEWS
        $breakingItems = [
            [
                'headline' => 'સાણંદ અને ધોલેરામાં સેમિકન્ડક્ટર પ્લાન્ટ્સ માટે ₹૧૫,૦૦૦ કરોડના નવા એમઓયુ સંપન્ન',
                'priority' => 10,
                'is_pinned' => true,
                'status' => 'published',
                'start_time' => now()->subHours(1),
                'created_by' => $channelHead->id,
            ],
            [
                'headline' => 'શેરબજારમાં જોરદાર ઉછાળો: નિફ્ટી ૨૫,૪૦૦ ની સર્વોચ્ચ સપાટીને સ્પર્શી ગયો',
                'priority' => 8,
                'is_pinned' => false,
                'status' => 'published',
                'start_time' => now()->subHours(2),
                'created_by' => $channelHead->id,
            ],
            [
                'headline' => 'અમદાવાદ મેટ્રો ફેઝ-૨ નું મોટેરા-ગાંધીનગર રૂટ પર ટ્રાયલ રન સફળતાપૂર્વક પૂર્ણ',
                'priority' => 7,
                'is_pinned' => false,
                'status' => 'published',
                'start_time' => now()->subHours(3),
                'created_by' => $channelHead->id,
            ],
        ];

        foreach ($breakingItems as $bi) {
            BreakingNews::create($bi);
        }

        // YOUTUBE VIDEOS (Official Embeds)
        $videos = [
            [
                'title' => 'ગુજરાતમાં બુલેટ ટ્રેન પ્રોજેક્ટની તાજી સ્થિતિ: સાબરમતી હબનું ગ્રાઉન્ડ રિપોર્ટિંગ',
                'description' => 'મુંબઈ-અમદાવાદ હાઈસ્પીડ રેલ કોરિડોરના નિર્માણ કાર્યની વિગતવાર સમીક્ષા.',
                'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'video_id' => 'dQw4w9WgXcQ',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1510519138171-c70d7634f02c?auto=format&fit=crop&w=800&q=80',
                'duration' => '08:45',
                'category_id' => $catGujarat->id,
                'author_id' => $staffReporter->id,
                'is_featured' => true,
                'status' => 'published',
                'views_count' => 5400,
                'published_at' => now()->subHours(5),
            ],
            [
                'title' => 'સ્ટેચ્યુ ઓફ યુનિટી પર નવી સુવિધાઓ: નર્મદા ડેમનો મનોહર નજારો',
                'description' => 'કેવડિયા એકતા નગર ખાતે પ્રવાસીઓ માટે નવી બોટિંગ અને લાઇટ-શો સેવા.',
                'youtube_url' => 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
                'video_id' => 'kJQP7kiw5Fk',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1596405835955-4606f75f8507?auto=format&fit=crop&w=800&q=80',
                'duration' => '05:12',
                'category_id' => $catGujarat->id,
                'author_id' => $staffReporter->id,
                'is_featured' => false,
                'status' => 'published',
                'views_count' => 3200,
                'published_at' => now()->subHours(10),
            ],
        ];

        foreach ($videos as $v) {
            YouTubeVideo::create($v);
        }

        // INSTAGRAM REELS (Official Embeds)
        $reels = [
            [
                'title' => 'અમદાવાદ રિવરફ્રન્ટ પર સવારની ખુશનુમા મોસમ | ગ્રાઉન્ડ વ્યુ',
                'caption' => 'સાબરમતી રિવરફ્રન્ટ પર ચાલતા વોકર્સ અને સાયકલિંગ ઉત્સાહીઓ સાથે ખાસ વાતચીત. #Ahmedabad #Riverfront',
                'instagram_url' => 'https://www.instagram.com/reel/C123456789/',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=600&q=80',
                'category_id' => $catAhmedabad->id,
                'district_id' => $distAhmedabad->id,
                'author_id' => $staffReporter->id,
                'status' => 'published',
                'views_count' => 8900,
                'published_at' => now()->subHours(3),
            ],
            [
                'title' => 'સુરતની પ્રખ્યાત લોચો વાનગી અને સ્ટ્રીટ ફૂડ સંસ્કૃતિ',
                'caption' => 'સુરતી સ્વાદના શોખીનો માટે રવિવારની ખાસ સફર! #SuratFood #StreetFood',
                'instagram_url' => 'https://www.instagram.com/reel/C987654321/',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
                'category_id' => $catSurat->id,
                'district_id' => $distSurat->id,
                'author_id' => $staffReporter->id,
                'status' => 'published',
                'views_count' => 12400,
                'published_at' => now()->subHours(7),
            ],
        ];

        foreach ($reels as $r) {
            InstagramReel::create($r);
        }

        // PHOTO GALLERIES
        $gallery = PhotoGallery::create([
            'title' => 'કચ્છના રણોત્સવની રંગત: ધોરડોમાં સફેદ રણ પર પૂર્ણિમાનો અદભુત નજારો',
            'slug' => 'kutch-rann-utsav-dhordo-white-desert-glimpses',
            'description' => 'વિશ્વભરના પ્રવાસીઓ માટે આકર્ષણનું કેન્દ્ર બનેલા કચ્છના સફેદ રણ અને સાંસ્કૃતિક મેળાવડાની શ્રેષ્ઠ તસવીરો.',
            'cover_image' => 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
            'category_id' => $catGujarat->id,
            'author_id' => $staffReporter->id,
            'status' => 'published',
            'views_count' => 3100,
            'published_at' => now()->subDays(1),
        ]);

        $images = [
            ['image_url' => 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80', 'caption' => 'સૂર્યાસ્ત સમયે કચ્છનું સફેદ રણ', 'credit' => 'સમય પિક્ચર્સ', 'sort_order' => 1],
            ['image_url' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80', 'caption' => 'રણોત્સવ ટેન્ટ સિટીનો રાત્રિનો અદભુત નજારો', 'credit' => 'ગુજરાત ટુરીઝમ', 'sort_order' => 2],
            ['image_url' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80', 'caption' => 'કચ્છી પરંપરાગત ભરતકામ અને હસ્તકલા સ્ટોલ', 'credit' => 'સમય પિક્ચર્સ', 'sort_order' => 3],
        ];

        foreach ($images as $img) {
            $gallery->images()->create($img);
        }
    }
}
