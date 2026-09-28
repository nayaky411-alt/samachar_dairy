import React, { useState } from 'react';
import { Play, Clock, X } from 'lucide-react';
import { Youtube } from '../common/BrandIcons';
import { useLanguage } from '../../context/LanguageContext';
import { getStorageUrl } from '../../api/client';

const VideoSection = ({ videos = [] }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const { t } = useLanguage();

  if (!videos || videos.length === 0) return null;

  return (
    <section className="my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-red-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-600 rounded-xs"></span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Youtube size={24} className="text-red-600" />
            <span>{t('વિડીયો સમાચાર', 'Video Bulletins')}</span>
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {t('સત્તાવાર યૂટ્યુબ ચેનલ', 'Official YouTube Broadcasts')}
        </span>
      </div>

      {/* Grid of Videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            onClick={() => setActiveVideo(vid)}
            className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
              <img
                src={getStorageUrl(vid.thumbnail_url) || `https://img.youtube.com/vi/${vid.video_id}/hqdefault.jpg`}
                alt={vid.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play size={20} className="ml-1" />
                </span>
              </div>
              {vid.duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                  {vid.duration}
                </span>
              )}
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                {vid.title}
              </h3>
              {vid.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {vid.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-950 text-white rounded-2xl max-w-3xl w-full overflow-hidden border border-slate-800 shadow-2xl relative">
            <div className="p-3.5 flex items-center justify-between border-b border-slate-800">
              <h4 className="font-bold text-sm truncate max-w-xl">{activeVideo.title}</h4>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative aspect-16/9 w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.video_id}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoSection;
