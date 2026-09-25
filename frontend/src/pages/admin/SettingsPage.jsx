import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { 
  Settings, 
  Save, 
  Check, 
  AlertCircle, 
  Building, 
  MapPin, 
  Mail, 
  Share2, 
  FileText,
  ExternalLink,
  Navigation,
  Lock,
  KeyRound
} from 'lucide-react';
import { Instagram, Youtube } from '../../components/common/BrandIcons';

export default function SettingsPage() {
  const { refreshSettings } = useSettings();

  // Admin password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const [settings, setSettings] = useState({
    // Website / Organization
    site_name: 'Samachar Diary',
    site_name_en: 'Samachar Diary',
    site_tagline: 'ગુજરાતનું અગ્રણી અને સૌથી વિશ્વસનીય ડિજિટલ સમાચાર માધ્યમ.',
    site_logo_url: '',

    // Office Address
    office_address: 'Shop No 11, SWARNIM DHARTI, 60 Meter Road, Sardar Patel Ring Rd, Near Sardardham, Ahmedabad, Khodiyar, Gujarat - 382501, India',
    city: 'Ahmedabad, Khodiyar',
    state: 'Gujarat',
    pincode: '382501',
    country: 'India',
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Shop+No+11+SWARNIM+DHARTI+60+Meter+Road+Sardar+Patel+Ring+Rd+Near+Sardardham+Ahmedabad+Khodiyar+Gujarat+382501+India',

    // Contact
    contact_email: 'samachardiaryx7@gmail.com',
    contact_phone: '+91 79 2658 9000',

    // Social Media
    social_instagram: 'https://www.instagram.com/samachardiary/',
    social_youtube: 'https://www.youtube.com/@SamacharDiary24x7',
    social_facebook: 'https://facebook.com/samachardairy247',
    social_x: 'https://x.com/samachardairy247',
    social_whatsapp: 'https://whatsapp.com/channel/samachardairy247',
    social_telegram: 'https://t.me/samachardairy247',

    // Footer & Legal
    footer_description: 'સમાચાર ડેરી ૨૪x૭ - ગુજરાત અને દેશ-વિદેશના તાજા સમાચાર, બ્રેકિંગ ન્યૂઝ, શેરબજાર અને ગ્રાઉન્ડ રિપોર્ટ્સનું વિશ્વસનીય ડિજિટલ પ્લેટફોર્મ.',
    copyright_text: '© {year} Samachar Diary. All Rights Reserved.',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/settings')
      .then(res => {
        if (res.data.success && Array.isArray(res.data.data)) {
          const map = {};
          res.data.data.forEach(item => {
            map[item.key] = item.value;
          });
          setSettings(prev => ({ ...prev, ...map }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await apiClient.post('/admin/settings', { settings });
      if (res.data.success) {
        setSuccess(true);
        await refreshSettings();
        setTimeout(() => setSuccess(false), 3500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'સેટિંગ્સ સાચવવામાં ક્ષતિ આવી.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordUpdating(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('નવો પાસવર્ડ ઓછામાં ઓછો 8 અક્ષરોનો હોવો જોઈએ (Minimum 8 characters).');
      setPasswordUpdating(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('નવો પાસવર્ડ અને કન્ફર્મેશન પાસવર્ડ સરખા નથી.');
      setPasswordUpdating(false);
      return;
    }

    try {
      const res = await apiClient.post('/auth/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      if (res.data.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 5000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'પાસવર્ડ બદલવામાં ક્ષતિ આવી. કૃપા કરીને વર્તમાન પાસવર્ડ ચકાસો.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">સેટિંગ્સ લોડ થઈ રહ્યા છે...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-700" />
            વેબસાઇટ / સંસ્થા ઓળખ સેટિંગ્સ (Website & Company Settings)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati mt-0.5">
            સત્તાવાર સરનામું, ઇમેઇલ, સોશિયલ મીડિયા એકાઉન્ટ્સ અને ફૂટર વિગતો સંપાદિત કરો
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-gujarati shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>સેટિંગ્સ સફળતાપૂર્વક સાચવવામાં આવ્યા છે અને સમગ્ર વેબસાઇટ પર લાઈવ થઈ ગયા છે!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-gujarati">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Website & Organization Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-bold text-slate-900 font-gujarati">
              ૧. વેબસાઇટ / સંસ્થા ઓળખ (Website / Organization Information)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">
                વેબસાઇટ નામ (Website Name - ગુજરાતી) *
              </label>
              <input
                type="text"
                required
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati focus:bg-white focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Website Name (English)
              </label>
              <input
                type="text"
                value={settings.site_name_en}
                onChange={(e) => handleChange('site_name_en', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">
                ટેગલાઇન (Tagline / Slogan)
              </label>
              <input
                type="text"
                value={settings.site_tagline}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati focus:bg-white focus:border-red-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Website Logo URL (વૈકલ્પિક)
              </label>
              <input
                type="text"
                placeholder="https://... અથવા /images/logo.png"
                value={settings.site_logo_url}
                onChange={(e) => handleChange('site_logo_url', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Business / Office Address */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-bold text-slate-900 font-gujarati">
              ૨. ઓફિસ સરનામું (Office / Business Address)
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">
                સંપૂર્ણ ઓફિસ સરનામું (Office Address) *
              </label>
              <textarea
                required
                rows={2}
                value={settings.office_address}
                onChange={(e) => handleChange('office_address', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed focus:bg-white focus:border-red-600 outline-none font-gujarati"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">શહેર (City)</label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">રાજ્ય (State)</label>
                <input
                  type="text"
                  value={settings.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">પિનકોડ (Pincode)</label>
                <input
                  type="text"
                  value={settings.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">દેશ (Country)</label>
                <input
                  type="text"
                  value={settings.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Google Maps / Directions Link (Get Directions URL)</span>
                {settings.google_maps_url && (
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-700 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>નકશો ચકાસો (Test Link)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </label>
              <input
                type="url"
                value={settings.google_maps_url}
                onChange={(e) => handleChange('google_maps_url', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-gujarati">
                આ લિંક Contact Us અને Footer માં "Get Directions" બટન તરીકે દર્શાવવામાં આવે છે.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Official Contact Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Mail className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-bold text-slate-900 font-gujarati">
              ૩. સત્તાવાર સંપર્ક વિગતો (Official Contact)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                સત્તાવાર ઇમેઇલ (Contact Email) *
              </label>
              <input
                type="email"
                required
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                વેબસાઇટ પર clickable mailto: લિંક તરીકે વપરાશે.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                હેલ્પલાઇન ફોન (Contact Phone - વૈકલ્પિક)
              </label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Official Social Media Accounts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Share2 className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-bold text-slate-900 font-gujarati">
              ૪. સત્તાવાર સોશિયલ મીડિયા (Official Social Media)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-pink-600">📸</span>
                <span>Instagram URL</span>
              </label>
              <input
                type="url"
                value={settings.social_instagram}
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-red-600">▶️</span>
                <span>YouTube URL</span>
              </label>
              <input
                type="url"
                value={settings.social_youtube}
                onChange={(e) => handleChange('social_youtube', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-blue-600">📘</span>
                <span>Facebook URL</span>
              </label>
              <input
                type="url"
                value={settings.social_facebook}
                onChange={(e) => handleChange('social_facebook', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span>✖️</span>
                <span>X / Twitter URL</span>
              </label>
              <input
                type="url"
                value={settings.social_x}
                onChange={(e) => handleChange('social_x', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-emerald-600">💬</span>
                <span>WhatsApp Channel / Number</span>
              </label>
              <input
                type="text"
                value={settings.social_whatsapp}
                onChange={(e) => handleChange('social_whatsapp', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-sky-600">✈️</span>
                <span>Telegram URL</span>
              </label>
              <input
                type="url"
                value={settings.social_telegram}
                onChange={(e) => handleChange('social_telegram', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Footer & Copyright */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-bold text-slate-900 font-gujarati">
              ૫. ફૂટર લખાણ અને કૉપિરાઇટ (Footer & Legal Notice)
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">
                ફૂટર ટૂંકી ઓળખ (Footer Description)
              </label>
              <textarea
                rows={2}
                value={settings.footer_description}
                onChange={(e) => handleChange('footer_description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati focus:bg-white focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Copyright Text (Note: Use &#123;year&#125; for automatic dynamic year)
              </label>
              <input
                type="text"
                value={settings.copyright_text}
                onChange={(e) => handleChange('copyright_text', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ઉદાહરણ: © &#123;year&#125; Samachar Diary. All Rights Reserved. ({new Date().getFullYear()} આપમેળે જનરેટ થશે)
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-bold font-gujarati transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>સેવ થઈ રહ્યું છે...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>તમામ સેટિંગ્સ સાચવો અને લાઈવ કરો (Save All Settings)</span>
            </>
          )}
        </button>
      </form>

      {/* Section 6: Administrator Security & Password Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 mt-8">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <KeyRound className="w-4 h-4 text-red-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-gujarati">
              ૬. એડમિનિસ્ટ્રેટર પાસવર્ડ સુરક્ષા (Administrator Security & Password Management)
            </h2>
            <p className="text-[11px] text-slate-500 font-gujarati">
              ફક્ત લૉગિન થયેલા મુખ્ય સંપાદક પોતાનો પાસવર્ડ સુરક્ષિત રીતે અપડેટ કરી શકે છે. વર્તમાન પાસવર્ડ ચકાસવો ફરજિયાત છે.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-gujarati shadow-xs">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>પાસવર્ડ સફળતાપૂર્વક અપડેટ થઈ ગયો છે! તમારો નવો પાસવર્ડ હવે એન્ક્રિપ્ટેડ સ્વરૂપે સુરક્ષિત છે.</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-gujarati">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">
              વર્તમાન પાસવર્ડ (Current Password) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="વર્તમાન પાસવર્ડ દાખલ કરો"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">
                નવો પાસવર્ડ (New Password) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ન્યૂનતમ 8 અક્ષરો"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">
                નવા પાસવર્ડની પુષ્ટિ (Confirm New Password) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="નવો પાસવર્ડ ફરી દાખલ કરો"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-red-600 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordUpdating}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-gujarati transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {passwordUpdating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>પાસવર્ડ અપડેટ થઈ રહ્યો છે...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>પાસવર્ડ સુરક્ષિત રીતે અપડેટ કરો (Update Password)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
