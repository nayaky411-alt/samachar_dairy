import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Compass, ChevronRight, Loader2, Newspaper } from 'lucide-react';
import apiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import NewsCard from '../components/news/NewsCard';
import GujaratMap from '../components/map/GujaratMap';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';

const GujaratNewsPage = () => {
  const params = useParams();
  const districtSlug = params.slug || params.districtSlug;
  const [districts, setDistricts] = useState([]);
  const [currentDistrict, setCurrentDistrict] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    apiClient.get('/districts')
      .then(res => {
        if (res.data.success) {
          setDistricts(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    if (districtSlug) {
      apiClient.get(`/districts/${districtSlug}/news?limit=12`)
        .then(res => {
          if (res.data.success) {
            setCurrentDistrict(res.data.data.district);
            setArticles(res.data.data.news?.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      // General Gujarat News
      apiClient.get('/news?category=gujarat&per_page=16')
        .then(res => {
          if (res.data.success) {
            setArticles(res.data.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [districtSlug]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <BreakingNewsTicker />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 space-y-6 w-full">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-red-800 to-red-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm font-gujarati">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
              <Compass size={16} />
              <span>ગુજરાતના ૩૩ જિલ્લાઓનું વિશેષ કવરેજ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mb-2">
              {currentDistrict ? `${currentDistrict.name_gu} (${currentDistrict.name}) ના તાજા સમાચાર` : 'ગુજરાત સમગ્ર (Gujarat News Hub)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {currentDistrict
                ? `${currentDistrict.name_gu} જિલ્લાના તમામ તાલુકાઓ અને ગ્રામ્ય વિસ્તારોના તાજા, પ્રમાણિત સમાચાર.`
                : 'ગુજરાતના તમામ વિસ્તારો, જિલ્લાઓ અને શહેરોમાંથી ક્ષણે-ક્ષણના સમાચાર.'}
            </p>
          </div>
        </div>

        {/* 33 Districts Filter Pills */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs font-gujarati">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            {t('જિલ્લા પસંદ કરો:', 'Select District:')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              to="/gujarat"
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                !districtSlug ? 'bg-red-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              તમામ ગુજરાત
            </Link>
            {districts.map(d => (
              <Link
                key={d.id}
                to={`/gujarat/${d.slug}`}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  districtSlug === d.slug
                    ? 'bg-red-700 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700'
                }`}
              >
                <span>{language === 'gu' ? d.name_gu : d.name}</span>
                {d.articles_count > 0 && (
                  <span className={`text-[10px] px-1 rounded ${districtSlug === d.slug ? 'bg-red-800' : 'bg-slate-200 text-slate-600'}`}>
                    {d.articles_count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Embedded Vector Map if on main gujarat hub */}
        {!districtSlug && <GujaratMap />}

        {/* News Feed */}
        <div className="font-gujarati">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b-2 border-red-700">
            <span className="w-2.5 h-6 bg-red-700 rounded-xs"></span>
            <h2 className="text-xl font-black text-slate-900">
              {currentDistrict ? `${currentDistrict.name_gu} અહેવાલો` : 'તાજા ગુજરાત સમાચાર'}
            </h2>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={36} className="animate-spin text-red-700 mb-2" />
              <span className="text-xs font-bold">સમાચાર લોડ થઈ રહ્યા છે...</span>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {articles.map(art => (
                <NewsCard key={art.id} article={art} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
              <Newspaper size={40} className="mx-auto text-slate-400 mb-2" />
              <h3 className="text-base font-bold text-slate-800">આ જિલ્લા માટે કોઈ પ્રકાશિત સમાચાર મળ્યા નથી.</h3>
              <p className="text-xs text-slate-400 mt-1">અમારા સંવાદદાતાઓ માહિતી એકત્રિત કરી રહ્યા છે.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GujaratNewsPage;
