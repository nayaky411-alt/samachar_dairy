import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';
import { ShieldCheck, Mail, Phone, MapPin, CheckCircle, Send, FileText, AlertCircle, Award, Users, Globe, Building } from 'lucide-react';

const PageWrapper = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <Header />
    <BreakingNewsTicker />
    <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold font-gujarati mb-3">{title}</h1>
        {subtitle && <p className="text-red-100 text-base md:text-lg font-gujarati max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </div>
    <main className="flex-grow container mx-auto max-w-4xl px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 font-gujarati leading-relaxed">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

// 1. About Us
export const AboutPage = () => (
  <PageWrapper 
    title="અમારા વિશે (About Us)" 
    subtitle="સમાચાર ડેરી ૨૪x૭ - ગુજરાતનું સૌથી વિશ્વસનીય અને તટસ્થ ડિજિટલ સમાચાર માધ્યમ"
  >
    <div className="space-y-6 text-slate-700">
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 text-red-900 mb-6">
        <Award className="w-8 h-8 text-red-700 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-lg">તટસ્થતા • સત્યતા • ઝડપ • લોકહિત</h3>
          <p className="text-sm text-red-800">અમારો ઉદ્દેશ્ય સામાન્ય નાગરિક સુધી સાચા અને પુષ્ટિ થયેલા સમાચાર પહોંચાડવાનો છે.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">અમારો પરિચય અને સંકલ્પ</h2>
      <p>
        <strong>સમાચાર ડેરી ૨૪x૭ (Samachar Dairy 247)</strong> એ ગુજરાત અને દેશભરના નાગરિકો માટે ૨૪ કલાક અવિરત કાર્યરત સ્વતંત્ર ડિજિટલ ન્યૂઝ પ્લેટફોર્મ છે. 
        અમદાવાદ સ્થિત મુખ્ય કાર્યાલય અને ગાંધીનગર બ્યુરો સહિત ગુજરાતના તમામ <strong>૩૩ જિલ્લાઓમાં</strong> અમારા ખાસ સંવાદદાતાઓ અને વિડિયો પત્રકારોની ટીમ કાર્યરત છે.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
        <div className="p-4 bg-slate-50 border rounded-xl text-center">
          <Globe className="w-8 h-8 text-red-700 mx-auto mb-2" />
          <h4 className="font-bold text-slate-900">૩૩ જિલ્લાઓ</h4>
          <p className="text-xs text-slate-500">ગામડાથી લઈને ગાંધીનગર સુધી ગાઢ કવરેજ</p>
        </div>
        <div className="p-4 bg-slate-50 border rounded-xl text-center">
          <Users className="w-8 h-8 text-red-700 mx-auto mb-2" />
          <h4 className="font-bold text-slate-900">૫૦+ પત્રકારો</h4>
          <p className="text-xs text-slate-500">અનુભવી સંપાદકો અને ફિલ્ડ રિપોર્ટર્સ</p>
        </div>
        <div className="p-4 bg-slate-50 border rounded-xl text-center">
          <Building className="w-8 h-8 text-red-700 mx-auto mb-2" />
          <h4 className="font-bold text-slate-900">ડિજિટલ ફર્સ્ટ</h4>
          <p className="text-xs text-slate-500">લાઈવ બ્રેકિંગ, વિડિયો રીલ્સ અને ગ્રાઉન્ડ રિપોર્ટ્સ</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">અમારી મુખ્ય પ્રાથમિકતાઓ</h2>
      <ul className="list-disc list-inside space-y-2 pl-2">
        <li><strong>સ્થાનિક સમસ્યાઓને વાચા:</strong> ખેડૂતો, યુવાનો, મહિલાઓ અને વેપારીઓને સ્પર્શતા પાયાના પ્રશ્નોનું ઊંડાણપૂર્વક કવરેજ.</li>
        <li><strong>રાજકીય તટસ્થતા:</strong> કોઈ પણ રાજકીય પક્ષ કે વિચારધારાથી પ્રભાવિત થયા વગર સંતુલિત અને દ્વિપક્ષીય અહેવાલો.</li>
        <li><strong>શેરબજાર અને બિઝનેસ:</strong> ગુજરાતીઓ માટે શેરબજાર (NIFTY, SENSEX), વેપાર, કરન્સી અને ઉદ્યોગ જગતના દૈનિક અપડેટ્સ.</li>
        <li><strong>ફેક્ટ-ચેકિંગ:</strong> સોશિયલ મીડિયા પર ફેલાતી અફવાઓ અને ખોટા સમાચારોની સચોટ ચકાસણી.</li>
      </ul>
    </div>
  </PageWrapper>
);

// 2. Editorial Policy
export const EditorialPolicyPage = () => (
  <PageWrapper 
    title="સંપાદકીય નીતિ (Editorial Policy)" 
    subtitle="સમાચાર ડેરી ૨૪x૭ ના પત્રકારત્વના સિદ્ધાંતો અને આદર્શો"
  >
    <div className="space-y-6 text-slate-700">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold">સત્ય, પારદર્શિતા અને જવાબદારી</h4>
          <p className="text-sm text-blue-800">અમારા કોઈપણ સમાચાર પ્રકાશિત થતાં પહેલાં ઓછામાં ઓછા બે સ્વતંત્ર સ્ત્રોતો દ્વારા ચકાસવામાં આવે છે.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૧. સચોટતા અને તથ્ય ચકાસણી (Accuracy & Fact-Checking)</h2>
      <p>
        અમે સનસનાટી ફેલાવવા કરતાં સચોટતાને મહત્વ આપીએ છીએ. સમાચાર ડેરી ૨૪x૭ ના ડેસ્ક પર આવતો દરેક અહેવાલ સિનિયર એડિટોરિયલ બોર્ડ દ્વારા સ્ક્રીન થયા બાદ જ વેબસાઈટ અને સોશિયલ મીડિયા પર રજૂ થાય છે.
      </p>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૨. સ્વતંત્રતા અને તટસ્થતા (Independence & Impartiality)</h2>
      <p>
        અમારું સંપાદકીય મંડળ કોઈપણ વ્યાપારી હિત કે રાજકીય દબાણથી મુક્ત રહીને નિર્ણય લે છે. જાહેર હિતના મુદ્દાઓમાં તમામ પક્ષોનો અભિપ્રાય લેવો ફરજિયાત ગણવામાં આવે છે.
      </p>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૩. ગોપનીય સ્ત્રોતોની સુરક્ષા (Protection of Sources)</h2>
      <p>
        પત્રકારત્વના મૂળભૂત અધિકાર મુજબ, વ્હિસલબ્લોઅર અને ગોપનીય માહિતી આપનાર વ્યક્તિની ઓળખ ક્યારેય જાહેર કરવામાં આવતી નથી.
      </p>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૪. સંવેદનશીલતા અને સામાજિક સૌહાર્દ (Social Harmony)</h2>
      <p>
        કોઈપણ જ્ઞાતિ, ધર્મ, લિંગ કે ભાષા પ્રત્યે નફરત ફેલાવતા સમાચારો કે કોમેન્ટ્સને અમારા પ્લેટફોર્મ પર સખ્તાઈથી પ્રતિબંધિત કરવામાં આવ્યા છે.
      </p>
    </div>
  </PageWrapper>
);

// 3. Corrections Policy
export const CorrectionsPolicyPage = () => (
  <PageWrapper 
    title="સુધારા નીતિ (Corrections & Clarifications Policy)" 
    subtitle="ભૂલો સ્વીકારવાની અને પારદર્શક રીતે સુધારવાની અમારી પ્રતિબદ્ધતા"
  >
    <div className="space-y-6 text-slate-700">
      <p>
        <strong>સમાચાર ડેરી ૨૪x૭</strong> પોતાની ભૂલોને પારદર્શક રીતે સ્વીકારવામાં માને છે. જો કોઈ અહેવાલમાં હકીકત દોષ, જોડણી કે આંકડાકીય ક્ષતિ જણાશે તો અમે ત્વરિત સુધારો કરીએ છીએ.
      </p>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">સુધારાની પ્રક્રિયા (How We Handle Corrections)</h2>
      <ul className="list-disc list-inside space-y-3 pl-2">
        <li><strong>સુધારેલ લેબલ (Update Tag):</strong> સુધારેલા લેખની ટોચ પર અથવા તળિયે સુધારાની તારીખ, સમય અને સુધારાનું ચોક્કસ કારણ દર્શાવવામાં આવે છે.</li>
        <li><strong>મહત્વપૂર્ણ ભૂલો:</strong> જો કોઈ અહેવાલ ગેરમાર્ગે દોરનારો સાબિત થાય તો તેની સ્પષ્ટતા સાથેનું ક્લેરિફિકેશન હોમપેજ પર દર્શાવવામાં આવે છે.</li>
        <li><strong>વાંચકો તરફથી સુધારા અરજી:</strong> જો આપને અમારા કોઈપણ લેખ કે વિડિયોમાં ક્ષતિ જણાય તો આપ <code className="bg-slate-100 px-2 py-0.5 rounded text-red-700 font-mono">corrections@samachardairy247.com</code> પર ઈમેલ કરી શકો છો.</li>
      </ul>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
        <h4 className="font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-700" />
          નિવારણ સમયમર્યાદા (Grievance Timeline)
        </h4>
        <p className="text-sm mt-1">
          અમારી એડિટોરિયલ ટીમ દ્વારા સુધારા માટેની અરજીઓ મળ્યાના ૨૪ થી ૪૮ કલાકની અંદર તપાસ કરીને યોગ્ય નિર્ણય લેવામાં આવે છે.
        </p>
      </div>
    </div>
  </PageWrapper>
);

// 4. Privacy Policy
export const PrivacyPolicyPage = () => (
  <PageWrapper 
    title="ગોપનીયતા નીતિ (Privacy Policy)" 
    subtitle="તમારી વ્યક્તિગત માહિતીની સુરક્ષા અમારી પ્રથમ પ્રાથમિકતા છે"
  >
    <div className="space-y-6 text-slate-700">
      <p>
        આ ગોપનીયતા નીતિ દર્શાવે છે કે જ્યારે તમે <strong>સમાચાર ડેરી ૨૪x૭</strong> વેબસાઇટ અને મોબાઇલ એપ્લિકેશનનો ઉપયોગ કરો છો ત્યારે તમારી માહિતી કેવી રીતે એકત્રિત, ઉપયોગ અને સુરક્ષિત કરવામાં આવે છે.
      </p>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૧. અમે એકત્રિત કરીએ છીએ તે માહિતી</h2>
      <ul className="list-disc list-inside space-y-2 pl-2">
        <li>બ્રાઉઝિંગ ડેટા અને IP સરનામું (સુરક્ષા અને એનાલિટિક્સ માટે).</li>
        <li>કુકીઝ (Cookies) દ્વારા વપરાશકર્તાની ભાષા પસંદગી અને વારંવાર વંચાતા વિષયોની નોંધ.</li>
        <li>સંપર્ક ફોર્મ અથવા ન્યૂઝલેટર સબ્સ્ક્રિપ્શન દ્વારા આપેલું નામ અને ઇમેઇલ સરનામું.</li>
      </ul>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૨. ડેટા સુરક્ષા (Data Security)</h2>
      <p>
        અમે તમારા વ્યક્તિગત ડેટાને કોઈપણ ત્રીજા પક્ષકાર (Third Party) ને વેચતા કે ભાડે આપતા નથી. તમામ સર્વર્સ ઉચ્ચ કક્ષાના એન્ક્રિપ્શન સાથે સુરક્ષિત રાખવામાં આવ્યા છે.
      </p>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૩. ત્રીજા પક્ષની લિંક્સ (Third Party Links)</h2>
      <p>
        અમારી વેબસાઈટ પર અન્ય ન્યૂઝ સોર્સ, વિડિયો (YouTube) કે સોશિયલ મીડિયા (Instagram) ના એમ્બેડેડ પ્લેયર્સ હોઈ શકે છે. તેમના નિયમો તેમની પોલિસી મુજબ લાગુ પડશે.
      </p>
    </div>
  </PageWrapper>
);

// 5. Terms of Service
export const TermsPage = () => (
  <PageWrapper 
    title="નિયમો અને શરતો (Terms of Service)" 
    subtitle="સમાચાર ડેરી ૨૪x૭ પ્લેટફોર્મના વપરાશ અંગેની કાનૂની શરતો"
  >
    <div className="space-y-6 text-slate-700">
      <p>
        સમાચાર ડેરી ૨૪x૭ ની મુલાકાત લઈને તમે આ નિયમો અને શરતોનું પાલન કરવા સંમત થાઓ છો.
      </p>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૧. કોપીરાઈટ અને બૌદ્ધિક સંપત્તિ (Copyright & IP)</h2>
      <p>
        આ વેબસાઈટ પર પ્રકાશિત તમામ ટેક્સ્ટ, વિડિયો, ગ્રાફિક્સ અને ફોટોગ્રાફ્સ <strong>સમાચાર ડેરી ૨૪x૭</strong> ની માલિકીના છે. અમારી લેખિત પરવાનગી વિના કોઈપણ સામગ્રીનો વ્યાવસાયિક ઉપયોગ કરી શકાશે નહીં.
      </p>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૨. વપરાશકર્તાની ટિપ્પણીઓ (User Comments Policy)</h2>
      <p>
        વાંચકો દ્વારા પોસ્ટ કરવામાં આવતી ટિપ્પણીઓમાં અશ્લીલતા, બદનક્ષીભર્યા શબ્દો કે હિંસા ફેલાવતા લખાણને કોઈપણ પૂર્વસૂચના વિના દૂર કરવાનો અધિકાર એડિટોરિયલ બોર્ડ પાસે સુરક્ષિત છે.
      </p>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">૩. શેરબજાર ડિસ્ક્લેમર (Market Disclaimer)</h2>
      <p className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-sm">
        <strong>મહત્વપૂર્ણ નોંધ:</strong> શેરબજાર અને કોમોડિટી માર્કેટ સંબંધિત માહિતી માત્ર શૈક્ષણિક અને માહિતીના હેતુ માટે છે. રોકાણ કરતા પહેલા તમારા અધિકૃત નાણાકીય સલાહકારની સલાહ અવશ્ય લો. સમાચાર ડેરી ૨૪x૭ કોઈપણ નુકસાન માટે જવાબદાર રહેશે નહીં.
      </p>
    </div>
  </PageWrapper>
);

// 6. Contact Us
export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageWrapper 
      title="સંપર્ક કરો (Contact Us)" 
      subtitle="અમારી ટીમ સાથે સીધો સંપર્ક કરો અથવા સમાચાર અને સૂચનો મોકલો"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b">મુખ્ય કાર્યાલય અને બ્યુરો</h2>
          
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-700 flex-shrink-0 mt-1" />
              <div>
                <strong className="text-slate-900 block font-base">મુખ્ય કાર્યાલય (Head Office):</strong>
                સમાચાર ડેરી ૨૪x૭ મીડિયા હાઉસ, એસ.જી. હાઇવે, અમદાવાદ - ૩૮૦૦૫૪, ગુજરાત.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-red-700 flex-shrink-0 mt-1" />
              <div>
                <strong className="text-slate-900 block font-base">ગાંધીનગર બ્યુરો:</strong>
                પ્રેસ રૂમ, સચિવાલય સંકુલ, ગાંધીનગર - ૩૮૨૦૧૦.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-red-700 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block font-base">ન્યૂઝરૂમ હેલ્પલાઇન:</strong>
                +91 79 2658 9800 / +91 98250 12345
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-red-700 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block font-base">ઇમેઇલ:</strong>
                editor@samachardairy247.com, contact@samachardairy247.com
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-200">
            <h4 className="font-bold text-red-900 mb-1">તમારી આસપાસ બનતી ઘટનાઓના સમાચાર આપો</h4>
            <p className="text-xs text-red-800">
              જો તમારી પાસે કોઈ બ્રેકિંગ ન્યૂઝ, વિડિયો કે ગંભીર ભ્રષ્ટાચારની માહિતી હોય તો અમારા વ્હોટ્સએપ નંબર પર શેર કરી શકો છો. સ્ત્રોતની ઓળખ ગુપ્ત રાખવામાં આવશે.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 mb-4">સંદેશો મોકલો</h3>
          {submitted ? (
            <div className="text-center py-10">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 text-lg">આભાર! આપનો સંદેશ મળી ગયો છે.</h4>
              <p className="text-sm text-slate-600 mt-1">અમારી સંપાદકીય ટીમ ટૂંક સમયમાં તમારો સંપર્ક કરશે.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs text-red-700 font-bold hover:underline"
              >
                બીજો સંદેશો મોકલો
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">તમારું પૂરું નામ *</label>
                <input 
                  type="text" 
                  required
                  placeholder="દા.ત. રમેશભાઈ પટેલ"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">ઇમેઇલ *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">મોબાઇલ નંબર</label>
                  <input 
                    type="tel" 
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">વિષય *</label>
                <input 
                  type="text" 
                  required
                  placeholder="સમાચાર સૂચન / પૂછપરછ / પ્રતિભાવ"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">સંદેશો / સમાચાર વિગત *</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="વિગતવાર માહિતી અહીં લખો..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                સંદેશો મોકલો
              </button>
            </form>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

// 7. Advertise With Us
export const AdvertisePage = () => (
  <PageWrapper 
    title="જાહેરાત આપો (Advertise with Us)" 
    subtitle="ગુજરાતના કરોડો સક્રિય વાંચકો સુધી તમારો બ્રાન્ડ સંદેશ પહોંચાડો"
  >
    <div className="space-y-6 text-slate-700">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border border-red-200">
        <h3 className="text-xl font-bold text-red-900 mb-2">ગુજરાતનું સૌથી ઝડપથી વિકસતું ડિજિટલ સમાચાર નેટવર્ક</h3>
        <p className="text-slate-700 text-sm">
          સમાચાર ડેરી ૨૪x૭ અમદાવાદ, સુરત, વડોદરા, રાજકોટ સહિત રાજ્યના તમામ ૩૩ જિલ્લાઓમાં દૈનિક લાખો વાચકો અને દર્શકો ધરાવે છે. 
          અમારા ડિજિટલ સ્લોટ્સ તમારા વ્યવસાયને યોગ્ય લક્ષિત ગ્રાહકો સુધી પહોંચાડવામાં મદદ કરશે.
        </p>
      </div>

      <h2 className="text-xl font-bold text-slate-900 border-b pb-2">અમારી જાહેરાત તકો (Advertising Options)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <h4 className="font-bold text-red-700 mb-1">૧. હોમપેજ હેડર બેનર (Header Banner)</h4>
          <p className="text-xs text-slate-500 mb-2">કદ: ૭૨૮ x ૯૦ પિક્સેલ (ડેસ્કટોપ) & ૩૨૦ x ૫૦ પિક્સેલ (મોબાઇલ)</p>
          <p className="text-sm">મુખ્ય પાના પર સૌથી ટોચ પર દર્શાવાય છે. સર્વોચ્ચ ક્લિક-થ્રુ રેટ (CTR) ધરાવે છે.</p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <h4 className="font-bold text-red-700 mb-1">૨. લેખ ઇન-લાઇન સ્પોન્સરશિપ (In-Article Ads)</h4>
          <p className="text-xs text-slate-500 mb-2">કદ: ૩૦૦ x ૨૫૦ અથવા ૬૦૦ x ૩૦૦ પિક્સેલ</p>
          <p className="text-sm">વાંચક જ્યારે સમાચાર વાંચતો હોય ત્યારે લેખની મધ્યમાં ધ્યાન ખેંચતી પ્લેસમેન્ટ.</p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <h4 className="font-bold text-red-700 mb-1">૩. ડિસ્ટ્રિક્ટ સ્પેસિફિક બેનર્સ (Geo-Targeted)</h4>
          <p className="text-xs text-slate-500 mb-2">૩૩ જિલ્લા આધારિત ટાર્ગેટિંગ</p>
          <p className="text-sm">માત્ર સુરત, રાજકોટ કે તમારા પસંદ કરેલા જિલ્લાના વાચકોને જ જાહેરાત બતાવો.</p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <h4 className="font-bold text-red-700 mb-1">૪. બ્રાન્ડેડ કન્ટેન્ટ અને વિડિયો રીલ્સ</h4>
          <p className="text-xs text-slate-500 mb-2">સોશિયલ મીડિયા એમ્પ્લિફિકેશન</p>
          <p className="text-sm">પ્રોડક્ટ રિવ્યુ, ઉદ્ઘાટન કવરેજ અને ઇન્ટરવ્યુ આધારિત ખાસ પ્રાયોજિત સ્ટોરીઝ.</p>
        </div>
      </div>

      <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">જાહેરાત દર (Rate Card) અને બુકિંગ માટે સંપર્ક</h3>
          <p className="text-slate-300 text-sm mt-1">અમારી માર્કેટિંગ ટીમ તમારા બજેટ મુજબ કસ્ટમ પેકેજ બનાવી આપશે.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="mailto:ads@samachardairy247.com" 
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition text-center"
          >
            ads@samachardairy247.com
          </a>
          <a 
            href="tel:+917926589801" 
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition text-center"
          >
            +91 79 2658 9801
          </a>
        </div>
      </div>
    </div>
  </PageWrapper>
);
