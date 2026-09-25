import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, ShieldAlert, ArrowUpRight, AlertCircle, Database } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const MarketTickerStrip = ({ marketData }) => {
  const { t } = useLanguage();

  if (!marketData) {
    return null;
  }

  const {
    status,
    is_available = true,
    is_demo = false,
    is_delayed = true,
    delay_minutes = 15,
    market_status = 'closed',
    data_source,
    provider,
    notice,
    last_updated,
  } = marketData;

  const indices = Array.isArray(marketData?.indices) ? marketData.indices : [];
  const sourceName = data_source || provider || 'Financial Market Feed';

  // Rule 9: If provider fails / data unavailable, show clear notice without inventing numbers
  if (status === 'unavailable' || !is_available || indices.length === 0) {
    return (
      <div className="my-6 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-800 text-slate-400 rounded-lg">
              <TrendingUp size={18} />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-white font-gujarati">
              {t('ભારતીય શેરબજાર ટ્રેકિંગ', 'Indian Stock Market Tracker')}
            </h3>
          </div>
          <Link
            to="/market"
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors self-start sm:self-auto font-gujarati"
          >
            <span>{t('માર્કેટ પેજ', 'Market Page')}</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-4 text-center border border-slate-700/60 flex flex-col items-center justify-center py-6">
          <AlertCircle size={28} className="text-amber-400 mb-2" />
          <p className="font-bold text-sm text-slate-200 font-gujarati">
            {t('બજાર ડેટા હાલ ઉપલબ્ધ નથી (Market data temporarily unavailable)', 'Market data temporarily unavailable')}
          </p>
          <p className="text-xs text-slate-400 mt-1 font-gujarati">
            {last_updated
              ? `છેલ્લું સફળ અપડેટ: ${new Date(last_updated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
              : 'પ્રદાતા સાથે સંપર્ક થઈ શક્યો નથી. કૃપા કરીને થોડા સમય પછી ફરી પ્રયાસ કરો.'}
          </p>
        </div>

        <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Database size={12} className="text-slate-500" />
            <span>Data Source: {sourceName}</span>
          </span>
          {last_updated && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <Clock size={12} className="text-slate-500" />
              <span>Last Updated: {new Date(last_updated).toLocaleTimeString('en-IN')}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  const isClosed = market_status === 'closed';

  return (
    <div className="my-6 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1.5 bg-red-600/30 text-red-400 rounded-lg">
            <TrendingUp size={18} />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-white font-gujarati">
            {t('ભારતીય શેરબજાર ટ્રેકિંગ', 'Indian Stock Market Tracker')}
          </h3>

          {/* Mode & Status Badges */}
          {is_demo ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              DEMO DATA
            </span>
          ) : is_delayed ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
              Delayed ({delay_minutes}m)
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/20 text-emerald-300 font-mono">
              Market Feed
            </span>
          )}

          {isClosed ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-700 text-slate-300 border border-slate-600 font-mono">
              Market Closed
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-700/60 text-emerald-200 border border-emerald-500/40 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Market Open
            </span>
          )}
        </div>

        <Link
          to="/market"
          className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors self-start sm:self-auto font-gujarati"
        >
          <span>{t('સંપૂર્ણ માર્કેટ ડેશબોર્ડ', 'Full Market Dashboard')}</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Indices horizontal cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto pb-1">
        {indices.map((idx) => {
          const ltpVal = idx.ltp ?? idx.value ?? idx.current_value ?? 0;
          const changeVal = idx.change ?? idx.absolute_change ?? 0;
          const changePct = idx.change_percent ?? idx.percentage_change ?? 0;
          const isPositive = Number(changeVal) >= 0;
          const displayVal = Number(ltpVal).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          return (
            <div
              key={idx.symbol}
              className="bg-slate-800/80 hover:bg-slate-800 rounded-xl p-3 border border-slate-700/60 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-bold text-slate-200 font-sans">{idx.symbol}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  {idx.market_status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-black font-mono tracking-tight text-white">
                {displayVal}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold mt-1 font-mono ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{isPositive ? '+' : ''}{Number(changeVal).toFixed(2)}</span>
                <span>({isPositive ? '+' : ''}{Number(changePct).toFixed(2)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution notice & Timestamps */}
      <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-1 font-mono text-[10px]">
          <Database size={12} className="text-slate-500" />
          <span>Data Source: {sourceName}</span>
        </span>
        {last_updated && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
            <Clock size={12} className="text-slate-500" />
            <span>Last Updated: {new Date(last_updated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default MarketTickerStrip;
