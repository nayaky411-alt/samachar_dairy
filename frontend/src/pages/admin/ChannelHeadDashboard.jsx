import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckSquare, FileText, Eye, Users, Flame, Clock, 
  ArrowRight, CheckCircle2, XCircle, AlertTriangle, Send, RefreshCw
} from 'lucide-react';
import PreviewModal from '../../components/admin/PreviewModal';
import RejectModal from '../../components/admin/RejectModal';

export default function ChannelHeadDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [breakingText, setBreakingText] = useState('');
  const [publishingBreaking, setPublishingBreaking] = useState(false);
  const [breakingSuccess, setBreakingSuccess] = useState(false);

  // Modals
  const [previewArticle, setPreviewArticle] = useState(null);
  const [rejectArticle, setRejectArticle] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    apiClient.get('/admin/dashboard')
      .then(res => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch admin dashboard:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickApproveAndPublish = async (articleId) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/articles/${articleId}/publish`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'પ્રકાશિત કરવામાં નિષ્ફળતા મળી.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectArticle) return;
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/articles/${rejectArticle.id}/reject`, { reason });
      setRejectArticle(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'રિજેક્ટ કરવામાં નિષ્ફળતા મળી.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBroadcastBreaking = async (e) => {
    e.preventDefault();
    if (!breakingText.trim()) return;

    setPublishingBreaking(true);
    try {
      const res = await apiClient.post('/admin/breaking-news', {
        title: breakingText,
        is_active: true,
        priority: 1,
      });
      if (res.data.success) {
        setBreakingText('');
        setBreakingSuccess(true);
        setTimeout(() => setBreakingSuccess(false), 3000);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'બ્રેકિંગ ન્યૂઝ પ્રકાશિત કરવામાં નિષ્ફળતા.');
    } finally {
      setPublishingBreaking(false);
    }
  };

  const stats = data?.stats || {};
  const pendingArticles = data?.recent_articles?.filter(a => a.status === 'pending_review') || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-red-700/80 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-500/30">
            મુખ્ય સંપાદક નિયંત્રણ કક્ષ (Channel Head Control Room)
          </span>
          <h1 className="text-2xl font-bold mt-2 font-gujarati">નમસ્તે, {user?.name || 'મુખ્ય સંપાદક'}</h1>
          <p className="text-red-100/80 text-xs sm:text-sm mt-1 font-gujarati">
            સમાચાર ડેરી ૨૪x૭ - સંપાદકીય મંજૂરીઓ, બ્રેકિંગ ન્યૂઝ અને પત્રકારોનું મોનિટરિંગ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/channel-head/approval-queue"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="font-gujarati">મંજૂરી કતાર ({stats.pending_approval || 0})</span>
          </Link>
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
            title="ડેટા રીફ્રેશ કરો"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instant Breaking News Ticker Creator */}
      <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-red-700">
          <Flame className="w-5 h-5 animate-pulse" />
          <h2 className="text-sm font-bold font-gujarati">તાત્કાલિક બ્રેકિંગ ન્યૂઝ ફ્લેશ કરો (Instant Breaking Alert)</h2>
        </div>
        {breakingSuccess && (
          <p className="text-xs text-emerald-600 font-bold mb-2 font-gujarati">
            ✓ બ્રેકિંગ ન્યૂઝ હોમપેજ ટીકરમાં લાઈવ થઈ ગયા છે!
          </p>
        )}
        <form onSubmit={handleBroadcastBreaking} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder="દા.ત. બ્રેકિંગ: ગુજરાત બજેટમાં ખેડૂતો માટે ૧૦ હજાર કરોડનું વિશેષ પેકેજ જાહેર..."
            value={breakingText}
            onChange={(e) => setBreakingText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-600 focus:bg-white font-gujarati"
          />
          <button
            type="submit"
            disabled={publishingBreaking}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold font-gujarati transition disabled:opacity-50 flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            {publishingBreaking ? 'લાઈવ થઈ રહ્યું છે...' : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>ફ્લેશ કરો ➔</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to="/admin/channel-head/approval-queue" className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs hover:border-amber-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 font-gujarati">મંજૂરી બાકી</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{stats.pending_approval || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">તાત્કાલિક નિર્ણય</div>
        </Link>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 font-gujarati">લાઈવ સમાચાર</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{stats.published_articles || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ઓનલાઇન રીડર્સ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 font-gujarati">કુલ વાચકો (Views)</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.total_views?.toLocaleString('gu-IN') || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">આર્ટિકલ વ્યુઝ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 font-gujarati">સ્ટાફ રિપોર્ટર્સ</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.staff_count || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">સક્રિય પત્રકારો</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-600 font-gujarati">બ્રેકિંગ ન્યૂઝ</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-red-600">{stats.breaking_news_count || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ટીકર લાઈવ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 font-gujarati">કુલ આર્ટીકલ્સ</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.total_articles || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ડેટાબેઝ આર્કાઇવ</div>
        </div>
      </div>

      {/* Approval Queue Quick Review Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 font-gujarati flex items-center gap-2">
              <span className="w-2.5 h-5 bg-amber-500 rounded-xs"></span>
              ચકાસણી હેઠળના તાજા સમાચાર (Pending Review)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              પત્રકારો દ્વારા સબમિટ કરાયેલ અહેવાલો. ચકાસીને મંજૂર કરો અથવા કારણ સાથે સુધારો માગો.
            </p>
          </div>
          <Link
            to="/admin/channel-head/approval-queue"
            className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 font-gujarati"
          >
            <span>સંપૂર્ણ મંજૂરી કતાર જુઓ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-gujarati">ડેટા લોડ થઈ રહ્યો છે...</div>
        ) : pendingArticles.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 font-gujarati">કોઈ અહેવાલ મંજૂરી માટે બાકી નથી!</p>
            <p className="text-xs text-slate-400 mt-0.5">તમામ સબમિશન્સ પ્રક્રિયા થઈ ચૂકી છે.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingArticles.slice(0, 5).map((art) => (
              <div key={art.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded font-gujarati">
                      {art.category?.name_gu || art.category?.name || 'સમાચાર'}
                    </span>
                    <span className="text-xs text-slate-500">
                      લેખક: <strong className="text-slate-700">{art.author?.name || 'સંવાદદાતા'}</strong>
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{new Date(art.updated_at).toLocaleDateString('gu-IN')}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 font-gujarati text-sm md:text-base line-clamp-1">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-gujarati line-clamp-1 mt-0.5">
                    {art.short_description || 'કોઈ સંક્ષિપ્ત વિગત નથી.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <button
                    onClick={() => setPreviewArticle(art)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition font-gujarati cursor-pointer"
                  >
                    પ્રિવ્યૂ (Preview)
                  </button>
                  <button
                    onClick={() => setRejectArticle(art)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition font-gujarati cursor-pointer"
                  >
                    રિજેક્ટ (Reject)
                  </button>
                  <button
                    onClick={() => handleQuickApproveAndPublish(art.id)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition font-gujarati cursor-pointer disabled:opacity-50"
                  >
                    મંજૂર & લાઈવ કરો
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Read Stories */}
      {data?.top_articles && data.top_articles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h2 className="font-bold text-slate-900 font-gujarati mb-3">સૌથી વધુ વંચાયેલા સમાચાર (Most Read Articles)</h2>
          <div className="divide-y divide-slate-100">
            {data.top_articles.map((art, idx) => (
              <div key={art.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-black text-slate-400">{idx + 1}</span>
                  <Link to={`/article/${art.slug}`} target="_blank" className="font-bold text-slate-800 hover:text-red-700 font-gujarati line-clamp-1">
                    {art.title}
                  </Link>
                </div>
                <span className="text-slate-500 font-mono font-bold flex-shrink-0 ml-4">
                  {art.views_count?.toLocaleString('gu-IN')} વ્યુઝ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {previewArticle && (
        <PreviewModal
          article={previewArticle}
          onClose={() => setPreviewArticle(null)}
          onApprove={() => {
            handleQuickApproveAndPublish(previewArticle.id);
            setPreviewArticle(null);
          }}
          onReject={() => {
            setRejectArticle(previewArticle);
            setPreviewArticle(null);
          }}
        />
      )}

      {rejectArticle && (
        <RejectModal
          isOpen={true}
          title={rejectArticle.title}
          onClose={() => setRejectArticle(null)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </div>
  );
}
