import React, { useEffect, useState, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  AlertCircle, 
  RefreshCw, 
  BarChart2, 
  Loader2, 
  Database,
  Info,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import apiClient from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import NewsCard from '../components/news/NewsCard';

const MarketPage = () => {
  const [marketData, setMarketData] = useState(null);
  const [marketNews, setMarketNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { language, t } = useLanguage();
  const refreshTimerRef = useRef(null);

  const fetchMarket = async (isManual = false, isBackground = false) => {
    if (isManual) setRefreshing(true);
    else if (!isBackground && !marketData) setLoading(true);

    try {
      const res = await apiClient.get('/market');
      if (res.data?.success) {
        setMarketData(res.data.data);
      }
    } catch (err) {
      if (!marketData) {
        setMarketData({
          status: 'unavailable',
          is_available: false,
          is_stale: true,
          message: 'Market data temporarily unavailable.',
          indices: [],
          top_gainers: [],
          top_losers: [],
          gainers: [],
          losers: [],
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMarketNews = async () => {
    try {
      const res = await apiClient.get('/news?category=stock-market&per_page=4');
      if (res.data?.success) {
        setMarketNews(res.data.data || []);
      }
    } catch (err) {
      // Fallback: try general business category
      try {
        const fallbackRes = await apiClient.get('/news?per_page=4');
        if (fallbackRes.data?.success) {
          setMarketNews(fallbackRes.data.data || []);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    document.title = 'ભારતીય શેરબજાર લાઇવ ટ્રેકિંગ | મુખ્ય સૂચકાંકો | સમાચાર ડાયરી 24x9';
    fetchMarket();
    fetchMarketNews();

    // Section 14: Auto refresh with tab visibility pause / resume
    const intervalSeconds = 30; // standard 30-second interval respecting provider cache
    
    const startTimer = () => {
      if (!refreshTimerRef.current) {
        refreshTimerRef.current = setInterval(() => {
          if (document.visibilityState === 'visible') {
            fetchMarket(false, true);
          }
        }, intervalSeconds * 1000);
      }
    };

    const stopTimer = () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMarket(false, true);
        startTimer();
      } else {
        stopTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTimer();

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const {
    status,
    is_available = true,
    is_demo = false,
    is_delayed = true,
    is_realtime = false,
    delay_minutes = 15,
    is_stale = false,
    market_status = 'closed',
    data_source,
    provider,
    notice,
    last_updated,
  } = marketData || {};

  const indices = Array.isArray(marketData?.indices) ? marketData.indices : [];
  const gainers = Array.isArray(marketData?.top_gainers) 
    ? marketData.top_gainers 
    : (Array.isArray(marketData?.gainers) ? marketData.gainers : []);
  const losers = Array.isArray(marketData?.top_losers) 
    ? marketData.top_losers 
    : (Array.isArray(marketData?.losers) ? marketData.losers : []);

  const sourceName = data_source || provider || 'Financial Market Feed';
  const isClosed = market_status === 'closed';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 mb-1 font-gujarati">
              <TrendingUp size={16} />
              <span>ભારતીય શેરબજાર પોર્ટલ (Indian Stock Market)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-gujarati">
              મુખ્ય સૂચકાંકો & માર્કેટ વિશ્લેષણ
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-gujarati">
              NSE અને BSE ના મુખ્ય સૂચકાંકો, ટોપ ગેઈનર્સ, ટોપ લૂઝર્સ અને પ્રમાણિત આંકડાકીય વિશ્લેષણ.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fetchMarket(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 font-gujarati shadow-sm"
              title="રીફ્રેશ કરો"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'અપડેટ થાય છે...' : 'રીફ્રેશ'}</span>
            </button>

            {/* Timing Badge: REAL-TIME / DELAYED / DEMO */}
            {is_demo ? (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                DEMO DATA
              </span>
            ) : is_realtime ? (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                REAL-TIME
              </span>
            ) : (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                DELAYED ({delay_minutes}m)
              </span>
            )}

            {/* Operational Status Badge */}
            {isClosed ? (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl uppercase bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                Market Closed
              </span>
            ) : (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl uppercase bg-emerald-900/60 text-emerald-200 border border-emerald-600/40 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Market Open
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stale Warning Notice (Section 16) */}
      {is_stale && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-800 flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <div className="font-gujarati">
            <span className="font-bold">ચેતવણી: બજાર ડેટા જૂનો હોઈ શકે છે (Data may be stale). </span>
            <span>છેલ્લો માન્ય સ્નેપશોટ: {last_updated ? new Date(last_updated).toLocaleString('en-IN') : 'N/A'}. નવીનતમ માહિતી માટે થોડી વારમાં ફરી રીફ્રેશ કરો.</span>
          </div>
        </div>
      )}

      {/* 3. Official Regulatory Disclosure Box (Section 25 & 26) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-xs text-slate-700 flex flex-col sm:flex-row items-start justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 font-gujarati">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              સત્તાવાર માર્કેટ ડેટા ડિસ્ક્લોઝર (Market Data Disclosure)
            </p>
            <p className="text-slate-600">
              {notice || 'Market data is provided for informational purposes. Data may be real-time or delayed depending on the configured provider and applicable data rights.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-[11px] font-mono text-slate-500 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Database size={13} className="text-slate-400" />
            <span>Data Source: {sourceName}</span>
          </div>
          {last_updated && (
            <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
              <Clock size={13} className="text-slate-400" />
              <span>Last Updated: {new Date(last_updated).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Main Content: Skeletons vs Data vs Unavailable */}
      {loading && !marketData ? (
        // Loading State: Skeleton Cards (Section 24)
        <div className="space-y-6">
          <div className="h-6 bg-slate-200 rounded w-64 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                  <div className="h-3 bg-slate-200 rounded w-12"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded w-32"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      ) : status === 'unavailable' || !is_available || indices.length === 0 ? (
        // Section 15: Error State without fake numbers
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs">
          <AlertCircle size={44} className="mx-auto text-amber-500 mb-3" />
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-gujarati">
            {t('બજાર ડેટા હાલ ઉપલબ્ધ નથી (Market data temporarily unavailable)', 'Market data temporarily unavailable')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto font-gujarati">
            {t(
              'બાહ્ય માર્કેટ ડેટા પ્રદાતા સાથે જોડાણ થઈ શક્યું નથી. શેરબજારના ભાવો હાલ દર્શાવી શકાતા નથી. કૃપા કરીને થોડા સમય પછી ફરી પ્રયાસ કરો.',
              'The market data provider is currently unreachable. Live market data is temporarily unavailable.'
            )}
          </p>
          {last_updated && (
            <p className="text-xs font-mono text-slate-400 mt-2">
              Last Verified Timestamp: {new Date(last_updated).toLocaleString('en-IN')}
            </p>
          )}
          <button
            onClick={() => fetchMarket(true)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-red-700 text-white hover:bg-red-800 text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer font-gujarati shadow-sm"
          >
            <RefreshCw size={14} />
            <span>ફરી પ્રયાસ કરો (Retry)</span>
          </button>
        </div>
      ) : (
        <>
          {/* Section 11: Major Indices Grid */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-red-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-red-700 rounded-xs"></span>
                <h2 className="text-xl font-black text-slate-900 font-gujarati">
                  મુખ્ય સૂચકાંકો (Major Market Indices)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Feed: {sourceName}
              </span>
            </div>

            {/* Responsive grid: Desktop 4, Tablet 2, Mobile 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {indices.map(idx => {
                const ltpVal = idx.ltp ?? idx.value ?? 0;
                const changeVal = idx.change ?? idx.absolute_change ?? 0;
                const changePct = idx.change_percent ?? idx.percentage_change ?? 0;
                const isPositive = Number(changeVal) > 0;
                const isNegative = Number(changeVal) < 0;

                const displayVal = Number(ltpVal).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });

                return (
                  <div
                    key={idx.symbol}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition space-y-3"
                  >
                    {/* Header: Symbol & Status */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <span className="font-bold text-slate-900 text-base font-sans">{idx.symbol}</span>
                        {idx.name && idx.name !== idx.symbol && (
                          <span className="block text-[11px] text-slate-400 truncate max-w-[140px] font-sans">
                            {idx.display_name || idx.name}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        idx.market_status === 'open' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx.market_status || (isClosed ? 'Closed' : 'Open')}
                      </span>
                    </div>

                    {/* Main Price (LTP) */}
                    <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
                      {displayVal}
                    </div>

                    {/* Change & Percentage */}
                    <div className={`flex items-center gap-1.5 text-xs font-bold font-mono ${
                      isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {isPositive ? <TrendingUp size={16} /> : isNegative ? <TrendingDown size={16} /> : null}
                      <span>{isPositive ? '+' : ''}{Number(changeVal).toFixed(2)}</span>
                      <span>({isPositive ? '+' : ''}{Number(changePct).toFixed(2)}%)</span>
                    </div>

                    {/* Detailed Metadata: High, Low, Previous Close */}
                    <div className="pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Prev Close</span>
                        <span className="font-bold text-slate-700">
                          {idx.previous_close ? Number(idx.previous_close).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Day Range</span>
                        <span className="font-bold text-slate-700 truncate block">
                          {idx.low ? Number(idx.low).toLocaleString('en-IN') : '-'} / {idx.high ? Number(idx.high).toLocaleString('en-IN') : '-'}
                        </span>
                      </div>
                    </div>

                    {/* 52-Week Range where available */}
                    {(idx.year_high || idx.year_low) && (
                      <div className="pt-1 text-[10px] text-slate-400 font-mono flex justify-between">
                        <span>52W L: {idx.year_low ? Number(idx.year_low).toLocaleString('en-IN') : '-'}</span>
                        <span>52W H: {idx.year_high ? Number(idx.year_high).toLocaleString('en-IN') : '-'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 9: Dynamic Top Gainers & Top Losers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Gainers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-emerald-500">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-lg font-gujarati">
                  <TrendingUp size={20} />
                  <span>ટોચના વધનારા શેરો (Top Gainers)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Dynamic Feed
                </span>
              </div>

              {gainers.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {gainers.map(s => {
                    const price = s.ltp ?? s.value ?? 0;
                    const pct = s.change_percent ?? s.percentage_change ?? 0;
                    const change = s.change ?? s.absolute_change ?? 0;

                    return (
                      <div key={s.symbol} className="py-3 flex items-center justify-between text-sm hover:bg-slate-50/60 px-2 rounded-xl transition">
                        <div>
                          <p className="font-bold text-slate-900 font-sans">{s.symbol}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px] font-sans">
                            {s.name || s.display_name}
                          </p>
                          {s.volume && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              Vol: {Number(s.volume).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                        <div className="text-right font-mono">
                          <p className="font-bold text-slate-900 text-sm">
                            ₹{Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <TrendingUp size={12} />
                            <span>+{Number(pct).toFixed(2)}% (+{Number(change).toFixed(2)})</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-gujarati">
                  આ સત્ર માટે કોઈ વધનારા શેરો નોંધાયા નથી.
                </div>
              )}
            </div>

            {/* Top Losers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-red-500">
                <div className="flex items-center gap-2 text-red-700 font-black text-lg font-gujarati">
                  <TrendingDown size={20} />
                  <span>ટોચના ઘટનારા શેરો (Top Losers)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  Dynamic Feed
                </span>
              </div>

              {losers.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {losers.map(s => {
                    const price = s.ltp ?? s.value ?? 0;
                    const pct = s.change_percent ?? s.percentage_change ?? 0;
                    const change = s.change ?? s.absolute_change ?? 0;

                    return (
                      <div key={s.symbol} className="py-3 flex items-center justify-between text-sm hover:bg-slate-50/60 px-2 rounded-xl transition">
                        <div>
                          <p className="font-bold text-slate-900 font-sans">{s.symbol}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px] font-sans">
                            {s.name || s.display_name}
                          </p>
                          {s.volume && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              Vol: {Number(s.volume).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                        <div className="text-right font-mono">
                          <p className="font-bold text-slate-900 text-sm">
                            ₹{Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs font-bold text-red-600 flex items-center justify-end gap-1">
                            <TrendingDown size={12} />
                            <span>{Number(pct).toFixed(2)}% ({Number(change).toFixed(2)})</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-gujarati">
                  આ સત્ર માટે કોઈ ઘટનારા શેરો નોંધાયા નથી.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 5. Section 21: Market News Section */}
      {marketNews.length > 0 && (
        <div>
          <div className="flex items-center gap-2 pb-2 mb-4 border-b-2 border-slate-900">
            <span className="w-2.5 h-6 bg-slate-900 rounded-xs"></span>
            <h2 className="text-xl font-black text-slate-900 font-gujarati">
              શેરબજાર અને અર્થતંત્ર સમાચાર (Market News)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketNews.map(item => (
              <NewsCard key={item.id} article={item} />
            ))}
          </div>
        </div>
      )}

      {/* 6. Legal / Regulatory Disclaimer (Section 26) */}
      <div className="p-4 bg-slate-100/90 rounded-2xl text-xs text-slate-600 text-center leading-relaxed font-gujarati border border-slate-200">
        <strong>મહત્વપૂર્ણ ડિસ્ક્લેમર: </strong>
        સમાચાર ડાયરી 24x9 શેરબજાર માહિતીનું પ્રસારણ માત્ર સામાન્ય માહિતી અને શૈક્ષણિક હેતુઓ માટે કરે છે. આ પ્લેટફોર્મ સેબી (SEBI) રજિસ્ટર્ડ ઇન્વેસ્ટમેન્ટ એડવાઇઝર નથી. શેરબજારમાં રોકાણ બજારના જોખમોને આધીન છે. કોઈપણ નાણાકીય નિર્ણય લેતા પહેલા તમારા અધિકૃત નાણાકીય સલાહકારની સલાહ અવશ્ય લો.
      </div>
    </div>
  );
};

export default MarketPage;
