import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FolderTree, ChevronRight, Loader2, Newspaper } from 'lucide-react';
import apiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import NewsCard from '../components/news/NewsCard';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';

const CategoryPage = () => {
  const params = useParams();
  const categorySlug = params.slug || params.categorySlug;
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const { language, t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    if (!categorySlug) {
      // Default to general news
      apiClient.get('/news?per_page=16')
        .then(res => {
          if (res.data.success) {
            setArticles(res.data.data || []);
          }
        })
        .finally(() => setLoading(false));
      return;
    }

    apiClient.get(`/categories/${categorySlug}`)
      .then(res => {
        if (res.data.success) {
          setCategory(res.data.data.category);
          setArticles(res.data.data.articles || []);
          setPagination(res.data.meta || { current_page: 1, last_page: 1 });
          document.title = `${res.data.data.category?.name_gu || 'સમાચાર'} | સમાચાર ડાયરી 24x9`;
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categorySlug]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <BreakingNewsTicker />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 space-y-6 w-full">
        {/* Category Header */}
        {category && (
          <div
            className="rounded-2xl p-6 sm:p-8 text-white shadow-sm font-gujarati"
            style={{ backgroundColor: category.color || '#b91c1c' }}
          >
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider bg-black/25 px-2.5 py-1 rounded-md mb-2 inline-block">
                કેટેગરી કવરેજ (Category Archive)
              </span>
              <h1 className="text-2xl sm:text-4xl font-black mt-2">
                {language === 'gu' ? category.name_gu : category.name}
              </h1>
              {category.description && (
                <p className="text-xs sm:text-sm mt-2 text-white/90 leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 font-gujarati">
              <Loader2 size={36} className="animate-spin text-red-700 mb-2" />
              <span className="text-xs font-bold">સમાચાર લોડ થઈ રહ્યા છે...</span>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {articles.map(art => (
                <NewsCard key={art.id} article={art} showCategory={false} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 font-gujarati">
              <Newspaper size={40} className="mx-auto text-slate-400 mb-2" />
              <h3 className="text-base font-bold text-slate-800">આ કેટેગરીમાં હાલ કોઈ સમાચાર ઉપલબ્ધ નથી.</h3>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
