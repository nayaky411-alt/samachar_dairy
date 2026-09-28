import React, { useState, useEffect } from 'react';
import apiClient, { getStorageUrl } from '../../api/client';
import { Megaphone, Plus, Trash2, Edit, ExternalLink, AlertCircle, ToggleLeft, ToggleRight, Eye, MousePointer } from 'lucide-react';

export default function AdsManagerPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    placement: 'desktop_banner',
    image_url: '',
    destination_url: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchAds = () => {
    setLoading(true);
    apiClient.get('/admin/advertisements')
      .then(res => {
        if (res.data.success) {
          setAds(res.data.data);
        }
      })
      .catch(err => {
        console.error('Fetch ads error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.post('/admin/advertisements', formData);
      if (res.data.success) {
        setFormData({
          title: '',
          placement: 'desktop_banner',
          image_url: '',
          destination_url: '',
          status: 'active',
        });
        fetchAds();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'જાહેરાત ઉમેરવામાં ક્ષતિ આવી.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('શું તમે ખરેખર આ જાહેરાત ડિલીટ કરવા માંગો છો?')) return;
    try {
      await apiClient.delete(`/admin/advertisements/${id}`);
      fetchAds();
    } catch (err) {
      alert('ડિલીટ કરવામાં ક્ષતિ આવી.');
    }
  };

  const handleToggleStatus = async (ad) => {
    const newStatus = ad.status === 'active' ? 'inactive' : 'active';
    try {
      await apiClient.put(`/admin/advertisements/${ad.id}`, {
        ...ad,
        status: newStatus,
      });
      fetchAds();
    } catch (err) {
      alert('સ્ટેટસ બદલવામાં ક્ષતિ આવી.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-red-700" />
          જાહેરાતો સંચાલન (Advertisements CMS)
        </h1>
        <p className="text-xs text-slate-500 font-gujarati mt-0.5">
          હેડર બેનર, ઇન-આર્ટિકલ સ્પોન્સરશિપ અને સાઇડબાર એડ્સનું સંચાલન અને ઇમ્પ્રેશન્સનું વિશ્લેષણ
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-gujarati">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* New Ad Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 font-gujarati flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-red-700" />
          નવી જાહેરાત ઉમેરો (Create Advertisement)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">જાહેરાતનું નામ / ક્લાયન્ટ *</label>
            <input
              type="text"
              required
              placeholder="દા.ત. અમૂલ ડેરી ફેસ્ટિવ બેનર"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">પ્લેસમેન્ટ સ્લોટ *</label>
            <select
              value={formData.placement}
              onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              <option value="desktop_banner">ડેસ્કટોપ હેડર બેનર (728x90)</option>
              <option value="mobile_banner">મોબાઇલ હેડર બેનર (320x50)</option>
              <option value="sidebar">સાઇડબાર (300x250)</option>
              <option value="article_inline">ઇન-આર્ટિકલ મિડલ (600x300)</option>
              <option value="homepage">હોમપેજ સ્પોન્સર બેનર</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">ક્રિએટિવ ઇમેજ URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">ક્લિક URL (Destination Link) *</label>
            <input
              type="url"
              required
              placeholder="https://www.example.com/festive-offer"
              value={formData.destination_url}
              onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">સ્ટેટસ</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati"
            >
              <option value="active">સક્રિય (Active)</option>
              <option value="inactive">નિષ્ક્રિય (Inactive)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold font-gujarati transition disabled:opacity-50"
        >
          {submitting ? 'ઉમેરાઈ રહી છે...' : 'જાહેરાત લાઈવ કરો ➔'}
        </button>
      </form>

      {/* Ads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 font-gujarati">તમામ જાહેરાતો ({ads.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-gujarati">જાહેરાતો લોડ થઈ રહી છે...</div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-gujarati">કોઈ જાહેરાત સેટ કરવામાં આવી નથી.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-gujarati">બેનર / ક્લાયન્ટ</th>
                  <th className="px-4 py-3.5 font-gujarati">પ્લેસમેન્ટ</th>
                  <th className="px-4 py-3.5 font-gujarati">ઇમ્પ્રેશન્સ</th>
                  <th className="px-4 py-3.5 font-gujarati">ક્લિક્સ</th>
                  <th className="px-4 py-3.5 font-gujarati">સ્થિતિ</th>
                  <th className="px-5 py-3.5 text-right font-gujarati">ક્રિયા</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <img src={getStorageUrl(ad.image_url)} alt="" className="w-16 h-10 object-cover rounded border border-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900 font-gujarati text-sm">{ad.title}</p>
                        <a href={ad.destination_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] truncate max-w-xs">
                          <span>{ad.destination_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono font-medium">
                      {ad.placement}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {ad.impressions_count?.toLocaleString('gu-IN') || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      <span className="flex items-center gap-1">
                        <MousePointer className="w-3.5 h-3.5 text-slate-400" />
                        {ad.clicks_count?.toLocaleString('gu-IN') || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(ad)}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        {ad.status === 'active' ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold font-gujarati">સક્રિય</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-500 font-gujarati">બંધ</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                        title="કાઢી નાખો"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
