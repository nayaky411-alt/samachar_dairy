import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';
import { useSettings } from '../context/SettingsContext';
import apiClient from '../api/client';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Send, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  Sparkles,
  Navigation
} from 'lucide-react';
import { Instagram, Youtube } from '../components/common/BrandIcons';

export default function ContactPage() {
  const { settings, getDirectionsUrl } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await apiClient.post('/contact', formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err.response?.data?.message || 'સંદેશો મોકલવામાં ક્ષતિ આવી. કૃપા કરીને ફરીથી પ્રયાસ કરો.');
    } finally {
      setSubmitting(false);
    }
  };

  const directionsUrl = getDirectionsUrl();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />
      <BreakingNewsTicker />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white py-14 px-4 shadow-inner">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-red-700/60 border border-red-500/40 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>સત્તાવાર સંપર્ક • Official Contact</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-gujarati tracking-tight mb-3">
            {settings.site_name || 'Samachar Diary'} સંપર્ક કેન્દ્ર
          </h1>
          <p className="text-red-100 text-base md:text-lg font-gujarati max-w-2xl mx-auto leading-relaxed">
            કોઈપણ સમાચાર સૂચન, પ્રેસ નોટ, પૂછપરછ અથવા જાહેરાત માટે અમારો સીધો સંપર્ક કરો.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Official Contact & Social Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Organization & Address Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="bg-red-700 text-white font-black text-xl px-2 py-0.5 rounded">
                  સમાચાર
                </span>
                <span className="text-slate-900 font-black text-xl">
                  ડેરી <span className="text-red-700">૨૪x૭</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  મુખ્ય કાર્યાલય સરનામું (Office Address)
                </span>
                <div className="flex items-start gap-3 text-slate-700 text-sm leading-relaxed">
                  <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">
                      {settings.site_name || 'Samachar Diary'}
                    </strong>
                    <p className="mt-1 text-slate-700 font-medium">
                      {settings.office_address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Get Directions Button */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition duration-200 shadow-sm"
              >
                <Navigation className="w-4 h-4 text-red-400 group-hover:text-white" />
                <span>Google Maps પર દિશા-નિર્દેશ મેળવો (Get Directions)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            {/* Official Email Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                સત્તાવાર ઇમેઇલ (Official Email)
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">સામાન્ય પૂછપરછ અને અહેવાલ:</p>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-sm font-bold text-slate-900 hover:text-red-700 transition break-all block"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">ક્લિક કરીને ઇમેઇલ કરો</span>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline"
                >
                  <span>Email Now</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Official Social Media Channels */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                સત્તાવાર સોશિયલ મીડિયા એકાઉન્ટ્સ (Official Social)
              </span>

              <div className="space-y-3">
                {/* Instagram CTA Button */}
                <a
                  href={settings.social_instagram || 'https://www.instagram.com/samachardiary/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50/70 to-rose-50/50 hover:from-pink-100 hover:to-rose-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Instagram size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block group-hover:text-pink-700 transition">
                        ઇન્સ્ટાગ્રામ (Instagram)
                      </span>
                      <span className="text-[11px] text-slate-500">@samachardiary</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-pink-700 bg-pink-100/80 px-2.5 py-1 rounded-lg">
                    Follow
                  </span>
                </a>

                {/* YouTube CTA Button */}
                <a
                  href={settings.social_youtube || 'https://www.youtube.com/@SamacharDiary24x7'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-red-200 bg-gradient-to-r from-red-50/70 to-amber-50/50 hover:from-red-100 hover:to-amber-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Youtube size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block group-hover:text-red-700 transition">
                        યૂટ્યુબ ચેનલ (YouTube)
                      </span>
                      <span className="text-[11px] text-slate-500">@SamacharDiary24x7</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-700 bg-red-100/80 px-2.5 py-1 rounded-lg">
                    Subscribe
                  </span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-gujarati text-slate-900">
                    અમને સંદેશો મોકલો (Send a Message)
                  </h2>
                  <p className="text-xs text-slate-500">
                    તમારો પ્રતિભાવ, સમાચાર સૂચન કે પૂછપરછ સીધી સંપાદકીય ટીમ સુધી પહોંચશે.
                  </p>
                </div>
              </div>

              {success && (
                <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm font-gujarati">
                      આભાર! આપનો સંદેશ સફળતાપૂર્વક મળી ગયો છે.
                    </h3>
                    <p className="text-xs text-emerald-700 mt-1 font-gujarati">
                      અમારી સંપાદકીય ટીમ ટૂંક સમયમાં તમારા ઇમેઇલ પર સંપર્ક કરશે.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="mt-3 text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                    >
                      બીજો સંદેશો મોકલો (Send Another Message)
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
                      તમારું પૂરું નામ (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="દા.ત. રમેશભાઈ પટેલ"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
                      ઇમેઇલ એડ્રેસ (Email) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
                      મોબાઇલ નંબર (Phone - વૈકલ્પિક)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
                      વિષય (Subject) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="સમાચાર સૂચન / પૂછપરછ / જાહેરાત"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
                    સંદેશો / વિગત (Message) *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="તમારો સંદેશો અથવા સમાચાર વિગત અહીં વિગતવાર લખો..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition resize-y"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-red-700 hover:bg-red-800 text-white font-bold text-sm rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>મોકલાઈ રહ્યું છે...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>સંદેશો સબમિટ કરો (Submit Message)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
