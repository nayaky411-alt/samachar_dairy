import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { CheckCircle, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import { Youtube } from '../../components/common/BrandIcons';

export default function StaffSubmitVideoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    thumbnail_url: '',
    duration: '',
    category_id: '',
    district_id: '',
  });

  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/categories').then(res => {
      if (res.data.success) setCategories(res.data.data.categories || []);
    }).catch(() => {});

    apiClient.get('/districts').then(res => {
      if (res.data.success) setDistricts(res.data.data.districts || []);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.post('/staff/youtube', formData);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/admin/staff'), 2000);
      }
    } catch (err) {
      console.error('Video submission error:', err);
      setError(err.response?.data?.message || 'વિડીયો સબમિટ કરવામાં ક્ષતિ આવી.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-600" />
            યૂટ્યુબ વિડીયો સબમિટ કરો (Submit YouTube Video)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati">
            ગ્રાઉન્ડ રિપોર્ટ્સ, ઇન્ટરવ્યુ અને બુલેટિન વિડીયો ચેનલ હેડની મંજૂરી માટે રજૂ કરો.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-gujarati">વિડીયો સફળતાપૂર્વક ચકાસણી માટે મોકલાઈ ગયો છે!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-gujarati">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
            વિડીયોનું શીર્ષક (Title) *
          </label>
          <input
            type="text"
            required
            placeholder="દા.ત. સુરતમાં મેગા ટેક્સટાઇલ પાર્કનું ભૂમિપૂજન: વેપારીઓ સાથે ખાસ વાતચીત..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white font-gujarati"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
            યૂટ્યુબ લિંક (YouTube Video URL) *
          </label>
          <input
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX અથવા https://youtu.be/..."
            value={formData.youtube_url}
            onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white"
          />
          <p className="text-[11px] text-slate-400 mt-1 font-gujarati">
            સિસ્ટમ આપમેળે યૂટ્યુબ વિડીયો ID અને થંબનેલ ઓળખી લેશે.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
              કેટેગરી (Category)
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati"
            >
              <option value="">કેટેગરી પસંદ કરો</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_gu} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
              જિલ્લો (District)
            </label>
            <select
              value={formData.district_id}
              onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati"
            >
              <option value="">જિલ્લો પસંદ કરો</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name_gu} ({d.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
            વિડીયો વર્ણન (Description)
          </label>
          <textarea
            rows={4}
            placeholder="વિડીયો રિપોર્ટિંગ અંગેની વિગતવાર માહિતી..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white font-gujarati"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 font-gujarati flex items-center justify-center gap-2 shadow-sm"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>સબમિટ થઈ રહ્યો છે...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>મંજૂરી માટે ચેનલ હેડને મોકલો</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
