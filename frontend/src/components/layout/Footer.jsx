import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, ShieldCheck, Navigation } from 'lucide-react';
import { Youtube, Instagram, Facebook } from '../common/BrandIcons';
import apiClient from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

const Footer = () => {
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { language, t } = useLanguage();
  const { settings, getDirectionsUrl, getCopyrightText } = useSettings();

  useEffect(() => {
    apiClient.get('/districts')
      .then(res => {
        if (res.data?.success) {
          setDistricts(res.data.data);
        }
      })
      .catch(() => {});

    apiClient.get('/categories')
      .then(res => {
        if (res.data?.success) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const directionsUrl = getDirectionsUrl();
  const copyrightNotice = getCopyrightText();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-red-700 mt-12">
      {/* 1. Top Section: Brand, Quick Links, Legal & Official Contact */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          
          {/* Col 1: Brand Info & Official Social Media */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/samachar-diary-logo.jpeg"
                alt="Samachar Diary 24x7 Logo"
                className="h-12 sm:h-14 w-auto object-contain bg-white/10 p-1 rounded-lg border border-slate-700 hover:opacity-90 transition-opacity"
              />
            </Link>

            <p className="text-xs leading-relaxed text-slate-400">
              {settings.footer_description || settings.site_tagline || 'ગુજરાતનું અગ્રણી અને સૌથી વિશ્વસનીય ડિજિટલ સમાચાર માધ્યમ. તથ્યપૂર્ણ પત્રકારત્વ અને નિષ્પક્ષ અહેવાલો.'}
            </p>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                સત્તાવાર સોશિયલ મીડિયા (Official Social)
              </span>
              <div className="flex items-center gap-2.5">
                {/* Official Instagram */}
                <a
                  href={settings.social_instagram || 'https://www.instagram.com/samachardiary/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-pink-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Instagram"
                  title="Official Instagram @samachardiary"
                >
                  <Instagram size={16} />
                </a>

                {/* Official YouTube */}
                <a
                  href={settings.social_youtube || 'https://www.youtube.com/@SamacharDiary24x7'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="YouTube"
                  title="Official YouTube @SamacharDiary24x7"
                >
                  <Youtube size={16} />
                </a>

                {/* Facebook if available */}
                {settings.social_facebook && (
                  <a
                    href={settings.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3 border-l-2 border-red-600 pl-2">
              ઝડપી કડીઓ (Quick Links)
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
              <Link to="/" className="hover:text-red-400 py-0.5 transition-colors">• મુખ્ય પૃષ્ઠ (Home)</Link>
              <Link to="/gujarat" className="hover:text-red-400 py-0.5 transition-colors">• ગુજરાત (Gujarat)</Link>
              <Link to="/market" className="hover:text-red-400 py-0.5 transition-colors">• શેરબજાર (Market)</Link>
              <Link to="/videos" className="hover:text-red-400 py-0.5 transition-colors">• વિડિયો (Videos)</Link>
              <Link to="/reels" className="hover:text-red-400 py-0.5 transition-colors">• રીલ્સ (Reels)</Link>
              <Link to="/galleries" className="hover:text-red-400 py-0.5 transition-colors">• ગેલેરી (Gallery)</Link>
              <Link to="/about" className="hover:text-red-400 py-0.5 transition-colors">• અમારા વિશે (About)</Link>
              <Link to="/contact" className="hover:text-red-400 py-0.5 transition-colors font-semibold text-red-400">• સંપર્ક (Contact)</Link>
            </div>
          </div>

          {/* Col 3: Legal & Editorial Policies */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3 border-l-2 border-red-600 pl-2">
              નીતિ અને કાનૂની (Legal & Policy)
            </h3>
            <div className="flex flex-col space-y-2 text-xs">
              <Link to="/editorial-policy" className="hover:text-red-400 transition-colors flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>સંપાદકીય નીતિ (Editorial Policy)</span>
              </Link>
              <Link to="/corrections-policy" className="hover:text-red-400 transition-colors">
                સુધારા નીતિ (Corrections Policy)
              </Link>
              <Link to="/privacy-policy" className="hover:text-red-400 transition-colors">
                ગોપનીયતા નીતિ (Privacy Policy)
              </Link>
              <Link to="/terms" className="hover:text-red-400 transition-colors">
                નિયમો અને શરતો (Terms & Conditions)
              </Link>
              <Link to="/advertise" className="hover:text-red-400 transition-colors">
                જાહેરાત આપો (Advertise With Us)
              </Link>
            </div>
          </div>

          {/* Col 4: Official Bureau & Address Contact */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3 border-l-2 border-red-600 pl-2">
              સત્તાવાર સંપર્ક (Contact Information)
            </h3>
            <div className="space-y-3 text-xs text-slate-400">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-slate-300">
                  {settings.office_address}
                </span>
              </div>

              {/* Get Directions Link */}
              <div className="pl-6">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 transition"
                >
                  <Navigation size={12} />
                  <span>Google Maps પર લોકેશન જુઓ</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-red-500 shrink-0" />
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="hover:text-white transition font-medium text-slate-200"
                >
                  {settings.contact_email}
                </a>
              </div>

              <div className="pt-1">
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded inline-block font-mono">
                  Digital Media & Bureau Compliant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Middle Section: Gujarat 33 Districts Directory */}
        <div className="py-6 border-b border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <span>{t('ગુજરાતના ૩૩ જિલ્લાઓ (સમાચાર ડિરેક્ટરી)', 'Gujarat 33 Districts News Directory')}</span>
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {districts.map((dist) => (
              <Link
                key={dist.id}
                to={`/gujarat/${dist.slug}`}
                className="bg-slate-800 hover:bg-red-700 hover:text-white px-2.5 py-1 rounded transition-colors text-slate-300"
              >
                {language === 'gu' ? dist.name_gu : dist.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 3. Bottom Legal & Copyright Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{copyrightNotice}</p>
          <p className="text-[11px] text-slate-400">
            {t('તમામ હક્કો સુરક્ષિત છે. અનધિકૃત પુનઃઉત્પાદન કાનૂની ગુનો છે.', 'All rights reserved. Unauthorized reproduction is prohibited.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
