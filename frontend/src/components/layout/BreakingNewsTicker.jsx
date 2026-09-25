import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import apiClient from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const BreakingNewsTicker = () => {
  const [items, setItems] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    apiClient.get('/breaking-news')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setItems(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="bg-red-800 text-white border-b border-red-900 overflow-hidden shadow-sm select-none">
      <div className="max-w-7xl mx-auto flex items-center px-4 py-1.5 text-sm">
        {/* Badge */}
        <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-0.5 rounded font-bold text-xs uppercase tracking-wider shrink-0 mr-3 animate-pulse">
          <Flame size={14} className="text-amber-300" />
          <span>{t('બ્રેકિંગ ન્યૂઝ', 'BREAKING NEWS')}</span>
        </div>

        {/* Scrolling Ticker */}
        <div className="overflow-hidden relative flex-1 whitespace-nowrap">
          <div className="animate-ticker flex items-center gap-8 py-0.5">
            {/* Duplicated for seamless continuous loop */}
            {[...items, ...items].map((item, index) => (
              <span key={`${item.id}-${index}`} className="inline-flex items-center gap-2 hover:text-amber-200 transition-colors">
                {item.link_url || item.article_id ? (
                  <Link
                    to={item.article_id ? `/news/${item.article_id}` : item.link_url}
                    className="hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>{item.headline}</span>
                    <ChevronRight size={12} className="opacity-70" />
                  </Link>
                ) : (
                  <span className="font-medium">{item.headline}</span>
                )}
                <span className="text-red-400 font-bold">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
