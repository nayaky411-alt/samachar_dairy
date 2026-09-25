import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Loader2, Newspaper } from 'lucide-react';
import apiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import NewsCard from '../components/news/NewsCard';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const { language, t } = useLanguage();

  useEffect(() => {
    apiClient.get('/categories')
      .then(res => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  const performSearch = (q, cat = selectedCategory) => {
    if (!q.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    let url = `/search?q=${encodeURIComponent(q.trim())}`;
    if (cat) url += `&category=${cat}`;

    apiClient.get(url)
      .then(res => {
        if (res.data.success) {
          setResults(res.data.data || []);
          setTotalCount(res.data.meta?.total || 0);
        }
      })
      .catch(() => {
        setResults([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (query) {
      setSearchTerm(query);
      performSearch(query, selectedCategory);
    }
  }, [query, selectedCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
      performSearch(searchTerm.trim(), selectedCategory);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <BreakingNewsTicker />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 space-y-6 w-full">
        {/* Search Bar Container */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm font-gujarati">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
            સમાચાર સર્ચ (Search News & Information)
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="કીવર્ડ, શહેર, નેતા અથવા વિષય લખો..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl text-base outline-none text-slate-900"
              />
              <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="sm:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-3.5 bg-slate-50 border border-slate-300 focus:border-red-600 rounded-xl text-sm font-semibold outline-none text-slate-800"
              >
                <option value="">તમામ કેટેગરીઝ</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {language === 'gu' ? c.name_gu : c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-sm shadow-sm cursor-pointer transition-colors"
            >
              શોધો (Search)
            </button>
          </form>

          {query && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                '{query}' માટે શોધ પરિણામો: <strong className="text-slate-900">{totalCount}</strong> સમાચાર મળ્યા.
              </span>
            </div>
          )}
        </div>

        {/* Results Feed */}
        <div className="font-gujarati">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={36} className="animate-spin text-red-700 mb-2" />
              <span className="text-xs font-bold">શોધાઈ રહ્યું છે...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.map(art => (
                <NewsCard key={art.id} article={art} />
              ))}
            </div>
          ) : query ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
              <Newspaper size={40} className="mx-auto text-slate-400 mb-2" />
              <h3 className="text-base font-bold text-slate-800">કોઈ મેળ ખાતા સમાચાર મળ્યા નથી.</h3>
              <p className="text-xs text-slate-400 mt-1">કૃપા કરીને અન્ય શબ્દો અથવા કેટેગરી બદલીને ફરી પ્રયાસ કરો.</p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
              <Search size={36} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium">સમાચાર શોધવા માટે ઉપર સર્ચ બોક્સમાં લખો.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
