import React from 'react';
import { X, Check, AlertTriangle, Clock, MapPin, User, FileVideo, HardDrive, CheckCircle2, Shield } from 'lucide-react';

export default function VideoPreviewModal({ video, onClose, onApprove, onReject, isActionLoading = false }) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-red-700 text-white text-[11px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              વિડિયો સમીક્ષા
            </span>
            <span className="font-bold text-sm text-slate-200">
              ચેનલ હેડ પ્રિવ્યૂ (Video Player & Verification)
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Native HTML5 Video Player */}
          <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-md flex items-center justify-center border border-slate-800">
            <video
              src={video.file_url || (video.file_path ? `http://localhost:8000/storage/${video.file_path}` : '')}
              controls
              playsInline
              preload="metadata"
              poster={video.thumbnail_url}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Title & Metadata Strip */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {video.category && (
                <span className="bg-red-950/80 text-red-300 border border-red-800/40 text-xs font-bold px-2.5 py-0.5 rounded-full font-gujarati">
                  {video.category.name_gu || video.category.name}
                </span>
              )}
              {video.district && (
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-gujarati">
                  <MapPin size={11} className="text-red-400" />
                  <span>{video.district.name_gu || video.district.name}</span>
                  {video.city && <span>• {video.city.name_gu || video.city.name}</span>}
                </span>
              )}
              {video.duration && (
                <span className="bg-slate-800 text-emerald-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock size={11} />
                  <span>{video.duration}</span>
                </span>
              )}
              <span className="bg-slate-800 text-slate-400 text-[11px] font-mono px-2 py-0.5 rounded">
                {video.source_type === 'uploaded' ? 'Local Upload' : 'Instagram Reel'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white font-gujarati leading-snug">
              {video.title}
            </h2>

            {video.caption && (
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-gujarati whitespace-pre-line bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                {video.caption}
              </p>
            )}
          </div>

          {/* Technical File & Staff Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">સંવાદદાતા (Staff)</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-200 truncate">
                <User size={13} className="text-red-400 shrink-0" />
                <span className="truncate">{video.author?.name || 'સંવાદદાતા'}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">ફાઇલ કદ (Size)</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <HardDrive size={13} className="text-amber-400 shrink-0" />
                <span>{video.file_size ? `${(video.file_size / (1024 * 1024)).toFixed(1)} MB` : 'N/A'}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">ફોર્મેટ (MIME)</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-200 truncate">
                <FileVideo size={13} className="text-blue-400 shrink-0" />
                <span className="font-mono text-[11px] truncate">{video.mime_type || 'video/mp4'}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">તારીખ (Date)</span>
              <span className="font-bold text-slate-200">
                {new Date(video.created_at).toLocaleDateString('gu-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            બંધ કરો (Close)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => onReject(video)}
              className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-gujarati"
            >
              <AlertTriangle size={14} className="text-red-400" />
              <span>સુધારો માગો (Reject)</span>
            </button>

            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => onApprove(video.id)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 font-gujarati"
            >
              <Check size={15} />
              <span>મંજૂર & લાઈવ કરો (Approve & Publish)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
