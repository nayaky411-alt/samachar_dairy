import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import apiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import NewsCard from '../components/news/NewsCard';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { language, t } = useLanguage();

  const fetchArticle = () => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);

    apiClient.get(`/news/${slug}`)
      .then(res => {
        if (res.data.success) {
          setData(res.data.data);
          document.title = `${res.data.data.article.title} | સમાચાર ડેરી ૨૪x૭`;
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const article = data?.article;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <BreakingNewsTicker />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
            <Loader2 size={40} className="animate-spin text-red-700 mb-3" />
            <span className="text-sm font-bold font-gujarati">
              {t('સમાચાર લોડ થઈ રહ્યા છે...', 'Loading full article...')}
            </span>
          </div>
        ) : error || !article ? (
          <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
            <AlertCircle size={44} className="mx-auto text-red-600 mb-3" />
            <h2 className="text-2xl font-black text-slate-900 mb-2 font-gujarati">
              {t('સમાચાર મળ્યા નથી (Article Not Found)', 'News Not Found')}
            </h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed font-gujarati">
              {t(
                'તમે શોધતા હતા તે સમાચાર કદાચ હટાવી દેવામાં આવ્યા છે અથવા ઉપલબ્ધ નથી.',
                'The news article you are looking for may have been removed or is unavailable.'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={fetchArticle}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 hover:bg-slate-800 transition cursor-pointer font-gujarati"
              >
                <RefreshCw size={15} />
                <span>ફરી પ્રયાસ કરો (Retry)</span>
              </button>
              <Link
                to="/"
                className="bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-800 transition font-gujarati"
              >
                મુખ્ય પૃષ્ઠ પર જાઓ (Go Home)
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* 1. Breadcrumb Navigation */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 overflow-x-auto font-gujarati py-1">
              <Link to="/" className="hover:text-red-700 shrink-0">મુખ્ય પૃષ્ઠ</Link>
              <ChevronRight size={12} className="shrink-0" />
              {article.category && (
                <>
                  <Link to={`/category/${article.category.slug}`} className="hover:text-red-700 shrink-0">
                    {language === 'gu' ? article.category.name_gu : article.category.name}
                  </Link>
                  <ChevronRight size={12} className="shrink-0" />
                </>
              )}
              {article.district && (
                <>
                  <Link to={`/gujarat/${article.district.slug}`} className="hover:text-red-700 shrink-0">
                    {language === 'gu' ? article.district.name_gu : article.district.name}
                  </Link>
                  <ChevronRight size={12} className="shrink-0" />
                </>
              )}
              <span className="text-slate-800 font-semibold truncate max-w-xs">{article.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Article Body (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs">
                {/* Category & District Top Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {article.category && (
                    <span className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider font-gujarati">
                      {language === 'gu' ? article.category.name_gu : article.category.name}
                    </span>
                  )}
                  {article.district && (
                    <Link
                      to={`/gujarat/${article.district.slug}`}
                      className="text-red-700 text-xs font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors font-gujarati"
                    >
                      <MapPin size={12} />
                      <span>{language === 'gu' ? article.district.name_gu : article.district.name}</span>
                    </Link>
                  )}
                  <span className="text-slate-400 text-xs flex items-center gap-1 ml-auto font-gujarati">
                    <Clock size={12} />
                    <span>વાંચન સમય: {article.reading_time || 2} મિનિટ</span>
                  </span>
                </div>

                {/* Article Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-snug mb-3 font-gujarati">
                  {article.title}
                </h1>

                {/* Article Subtitle */}
                {article.subtitle && (
                  <h2 className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-4 font-gujarati">
                    {article.subtitle}
                  </h2>
                )}

                {/* Publication & Updated Timestamp */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-6 font-gujarati">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span>પ્રકાશિત: {formatDate(article.published_at)}</span>
                  {article.updated_at && article.updated_at !== article.published_at && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400">અપડેટ: {formatDate(article.updated_at)}</span>
                    </>
                  )}
                </div>

                {/* Featured Image */}
                {article.featured_image && (
                  <div className="mb-6 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full max-h-[480px] object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    {(article.featured_image_caption || article.featured_image_credit) && (
                      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 text-center italic font-gujarati">
                        {article.featured_image_caption}
                        {article.featured_image_credit && ` • તસવીર સૌજન્ય: ${article.featured_image_credit}`}
                      </div>
                    )}
                  </div>
                )}

                {/* Full Article Main Body HTML */}
                <div
                  className="prose prose-slate max-w-none text-slate-900 text-base sm:text-lg leading-relaxed space-y-5 font-gujarati"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Source Attribution Box */}
                {article.source_name && (
                  <div className="mt-8 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between font-gujarati">
                    <div>
                      <span className="font-bold text-slate-800">સ્ત્રોત / સંદર્ભ: </span>
                      <span>{article.source_name}</span>
                    </div>
                    {article.source_url && (
                      <a
                        href={article.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>મૂળ સ્ત્રોત ખોલો</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}

                {/* Official Correction Note */}
                {article.correction_note && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5 font-gujarati">
                    <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-amber-800">સંપાદકીય સુધારો (Editorial Correction)</p>
                      <p className="mt-1">{article.correction_note}</p>
                      {article.correction_at && (
                        <p className="text-[11px] text-amber-700 mt-1">સુધારા સમય: {formatDate(article.correction_at)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Article Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2 font-gujarati">
                    <span className="text-xs font-bold text-slate-500">ટેગ્સ:</span>
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/search?q=${encodeURIComponent(tag.name)}`}
                        className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 transition-colors"
                      >
                        #{tag.name_gu || tag.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar: Related Stories & Location news (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Related from same category */}
                {data?.related_from_category && data.related_from_category.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs font-gujarati">
                    <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                      <span className="w-2 h-5 bg-red-700 rounded-xs"></span>
                      <h3 className="font-black text-base text-slate-900">
                        {article.category?.name_gu || 'સંબંધિત સમાચાર'}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {data.related_from_category.map((rel) => (
                        <NewsCard key={rel.id} article={rel} variant="compact" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Related from same district/city */}
                {data?.related_from_location && data.related_from_location.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs font-gujarati">
                    <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                      <span className="w-2 h-5 bg-red-700 rounded-xs"></span>
                      <h3 className="font-black text-base text-slate-900">
                        {article.district?.name_gu || 'સ્થાનિક'} થી વધુ સમાચાર
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {data.related_from_location.map((loc) => (
                        <NewsCard key={loc.id} article={loc} variant="compact" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;
