import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, X, Clock, MapPin, User, ShieldCheck } from 'lucide-react';
import { getStorageUrl } from '../../api/client';

const PreviewModal = ({ article, onClose }) => {
  const [device, setDevice] = useState('desktop'); // desktop, tablet, mobile

  if (!article) return null;

  const deviceWidthClass = {
    desktop: 'max-w-4xl w-full',
    tablet: 'max-w-[768px] w-full',
    mobile: 'max-w-[390px] w-full',
  }[device];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden">
      {/* Top Device Bar */}
      <div className="w-full max-w-4xl bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between shadow-xl mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs sm:text-sm">પૂર્વાવલોકન (Responsive Preview):</span>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${device === 'desktop' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Desktop (1200px)"
            >
              <Monitor size={15} />
              <span className="hidden sm:inline">ડેસ્કટોપ</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${device === 'tablet' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Tablet (768px)"
            >
              <Tablet size={15} />
              <span className="hidden sm:inline">ટેબ્લેટ</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors ${device === 'mobile' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Mobile (390px)"
            >
              <Smartphone size={15} />
              <span className="hidden sm:inline">મોબાઇલ</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Render Device Frame */}
      <div className={`flex-1 overflow-y-auto bg-white rounded-2xl shadow-2xl transition-all duration-300 ${deviceWidthClass} p-5 sm:p-8 border border-slate-300`}>
        {/* Category & Location Badges */}
        <div className="flex items-center gap-2 mb-3">
          {article.category && (
            <span className="bg-red-700 text-white text-xs font-bold px-2.5 py-0.5 rounded">
              {article.category.name_gu || article.category.name}
            </span>
          )}
          {article.district && (
            <span className="text-red-700 text-xs font-semibold flex items-center gap-0.5 bg-red-50 px-2 py-0.5 rounded">
              <MapPin size={12} />
              <span>{article.district.name_gu || article.district.name}</span>
            </span>
          )}
          <span className="text-slate-400 text-xs">
            વાંચન સમય: {article.reading_time || 2} મિનિટ
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug mb-3">
          {article.title}
        </h1>

        {article.subtitle && (
          <h2 className="text-sm sm:text-base font-semibold text-slate-600 mb-4 leading-relaxed">
            {article.subtitle}
          </h2>
        )}

        {/* Author / Date Info */}
        <div className="flex items-center justify-between py-3 border-y border-slate-200 mb-5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center">
              {article.author?.name ? article.author.name[0] : 'R'}
            </span>
            <div>
              <p className="font-bold text-slate-900">{article.author?.name || 'સંવાદદાતા'}</p>
              <p className="text-[11px] text-slate-500">{article.content_type || 'Original Reporting'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="flex items-center gap-1 font-medium">
              <Clock size={12} />
              <span>{new Date().toLocaleDateString('gu-IN')}</span>
            </p>
            {article.source_name && (
              <p className="text-[11px] text-slate-500">સ્ત્રોત: {article.source_name}</p>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="mb-6">
            <img
              src={getStorageUrl(article.featured_image)}
              alt={article.title}
              className="w-full rounded-xl object-cover max-h-[420px] shadow-sm"
            />
            {article.featured_image_caption && (
              <p className="text-xs text-slate-500 mt-1 italic text-center">
                {article.featured_image_caption} {article.featured_image_credit && `(સૌજન્ય: ${article.featured_image_credit})`}
              </p>
            )}
          </div>
        )}

        {/* Body Content */}
        <div
          className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  );
};

export default PreviewModal;
