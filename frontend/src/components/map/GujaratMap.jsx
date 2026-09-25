import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Newspaper, 
  ChevronRight, 
  Loader2, 
  Compass, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles,
  Layers,
  X,
  TrendingUp,
  Clock
} from 'lucide-react';
import apiClient from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import NewsCard from '../news/NewsCard';
import { gujaratMapData } from '../../data/gujaratMapData';

const GujaratMap = () => {
  const [districtsApiData, setDistrictsApiData] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtNews, setDistrictNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [activeZone, setActiveZone] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const mapContainerRef = useRef(null);
  const { language, t } = useLanguage();

  // Load live district info and news count from API
  useEffect(() => {
    apiClient.get('/districts')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          setDistrictsApiData(res.data.data);
          
          // Default select Ahmedabad or first district
          const defaultDist = res.data.data.find(d => d.slug === 'ahmedabad') || res.data.data[0];
          handleSelectDistrict(defaultDist);
        }
      })
      .catch(() => {
        // Fallback default
        if (gujaratMapData.districts.length > 0) {
          handleSelectDistrict(gujaratMapData.districts.find(d => d.slug === 'ahmedabad') || gujaratMapData.districts[0]);
        }
      });
  }, []);

  // Merge static vector geometry with dynamic API data (e.g. articles_count, headquarters)
  const mergedDistricts = useMemo(() => {
    return gujaratMapData.districts.map(vectorDist => {
      const apiDist = districtsApiData.find(d => d.slug === vectorDist.slug);
      return {
        ...vectorDist,
        id: apiDist?.id || vectorDist.slug,
        articles_count: apiDist?.articles_count || 0,
        headquarters: apiDist?.headquarters || vectorDist.headquarters,
        name: apiDist?.name || vectorDist.name,
        name_gu: apiDist?.name_gu || vectorDist.name_gu,
      };
    });
  }, [districtsApiData]);

  const handleSelectDistrict = (district) => {
    if (!district) return;
    const targetSlug = district.slug;
    const fullDist = mergedDistricts.find(d => d.slug === targetSlug) || district;
    setSelectedDistrict(fullDist);
    setLoadingNews(true);

    apiClient.get(`/districts/${targetSlug}/news?limit=4`)
      .then(res => {
        if (res.data.success) {
          setDistrictNews(res.data.data.news?.data || []);
        }
      })
      .catch(() => setDistrictNews([]))
      .finally(() => setLoadingNews(false));
  };

  // Search filter list
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return mergedDistricts.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.name_gu.includes(query) ||
      d.headquarters?.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, mergedDistricts]);

  // Track mouse coordinates for floating tooltip
  const handleMouseMove = (e) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.9));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setActiveZone('all');
  };

  return (
    <section className="my-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header with Title & Live Search */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-5 sm:p-7 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-700/40 border border-red-500/40 rounded-full text-xs font-bold text-red-200 mb-2">
              <Compass size={14} className="text-amber-400 animate-spin-slow" />
              <span>{t('૩૩ જિલ્લાઓનું ડિજિટલ પોર્ટલ', '33 Districts Digital Portal')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-gujarati tracking-tight flex items-center gap-2">
              <span>{t('ગુજરાત ઇન્ટરેક્ટિવ નકશો', 'Interactive Gujarat Vector Map')}</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-amber-400 text-slate-950 rounded-md font-sans">
                LIVE 24x7
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-gujarati">
              {t(
                'નકશામાં કોઈપણ જિલ્લા પર ક્લિક કરો અને ત્યાંના સ્થાનિક, સત્ય અને વિશ્લેષણાત્મક સમાચાર વાંચો.',
                'Click any district on the vector map to instantly explore local news, ground reports, and updates.'
              )}
            </p>
          </div>

          {/* District Search Bar */}
          <div className="relative w-full lg:w-72">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('જિલ્લો શોધો... (Search District)', 'Search district...')}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 transition font-gujarati"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {filteredSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                {filteredSearchResults.map((dist) => (
                  <button
                    key={dist.slug}
                    onClick={() => {
                      handleSelectDistrict(dist);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-red-50 flex items-center justify-between border-b border-slate-100 last:border-0 transition"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-red-700" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 font-gujarati">{dist.name_gu}</span>
                        <span className="text-[11px] text-slate-500 ml-1.5">({dist.name})</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {dist.articles_count || 0} {t('સમાચાર', 'News')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-700/80">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1 font-gujarati">
            <Layers size={14} />
            <span>{t('વિભાગ પસંદ કરો:', 'Region Filter:')}</span>
          </span>
          {gujaratMapData.regions.map(region => (
            <button
              key={region.id}
              onClick={() => setActiveZone(region.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 font-gujarati cursor-pointer ${
                activeZone === region.id
                  ? 'bg-red-700 text-white shadow-md ring-2 ring-red-400/40'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>{language === 'gu' ? region.name_gu : region.name_en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Vector Map & District News Panel */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Vector Map Container (7 cols) */}
        <div 
          ref={mapContainerRef}
          onMouseMove={handleMouseMove}
          className="lg:col-span-7 bg-gradient-to-br from-sky-50/50 via-slate-50/40 to-blue-50/30 rounded-2xl p-4 border border-slate-200/90 relative overflow-hidden flex flex-col items-center select-none"
          style={{ minHeight: '520px' }}
        >
          {/* Map Controls (Zoom / Toggle Labels) */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset View"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
            <div className="h-px bg-slate-200 my-0.5"></div>
            <button
              onClick={() => setShowLabels(!showLabels)}
              title={showLabels ? "Hide District Labels" : "Show District Labels"}
              className={`p-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                showLabels ? 'bg-red-100 text-red-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Aa
            </button>
          </div>

          {/* Compass Indicator */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs text-slate-700 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>ઉત્તર (North) ↑</span>
          </div>

          {/* Interactive Floating Hover Tooltip */}
          {hoveredDistrict && (
            <div 
              className="absolute z-30 pointer-events-none bg-slate-950/90 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/80 transition-transform duration-75 text-xs flex flex-col gap-1"
              style={{
                left: `${Math.min(Math.max(mousePos.x + 15, 10), 450)}px`,
                top: `${Math.min(Math.max(mousePos.y - 45, 10), 440)}px`,
              }}
            >
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-red-400" />
                <span className="font-black text-sm font-gujarati text-white">
                  {hoveredDistrict.name_gu}
                </span>
                <span className="text-[11px] text-slate-300 font-sans">
                  ({hoveredDistrict.name})
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-300 pt-0.5 border-t border-slate-800">
                <span>વડુ મથક: <strong className="text-white">{hoveredDistrict.headquarters}</strong></span>
                <span className="bg-red-700 text-white px-1.5 py-0.2 rounded font-bold">
                  {hoveredDistrict.articles_count || 0} સમાચાર
                </span>
              </div>
            </div>
          )}

          {/* The High-Precision SVG Gujarat Map */}
          <div 
            className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center'
            }}
          >
            <svg
              viewBox={gujaratMapData.viewBox}
              className="w-full h-auto max-h-[520px] select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08))' }}
              role="img"
              aria-label="Gujarat Interactive 33 Districts Vector Map"
            >
              <defs>
                {/* Subtle 3D District shadow */}
                <filter id="district-elevation" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
                </filter>
                {/* Glow filter for selected district */}
                <filter id="selected-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#b91c1c" floodOpacity="0.45" />
                </filter>
                {/* Subtle water wave pattern */}
                <pattern id="water-wave" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0,10 Q10,5 20,10 T40,10" fill="none" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.6" />
                </pattern>
              </defs>

              {/* Ocean / Gulf Water Backdrop Labels */}
              <rect width="840" height="669" fill="url(#water-wave)" pointerEvents="none" />

              {/* Gulf of Kutch Label */}
              <g pointerEvents="none" opacity="0.7">
                <text x="210" y="275" className="fill-sky-800/60 font-bold text-[11px] font-gujarati tracking-wider select-none">
                  કચ્છનો અખાત (Gulf of Kutch)
                </text>
              </g>

              {/* Gulf of Khambhat Label */}
              <g pointerEvents="none" opacity="0.7">
                <text x="460" y="475" className="fill-sky-800/60 font-bold text-[11px] font-gujarati tracking-wider select-none">
                  ખંભાતનો અખાત (Gulf of Khambhat)
                </text>
              </g>

              {/* Arabian Sea Label */}
              <g pointerEvents="none" opacity="0.6">
                <text x="80" y="490" className="fill-sky-800/50 font-black text-[13px] font-gujarati tracking-widest select-none">
                  અરબી સમુદ્ર (Arabian Sea)
                </text>
              </g>

              {/* 33 Interactive District Paths */}
              {mergedDistricts.map((dist) => {
                const isSelected = selectedDistrict?.slug === dist.slug;
                const isHovered = hoveredDistrict?.slug === dist.slug;
                const matchesZone = activeZone === 'all' || dist.zone.id === activeZone;

                // Color calculation based on state
                let fill = '#ffffff';
                let stroke = '#94a3b8';
                let strokeWidth = 1.2;
                let filter = 'url(#district-elevation)';
                let opacity = matchesZone ? 1 : 0.28;

                if (isSelected) {
                  fill = '#b91c1c';
                  stroke = '#7f1d1d';
                  strokeWidth = 2.5;
                  filter = 'url(#selected-glow)';
                  opacity = 1;
                } else if (isHovered) {
                  fill = '#fee2e2';
                  stroke = '#dc2626';
                  strokeWidth = 2;
                  opacity = 1;
                } else if (activeZone !== 'all' && matchesZone) {
                  fill = '#f8fafc';
                  stroke = '#dc2626';
                  strokeWidth = 1.5;
                }

                return (
                  <path
                    key={dist.slug}
                    d={dist.path}
                    onClick={() => handleSelectDistrict(dist)}
                    onMouseEnter={() => setHoveredDistrict(dist)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    filter={filter}
                    className="cursor-pointer transition-all duration-200 focus:outline-hidden"
                    style={{
                      transformOrigin: `${dist.x}px ${dist.y}px`,
                      zIndex: isSelected ? 20 : isHovered ? 15 : 1
                    }}
                  />
                );
              })}

              {/* District Labels & Visual Centroid Badges */}
              {showLabels && mergedDistricts.map((dist) => {
                const isSelected = selectedDistrict?.slug === dist.slug;
                const isHovered = hoveredDistrict?.slug === dist.slug;
                const matchesZone = activeZone === 'all' || dist.zone.id === activeZone;
                
                if (!matchesZone && !isSelected) return null;

                return (
                  <g 
                    key={`label-${dist.slug}`} 
                    pointerEvents="none"
                    className="select-none transition-opacity duration-200"
                  >
                    {/* Pulsing Beacon on Selected District */}
                    {isSelected && (
                      <g transform={`translate(${dist.x}, ${dist.y - 14})`}>
                        <circle cx="0" cy="0" r="14" fill="#ef4444" opacity="0.3" className="animate-ping" />
                        <circle cx="0" cy="0" r="7" fill="#b91c1c" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    )}

                    {/* District Name Text with White Outline for High Contrast */}
                    <text
                      x={dist.x}
                      y={isSelected ? dist.y + 11 : dist.y + 3}
                      textAnchor="middle"
                      className={`font-gujarati select-none transition-all duration-150 ${
                        isSelected 
                          ? 'fill-white font-black text-[12px]' 
                          : isHovered 
                          ? 'fill-red-950 font-black text-[11px]' 
                          : 'fill-slate-900 font-bold text-[10px]'
                      }`}
                      style={{
                        stroke: isSelected ? '#7f1d1d' : '#ffffff',
                        strokeWidth: isSelected ? '1.5px' : '2.5px',
                        paintOrder: 'stroke fill',
                      }}
                    >
                      {dist.name_gu}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Dynamic Map Legend Footer */}
          <div className="w-full mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-gujarati">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-red-700 border border-red-900 inline-block"></span>
                <span>પસંદ કરેલ જિલ્લો (Selected)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-red-100 border border-red-400 inline-block"></span>
                <span>હોવર (Hover)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-white border border-slate-300 inline-block"></span>
                <span>સામાન્ય (Default)</span>
              </span>
            </div>

            <div className="text-slate-400 text-[10px]">
              કુલ ૩૩ જિલ્લાઓ | ૨૫૨+ તાલુકાઓ
            </div>
          </div>
        </div>

        {/* Selected District News Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          {selectedDistrict ? (
            <div className="bg-gradient-to-br from-slate-900 to-red-950 text-white rounded-2xl p-5 shadow-lg border border-red-900/50 mb-4 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-700/80 text-white rounded-xl shadow-md border border-red-500/40">
                      <MapPin size={22} className="animate-bounce" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-800/80 text-red-200 font-bold border border-red-600/40">
                          {selectedDistrict.zone?.name_gu || 'ગુજરાત'}
                        </span>
                        <span className="text-[11px] text-amber-300 font-sans font-bold">
                          {selectedDistrict.name}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black font-gujarati tracking-tight mt-0.5">
                        {selectedDistrict.name_gu}
                      </h3>
                    </div>
                  </div>

                  <Link
                    to={`/district/${selectedDistrict.slug}`}
                    className="group inline-flex items-center gap-1 text-xs font-bold bg-white text-red-900 hover:bg-amber-400 px-3 py-2 rounded-xl transition shadow-md font-gujarati"
                  >
                    <span>{t('જિલ્લા પેજ', 'View Page')}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-gujarati">
                  <span>
                    વડુ મથક: <strong className="text-white">{selectedDistrict.headquarters}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <TrendingUp size={13} />
                    <span>{selectedDistrict.articles_count || districtNews.length} તાજા અહેવાલ</span>
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* News Stream List */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex-1">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-gujarati">
                <Clock size={16} className="text-red-700" />
                <span>
                  {selectedDistrict?.name_gu 
                    ? `${selectedDistrict.name_gu} ના તાજા અહેવાલો` 
                    : t('તાજા અહેવાલો', 'Latest Ground Reports')}
                </span>
              </h4>
              <span className="text-[11px] text-slate-400 font-gujarati">પ્રમાણિત ખબરો</span>
            </div>

            {loadingNews ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 size={32} className="animate-spin text-red-700 mb-2" />
                <span className="text-xs font-bold font-gujarati">
                  {t('સમાચાર લોડ થઈ રહ્યા છે...', 'Loading local reports...')}
                </span>
              </div>
            ) : districtNews.length > 0 ? (
              <div className="space-y-2.5">
                {districtNews.map(item => (
                  <NewsCard key={item.id} article={item} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center text-slate-500 border border-slate-200/80 shadow-xs">
                <Newspaper size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs sm:text-sm font-bold text-slate-700 font-gujarati">
                  {selectedDistrict?.name_gu} જિલ્લા માટે હાલ કોઈ તાજા અહેવાલ નથી.
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-gujarati">
                  અમારા સંવાદદાતાઓ સતત માહિતી અપડેટ કરી રહ્યા છે.
                </p>
                <Link
                  to={`/district/${selectedDistrict?.slug || 'gujarat'}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800 font-gujarati hover:underline"
                >
                  <span>સમગ્ર ગુજરાતના મુખ્ય સમાચાર જુઓ</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick 33 Districts Selector Strip at Bottom */}
      <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 font-gujarati">
            <Sparkles size={14} className="text-red-700" />
            <span>{t('૩૩ જિલ્લાઓ ઝડપી પસંદગી (Quick District Selector):', 'Quick 33 Districts Select:')}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-gujarati">
            {mergedDistricts.length} જિલ્લાઓ ઉપલબ્ધ
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
          {mergedDistricts.map(d => {
            const isSelected = selectedDistrict?.slug === d.slug;
            return (
              <button
                key={d.slug}
                onClick={() => handleSelectDistrict(d)}
                className={`text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-gujarati ${
                  isSelected
                    ? 'bg-red-700 text-white font-bold shadow-xs scale-105'
                    : 'bg-white hover:bg-red-50 hover:text-red-700 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{language === 'gu' ? d.name_gu : d.name}</span>
                {d.articles_count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                    isSelected ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {d.articles_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GujaratMap;
