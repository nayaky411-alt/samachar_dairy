import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, MapPin, Eye, FileVideo } from 'lucide-react';

export default function UploadedVideoCard({ video, onPlayClick }) {
  if (!video) return null;

  const videoUrl = `/videos/${video.slug || video.id}`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail with Play Icon & Duration */}
      <div 
        onClick={() => onPlayClick ? onPlayClick(video) : null}
        className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
      >
        <Link to={videoUrl} className="block w-full h-full">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
              <FileVideo size={36} />
            </div>
          )}

          {/* Dark Overlay & Play Button */}
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-red-700/90 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-red-600 transition-all duration-300">
              <Play size={20} className="ml-1 fill-white" />
            </span>
          </div>
        </Link>

        {/* Duration Badge */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[11px] font-bold font-mono px-2 py-0.5 rounded-md pointer-events-none shadow-xs">
            {video.duration}
          </span>
        )}

        {/* Category Pill */}
        {video.category && (
          <span className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs font-gujarati pointer-events-none">
            {video.category.name_gu || video.category.name}
          </span>
        )}
      </div>

      {/* Video Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Date */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-gujarati">
            {video.district ? (
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <MapPin size={11} className="text-red-600" />
                <span>{video.district.name_gu || video.district.name}</span>
                {video.city && <span>• {video.city.name_gu || video.city.name}</span>}
              </span>
            ) : (
              <span>ગુજરાત ન્યૂઝ</span>
            )}

            {video.published_at && (
              <span>{new Date(video.published_at).toLocaleDateString('gu-IN')}</span>
            )}
          </div>

          {/* Title */}
          <Link to={videoUrl} className="block group-hover:text-red-700 transition-colors">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 font-gujarati line-clamp-2 leading-snug">
              {video.title}
            </h3>
          </Link>

          {/* Caption */}
          {video.caption && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-gujarati">
              {video.caption}
            </p>
          )}
        </div>

        {/* Footer info (Views & Watch Button) */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Eye size={12} />
            <span>{video.views_count || 0} વ્યૂઝ</span>
          </span>

          <Link
            to={videoUrl}
            className="text-red-700 font-bold hover:underline flex items-center gap-1 font-gujarati text-xs"
          >
            <span>વિડિયો જુઓ ➔</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
