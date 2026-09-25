import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import NewsCard from './NewsCard';
import { useLanguage } from '../../context/LanguageContext';

const CategoryBlock = ({ title, titleGu, slug, articles = [], color = '#b91c1c' }) => {
  const { language, t } = useLanguage();

  if (!articles || articles.length === 0) return null;

  return (
    <section className="my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 mb-4 border-b-2" style={{ borderColor: color }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 rounded-xs" style={{ backgroundColor: color }}></span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {language === 'gu' ? (titleGu || title) : title}
          </h2>
        </div>
        {slug && (
          <Link
            to={`/category/${slug}`}
            className="text-xs sm:text-sm font-bold text-slate-600 hover:text-red-700 flex items-center gap-0.5 transition-colors"
          >
            <span>{t('બધા જુઓ', 'View All')}</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* Grid of articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.slice(0, 4).map((art) => (
          <NewsCard key={art.id} article={art} showCategory={false} />
        ))}
      </div>
    </section>
  );
};

export default CategoryBlock;
