import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';
import { useSettings } from '../context/SettingsContext';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Video, 
  Globe2, 
  ShieldCheck, 
  Sparkles, 
  Navigation,
  ExternalLink 
} from 'lucide-react';
import { Instagram, Youtube } from '../components/common/BrandIcons';

export default function AboutPage() {
  const { settings, getDirectionsUrl } = useSettings();
  const directionsUrl = getDirectionsUrl();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />
      <BreakingNewsTicker />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white py-14 px-4 shadow-inner">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-red-700/60 border border-red-500/40 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>સંસ્થા પરિચય • Organization Profile</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-gujarati tracking-tight mb-3">
            અમારા વિશે (About {settings.site_name || 'Samachar Diary'})
          </h1>
          <p className="text-red-100 text-base md:text-lg font-gujarati max-w-2xl mx-auto leading-relaxed">
            {settings.site_tagline || 'ગુજરાતનું અગ્રણી અને સૌથી વિશ્વસનીય ડિજિટલ સમાચાર માધ્યમ.'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">

          {/* Section 1: Organization & Mission */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-gujarati text-slate-900">
                  સંસ્થા અને પરિચય ({settings.site_name || 'Samachar Diary'})
                </h2>
                <span className="text-xs text-slate-500">Digital News & Field Journalism</span>
              </div>
            </div>

            <p className="text-slate-700 text-sm md:text-base leading-relaxed font-gujarati">
              <strong>{settings.site_name || 'Samachar Diary'}</strong> એ ગુજરાત અને દેશ-વિદેશના તાજા, મહત્વપૂર્ણ અને લોકહિતના સમાચારો આપતું સમર્પિત ડિજિટલ ન્યૂઝ પ્લેટફોર્મ છે. 
              અમારો મુખ્ય હેતુ વિશ્વસનીય, પુષ્ટિ થયેલ અને તટસ્થ માહિતી ઝડપથી લોકો સુધી પહોંચાડવાનો છે.
            </p>
          </div>

          {/* Section 2: Coverage Focus */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-gujarati text-slate-900">
                  કવરેજ ફોકસ (Coverage Focus)
                </h2>
                <span className="text-xs text-slate-500">ગુજરાતના ૩૩ જિલ્લાઓ અને સ્થાનિક મુદ્દાઓ</span>
              </div>
            </div>

            <p className="text-slate-700 text-sm md:text-base leading-relaxed font-gujarati">
              અમારું સંપાદકીય કવરેજ ગુજરાતના તમામ ૩૩ જિલ્લાઓના પાયાના પ્રશ્નો, સ્થાનિક ઘટનાઓ, સરકારી નીતિઓ અને નાગરિકોના અવાજને કેન્દ્રમાં રાખે છે:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm font-gujarati mb-1">
                  🏛️ સ્થાનિક & રાજ્ય સમાચાર
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-gujarati">
                  ગુજરાતના ગામડાઓથી લઈને મહાનગરો સુધીના સામાજિક, પ્રશાસનિક અને વિકાસ કાર્યોનું વિગતવાર કવરેજ.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm font-gujarati mb-1">
                  📈 વેપાર અને શેરબજાર
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-gujarati">
                  ભારતીય શેરબજાર (NIFTY 50, SENSEX), વેપાર, ઉદ્યોગ અને રોકાણકારો માટે વિશ્લેષણાત્મક માહિતી.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm font-gujarati mb-1">
                  ⚖️ તટસ્થ અને સચોટ માહિતી
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-gujarati">
                  અફવાઓ અને ખોટા સમાચારોથી મુક્ત, વિશ્વસનીય સ્ત્રોતો દ્વારા ચકાસાયેલ માહિતીનું પ્રકાશન.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Digital News & Video Presence */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-gujarati text-slate-900">
                  ડિજિટલ ન્યૂઝ અને વિડિયો પ્રસ્તુતિ (Digital Video Presence)
                </h2>
                <span className="text-xs text-slate-500">ગ્રાઉન્ડ રિપોર્ટ્સ, રીલ્સ અને વિડિયો બુલેટિન</span>
              </div>
            </div>

            <p className="text-slate-700 text-sm md:text-base leading-relaxed font-gujarati">
              આજના આધુનિક ડિજિટલ યુગમાં વાચકો અને દર્શકો સુધી તાત્કાલિક માહિતી પહોંચાડવા માટે {settings.site_name || 'Samachar Diary'} સોશિયલ અને ડિજિટલ વિડિયો પ્લેટફોર્મ્સ પર સક્રિય છે.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <a
                href={settings.social_youtube || 'https://www.youtube.com/@SamacharDiary24x7'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100/80 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Youtube size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block">સત્તાવાર યૂટ્યુબ ચેનલ</span>
                  <span className="text-xs text-red-700 font-semibold truncate block">@SamacharDiary24x7</span>
                </div>
                <ExternalLink className="w-4 h-4 text-red-600" />
              </a>

              <a
                href={settings.social_instagram || 'https://www.instagram.com/samachardiary/'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-pink-200 bg-pink-50/60 hover:bg-pink-100/80 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shrink-0">
                  <Instagram size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block">સત્તાવાર ઇન્સ્ટાગ્રામ</span>
                  <span className="text-xs text-pink-700 font-semibold truncate block">@samachardiary</span>
                </div>
                <ExternalLink className="w-4 h-4 text-pink-600" />
              </a>
            </div>
          </div>

          {/* Section 4: Office Contact Information */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-gujarati text-slate-900">
                  મુખ્ય કાર્યાલય સરનામું અને સંપર્ક (Office Contact)
                </h2>
                <span className="text-xs text-slate-500">Official Bureau Location</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-sm">
              <div>
                <strong className="text-slate-900 block font-semibold mb-1">
                  {settings.site_name || 'Samachar Diary'}
                </strong>
                <p className="text-slate-700 leading-relaxed">
                  {settings.office_address}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-red-600" />
                  <a href={`mailto:${settings.contact_email}`} className="text-slate-900 font-bold hover:underline">
                    {settings.contact_email}
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps પર લોકેશન જુઓ (Get Directions)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
