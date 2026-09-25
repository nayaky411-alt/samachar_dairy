import React, { useState } from 'react';
import { Play, Eye, X, ExternalLink, Film, Clock, User, Share2 } from 'lucide-react';
import { Instagram } from '../common/BrandIcons';
import { useLanguage } from '../../context/LanguageContext';

const ReelsSection = ({ reels = [] }) => {
  const [activeReel, setActiveReel] = useState(null);
  const { language, t } = useLanguage();

  if (!reels || reels.length === 0) return null;

  return (
    <section className="my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-pink-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-pink-600 rounded-xs"></span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Instagram size={22} className="text-pink-600" />
            <span>{t('શોર્ટ વિડીયો & રીલ્સ', 'Shorts & Reels')}</span>
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {t('સત્તાવાર શોર્ટ્સ અને વાયરલ રીલ્સ', 'Official Shorts & Viral Reels')}
        </span>
      </div>

      {/* Grid of Reels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {reels.map((reel) => {
          const isUploaded = reel.source_type === 'uploaded' || (reel.file_url && !reel.instagram_url);
          return (
            <div
              key={reel.id}
              onClick={() => setActiveReel(reel)}
              className="group relative aspect-9/16 rounded-xl overflow-hidden bg-slate-900 cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={reel.thumbnail_url || 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=600&q=80'}
                alt={reel.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

              {/* Source Badge (Top Left) */}
              <div className="absolute top-2.5 left-2.5 z-10">
                {isUploaded ? (
                  <span className="px-1.5 py-0.5 rounded bg-red-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <Film size={10} />
                    <span>શોર્ટ</span>
                  </span>
                ) : (
                  <span className="p-1 rounded bg-pink-600/90 text-white text-[10px] font-bold flex items-center shadow-xs">
                    <Instagram size={11} />
                  </span>
                )}
              </div>

              {/* Duration Badge (Top Right) */}
              {reel.duration && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-0.5">
                    <Clock size={9} />
                    <span>{reel.duration}</span>
                  </span>
                </div>
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-10 h-10 rounded-full bg-pink-600/85 group-hover:bg-pink-600 text-white flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform shadow-lg">
                  <Play size={18} className="ml-0.5" />
                </span>
              </div>

              {/* Metadata Bottom */}
              <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                <div className="flex items-center justify-between text-[10px] text-pink-300 font-bold mb-1">
                  <span>{reel.category ? (language === 'gu' ? (reel.category.name_gu || reel.category.name) : reel.category.name) : 'સમાચાર'}</span>
                  <span className="flex items-center gap-0.5 text-slate-300">
                    <Eye size={10} />
                    <span>{reel.views_count || 120}</span>
                  </span>
                </div>
                <h3
                  style={{ color: '#ffffff' }}
                  className="text-xs font-bold line-clamp-2 leading-snug !text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                >
                  {reel.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reel Modal Player */}
      {activeReel && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full overflow-hidden border border-slate-700 shadow-2xl relative max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-3.5 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                {activeReel.file_url ? (
                  <>
                    <Film size={18} className="text-red-500" />
                    <span className="font-bold text-sm">શોર્ટ વિડીયો પ્લેયર</span>
                  </>
                ) : (
                  <>
                    <Instagram size={18} className="text-pink-500" />
                    <span className="font-bold text-sm">ઇન્સ્ટાગ્રામ રીલ</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveReel(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto flex flex-col items-center">
              {activeReel.file_url ? (
                /* Native Video Player for Uploaded Video */
                <div className="aspect-9/16 max-h-[460px] w-full rounded-xl overflow-hidden bg-black relative flex items-center justify-center shadow-lg border border-slate-800">
                  <video
                    key={activeReel.file_url}
                    src={activeReel.file_url}
                    poster={activeReel.thumbnail_url}
                    controls
                    autoPlay
                    playsInline
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                /* Instagram Reel Card with Link */
                <div className="aspect-9/16 max-h-[420px] w-full rounded-xl overflow-hidden bg-black relative flex items-center justify-center">
                  <img
                    src={activeReel.thumbnail_url}
                    alt={activeReel.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/50">
                    <Instagram size={48} className="text-pink-500 mb-3 animate-pulse" />
                    <p className="text-sm font-bold text-white mb-2">{activeReel.title}</p>
                    {activeReel.caption && (
                      <p className="text-xs text-slate-300 line-clamp-3 mb-4">{activeReel.caption}</p>
                    )}
                    {activeReel.instagram_url && (
                      <a
                        href={activeReel.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg hover:brightness-110 transition-all"
                      >
                        <span>ઇન્સ્ટાગ્રામ પર રીલ જુઓ</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Video Details */}
              <div className="w-full mt-3.5 text-left space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-pink-400">
                    {activeReel.category ? (language === 'gu' ? (activeReel.category.name_gu || activeReel.category.name) : activeReel.category.name) : 'સમાચાર'}
                  </span>
                  <div className="flex items-center gap-3">
                    {activeReel.author?.name && (
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        <span>{activeReel.author.name}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      <span>{activeReel.views_count || 120} વ્યૂઝ</span>
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-white leading-snug">
                  {activeReel.title}
                </h4>

                {activeReel.caption && (
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-800">
                    {activeReel.caption}
                  </p>
                )}

                {/* Optional external Instagram link if reel also has one */}
                {activeReel.file_url && activeReel.instagram_url && (
                  <div className="pt-2">
                    <a
                      href={activeReel.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 font-bold"
                    >
                      <Instagram size={14} />
                      <span>ઇન્સ્ટાગ્રામ પર પણ જુઓ</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReelsSection;
