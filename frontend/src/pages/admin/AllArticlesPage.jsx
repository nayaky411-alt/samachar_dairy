import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { 
  FileText, Search, PlusCircle, Eye, Edit, Trash2, 
  Archive, CheckCircle2, Clock, AlertCircle, RefreshCw 
} from 'lucide-react';

export default function AllArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  const fetchArticles = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (categoryFilter) params.append('category_id', categoryFilter);
    if (searchQuery) params.append('search', searchQuery);
    params.append('page', page);

    apiClient.get(`/admin/articles?${params.toString()}`)
      .then(res => {
        if (res.data.success) {
          setArticles(res.data.data);
          setMeta(res.data.meta || {});
        }
      })
      .catch(err => {
        console.error('Fetch articles error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    apiClient.get('/categories').then(res => {
      if (res.data.success) setCategories(res.data.data.categories || []);
    });
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [statusFilter, categoryFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const handlePublish = async (id) => {
    try {
      await apiClient.post(`/admin/articles/${id}/publish`);
      fetchArticles();
    } catch (err) {
      alert('પ્રકાશિત કરવામાં ક્ષતિ આવી.');
    }
  };

  const handleUnpublish = async (id) => {
    if (!window.confirm('શું તમે ખરેખર આ અહેવાલ અનપબ્લિશ કરી ડ્રાફ્ટમાં ફેરવવા માંગો છો?')) return;
    try {
      await apiClient.post(`/admin/articles/${id}/unpublish`);
      fetchArticles();
    } catch (err) {
      alert('અનપબ્લિશ કરવામાં ક્ષતિ આવી.');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('શું તમે આ અહેવાલ આર્કાઇવ કરવા માંગો છો?')) return;
    try {
      await apiClient.post(`/admin/articles/${id}/archive`);
      fetchArticles();
    } catch (err) {
      alert('આર્કાઇવ કરવામાં ક્ષતિ આવી.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-700" />
            તમામ સમાચાર આર્કાઇવ (All Articles CMS)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati mt-0.5">
            સમાચાર ડેરી ૨૪x૭ ના તમામ પ્રકાશિત, ડ્રાફ્ટ અને આર્કાઇવ કરાયેલા અહેવાલો
          </p>
        </div>
        <Link
          to="/admin/staff/create-news"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold font-gujarati shadow-xs self-start sm:self-auto transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>નવા સમાચાર ઉમેરો</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="શીર્ષક દ્વારા શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-gujarati cursor-pointer"
          >
            <option value="">તમામ સ્થિતિ (All Status)</option>
            <option value="published">પ્રકાશિત (Published)</option>
            <option value="pending_review">ચકાસણી હેઠળ (Pending)</option>
            <option value="draft">ડ્રાફ્ટ (Draft)</option>
            <option value="rejected">સુધારો માગેલ (Rejected)</option>
            <option value="archived">આર્કાઇવ (Archived)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-gujarati cursor-pointer"
          >
            <option value="">તમામ કેટેગરીઝ</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_gu} ({c.name})
              </option>
            ))}
          </select>

          <button
            onClick={fetchArticles}
            className="p-2 text-slate-600 hover:text-slate-900 border rounded-lg hover:bg-slate-100 transition"
            title="રીફ્રેશ"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">અહેવાલો લોડ થઈ રહ્યા છે...</div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">કોઈ અહેવાલો મળ્યા નથી.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-gujarati">શીર્ષક / લેખક</th>
                  <th className="px-4 py-3.5 font-gujarati">કેટેગરી</th>
                  <th className="px-4 py-3.5 font-gujarati">સ્થિતિ</th>
                  <th className="px-4 py-3.5 font-gujarati">વાચકો</th>
                  <th className="px-4 py-3.5 font-gujarati">તારીખ</th>
                  <th className="px-5 py-3.5 text-right font-gujarati">ક્રિયાઓ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 font-gujarati max-w-md line-clamp-1">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        લેખક: <strong className="text-slate-700">{art.author?.name || 'સંવાદદાતા'}</strong>
                        {art.district && ` • ${art.district.name_gu || art.district.name}`}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-gujarati">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        {art.category?.name_gu || art.category?.name}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {art.status === 'published' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          પ્રકાશિત
                        </span>
                      )}
                      {art.status === 'pending_review' && (
                        <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          ચકાસણી હેઠળ
                        </span>
                      )}
                      {art.status === 'draft' && (
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          ડ્રાફ્ટ
                        </span>
                      )}
                      {art.status === 'rejected' && (
                        <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          સુધારો માગેલ
                        </span>
                      )}
                      {art.status === 'archived' && (
                        <span className="bg-zinc-200 text-zinc-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          આર્કાઇવ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs font-mono font-bold text-slate-700">
                      {art.views_count?.toLocaleString('gu-IN') || 0}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {new Date(art.updated_at).toLocaleDateString('gu-IN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/staff/articles/${art.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded-lg transition"
                          title="સંપાદન"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {art.status === 'published' ? (
                          <>
                            <Link
                              to={`/article/${art.slug}`}
                              target="_blank"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="લાઈવ જુઓ"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleUnpublish(art.id)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold transition font-gujarati"
                            >
                              અનપબ્લિશ
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handlePublish(art.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition font-gujarati"
                          >
                            પ્રકાશિત
                          </button>
                        )}

                        {art.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(art.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="આર્કાઇવ કરો"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-gujarati">
              પૃષ્ઠ {meta.current_page} / {meta.last_page} (કુલ {meta.total} સમાચાર)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50 font-gujarati"
              >
                પાછળ
              </button>
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50 font-gujarati"
              >
                આગળ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
