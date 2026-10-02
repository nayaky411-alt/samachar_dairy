import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient, { getStorageUrl } from '../api/client';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/layout/BreakingNewsTicker';
import UploadedVideoCard from '../components/media/UploadedVideoCard';
import NewsCard from '../components/news/NewsCard';
import { 
  Play, Clock, MapPin, User, Eye, Share2, 
  ArrowLeft, Check, Sparkles, AlertCircle, Loader2, FileVideo 
} from 'lucide-react';

export default function VideoDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiClient.get(`/videos/${slug}`)
      .then(res => {
        if (res.data.success) {
          const v = res.data.data.video;
          setVideo(v);
          setRelatedVideos(res.data.data.related_videos || []);
          setRelatedArticles(res.data.data.related_articles || []);

          // Set Page SEO Title
          document.title = `${v.title} | સમાચાર ડાયરી 24x9 વિડિયો`;

          // Track view count
          apiClient.post(`/videos/${slug}/view`).catch(() => {});
        } else {
          setError('વિડિયો મળ્યો નથી.');
        }
      })
      .catch(err => {
        console.error('Failed to load video:', err);
        setError('વિડિયો લોડ કરવામાં ક્ષતિ આવી અથવા આ વિડિયો ઉપલબ્ધ નથી.');
      })
      .finally(() => setLoading(false));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.caption || video?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Header />
        <BreakingNewsTicker />
        <div className="flex-grow min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
          <Loader2 size={36} className="animate-spin text-red-700 mb-3" />
          <span className="text-sm font-bold font-gujarati">વિડિયો લોડ થઈ રહ્યો છે...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Header />
        <BreakingNewsTicker />
        <div className="flex-grow max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold font-gujarati text-slate-900 mb-2">
            {error || 'વિડિયો ઉપલબ્ધ નથી'}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            આ વિડિયો હટાવી દેવામાં આવ્યો હોઈ શકે છે અથવા લિંક અમાન્ય છે.
          </p>
          <Link
            to="/videos"
            className="px-5 py-2.5 bg-red-700 text-white font-bold rounded-xl text-xs hover:bg-red-800 transition"
          >
            તમામ વિડિયો જુઓ ➔
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <BreakingNewsTicker />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-gujarati">
          <Link to="/" className="hover:text-red-700">મુખ્ય પૃષ્ઠ</Link>
          <span>/</span>
          <Link to="/videos" className="hover:text-red-700">વિડિયો સમાચાર</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-md">{video.title}</span>
        </div>

        {/* Main Video & Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Main Player & Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* HTML5 Native Video Player */}
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex items-center justify-center">
              <video
                src={getStorageUrl(video.file_url || video.file_path)}
                controls
                playsInline
                preload="auto"
                poster={getStorageUrl(video.thumbnail_url || video.thumbnail_path)}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Video Badges & Share Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {video.category && (
                  <span className="bg-red-700 text-white font-bold px-3 py-1 rounded-full font-gujarati text-xs">
                    {video.category.name_gu || video.category.name}
                  </span>
                )}
                {video.district && (
                  <span className="bg-slate-200 text-slate-800 font-semibold px-3 py-1 rounded-full flex items-center gap-1 font-gujarati text-xs">
                    <MapPin size={12} className="text-red-600" />
                    <span>{video.district.name_gu || video.district.name}</span>
                    {video.city && <span>• {video.city.name_gu || video.city.name}</span>}
                  </span>
                )}
                {video.duration && (
                  <span className="bg-slate-100 text-slate-700 font-mono font-bold px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                    <Clock size={12} />
                    <span>{video.duration}</span>
                  </span>
                )}
              </div>

              {/* Share & Views Counter */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Eye size={14} className="text-slate-400" />
                  <span>{video.views_count || 0} વ્યૂઝ</span>
                </span>

                <button
                  onClick={handleShare}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="લિંક શેર કરો"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                  <span>{copied ? 'લિંક કોપી થઈ!' : 'શેર કરો'}</span>
                </button>
              </div>
            </div>

            {/* Video Title */}
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 font-gujarati leading-tight">
              {video.title}
            </h1>

            {/* Author & Published Info */}
            <div className="flex items-center gap-3 py-3 border-y border-slate-200 text-xs text-slate-600 font-gujarati">
              <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center font-bold">
                {video.author?.name ? video.author.name[0] : 'S'}
              </div>
              <div>
                <p className="font-bold text-slate-900 leading-tight">
                  {video.author?.name || 'સમાચાર ડેરી વિશેષ સંવાદદાતા'}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  પ્રકાશિત: {new Date(video.published_at || video.created_at).toLocaleDateString('gu-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Video Caption & Description */}
            {video.caption && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h3 className="font-bold text-sm text-slate-900 font-gujarati uppercase tracking-wider">
                  અહેવાલની વિગત (About this report)
                </h3>
                <p className="text-sm text-slate-700 font-gujarati leading-relaxed whitespace-pre-line">
                  {video.caption}
                </p>
              </div>
            )}
          </div>

          {/* Right 1 Col: Related Videos & Top News */}
          <div className="space-y-6">
            {/* Related Local Videos */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-black text-slate-900 font-gujarati text-base flex items-center gap-2">
                  <Play size={16} className="text-red-700 fill-red-700" />
                  <span>વધુ સંબંધિત વિડિયો</span>
                </h3>
                <Link to="/videos" className="text-xs font-bold text-red-700 hover:underline">
                  બધા જુઓ ➔
                </Link>
              </div>

              {relatedVideos.length === 0 ? (
                <p className="text-xs text-slate-400 font-gujarati">કોઈ અન્ય વિડિયો નથી.</p>
              ) : (
                <div className="space-y-3">
                  {relatedVideos.map((rVid) => (
                    <Link
                      key={rVid.id}
                      to={`/videos/${rVid.slug || rVid.id}`}
                      className="group flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
                    >
                      <div className="relative w-24 aspect-video bg-slate-900 rounded-lg overflow-hidden shrink-0">
                        {rVid.thumbnail_url ? (
                          <img src={getStorageUrl(rVid.thumbnail_url || rVid.thumbnail_path)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <FileVideo size={18} />
                          </div>
                        )}
                        {rVid.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded font-mono">
                            {rVid.duration}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-red-700 transition line-clamp-2 font-gujarati leading-snug">
                          {rVid.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(rVid.published_at || rVid.created_at).toLocaleDateString('gu-IN')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Related News Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-black text-slate-900 font-gujarati text-base pb-2 border-b border-slate-100">
                  તાજા સમાચાર (Related News)
                </h3>
                <div className="space-y-2.5">
                  {relatedArticles.map((art) => (
                    <Link
                      key={art.id}
                      to={`/article/${art.slug}`}
                      className="block p-2 rounded-xl hover:bg-slate-50 transition group"
                    >
                      <span className="text-[10px] font-bold text-red-700 block mb-0.5 font-gujarati">
                        {art.category?.name_gu || 'સમાચાર'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-red-700 transition line-clamp-2 font-gujarati">
                        {art.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
