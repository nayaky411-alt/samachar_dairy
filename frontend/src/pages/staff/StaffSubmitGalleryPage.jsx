import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Camera, Plus, Trash2, CheckCircle, AlertCircle, Send, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function StaffSubmitGalleryPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image: '',
    category_id: '',
    district_id: '',
  });

  const [images, setImages] = useState([
    { image_url: '', caption: '', credit: '' },
    { image_url: '', caption: '', credit: '' },
  ]);

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

  const addImageField = () => {
    setImages([...images, { image_url: '', caption: '', credit: '' }]);
  };

  const removeImageField = (index) => {
    if (images.length <= 1) return;
    setImages(images.filter((_, i) => i !== index));
  };

  const handleImageChange = (index, field, value) => {
    const updated = [...images];
    updated[index][field] = value;
    setImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const validImages = images.filter(img => img.image_url.trim() !== '');
    if (validImages.length === 0) {
      setError('ઓછામાં ઓછો એક ફોટો ઉમેરવો ફરજિયાત છે.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        cover_image: formData.cover_image || validImages[0].image_url,
        images: validImages,
      };

      const res = await apiClient.post('/staff/galleries', payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/admin/staff'), 2000);
      }
    } catch (err) {
      console.error('Gallery submission error:', err);
      setError(err.response?.data?.message || 'ફોટો ગેલેરી સબમિટ કરવામાં ક્ષતિ આવી.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <Camera className="w-6 h-6 text-purple-600" />
            ફોટો ગેલેરી સબમિટ કરો (Submit Photo Gallery)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati">
            તહેવારો, ચૂંટણી રેલીઓ અને ઉત્સવોના મલ્ટીપલ હાઇ-રિઝોલ્યુશન ફોટોઝ રજૂ કરો.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-gujarati">ગેલેરી સફળતાપૂર્વક ચકાસણી માટે મોકલાઈ ગઈ છે!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-gujarati">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
            ગેલેરીનું શીર્ષક (Title) *
          </label>
          <input
            type="text"
            required
            placeholder="દા.ત. નવરાત્રિ મહોત્સવ ૨૦૨૬: વડોદરાના યુનાઈટેડ વે ખાતે ખેલૈયાઓની ધૂમ..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white font-gujarati"
          />
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
            કવર ફોટો URL (Cover Image URL)
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
            ગેલેરી પરિચય (Description)
          </label>
          <textarea
            rows={2}
            placeholder="આ આલ્બમ અંગેની ટૂંકી માહિતી..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white font-gujarati"
          ></textarea>
        </div>

        {/* Dynamic Image Cards */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 font-gujarati flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              ગેલેરી ફોટોગ્રાફ્સ ({images.length})
            </h3>
            <button
              type="button"
              onClick={addImageField}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold font-gujarati transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>બીજો ફોટો ઉમેરો</span>
            </button>
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 font-gujarati">ફોટો #{idx + 1}</span>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 transition"
                      title="કાઢી નાખો"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="url"
                      required
                      placeholder="ઇમેજ URL (Image URL) *"
                      value={img.image_url}
                      onChange={(e) => handleImageChange(idx, 'image_url', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="ફોટો ક્રેડિટ (Credit)"
                      value={img.credit}
                      onChange={(e) => handleImageChange(idx, 'credit', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="ફોટો કેપ્શન / વિવરણ (Caption in Gujarati)"
                  value={img.caption}
                  onChange={(e) => handleImageChange(idx, 'caption', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-gujarati"
                />
              </div>
            ))}
          </div>
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
