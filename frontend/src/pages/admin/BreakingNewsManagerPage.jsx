import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Flame, Plus, Trash2, CheckCircle, Clock, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export default function BreakingNewsManagerPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    priority: 1,
    is_active: true,
    expires_at: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    apiClient.get('/admin/breaking-news')
      .then(res => {
        if (res.data.success) {
          setItems(res.data.data);
        }
      })
      .catch(err => {
        console.error('Fetch breaking news error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.post('/admin/breaking-news', formData);
      if (res.data.success) {
        setFormData({ title: '', url: '', priority: 1, is_active: true, expires_at: '' });
        fetchItems();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'બ્રેકિંગ ન્યૂઝ ઉમેરવામાં ક્ષતિ આવી.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await apiClient.put(`/admin/breaking-news/${item.id}`, {
        ...item,
        is_active: !item.is_active,
      });
      fetchItems();
    } catch (err) {
      alert('સ્ટેટસ બદલવામાં ક્ષતિ આવી.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('શું તમે આ બ્રેકિંગ ન્યૂઝ ડિલીટ કરવા માંગો છો?')) return;
    try {
      await apiClient.delete(`/admin/breaking-news/${id}`);
      fetchItems();
    } catch (err) {
      alert('ડિલીટ કરવામાં ક્ષતિ આવી.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
          <Flame className="w-6 h-6 text-red-600" />
          બ્રેકિંગ ન્યૂઝ મેનેજર (Breaking News Ticker CMS)
        </h1>
        <p className="text-xs text-slate-500 font-gujarati mt-0.5">
          હેડર નીચે દોડતી લાલ પટ્ટીમાં તાજા મહત્વના સમાચારો ફ્લેશ કરો અને આપમેળે એક્સપાયર થવાનો સમય સેટ કરો.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-gujarati">{error}</span>
        </div>
      )}

      {/* Add Breaking News Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 font-gujarati flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-red-700" />
          નવા બ્રેકિંગ ન્યૂઝ ઉમેરો
        </h2>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">બ્રેકિંગ ટેક્સ્ટ *</label>
          <input
            type="text"
            required
            placeholder="દા.ત. બ્રેકિંગ: ગુજરાતમાં આગામી ૩ દિવસ ભારેથી અતિભારે વરસાદની હવામાન વિભાગની આગાહી..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati focus:ring-2 focus:ring-red-600 focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">પ્રાયોરિટી ક્રમ (Priority)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">સમાપ્તિ સમય (Auto Expire)</label>
            <input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">લિંક URL (વૈકલ્પિક)</label>
            <input
              type="url"
              placeholder="/article/slug અથવા https://..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold font-gujarati transition disabled:opacity-50"
        >
          {submitting ? 'ઉમેરાઈ રહ્યું છે...' : 'બ્રેકિંગ ટીકરમાં લાઈવ કરો ➔'}
        </button>
      </form>

      {/* Existing Breaking News Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 font-gujarati">હાલના બ્રેકિંગ સમાચારો ({items.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-gujarati">લોડ થઈ રહ્યું છે...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-gujarati">કોઈ બ્રેકિંગ ન્યૂઝ સક્રિય નથી.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.2 bg-red-100 text-red-800 rounded font-gujarati">
                      પ્રાયોરિટી: {item.priority}
                    </span>
                    {item.expires_at && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>સમાપ્તિ: {new Date(item.expires_at).toLocaleString('gu-IN')}</span>
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 font-gujarati text-sm">{item.title}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    className="flex items-center gap-1.5 text-xs font-bold cursor-pointer font-gujarati"
                  >
                    {item.is_active ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-emerald-600" />
                        <span className="text-emerald-700">સક્રિય</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                        <span className="text-slate-500">બંધ</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="ડિલીટ કરો"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
