import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, PlusCircle, Clock, CheckCircle2, AlertTriangle, 
  Film, Camera, Image, ArrowRight, Eye, Edit, AlertCircle, RefreshCw
} from 'lucide-react';
import { Youtube } from '../../components/common/BrandIcons';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

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
        console.error('Failed to fetch staff articles:', err);
        setError('અહેવાલો લોડ કરવામાં નિષ્ફળતા મળી.');
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

  // Compute metrics
  const draftsCount = articles.filter(a => a.status === 'draft').length;
  const pendingCount = articles.filter(a => a.status === 'pending_review').length;
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const rejectedArticles = articles.filter(a => a.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-800 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="bg-red-700/80 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-500/30">
            પત્રકાર કાર્યસ્થળ (Staff Workspace)
          </span>
          <h1 className="text-2xl font-bold mt-2 font-gujarati">નમસ્તે, {user?.name || 'સંવાદદાતા'}!</h1>
          <p className="text-red-100/80 text-sm mt-1 font-gujarati">
            તમારા તમામ ડ્રાફ્ટ્સ, સબમિશન્સ અને સ્ટેટસ અહીં મેનેજ કરો.
          </p>
        </div>
        <Link
          to="/admin/staff/create-news"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="font-gujarati">નવા સમાચાર લખો</span>
        </Link>
      </div>

      {/* Rejection Alert If Any */}
      {rejectedArticles.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-900">
          <div className="flex items-center gap-2.5 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <h3 className="font-bold text-base font-gujarati">
              ધ્યાન આપો: તમારા {rejectedArticles.length} સમાચારમાં સંપાદક દ્વારા સુધારા માંગવામાં આવ્યા છે!
            </h3>
          </div>
          <div className="space-y-2 mt-3">
            {rejectedArticles.map(art => (
              <div key={art.id} className="bg-white/80 p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <strong className="text-slate-900 block text-sm font-gujarati">{art.title}</strong>
                  <span className="text-red-700 font-semibold font-gujarati">સંપાદક ફીડબેક: </span>
                  <span className="text-slate-700">{art.rejection_reason || 'કૃપા કરીને વિગતો ફરી ચકાસી સુધારો કરો.'}</span>
                </div>
                <Link
                  to={`/admin/staff/articles/${art.id}/edit`}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg self-start sm:self-center transition font-gujarati"
                >
                  સુધારો કરો ➔
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-gujarati">ડ્રાફ્ટ અહેવાલો</span>
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{draftsCount}</div>
          <div className="mt-1 text-xs text-slate-500 font-gujarati">લખાણ હેઠળ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 font-gujarati">ચકાસણી હેઠળ (Review)</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-600">{pendingCount}</div>
          <div className="mt-1 text-xs text-slate-500 font-gujarati">ચેનલ હેડ ડેસ્ક પર</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 font-gujarati">પ્રકાશિત (Published)</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600">{publishedCount}</div>
          <div className="mt-1 text-xs text-slate-500 font-gujarati">વેબસાઇટ પર લાઈવ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 font-gujarati">સુધારા જરૂરી (Rejected)</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-red-600">{rejectedArticles.length}</div>
          <div className="mt-1 text-xs text-slate-500 font-gujarati">પુનઃસમીક્ષા માગેલ</div>
        </div>
      </div>

      {/* Quick Media Action Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 font-gujarati">ઝડપી મીડિયા સબમિશન (Quick Media Actions)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/staff/create-news"
            className="p-4 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition text-center group"
          >
            <PlusCircle className="w-6 h-6 text-red-700 mx-auto mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-800 font-gujarati block">નવા સમાચાર</span>
            <span className="text-[10px] text-slate-500">રિપોર્ટ લખો</span>
          </Link>

          <Link
            to="/admin/staff/submit-reel"
            className="p-4 rounded-xl bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 transition text-center group"
          >
            <Film className="w-6 h-6 text-pink-600 mx-auto mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-800 font-gujarati block">ઇન્સ્ટાગ્રામ રીલ</span>
            <span className="text-[10px] text-slate-500">શોર્ટ વીડિયો</span>
          </Link>

          <Link
            to="/admin/staff/submit-video"
            className="p-4 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition text-center group"
          >
            <Youtube className="w-6 h-6 text-red-600 mx-auto mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-800 font-gujarati block">યૂટ્યુબ વિડીયો</span>
            <span className="text-[10px] text-slate-500">વિગતવાર વિડિયો</span>
          </Link>

          <Link
            to="/admin/staff/submit-gallery"
            className="p-4 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition text-center group"
          >
            <Camera className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-800 font-gujarati block">ફોટો ગેલેરી</span>
            <span className="text-[10px] text-slate-500">મલ્ટી ફોટો આલ્બમ</span>
          </Link>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 font-gujarati">મારા તાજેતરના અહેવાલો (My Recent Articles)</h2>
            <p className="text-xs text-slate-500 mt-0.5">તમારા દ્વારા તૈયાર કરાયેલ છેલ્લા સમાચાર અને તેમનું વર્તમાન સ્ટેટસ</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchArticles}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              title="રીફ્રેશ કરો"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/admin/staff/articles"
              className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 font-gujarati"
            >
              <span>બધા જુઓ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">અહેવાલો લોડ થઈ રહ્યા છે...</div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 font-gujarati">હજી સુધી કોઈ સમાચાર લખાયા નથી</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 font-gujarati">
              નવો અહેવાલ તૈયાર કરો અને મંજૂરી માટે ચેનલ હેડને મોકલો.
            </p>
            <Link
              to="/admin/staff/create-news"
              className="px-4 py-2 bg-red-700 text-white rounded-lg text-xs font-bold hover:bg-red-800 transition"
            >
              પહેલો અહેવાલ લખો
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-gujarati">શીર્ષક</th>
                  <th className="px-4 py-3.5 font-gujarati">કેટેગરી</th>
                  <th className="px-4 py-3.5 font-gujarati">સ્થિતિ (Status)</th>
                  <th className="px-4 py-3.5 font-gujarati">તારીખ</th>
                  <th className="px-5 py-3.5 text-right font-gujarati">ક્રિયાઓ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.slice(0, 10).map((art) => {
                  let badge = null;
                  if (art.status === 'draft') {
                    badge = <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full">ડ્રાફ્ટ</span>;
                  } else if (art.status === 'pending_review') {
                    badge = <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full">ચકાસણી હેઠળ</span>;
                  } else if (art.status === 'published') {
                    badge = <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">પ્રકાશિત</span>;
                  } else if (art.status === 'rejected') {
                    badge = <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full">રિજેક્ટ / સુધારો</span>;
                  }

                  return (
                    <tr key={art.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 font-gujarati max-w-md line-clamp-1">
                          {art.title}
                        </div>
                        {art.district && (
                          <span className="text-[11px] text-slate-500 font-gujarati">
                            જિલ્લો: {art.district.name_gu || art.district.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600 font-gujarati">
                        {art.category?.name_gu || art.category?.name || 'સામાન્ય'}
                      </td>
                      <td className="px-4 py-4">{badge}</td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {new Date(art.created_at).toLocaleDateString('gu-IN')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/staff/articles/${art.id}/edit`}
                            className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-slate-100 rounded-lg transition"
                            title="સંપાદિત કરો"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {art.status === 'draft' && (
                            <button
                              onClick={() => handleSubmitForReview(art.id)}
                              disabled={submittingId === art.id}
                              className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-bold transition disabled:opacity-50 font-gujarati"
                            >
                              {submittingId === art.id ? 'મોકલાઈ રહ્યું છે...' : 'મંજૂરી માટે મોકલો'}
                            </button>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
