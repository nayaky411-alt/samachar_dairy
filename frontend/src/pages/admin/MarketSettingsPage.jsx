import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sliders,
  Database,
  Clock,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import apiClient from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const MarketSettingsPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [refreshingFeed, setRefreshingFeed] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, index, stock

  const [settings, setSettings] = useState({
    provider: 'yahoo',
    api_url: '',
    cache_ttl: 60,
    refresh_interval: 30,
    stale_threshold: 300,
    api_timeout: 6,
    is_production: false,
    diagnostics: null,
  });

  const [symbols, setSymbols] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // New symbol form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingSymbol, setAddingSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState({
    symbol: '',
    name: '',
    display_name: '',
    exchange: 'NSE',
    instrument_type: 'stock',
    sort_order: 10,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, symbolsRes] = await Promise.all([
        apiClient.get('/admin/market/settings'),
        apiClient.get('/admin/market/symbols'),
      ]);

      if (settingsRes.data.success) {
        setSettings(settingsRes.data.data);
      }
      if (symbolsRes.data.success) {
        setSymbols(symbolsRes.data.data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load market settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiClient.post('/admin/market/settings', {
        provider: settings.provider,
        api_url: settings.api_url,
        cache_ttl: Number(settings.cache_ttl),
        refresh_interval: Number(settings.refresh_interval),
        stale_threshold: Number(settings.stale_threshold),
        api_timeout: Number(settings.api_timeout),
      });

      if (res.data.success) {
        setMessage('Market configuration updated successfully.');
        loadData();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update market settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRefreshFeed = async () => {
    setRefreshingFeed(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiClient.post('/admin/market/refresh');
      if (res.data.success) {
        setMessage('Market feed cache cleared and fresh quotes fetched.');
        loadData();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh market feed.');
    } finally {
      setRefreshingFeed(false);
    }
  };

  const handleToggleSymbol = async (id) => {
    try {
      const res = await apiClient.patch(`/admin/market/symbols/${id}/toggle`);
      if (res.data.success) {
        setSymbols(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
      }
    } catch (err) {
      setError('Failed to toggle symbol status.');
    }
  };

  const handleDeleteSymbol = async (id, symName) => {
    if (!window.confirm(`Are you sure you want to remove ${symName} from tracked instruments?`)) {
      return;
    }

    try {
      const res = await apiClient.delete(`/admin/market/symbols/${id}`);
      if (res.data.success) {
        setSymbols(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      setError('Failed to delete symbol.');
    }
  };

  const handleAddSymbol = async (e) => {
    e.preventDefault();
    setAddingSymbol(true);
    setError(null);

    try {
      const res = await apiClient.post('/admin/market/symbols', newSymbol);
      if (res.data.success) {
        setSymbols(prev => [...prev, res.data.data].sort((a, b) => a.sort_order - b.sort_order));
        setShowAddModal(false);
        setNewSymbol({
          symbol: '',
          name: '',
          display_name: '',
          exchange: 'NSE',
          instrument_type: 'stock',
          sort_order: 10,
        });
        setMessage(`Instrument ${res.data.data.symbol} added successfully.`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add symbol.');
    } finally {
      setAddingSymbol(false);
    }
  };

  const filteredSymbols = symbols.filter(s => {
    if (activeTab === 'all') return true;
    return s.instrument_type === activeTab;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-32 bg-slate-200 rounded-2xl"></div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const diag = settings.diagnostics || {};

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 font-gujarati">
            <TrendingUp size={16} />
            <span>મુખ્ય સંપાદક CMS • માર્કેટ સેટિંગ્સ</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Indian Stock Market Integration Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized market feeds, tracked instruments, and caching parameters.
          </p>
        </div>

        <button
          onClick={handleRefreshFeed}
          disabled={refreshingFeed}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <RefreshCw size={14} className={refreshingFeed ? 'animate-spin' : ''} />
          <span>{refreshingFeed ? 'Refreshing...' : 'Bypass Cache & Refresh Feed'}</span>
        </button>
      </div>

      {/* Alert Notices */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Diagnostics / Status Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-red-400" />
            <span className="font-bold text-sm">Active Provider Diagnostics</span>
          </div>
          <div className="flex items-center gap-2">
            {diag.is_available ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                ONLINE & ACTIVE
              </span>
            ) : (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                UNAVAILABLE
              </span>
            )}
            {diag.is_demo ? (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                DEMO MODE
              </span>
            ) : diag.is_delayed ? (
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                DELAYED ({diag.delay_minutes}m)
              </span>
            ) : (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                REAL-TIME
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Data Source:</span>
            <span className="font-bold text-slate-100">{diag.provider_name || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Exchange Session:</span>
            <span className="font-bold text-slate-100 uppercase">{diag.market_status || 'closed'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Environment:</span>
            <span className="font-bold text-slate-100">{settings.is_production ? 'Production (Strict)' : 'Development / Staging'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Last Sync Timestamp:</span>
            <span className="font-mono text-slate-300">
              {diag.last_updated ? new Date(diag.last_updated).toLocaleTimeString('en-IN') : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Provider Configuration Form */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <Sliders size={18} className="text-red-700" />
          <h2 className="text-base font-bold text-slate-900">Feed & Caching Configuration</h2>
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Data Provider Adapter
              </label>
              <select
                value={settings.provider}
                onChange={e => setSettings({ ...settings, provider: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-red-700 font-sans"
              >
                <option value="yahoo">Yahoo Finance (Real NSE / BSE live feed - 15m Delayed compliant)</option>
                <option value="configured">Configured External REST API Feed (Licensed Corporate Provider)</option>
                {!settings.is_production && (
                  <option value="demo">Local Development Simulated Demo Provider</option>
                )}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {settings.provider === 'yahoo' && 'Fetches live market quotes for Indian indices and stocks from Yahoo Finance API.'}
                {settings.provider === 'configured' && 'Connects to an authorized external market data vendor using API credentials in Laravel .env.'}
                {settings.provider === 'demo' && 'Generates time-seeded simulation for local development only. Prohibited in production.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                External API Endpoint URL (if using Configured Provider)
              </label>
              <input
                type="text"
                placeholder="https://api.marketprovider.com/v1"
                value={settings.api_url || ''}
                onChange={e => setSettings({ ...settings, api_url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-red-700"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                API credentials (MARKET_API_KEY & MARKET_API_SECRET) must be stored securely in Laravel .env.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cache TTL (Seconds)
              </label>
              <input
                type="number"
                min="5"
                max="3600"
                value={settings.cache_ttl}
                onChange={e => setSettings({ ...settings, cache_ttl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-red-700"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Protects the external provider from excessive queries. Recommended: 30 - 60 seconds.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Frontend Auto-Refresh Interval (Seconds)
              </label>
              <input
                type="number"
                min="10"
                max="3600"
                value={settings.refresh_interval}
                onChange={e => setSettings({ ...settings, refresh_interval: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-red-700"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Browser background polling interval (automatically pauses when browser tab is inactive).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stale Data Warning Threshold (Seconds)
              </label>
              <input
                type="number"
                min="30"
                max="86400"
                value={settings.stale_threshold}
                onChange={e => setSettings({ ...settings, stale_threshold: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-red-700"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Marks data as stale and displays warning if cache exceeds this age. Default: 300s (5m).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Provider Connection Timeout (Seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.api_timeout}
                onChange={e => setSettings({ ...settings, api_timeout: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-red-700"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Maximum time allowed for external HTTP request before triggering timeout fallback.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {savingSettings ? 'Saving Settings...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Tracked Symbols Registry */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tracked Instruments Registry ({symbols.length})
            </h2>
            <p className="text-xs text-slate-500">
              Enable or disable tracked indices and constituent stocks. Prices are fetched dynamically from the provider.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Add Instrument</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2">
          {['all', 'index', 'stock'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'all' ? 'All Instruments' : tab === 'index' ? 'Major Indices' : 'Constituent Stocks'}
            </button>
          ))}
        </div>

        {/* Symbols Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Display Name</th>
                <th className="py-2.5 px-3">Exchange</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-center">Sort Order</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSymbols.map(sym => (
                <tr key={sym.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-bold font-mono text-slate-900">
                    {sym.symbol}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">{sym.display_name || sym.name}</span>
                    {sym.name && sym.name !== sym.display_name && (
                      <span className="block text-[11px] text-slate-400">{sym.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">{sym.exchange}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      sym.instrument_type === 'index'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {sym.instrument_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600">
                    {sym.sort_order}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggleSymbol(sym.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition cursor-pointer ${
                        sym.is_active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {sym.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteSymbol(sym.id, sym.symbol)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove instrument"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Symbol Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Tracked Instrument</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSymbol} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ticker / Symbol *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INFY or SENSEX"
                  value={newSymbol.symbol}
                  onChange={e => setNewSymbol({ ...newSymbol, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:outline-red-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys"
                  value={newSymbol.display_name}
                  onChange={e => setNewSymbol({ ...newSymbol, display_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-red-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Company / Index Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Infosys Limited"
                  value={newSymbol.name}
                  onChange={e => setNewSymbol({ ...newSymbol, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-red-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Exchange</label>
                  <select
                    value={newSymbol.exchange}
                    onChange={e => setNewSymbol({ ...newSymbol, exchange: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-red-700"
                  >
                    <option value="NSE">NSE</option>
                    <option value="BSE">BSE</option>
                    <option value="MCX">MCX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newSymbol.instrument_type}
                    onChange={e => setNewSymbol({ ...newSymbol, instrument_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-red-700"
                  >
                    <option value="stock">Stock</option>
                    <option value="index">Index</option>
                    <option value="etf">ETF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={newSymbol.sort_order}
                  onChange={e => setNewSymbol({ ...newSymbol, sort_order: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-red-700"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Regulatory Notice:</strong> Market prices are automatically populated from the verified market feed. Manual entry of live prices is strictly disabled.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingSymbol}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {addingSymbol ? 'Adding...' : 'Add Instrument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSettingsPage;
