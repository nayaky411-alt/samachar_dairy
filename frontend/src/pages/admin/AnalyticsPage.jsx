import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { BarChart3, TrendingUp, MapPin, Award, Users, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    apiClient.get('/admin/analytics')
      .then(res => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch(err => {
        console.error('Fetch analytics error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const topCategories = data?.top_categories || [];
  const topCities = data?.top_cities || [];
  const topAuthors = data?.top_authors || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-700" />
            વાંચક વિશ્લેષણ & એનાલિટિક્સ (Audience Analytics)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati mt-0.5">
            સૌથી વધુ વંચાતી કેટેગરીઝ, ટોચના જિલ્લાઓ અને ઉત્કૃષ્ટ પ્રદર્શન કરનાર પત્રકારોનું વિશ્લેષણ
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-bold font-gujarati self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>રીફ્રેશ</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500 font-gujarati">એનાલિટિક્સ ડેટા તૈયાર થઈ રહ્યો છે...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Categories */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <TrendingUp className="w-5 h-5 text-red-700" />
              <h2 className="font-bold text-slate-900 font-gujarati text-sm">સૌથી વધુ વંચાતી કેટેગરીઝ</h2>
            </div>
            <div className="space-y-3">
              {topCategories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-bold text-slate-400">{idx + 1}.</span>
                    <span className="font-bold text-slate-800 font-gujarati">{cat.name_gu}</span>
                  </div>
                  <span className="font-bold font-mono text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    {cat.articles_count || 0} અહેવાલ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Cities / Districts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-blue-700" />
              <h2 className="font-bold text-slate-900 font-gujarati text-sm">ટોચના સક્રિય શહેરો / જિલ્લા</h2>
            </div>
            <div className="space-y-3">
              {topCities.map((city, idx) => (
                <div key={city.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-bold text-slate-400">{idx + 1}.</span>
                    <span className="font-bold text-slate-800 font-gujarati">{city.name_gu || city.name}</span>
                  </div>
                  <span className="font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {city.articles_count || 0} સમાચાર
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Authors */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Award className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-slate-900 font-gujarati text-sm">ટોચના યોગદાનકર્તા પત્રકારો</h2>
            </div>
            <div className="space-y-3">
              {topAuthors.map((author, idx) => (
                <div key={author.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-bold text-slate-400">{idx + 1}.</span>
                    <div>
                      <span className="font-bold text-slate-800 font-gujarati block">{author.name}</span>
                      <span className="text-[10px] text-slate-400 font-gujarati">{author.designation || 'રિપોર્ટર'}</span>
                    </div>
                  </div>
                  <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {author.articles_count || 0} અહેવાલ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
