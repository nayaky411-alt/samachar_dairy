import React, { useEffect, useState } from 'react';
import { Play, Loader2, HardDrive, Filter } from 'lucide-react';
import { Youtube } from '../components/common/BrandIcons';
import apiClient from '../api/client';
import VideoSection from '../components/media/VideoSection';
import UploadedVideoCard from '../components/media/UploadedVideoCard';

const VideosPage = () => {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'uploaded' | 'youtube'
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'સત્તાવાર વિડીયો સમાચાર | સમાચાર ડેરી ૨૪x૭';

    Promise.allSettled([
      apiClient.get('/videos'),
      apiClient.get('/youtube')
    ]).then(([resUploaded, resYoutube]) => {
      if (resUploaded.status === 'fulfilled' && resUploaded.value.data.success) {
        setUploadedVideos(resUploaded.value.data.data || []);
      }
      if (resYoutube.status === 'fulfilled' && resYoutube.value.data.success) {
        setYoutubeVideos(resYoutube.value.data.data || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-300 mb-2">
          <Play size={18} className="text-red-500 fill-red-500" />
          <span>સત્તાવાર વિડીયો હબ</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mb-2 font-gujarati">
          સમાચાર ડેરી વિડીયો હબ (Video Hub)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-gujarati">
          ગુજરાતના ગ્રાઉન્ડ રિપોર્ટિંગ, મહત્વપૂર્ણ ઇન્ટરવ્યુ, સ્પેશિયલ બુલેટિન અને બ્રેકિંગ વિડીયો સમાચાર.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-gujarati ${
            filterType === 'all'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          તમામ વિડિયો (All Videos)
        </button>

        <button
          onClick={() => setFilterType('uploaded')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-gujarati ${
            filterType === 'uploaded'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HardDrive size={14} />
          <span>ગ્રાઉન્ડ રિપોર્ટ્સ (Field Videos)</span>
          {uploadedVideos.length > 0 && (
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {uploadedVideos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterType('youtube')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-gujarati ${
            filterType === 'youtube'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Youtube size={14} />
          <span>યૂટ્યુબ બુલેટિન (YouTube)</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 size={36} className="animate-spin text-red-700 mb-2" />
          <span className="text-xs font-bold font-gujarati">વિડિયો લોડ થઈ રહ્યા છે...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Uploaded Videos */}
          {(filterType === 'all' || filterType === 'uploaded') && (
            <div>
              <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-red-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-red-700 rounded-xs"></span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 font-gujarati">
                    <HardDrive size={20} className="text-red-700" />
                    <span>વિશેષ ગ્રાઉન્ડ વિડિયો રિપોર્ટ્સ (Field Reports)</span>
                  </h2>
                </div>
              </div>

              {uploadedVideos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 font-gujarati text-xs">
                  હાલમાં કોઈ ગ્રાઉન્ડ વિડિયો ઉપલબ્ધ નથી.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {uploadedVideos.map((vid) => (
                    <UploadedVideoCard key={vid.id} video={vid} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: YouTube Bulletins */}
          {(filterType === 'all' || filterType === 'youtube') && (
            <VideoSection videos={youtubeVideos} />
          )}
        </div>
      )}
    </div>
  );
};

export default VideosPage;
