import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const HeroSection = ({ articles = [] }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  if (!articles || articles.length === 0) return null;

  const mainStory = articles[0];
  const sideStories = articles.slice(1, 5);

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

  const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

  const handleCardClick = (slugOrId, e) => {
    if (e.target.closest('a') || e.target.closest('button')) return;
    navigate(`/news/${slugOrId}`);
  };

  return (
    <section className="my-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-6 bg-red-700 rounded-sm"></span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <span>{t('મુખ્ય સમાચાર', 'Top Stories')}</span>
          <Sparkles size={16} className="text-amber-500" />
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Large Main Hero Story (7 cols) */}
        {mainStory && (
          <div className="lg:col-span-7">
            <article
              onClick={(e) => handleCardClick(mainStory.slug || mainStory.id, e)}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md h-[380px] sm:h-[460px] flex flex-col justify-end cursor-pointer"
            >
              <img
                src={mainStory.featured_image || fallbackImage}
                alt={mainStory.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 via-45% to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 pointer-events-none"></div>

              <div className="relative z-10 p-5 sm:p-7 text-white">
                <div className="flex items-center gap-2.5 mb-2.5">
                  {mainStory.category && (
                    <span className="bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
                      {language === 'gu' ? mainStory.category.name_gu : mainStory.category.name}
                    </span>
                  )}
                  {mainStory.district && (
                    <span className="flex items-center gap-1 text-xs text-amber-300 font-semibold bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs shadow-xs">
                      <MapPin size={12} />
                      <span>{language === 'gu' ? mainStory.district.name_gu : mainStory.district.name}</span>
                    </span>
                  )}
                  <span className="text-slate-100 text-xs flex items-center gap-1 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    <Clock size={12} />
                    <span>{formatDate(mainStory.published_at)}</span>
                  </span>
                </div>

                <Link to={`/news/${mainStory.slug || mainStory.id}`}>
                  <h1
                    style={{ color: '#ffffff' }}
                    className="text-xl sm:text-2xl md:text-3xl font-black !text-white group-hover:text-red-300 transition-colors leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                  >
                    {mainStory.title}
                  </h1>
                </Link>

                {mainStory.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-100 mt-2 line-clamp-2 leading-relaxed hidden sm:block drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {mainStory.subtitle}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-slate-100 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  <span>{mainStory.author?.name || 'મુખ્ય સંપાદક બ્યુરો'}</span>
                  <span>વાંચન સમય: {mainStory.reading_time || 2} મિનિટ</span>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* 2. Side Secondary Stories (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
          {sideStories.map((story) => {
            const storySlug = story.slug || story.id;
            return (
              <article
                key={story.id}
                onClick={(e) => handleCardClick(storySlug, e)}
                className="group bg-white rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all p-3.5 flex gap-3.5 items-center flex-1 cursor-pointer"
              >
                <Link to={`/news/${storySlug}`} className="w-28 sm:w-32 h-20 sm:h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0 block relative">
                  <img
                    src={story.featured_image || fallbackImage}
                    alt={story.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {story.category && (
                    <span className="absolute bottom-1 left-1 bg-red-700/90 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                      {language === 'gu' ? story.category.name_gu : story.category.name}
                    </span>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    {story.district && (
                      <span className="text-red-700 font-semibold flex items-center gap-0.5">
                        <MapPin size={10} />
                        <span>{language === 'gu' ? story.district.name_gu : story.district.name}</span>
                      </span>
                    )}
                    <span>•</span>
                    <span>{formatDate(story.published_at)}</span>
                  </div>
                  <Link to={`/news/${storySlug}`}>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                      {story.title}
                    </h3>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
