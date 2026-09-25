import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { 
  CheckSquare, FileText, Film, Camera, 
  Check, X, Eye, RefreshCw, AlertCircle, Clock, Calendar, 
  HardDrive, Play, FileVideo, User, MapPin
} from 'lucide-react';
import { Youtube } from '../../components/common/BrandIcons';
import PreviewModal from '../../components/admin/PreviewModal';
import RejectModal from '../../components/admin/RejectModal';
import VideoPreviewModal from '../../components/admin/VideoPreviewModal';

export default function ApprovalQueuePage() {
  const [activeTab, setActiveTab] = useState('articles'); // articles, uploaded_videos, reels, videos, galleries
  const [data, setData] = useState({
    articles: [],
    uploaded_videos: [],
    reels: [],
    videos: [],
    galleries: [],
    counts: { articles: 0, uploaded_videos: 0, reels: 0, videos: 0, galleries: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [previewArticle, setPreviewArticle] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [rejectItem, setRejectItem] = useState(null); // { type: 'article'|'uploaded_video'|'reel'|'video'|'gallery', item: ... }

  const fetchQueue = () => {
    setLoading(true);
    apiClient.get('/admin/approval-queue')
      .then(res => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch(err => {
        console.error('Fetch queue error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Approvals
  const handleApproveArticle = async (id, publishImmediately = true) => {
    setActionLoading(true);
    try {
      const endpoint = publishImmediately ? `/admin/articles/${id}/publish` : `/admin/articles/${id}/approve`;
      await apiClient.post(endpoint);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'મંજૂર કરવામાં ક્ષતિ આવી.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveUploadedVideo = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/uploaded-videos/${id}/approve`);
      if (previewVideo && previewVideo.id === id) {
        setPreviewVideo(null);
      }
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'વિડિયો મંજૂર કરવામાં ક્ષતિ આવી.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveReel = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/reels/${id}/approve`);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'રીલ મંજૂર કરવામાં ક્ષતિ આવી.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveVideo = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/videos/${id}/approve`);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'વિડીયો મંજૂર કરવામાં ક્ષતિ આવી.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveGallery = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/galleries/${id}/approve`);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'ગેલેરી મંજૂર કરવામાં ક્ષતિ આવી.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Confirm
  const handleRejectConfirm = async (reason) => {
    if (!rejectItem) return;
    setActionLoading(true);
    try {
      const { type, item } = rejectItem;
      if (type === 'article') {
        await apiClient.post(`/admin/articles/${item.id}/reject`, { reason });
      } else if (type === 'uploaded_video') {
        await apiClient.post(`/admin/uploaded-videos/${item.id}/reject`, { reason });
        if (previewVideo && previewVideo.id === item.id) {
          setPreviewVideo(null);
        }
      } else if (type === 'reel') {
        await apiClient.post(`/admin/reels/${item.id}/reject`, { reason });
      } else if (type === 'video') {
        await apiClient.post(`/admin/videos/${item.id}/reject`, { reason });
      } else if (type === 'gallery') {
        await apiClient.post(`/admin/galleries/${item.id}/reject`, { reason });
      }
      setRejectItem(null);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'રિજેક્ટ કરવામાં ક્ષતિ આવી.');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = data.counts || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-red-700" />
            સંપાદકીય મંજૂરી કતાર (Editorial Approval Queue)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati mt-0.5">
            કુલ {counts.total || 0} સામગ્રીઓ સમીક્ષા હેઠળ છે. ગુણવત્તા અને તથ્ય ચકાસીને મંજૂરી આપો.
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 border border-slate-300 transition flex items-center gap-1.5 text-xs font-bold font-gujarati self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>રીફ્રેશ કરો</span>
        </button>
      </div>

      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-gujarati ${
            activeTab === 'articles'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>અહેવાલો (Articles)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'articles' ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-800'
          }`}>
            {counts.articles || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('uploaded_videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-gujarati ${
            activeTab === 'uploaded_videos'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>અપલોડ વિડિયો (Local Videos)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'uploaded_videos' ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-800'
          }`}>
            {counts.uploaded_videos || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-gujarati ${
            activeTab === 'reels'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>ઇન્સ્ટાગ્રામ રીલ્સ (Reels)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'reels' ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-800'
          }`}>
            {counts.reels || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-gujarati ${
            activeTab === 'videos'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Youtube className="w-4 h-4" />
          <span>યૂટ્યુબ વિડીયોઝ (YouTube)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'videos' ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-800'
          }`}>
            {counts.videos || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('galleries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-gujarati ${
            activeTab === 'galleries'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>ફોટો ગેલેરીઝ (Galleries)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'galleries' ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-800'
          }`}>
            {counts.galleries || 0}
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">મંજૂરી કતાર લોડ થઈ રહી છે...</div>
        ) : (
          <div>
            {/* 1. ARTICLES TAB */}
            {activeTab === 'articles' && (
              data.articles.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-gujarati">
                  કોઈ લેખ મંજૂરી માટે બાકી નથી.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.articles.map((art) => (
                    <div key={art.id} className="p-5 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded font-gujarati">
                            {art.category?.name_gu || art.category?.name || 'સમાચાર'}
                          </span>
                          {art.district && (
                            <span className="text-slate-500 font-gujarati">
                              જિલ્લો: {art.district.name_gu || art.district.name}
                            </span>
                          )}
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">
                            લેખક: <strong>{art.author?.name}</strong>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">
                            {new Date(art.updated_at).toLocaleDateString('gu-IN')}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 font-gujarati text-base md:text-lg">
                          {art.title}
                        </h3>

                        <p className="text-xs text-slate-600 font-gujarati line-clamp-2">
                          {art.short_description || 'કોઈ સંક્ષિપ્ત વિગત નથી.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        <button
                          onClick={() => setPreviewArticle(art)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition font-gujarati flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>પ્રિવ્યૂ</span>
                        </button>

                        <button
                          onClick={() => setRejectItem({ type: 'article', item: art })}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition font-gujarati flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>સુધારો માગો (Reject)</span>
                        </button>

                        <button
                          onClick={() => handleApproveArticle(art.id, true)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition font-gujarati flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>મંજૂર & લાઈવ કરો</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 2. UPLOADED LOCAL VIDEOS TAB (NEW) */}
            {activeTab === 'uploaded_videos' && (
              (!data.uploaded_videos || data.uploaded_videos.length === 0) ? (
                <div className="p-12 text-center text-slate-500 font-gujarati">
                  કોઈ અપલોડ કરેલ વિડિયો મંજૂરી માટે બાકી નથી.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.uploaded_videos.map((vid) => (
                    <div key={vid.id} className="p-5 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4 flex-1">
                        {/* Thumbnail with duration & play badge */}
                        <div 
                          onClick={() => setPreviewVideo(vid)}
                          className="relative w-28 sm:w-36 aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer group shadow-2xs"
                        >
                          {vid.thumbnail_url ? (
                            <img src={vid.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <FileVideo size={24} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 flex items-center justify-center transition">
                            <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                              <Play size={14} className="ml-0.5" />
                            </span>
                          </div>
                          {vid.duration && (
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                              {vid.duration}
                            </span>
                          )}
                        </div>

                        {/* Video Details */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded font-gujarati">
                              {vid.category?.name_gu || 'વિડિયો રિપોર્ટ'}
                            </span>
                            {vid.district && (
                              <span className="text-xs text-slate-500 flex items-center gap-1 font-gujarati">
                                <MapPin size={11} className="text-red-600" />
                                <span>{vid.district.name_gu || vid.district.name}</span>
                              </span>
                            )}
                            <span className="text-xs text-slate-500">
                              સંવાદદાતા: <strong>{vid.author?.name}</strong>
                            </span>
                            {vid.file_size && (
                              <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {(vid.file_size / (1024 * 1024)).toFixed(1)} MB
                              </span>
                            )}
                          </div>

                          <h3 
                            onClick={() => setPreviewVideo(vid)}
                            className="font-bold text-slate-900 font-gujarati text-sm sm:text-base hover:text-red-700 cursor-pointer transition leading-snug"
                          >
                            {vid.title}
                          </h3>

                          {vid.caption && (
                            <p className="text-xs text-slate-500 line-clamp-1 font-gujarati">{vid.caption}</p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        <button
                          onClick={() => setPreviewVideo(vid)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition font-gujarati flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-red-600" />
                          <span>પ્લે અને પ્રિવ્યૂ</span>
                        </button>

                        <button
                          onClick={() => setRejectItem({ type: 'uploaded_video', item: vid })}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition font-gujarati flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>સુધારો માગો</span>
                        </button>

                        <button
                          onClick={() => handleApproveUploadedVideo(vid.id)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition font-gujarati flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>મંજૂર & લાઈવ કરો</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 3. REELS TAB */}
            {activeTab === 'reels' && (
              data.reels.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-gujarati">
                  કોઈ ઇન્સ્ટાગ્રામ રીલ મંજૂરી માટે બાકી નથી.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.reels.map((reel) => (
                    <div key={reel.id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {reel.thumbnail_url ? (
                          <img src={reel.thumbnail_url} alt="" className="w-16 h-20 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-20 bg-pink-100 text-pink-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Film className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-100 text-pink-800 rounded font-gujarati">ઇન્સ્ટાગ્રામ રીલ</span>
                            <span className="text-xs text-slate-500">લેખક: <strong>{reel.author?.name}</strong></span>
                          </div>
                          <h3 className="font-bold text-slate-900 font-gujarati text-sm sm:text-base">{reel.title}</h3>
                          <a href={reel.instagram_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-0.5 block truncate max-w-md">
                            {reel.instagram_url}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <button
                          onClick={() => setRejectItem({ type: 'reel', item: reel })}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition font-gujarati cursor-pointer"
                        >
                          રિજેક્ટ
                        </button>
                        <button
                          onClick={() => handleApproveReel(reel.id)}
                          disabled={actionLoading}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition font-gujarati cursor-pointer"
                        >
                          મંજૂર કરો
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 4. VIDEOS TAB (YouTube) */}
            {activeTab === 'videos' && (
              data.videos.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-gujarati">
                  કોઈ યૂટ્યુબ વિડીયો મંજૂરી માટે બાકી નથી.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.videos.map((vid) => (
                    <div key={vid.id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={vid.thumbnail_url || `https://img.youtube.com/vi/${vid.video_id}/hqdefault.jpg`} 
                          alt="" 
                          className="w-24 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded font-gujarati">યૂટ્યુબ</span>
                            <span className="text-xs text-slate-500">રિપોર્ટર: <strong>{vid.author?.name}</strong></span>
                          </div>
                          <h3 className="font-bold text-slate-900 font-gujarati text-sm sm:text-base">{vid.title}</h3>
                          <a href={vid.youtube_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-0.5 block truncate max-w-md">
                            {vid.youtube_url}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <button
                          onClick={() => setRejectItem({ type: 'video', item: vid })}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition font-gujarati cursor-pointer"
                        >
                          રિજેક્ટ
                        </button>
                        <button
                          onClick={() => handleApproveVideo(vid.id)}
                          disabled={actionLoading}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition font-gujarati cursor-pointer"
                        >
                          મંજૂર કરો
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 5. GALLERIES TAB */}
            {activeTab === 'galleries' && (
              data.galleries.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-gujarati">
                  કોઈ ફોટો ગેલેરી મંજૂરી માટે બાકી નથી.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.galleries.map((gal) => (
                    <div key={gal.id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={gal.cover_image} 
                          alt="" 
                          className="w-20 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-gujarati">
                              ગેલેરી ({gal.images?.length || 0} ફોટોઝ)
                            </span>
                            <span className="text-xs text-slate-500">રિપોર્ટર: <strong>{gal.author?.name}</strong></span>
                          </div>
                          <h3 className="font-bold text-slate-900 font-gujarati text-sm sm:text-base">{gal.title}</h3>
                          <p className="text-xs text-slate-500 font-gujarati line-clamp-1">{gal.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <button
                          onClick={() => setRejectItem({ type: 'gallery', item: gal })}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition font-gujarati cursor-pointer"
                        >
                          રિજેક્ટ
                        </button>
                        <button
                          onClick={() => handleApproveGallery(gal.id)}
                          disabled={actionLoading}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition font-gujarati cursor-pointer"
                        >
                          મંજૂર કરો
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Preview Modal for Articles */}
      {previewArticle && (
        <PreviewModal
          article={previewArticle}
          onClose={() => setPreviewArticle(null)}
          onApprove={() => {
            handleApproveArticle(previewArticle.id, true);
            setPreviewArticle(null);
          }}
          onReject={() => {
            setRejectItem({ type: 'article', item: previewArticle });
            setPreviewArticle(null);
          }}
        />
      )}

      {/* Video Preview Modal for Channel Head */}
      {previewVideo && (
        <VideoPreviewModal
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
          onApprove={handleApproveUploadedVideo}
          onReject={(vid) => setRejectItem({ type: 'uploaded_video', item: vid })}
          isActionLoading={actionLoading}
        />
      )}

      {/* Mandatory Reason Reject Modal */}
      {rejectItem && (
        <RejectModal
          articleTitle={rejectItem.item.title}
          onCancel={() => setRejectItem(null)}
          onConfirm={handleRejectConfirm}
          isSubmitting={actionLoading}
        />
      )}
    </div>
  );
}
