import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient, { getStorageUrl } from '../api/client';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';
import NewsCard from '../components/news/NewsCard';
import { User, Calendar, Mail, Share2, Award, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuthorPage() {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

    // Fetch author profile and their articles
    apiClient.get(`/author/${slug}`)
      .then(res => {
        if (res.data.success) {
          setAuthor(res.data.data.author);
          setArticles(res.data.data.articles?.data || res.data.data.articles || []);
        } else {
          setError('પત્રકાર / લેખક મળ્યા નથી.');
        }
      })
      .catch(err => {
        console.error('Author fetch error:', err);
        setError('પત્રકારની વિગતો લોડ કરવામાં ક્ષતિ આવી છે.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <BreakingNewsTicker />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-700 transition">
            <ArrowLeft className="w-4 h-4" />
            મુખ્ય પૃષ્ઠ પર પાછા જાઓ
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 font-medium font-gujarati">વિગતો લોડ થઈ રહી છે...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold font-gujarati text-slate-900 mb-2">{error}</h2>
            <p className="text-slate-600 text-sm mb-6">તમે શોધેલ પત્રકારની પ્રોફાઇલ ઉપલબ્ધ નથી અથવા કાઢી નાખવામાં આવી છે.</p>
            <Link to="/" className="px-5 py-2.5 bg-red-700 text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition">
              મુખ્ય સમાચાર જુઓ
            </Link>
          </div>
        ) : (
          <div>
            {/* Author Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                <div className="relative">
                  {author?.profile_image ? (
                    <img 
                      src={getStorageUrl(author.profile_image)} 
                      alt={author.name} 
                      className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover shadow-md border-2 border-slate-100"
                    />
                  ) : (
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-tr from-red-800 to-red-600 text-white flex items-center justify-center text-4xl font-bold shadow-md">
                      {author?.name ? author.name.charAt(0) : 'સ'}
                    </div>
                  )}
                  <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-full shadow-sm" title="વેરિફાઈડ પત્રકાર">
                    <Award className="w-4 h-4" />
                  </span>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold font-gujarati text-slate-900">
                      {author?.name}
                    </h1>
                    <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-2.5 py-0.5 rounded-full font-gujarati">
                      {author?.designation || 'વરિષ્ઠ પત્રકાર (Senior Journalist)'}
                    </span>
                  </div>

                  <p className="text-slate-600 font-gujarati text-sm md:text-base leading-relaxed mb-4 max-w-3xl">
                    {author?.bio || 'સમાચાર ડાયરી 24x9 ના ખાસ સંવાદદાતા તરીકે ગુજરાત અને દેશ-વિદેશના મહત્વપૂર્ણ રાજકીય, સામાજિક અને સ્થાનિક પ્રશ્નો પર સચોટ વિશ્લેષણ રજૂ કરે છે.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-slate-500 font-gujarati pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-red-600" />
                      <span>કુલ અહેવાલો: <strong className="text-slate-800">{articles.length}</strong></span>
                    </div>
                    {author?.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{author.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Articles by Author */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-red-700 mb-6">
                <h2 className="text-xl md:text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-red-700 rounded-sm"></span>
                  {author?.name} દ્વારા લખાયેલા અહેવાલો
                </h2>
                <span className="text-sm font-gujarati text-slate-500">
                  {articles.length} સમાચાર
                </span>
              </div>

              {articles.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center border border-slate-200">
                  <p className="text-slate-500 font-gujarati">હાલ આ લેખક દ્વારા કોઈ પ્રકાશિત અહેવાલો ઉપલબ્ધ નથી.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
