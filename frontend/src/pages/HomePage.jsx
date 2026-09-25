import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Compass, Newspaper, ArrowRight, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';
import HeroSection from '../components/news/HeroSection';
import NewsCard from '../components/news/NewsCard';
import CategoryBlock from '../components/news/CategoryBlock';
import GujaratMap from '../components/map/GujaratMap';
import MarketTickerStrip from '../components/market/MarketTickerStrip';
import ReelsSection from '../components/media/ReelsSection';
import VideoSection from '../components/media/VideoSection';
import GallerySection from '../components/media/GallerySection';

const HomePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    apiClient.get('/homepage')
      .then(res => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Header />
        <BreakingNewsTicker />
        <div className="flex-grow min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
          <Loader2 size={36} className="animate-spin text-red-700 mb-3" />
          <span className="text-sm font-bold font-gujarati">{t('સમાચાર લોડ થઈ રહ્યા છે...', 'Loading latest news...')}</span>
        </div>
        <Footer />
      </div>
    );
  }

  const sections = data?.sections || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <BreakingNewsTicker />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-4 space-y-6 w-full">
        {/* Top Desktop Banner Ad */}
        {data?.advertisements?.header_banner && (
          <div className="my-2 p-2 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">જાહેરાત (Advertisement)</span>
            <a href={data.advertisements.header_banner.destination_url || '#'} target="_blank" rel="noreferrer">
              <img
                src={data.advertisements.header_banner.image_url}
                alt={data.advertisements.header_banner.title}
                className="max-h-24 sm:max-h-28 w-full object-cover rounded-lg"
              />
            </a>
          </div>
        )}

        {/* 2. Hero Section */}
        <HeroSection articles={data?.hero || []} />

        {/* 3. Live Indian Stock Market Strip */}
        <MarketTickerStrip marketData={data?.market} />

        {/* 4. Interactive Gujarat Vector Map */}
        <GujaratMap />

        {/* 5. Latest 24x7 News Section */}
        {data?.latest_news && data.latest_news.length > 0 && (
          <section className="my-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-slate-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-slate-900 rounded-xs"></span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>{t('તાજા સમાચાર (૨૪x૭)', 'Latest News (24x7)')}</span>
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                </h2>
              </div>
              <Link to="/news" className="text-xs sm:text-sm font-bold text-red-700 hover:underline flex items-center gap-0.5">
                <span>{t('બધા તાજા સમાચાર', 'View All News')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.latest_news.slice(0, 8).map(art => (
                <NewsCard key={art.id} article={art} />
              ))}
            </div>
          </section>
        )}

        {/* 6. Gujarat City News Spotlight */}
        {data?.gujarat_news && data.gujarat_news.length > 0 && (
          <section className="my-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-7">
            <div className="flex items-center justify-between pb-2 mb-5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-red-700 rounded-xs"></span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {t('ગુજરાતના શહેરોમાંથી (City Spotlight)', 'Gujarat City News')}
                </h2>
              </div>
              <Link to="/gujarat-news" className="text-xs sm:text-sm font-bold text-red-700 hover:underline flex items-center gap-0.5">
                <span>{t('તમામ શહેરો', 'All Cities')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.gujarat_news.map(art => (
                <NewsCard key={art.id} article={art} variant="horizontal" />
              ))}
            </div>
          </section>
        )}

        {/* 7. Official Shorts & Reels Section */}
        <ReelsSection reels={data?.reels || []} />

        {/* 9. Official YouTube Videos Section */}
        <VideoSection videos={data?.videos || []} />

        {/* 9. Business & Market Category Section */}
        <CategoryBlock
          title="Business & Market"
          titleGu="વેપાર અને અર્થતંત્ર"
          slug="business"
          color="#059669"
          articles={data?.business_news || []}
        />

        {/* 10. Sports Category Section */}
        <CategoryBlock
          title="Sports"
          titleGu="રમતગમત (Sports)"
          slug="sports"
          color="#0d9488"
          articles={data?.sports_news || []}
        />

        {/* 11. Photo Gallery Section */}
        <GallerySection galleries={data?.galleries || []} />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
