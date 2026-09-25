import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, TrendingUp, User, Globe, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import apiClient from '../../api/client';

const Header = () => {
  const { user, isAuthenticated, isChannelHead, logout } = useAuth();
  const { language, switchLanguage, t } = useLanguage();
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);
  const [marketMini, setMarketMini] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Format Gujarati Date
    const now = new Date();
    const guDays = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'];
    const guMonths = ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'];
    
    if (language === 'gu') {
      setCurrentDate(`${guDays[now.getDay()]}, ${now.getDate()} ${guMonths[now.getMonth()]} ${now.getFullYear()}`);
    } else {
      setCurrentDate(now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    }

    // Fetch navigation categories
    apiClient.get('/categories')
      .then(res => {
        if (res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {});

    // Fetch mini market data
    apiClient.get('/market')
      .then(res => {
        if (res.data.success && res.data.data.indices) {
          const nifty = res.data.data.indices.find(i => i.symbol === 'NIFTY 50');
          const sensex = res.data.data.indices.find(i => i.symbol === 'SENSEX');
          setMarketMini({ nifty, sensex });
        }
      })
      .catch(() => {});
  }, [language]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* 1. Top Utility Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date & Location */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-200">{currentDate}</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-slate-400">અમદાવાદ, ગુજરાત</span>
          </div>

          {/* Center: Mini Market Strip */}
          {marketMini?.nifty && (
            <div className="hidden md:flex items-center gap-4 text-[11px]">
              <Link to="/market" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <span className="font-semibold text-slate-300">NIFTY 50:</span>
                <span className="font-mono text-white">
                  {Number(marketMini.nifty.ltp ?? marketMini.nifty.value ?? marketMini.nifty.current_value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`font-bold flex items-center ${(marketMini.nifty.change_percent ?? marketMini.nifty.percentage_change ?? marketMini.nifty.change_percent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(marketMini.nifty.change_percent ?? marketMini.nifty.percentage_change ?? marketMini.nifty.change_percent ?? 0) >= 0 ? '+' : ''}
                  {marketMini.nifty.change_percent ?? marketMini.nifty.percentage_change ?? 0}%
                </span>
              </Link>
              <span className="text-slate-700">•</span>
              <Link to="/market" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <span className="font-semibold text-slate-300">SENSEX:</span>
                <span className="font-mono text-white">
                  {Number(marketMini.sensex.ltp ?? marketMini.sensex.value ?? marketMini.sensex.current_value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`font-bold flex items-center ${(marketMini.sensex.change_percent ?? marketMini.sensex.percentage_change ?? marketMini.sensex.change_percent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(marketMini.sensex.change_percent ?? marketMini.sensex.percentage_change ?? marketMini.sensex.change_percent ?? 0) >= 0 ? '+' : ''}
                  {marketMini.sensex.change_percent ?? marketMini.sensex.percentage_change ?? 0}%
                </span>
              </Link>
            </div>
          )}

          {/* Right: Language switch & Admin */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 rounded p-0.5 text-[11px]">
              <button
                onClick={() => switchLanguage('gu')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${language === 'gu' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ગુજરાતી
              </button>
              <button
                onClick={() => switchLanguage('en')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${language === 'en' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isChannelHead ? (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/admin/channel-head"
                      className="bg-red-700 hover:bg-red-800 text-white px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors"
                      title="મુખ્ય સંપાદક કંટ્રોલ રૂમ"
                    >
                      <Shield size={12} />
                      <span>સંપાદક CMS</span>
                    </Link>
                    <Link
                      to="/admin/staff"
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors text-xs"
                      title="સ્ટાફ રિપોર્ટર પોર્ટલ"
                    >
                      <span>સ્ટાફ પોર્ટલ</span>
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/admin/staff"
                    className="bg-red-700 hover:bg-red-800 text-white px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors"
                  >
                    <Shield size={12} />
                    <span>સ્ટાફ પોર્ટલ</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  title="Logout"
                  className="text-slate-400 hover:text-red-400 cursor-pointer p-1"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
              >
                <User size={13} />
                <span>{t('સ્ટાફ લૉગિન', 'Staff Login')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Branding & Search Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Newspaper Brand Logo */}
        <Link to="/" className="flex items-center gap-3 select-none group shrink-0">
          <img
            src="/samachar-diary-logo.jpeg"
            alt="Samachar Diary 24x7 Logo"
            className="h-12 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm rounded-md"
          />
        </Link>

        {/* Search & Quick Links */}
        <div className="hidden lg:flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('સમાચાર, શહેર અથવા વિષય શોધો...', 'Search news, city, topic...')}
              className="w-full bg-slate-100 border border-slate-300 focus:border-red-600 focus:bg-white rounded-full pl-4 pr-10 py-1.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-700 cursor-pointer"
            >
              <Search size={16} />
            </button>
          </form>

          <Link
            to="/market"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 hover:border-red-600 hover:text-red-700 text-xs font-semibold text-slate-700 transition-colors"
          >
            <TrendingUp size={14} className="text-red-600" />
            <span>{t('શેરબજાર લાઈવ', 'Live Market')}</span>
          </Link>
        </div>
      </div>

      {/* 3. Primary Navigation Bar */}
      <nav className="hidden lg:block bg-red-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            <Link
              to="/"
              className="px-3 py-1.5 rounded hover:bg-red-800 font-bold text-sm transition-colors whitespace-nowrap"
            >
              {t('મુખ્ય પૃષ્ઠ', 'Home')}
            </Link>

            <Link
              to="/gujarat"
              className="px-3 py-1.5 rounded hover:bg-red-800 font-bold text-sm bg-red-800/60 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <span>{t('ગુજરાત નકશો', 'Gujarat Map')}</span>
            </Link>

            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="px-2.5 py-1.5 rounded hover:bg-red-800 text-sm font-medium transition-colors whitespace-nowrap"
              >
                {language === 'gu' ? cat.name_gu : cat.name}
              </Link>
            ))}

            <Link
              to="/videos"
              className="px-2.5 py-1.5 rounded hover:bg-red-800 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t('વિડીયો', 'Videos')}
            </Link>

            <Link
              to="/reels"
              className="px-2.5 py-1.5 rounded hover:bg-red-800 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t('રીલ્સ', 'Reels')}
            </Link>

            <Link
              to="/gallery"
              className="px-2.5 py-1.5 rounded hover:bg-red-800 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t('ગેલેરી', 'Photos')}
            </Link>

            <Link
              to="/market"
              className="px-2.5 py-1.5 rounded hover:bg-red-800 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t('માર્કેટ', 'Market')}
            </Link>

            <Link
              to="/about"
              className="px-2.5 py-1.5 rounded hover:bg-red-800 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t('અમારા વિશે', 'About')}
            </Link>

            <Link
              to="/contact"
              className="px-2.5 py-1.5 rounded hover:bg-red-800 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t('સંપર્ક', 'Contact')}
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-300 shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('શોધો...', 'Search...')}
                className="w-full bg-slate-100 border border-slate-300 rounded-lg pl-3 pr-10 py-2 text-sm outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Search size={18} />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-700 font-bold"
              >
                {t('મુખ્ય પૃષ્ઠ', 'Home')}
              </Link>
              <Link
                to="/gujarat"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 bg-red-50 text-red-700 font-bold rounded-lg"
              >
                {t('ગુજરાત નકશો', 'Gujarat Map')}
              </Link>
              <Link
                to="/market"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-700"
              >
                {t('શેરબજાર', 'Stock Market')}
              </Link>
              <Link
                to="/videos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-700"
              >
                {t('વિડીયો', 'Videos')}
              </Link>
              <Link
                to="/reels"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-700"
              >
                {t('રીલ્સ', 'Reels')}
              </Link>
              <Link
                to="/gallery"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-700"
              >
                {t('ફોટો ગેલેરી', 'Photo Gallery')}
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-700"
              >
                {t('અમારા વિશે', 'About Us')}
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-700"
              >
                {t('સંપર્ક', 'Contact Us')}
              </Link>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {t('મુખ્ય કેટેગરીઝ', 'Categories')}
              </span>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded hover:bg-slate-100 text-slate-800"
                  >
                    {language === 'gu' ? cat.name_gu : cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Admin link for staff on mobile */}
            <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {isChannelHead ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/admin/channel-head"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center bg-red-700 text-white font-bold py-2 rounded-lg text-sm"
                      >
                        સંપાદક CMS
                      </Link>
                      <Link
                        to="/admin/staff"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center bg-slate-800 text-white font-bold py-2 rounded-lg text-sm"
                      >
                        સ્ટાફ પોર્ટલ
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to="/admin/staff"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-center bg-red-700 text-white font-bold py-2 rounded-lg"
                    >
                      સ્ટાફ પોર્ટલ
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full text-center border border-red-300 text-red-700 font-bold py-2 rounded-lg"
                  >
                    લૉગ આઉટ (Logout)
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-slate-900 text-white font-bold py-2 rounded-lg"
                >
                  સ્ટાફ લૉગિન (Staff Login)
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
