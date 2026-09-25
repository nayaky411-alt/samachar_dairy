import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

const OFFICIAL_DEFAULTS = {
  site_name: 'Samachar Diary',
  site_name_en: 'Samachar Diary',
  site_tagline: 'ગુજરાતનું અગ્રણી અને સૌથી વિશ્વસનીય ડિજિટલ સમાચાર માધ્યમ. તથ્યપૂર્ણ પત્રકારત્વ અને નિષ્પક્ષ અહેવાલો.',
  site_logo_url: '',
  office_address: 'Shop No 11, SWARNIM DHARTI, 60 Meter Road, Sardar Patel Ring Rd, Near Sardardham, Ahmedabad, Khodiyar, Gujarat - 382501, India',
  city: 'Ahmedabad, Khodiyar',
  state: 'Gujarat',
  pincode: '382501',
  country: 'India',
  contact_email: 'samachardiaryx7@gmail.com',
  contact_phone: '+91 79 2658 9000',
  social_instagram: 'https://www.instagram.com/samachardiary/',
  social_youtube: 'https://www.youtube.com/@SamacharDiary24x7',
  social_facebook: 'https://facebook.com/samachardairy247',
  social_x: 'https://x.com/samachardairy247',
  social_whatsapp: 'https://whatsapp.com/channel/samachardairy247',
  social_telegram: 'https://t.me/samachardairy247',
  google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Shop+No+11+SWARNIM+DHARTI+60+Meter+Road+Sardar+Patel+Ring+Rd+Near+Sardardham+Ahmedabad+Khodiyar+Gujarat+382501+India',
  footer_description: 'સમાચાર ડેરી ૨૪x૭ - ગુજરાત અને દેશ-વિદેશના તાજા સમાચાર, બ્રેકિંગ ન્યૂઝ, શેરબજાર અને ગ્રાઉન્ડ રિપોર્ટ્સનું વિશ્વસનીય ડિજિટલ પ્લેટફોર્મ.',
  copyright_text: '© {year} Samachar Diary. All Rights Reserved.',
};

const SettingsContext = createContext({
  settings: OFFICIAL_DEFAULTS,
  loading: true,
  refreshSettings: async () => {},
  getDirectionsUrl: () => '',
  getCopyrightText: () => '',
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(OFFICIAL_DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiClient.get('/settings');
      if (res.data && res.data.success && res.data.data) {
        setSettings(prev => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (err) {
      console.warn('Could not fetch remote settings, using official defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getDirectionsUrl = useCallback(() => {
    if (settings.google_maps_url && settings.google_maps_url.trim()) {
      return settings.google_maps_url.trim();
    }
    const query = encodeURIComponent(settings.office_address || OFFICIAL_DEFAULTS.office_address);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }, [settings.google_maps_url, settings.office_address]);

  const getCopyrightText = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const template = settings.copyright_text || OFFICIAL_DEFAULTS.copyright_text;
    return template.replace('{year}', currentYear);
  }, [settings.copyright_text]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        getDirectionsUrl,
        getCopyrightText,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
