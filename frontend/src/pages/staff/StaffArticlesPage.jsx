import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { 
  FileText, PlusCircle, Search, Edit, Trash2, Send, Eye, 
  AlertCircle, CheckCircle2, Clock, Filter, RefreshCw
} from 'lucide-react';

export default function StaffArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [activeRejection, setActiveRejection] = useState(null);

  const fetchArticles = () => {
    setLoading(true);
    apiClient.get('/staff/articles')
      .then(res => {
        if (res.data.success) {
          const raw = res.data.data;
          const list = Array.isArray(raw) ? raw : (raw?.articles?.data || raw?.articles || []);
          setArticles(list);
        }
      })
      .catch(err => {
        console.error('Failed to fetch articles:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmitForReview = async (id) => {
    setSubmittingId(id);
    try {
      const res = await apiClient.post(`/staff/articles/${id}/submit`);
      if (res.data.success) {
        fetchArticles();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'ચકાસણી માટે મોકલવામાં નિષ્ફળતા મળી.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('શું તમે ખરેખર આ ડ્રાફ્ટ ડિલીટ કરવા માંગો છો?')) return;
    try {
      await apiClient.delete(`/staff/articles/${id}`);
      fetchArticles();
    } catch (err) {
      alert(err.response?.data?.message || 'ડિલીટ કરવામાં ક્ષતિ આવી.');
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
    const matchesSearch = !searchQuery || 
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900">મારા તમામ અહેવાલો (My Articles)</h1>
          <p className="text-xs text-slate-500 font-gujarati mt-0.5">
            તમારા તમામ ડ્રાફ્ટ્સ, પેન્ડિંગ સમીક્ષા અને પ્રકાશિત થયેલા સમાચારોની યાદી
          </p>
        </div>
        <Link
          to="/admin/staff/create-news"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="font-gujarati">નવો અહેવાલ</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'બધા (All)', count: articles.length },
            { id: 'draft', label: 'ડ્રાફ્ટ', count: articles.filter(a => a.status === 'draft').length },
            { id: 'pending_review', label: 'ચકાસણી હેઠળ', count: articles.filter(a => a.status === 'pending_review').length },
            { id: 'published', label: 'પ્રકાશિત', count: articles.filter(a => a.status === 'published').length },
            { id: 'rejected', label: 'સુધારો જરૂરી', count: articles.filter(a => a.status === 'rejected').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer font-gujarati flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="અહેવાલ શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">અહેવાલો લોડ થઈ રહ્યા છે...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 font-gujarati">કોઈ અહેવાલો મળ્યા નથી</h3>
            <p className="text-xs text-slate-500 mt-1 font-gujarati">
              આ ફિલ્ટરમાં કોઈ આર્ટીકલ્સ ઉપલબ્ધ નથી.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-gujarati">અહેવાલ / વિગતો</th>
                  <th className="px-4 py-3.5 font-gujarati">કેટેગરી / જિલ્લો</th>
                  <th className="px-4 py-3.5 font-gujarati">સ્થિતિ</th>
                  <th className="px-4 py-3.5 font-gujarati">તારીખ</th>
                  <th className="px-5 py-3.5 text-right font-gujarati">ક્રિયાઓ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 font-gujarati max-w-md line-clamp-1">
                        {art.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {art.short_description || 'કોઈ સંક્ષિપ્ત વિગત નથી.'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <span className="font-bold text-slate-700 block font-gujarati">
                        {art.category?.name_gu || art.category?.name || 'જનરલ'}
                      </span>
                      {art.district && (
                        <span className="text-[11px] text-slate-500 font-gujarati">
                          {art.district.name_gu || art.district.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {art.status === 'draft' && (
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          ડ્રાફ્ટ
                        </span>
                      )}
                      {art.status === 'pending_review' && (
                        <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          ચકાસણી હેઠળ
                        </span>
                      )}
                      {art.status === 'published' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          પ્રકાશિત
                        </span>
                      )}
                      {art.status === 'rejected' && (
                        <button
                          onClick={() => setActiveRejection(art)}
                          className="bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>સુધારો માગેલ</span>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {new Date(art.created_at).toLocaleDateString('gu-IN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/staff/articles/${art.id}/edit`}
                          className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-slate-100 rounded-lg transition"
                          title="સંપાદિત કરો"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {art.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleSubmitForReview(art.id)}
                              disabled={submittingId === art.id}
                              className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-bold transition disabled:opacity-50 font-gujarati flex items-center gap-1"
                              title="ચકાસણી માટે મોકલો"
                            >
                              <Send className="w-3 h-3" />
                              <span>સબમિટ</span>
                            </button>
                            <button
                              onClick={() => handleDelete(art.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="ડિલીટ કરો"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {art.status === 'published' && (
                          <Link
                            to={`/article/${art.slug}`}
                            target="_blank"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="લાઈવ જુઓ"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Note Modal */}
      {activeRejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-red-200">
            <div className="flex items-center gap-2 text-red-700 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg font-gujarati">સંપાદકનો સુધારો સંદેશ</h3>
            </div>
            <p className="text-xs text-slate-500 font-bold mb-1 font-gujarati">અહેવાલ: {activeRejection.title}</p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm font-gujarati my-3">
              {activeRejection.rejection_reason || 'કોઈ સ્પષ્ટ કારણ નોંધાયેલ નથી. કૃપા કરીને હકીકતો ચકાસો.'}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setActiveRejection(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold font-gujarati cursor-pointer"
              >
                બંધ કરો
              </button>
              <Link
                to={`/admin/staff/articles/${activeRejection.id}/edit`}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold font-gujarati"
              >
                અહેવાલ સુધારો ➔
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
