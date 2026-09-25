import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const NewsCard = ({ article, variant = 'vertical', showCategory = true }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (!article) return null;

  const targetSlug = article.slug || article.id;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/news/${targetSlug}`);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/news/${targetSlug}`;
    if (navigator.share) {
      navigator.share({ title: article.title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';

  if (variant === 'horizontal') {
    return (
      <article
        onClick={handleCardClick}
        className="group bg-white rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row cursor-pointer"
      >
        <Link to={`/news/${targetSlug}`} className="sm:w-2/5 relative aspect-16/10 sm:aspect-auto overflow-hidden bg-slate-100 block shrink-0">
          <img
            src={article.featured_image || fallbackImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {showCategory && article.category && (
            <span className="absolute top-2 left-2 bg-red-700 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
              {language === 'gu' ? article.category.name_gu : article.category.name}
            </span>
          )}
        </Link>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
              {article.district && (
                <span className="flex items-center gap-0.5 text-red-700 font-semibold">
                  <MapPin size={12} />
                  <span>{language === 'gu' ? article.district.name_gu : article.district.name}</span>
                </span>
              )}
              {article.district && <span>•</span>}
              <span className="flex items-center gap-1">
                <Clock size={12} />
                <span>{formatDate(article.published_at)}</span>
              </span>
            </div>
            <Link to={`/news/${targetSlug}`}>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h3>
            </Link>
            {article.short_description && (
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                {article.short_description}
              </p>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{article.author?.name || 'બ્યુરો રિપોર્ટ'}</span>
            <button
              onClick={handleShare}
              title="Share"
              className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600 cursor-pointer"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article
        onClick={handleCardClick}
        className="group py-3 border-b border-slate-100 last:border-0 flex items-start gap-3 cursor-pointer"
      >
        <Link to={`/news/${targetSlug}`} className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 block">
          <img
            src={article.featured_image || fallbackImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-0.5">
            {article.category && (
              <span className="text-red-700 font-bold">
                {language === 'gu' ? article.category.name_gu : article.category.name}
              </span>
            )}
            <span>•</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
          <Link to={`/news/${targetSlug}`}>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h4>
          </Link>
        </div>
      </article>
    );
  }

  // Standard vertical variant
  return (
    <article
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all overflow-hidden flex flex-col h-full cursor-pointer"
    >
      <Link to={`/news/${targetSlug}`} className="relative aspect-16/10 overflow-hidden bg-slate-100 block">
        <img
          src={article.featured_image || fallbackImage}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {showCategory && article.category && (
          <span className="absolute top-2 left-2 bg-red-700 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
            {language === 'gu' ? article.category.name_gu : article.category.name}
          </span>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            {article.district && (
              <span className="flex items-center gap-0.5 text-red-700 font-semibold">
                <MapPin size={12} />
                <span>{language === 'gu' ? article.district.name_gu : article.district.name}</span>
              </span>
            )}
            {article.district && <span>•</span>}
            <span className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatDate(article.published_at)}</span>
            </span>
          </div>
          <Link to={`/news/${targetSlug}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </Link>
          {article.short_description && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
              {article.short_description}
            </p>
          )}
        </div>
        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-[150px]">{article.author?.name || 'બ્યુરો રિપોર્ટ'}</span>
          <button
            onClick={handleShare}
            title="Share"
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600 cursor-pointer"
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
