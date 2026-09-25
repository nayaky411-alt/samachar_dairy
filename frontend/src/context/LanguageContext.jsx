import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('samachar_lang') || 'gu');

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('samachar_lang', lang);
  };

  const t = (guText, enText) => {
    return language === 'en' ? (enText || guText) : guText;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
