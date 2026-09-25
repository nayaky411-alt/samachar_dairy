import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  Eye,
  Sparkles,
  MapPin,
  Folder,
  Layers,
  Heading,
  Bold,
  Italic,
  List,
  Quote,
  Table as TableIcon,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ArticleEditor = ({ initialData = null, isEdit = false }) => {
  const { isChannelHead } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    short_description: initialData?.short_description || '',
    content: initialData?.content || '',
    category_id: initialData?.category_id || '',
    district_id: initialData?.district_id || '',
    city_id: initialData?.city_id || '',
    content_type: initialData?.content_type || 'Original Reporting',
    source_name: initialData?.source_name || '',
    source_url: initialData?.source_url || '',
    featured_image: initialData?.featured_image || '',
    featured_image_caption: initialData?.featured_image_caption || '',
    featured_image_credit: initialData?.featured_image_credit || '',
    reading_time: initialData?.reading_time || 2,
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
  });

  // Aux state
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, unsaved
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // content, location, media, seo, preview
  const [articleId, setArticleId] = useState(initialData?.id || null);

  const textareaRef = useRef(null);

  // Load taxonomies
  useEffect(() => {
    apiClient.get('/categories').then(res => setCategories(res.data.data || []));
    apiClient.get('/districts').then(res => setDistricts(res.data.data || []));
    apiClient.get('/cities').then(res => setCities(res.data.data || []));
  }, []);

  // Filter cities when district changes
  useEffect(() => {
    if (formData.district_id) {
      setFilteredCities(cities.filter(c => c.district_id === Number(formData.district_id)));
    } else {
      setFilteredCities(cities);
    }
  }, [formData.district_id, cities]);

  // Warn before exit with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'unsaved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // Duplicate title detection
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.trim().length > 10) {
        apiClient.get(`/search?q=${encodeURIComponent(formData.title.slice(0, 30))}`)
          .then(res => {
            const matches = (res.data.data || []).filter(a => a.id !== articleId);
            if (matches.length > 0) {
              setDuplicateWarning(`સાવધાની: આ શીર્ષક સાથે સામ્ય ધરાવતા ${matches.length} અન્ય સમાચાર પહેલેથી ઉપલબ્ધ છે: '${matches[0].title}'`);
            } else {
              setDuplicateWarning(null);
            }
          })
          .catch(() => {});
      } else {
        setDuplicateWarning(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.title, articleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaveStatus('unsaved');
  };

  // Rich toolbar insertion helpers
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = `${prefix}${selected || 'ટેક્સ્ટ'}${suffix}`;

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    setSaveStatus('unsaved');
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setSaveStatus('saving');
      const res = await apiClient.post('/staff/media/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0,
      });
      if (res.data.success) {
        setFormData(prev => ({ ...prev, featured_image: res.data.data.url }));
        setSaveStatus('unsaved');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      alert('કૃપા કરીને સમાચારનું શીર્ષક (Headline) લખો.');
      return;
    }
    if (!formData.category_id) {
      alert('કૃપા કરીને કેટેગરી પસંદ કરો.');
      return;
    }

    try {
      setSaveStatus('saving');
      setIsSubmitting(true);

      let res;
      if (articleId) {
        res = await apiClient.put(`/staff/articles/${articleId}`, formData);
      } else {
        res = await apiClient.post('/staff/articles', formData);
      }

      if (res.data.success) {
        setArticleId(res.data.data.id);
        setSaveStatus('saved');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving draft');
      setSaveStatus('unsaved');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit for Approval
  const handleSubmitForApproval = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('કૃપા કરીને શીર્ષક અને વિગતવાર સમાચાર બંને ભરો.');
      return;
    }

    try {
      setIsSubmitting(true);

      // First ensure draft is saved
      let currentId = articleId;
      if (!currentId) {
        const draftRes = await apiClient.post('/staff/articles', formData);
        currentId = draftRes.data.data.id;
        setArticleId(currentId);
      } else {
        await apiClient.put(`/staff/articles/${currentId}`, formData);
      }

      // Then submit for approval
      const submitRes = await apiClient.post(`/staff/articles/${currentId}/submit`);
      if (submitRes.data.success) {
        alert('સમાચાર સફળતાપૂર્વક મુખ્ય સંપાદકને મંજૂરી માટે મોકલવામાં આવ્યા છે.');
        navigate('/admin/staff/articles');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top action bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {isEdit ? 'સમાચાર સંપાદિત કરો (Edit Article)' : 'નવા સમાચાર તૈયાર કરો (Create Article)'}
          </h2>
          <div className="flex items-center gap-2 text-xs mt-1">
            {saveStatus === 'saving' && (
              <span className="text-amber-600 font-semibold animate-pulse flex items-center gap-1">
                <Clock size={12} />
                <span>સાચવી રહ્યા છીએ (Saving draft)...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>ડ્રાફ્ટ સેવ થઈ ગયો છે (Saved)</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-slate-500 font-medium">
                અનસેવ કરેલા ફેરફારો છે (Unsaved changes)
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Save size={15} />
            <span>ડ્રાફ્ટ સાચવો (Save Draft)</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitForApproval}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Send size={14} />
            <span>મંજૂરી માટે રજૂ કરો (Submit for Review)</span>
          </button>
        </div>
      </div>

      {/* Duplicate detection warning */}
      {duplicateWarning && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {/* Editor Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('content')}
          className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${activeTab === 'content' ? 'border-red-700 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          વાર્તા વિગત (Story & Content)
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${activeTab === 'location' ? 'border-red-700 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          સ્થળ & સ્ત્રોત (Location & Source)
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${activeTab === 'media' ? 'border-red-700 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          મુખ્ય તસવીર (Featured Image)
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${activeTab === 'seo' ? 'border-red-700 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          SEO & સોશિયલ મેટા
        </button>
      </div>

      {/* Form Content */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* TAB 1: Content */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                મુખ્ય હેડલાઇન (Main Headline) *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="ગુજરાતીમાં આકર્ષક અને તથ્યપૂર્ણ શીર્ષક લખો..."
                className="w-full text-lg sm:text-xl font-bold bg-white border border-slate-300 focus:border-red-600 rounded-xl px-4 py-2.5 outline-none text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  સબ-ટાઈટલ (Subtitle / Kick Headline)
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="વધારાની માહિતી માટે ઉપ-શીર્ષક..."
                  className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  કેટેગરી (Category) *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full text-sm font-semibold bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
                >
                  <option value="">કેટેગરી પસંદ કરો...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name_gu} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                ટૂંકો સારાંશ (Short Description / Excerpt)
              </label>
              <textarea
                name="short_description"
                rows={2}
                value={formData.short_description}
                onChange={handleChange}
                placeholder="હોમપેજ અને સોશિયલ કાર્ડ માટે ૧-૨ વાક્યનો સારાંશ..."
                className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl p-3 outline-none text-slate-800"
              />
            </div>

            {/* Rich Editor Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  સમાચાર અહેવાલ (Article Body - HTML Support) *
                </label>
                <span className="text-[11px] text-slate-400">
                  ગુજરાતી યુનિકોડ ટેક્સ્ટ સપોર્ટેડ
                </span>
              </div>

              <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:border-red-600">
                <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-700">
                  <button
                    type="button"
                    onClick={() => insertFormatting('<h3>', '</h3>')}
                    title="Heading 3"
                    className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold cursor-pointer"
                  >
                    <Heading size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<strong>', '</strong>')}
                    title="Bold"
                    className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold cursor-pointer"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<em>', '</em>')}
                    title="Italic"
                    className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold cursor-pointer"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<blockquote>"', '"</blockquote>')}
                    title="Quote"
                    className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold cursor-pointer"
                  >
                    <Quote size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                    title="List"
                    className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold cursor-pointer"
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<p>', '</p>')}
                    title="Paragraph"
                    className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold cursor-pointer"
                  >
                    P
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  name="content"
                  rows={12}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="સમાચારની વિગતો અહીં લખો (પેરાગ્રાફ્સ, અવતરણો, સત્તાવાર નિવેદનો)..."
                  className="w-full p-4 text-sm sm:text-base leading-relaxed outline-none text-slate-900 font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Location & Source */}
        {activeTab === 'location' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  જિલ્લો (Gujarat District)
                </label>
                <select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  className="w-full text-sm font-semibold bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
                >
                  <option value="">જિલ્લો પસંદ કરો...</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name_gu} ({d.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  શહેર / નગર (City / Town)
                </label>
                <select
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  className="w-full text-sm font-semibold bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
                >
                  <option value="">શહેર પસંદ કરો...</option>
                  {filteredCities.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name_gu} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  અહેવાલનો પ્રકાર (Content Type)
                </label>
                <select
                  name="content_type"
                  value={formData.content_type}
                  onChange={handleChange}
                  className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
                >
                  <option value="Original Reporting">મૂળ અહેવાલ (Original Reporting)</option>
                  <option value="Staff Report">સ્ટાફ રિપોર્ટ (Staff Report)</option>
                  <option value="Agency Report">એજન્સી અહેવાલ (Agency Report)</option>
                  <option value="Press Release">પ્રેસ રિલીઝ (Press Release)</option>
                  <option value="Official Statement">સત્તાવાર નિવેદન (Official Statement)</option>
                  <option value="Special Report">વિશેષ અહેવાલ (Special Report)</option>
                  <option value="Explainer">એક્સપ્લેનર (Explainer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  સ્ત્રોતનું નામ (Source Name)
                </label>
                <input
                  type="text"
                  name="source_name"
                  value={formData.source_name}
                  onChange={handleChange}
                  placeholder="દા.ત. પીટીઆઈ, રાજ્ય માહિતી ખાતું..."
                  className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  સ્ત્રોત લિંક (Source URL)
                </label>
                <input
                  type="url"
                  name="source_url"
                  value={formData.source_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Featured Media */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                મુખ્ય તસવીર અપલોડ કરો (Upload Featured Image)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                અથવા તસવીરનું વેબ URL (Image URL)
              </label>
              <input
                type="url"
                name="featured_image"
                value={formData.featured_image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
              />
            </div>

            {formData.featured_image && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block mb-2">તસવીર પૂર્વાવલોકન (Preview):</span>
                <img
                  src={formData.featured_image}
                  alt="Preview"
                  className="max-h-60 rounded-lg object-cover shadow-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  તસવીર કૅપ્શન (Caption)
                </label>
                <input
                  type="text"
                  name="featured_image_caption"
                  value={formData.featured_image_caption}
                  onChange={handleChange}
                  placeholder="તસવીર વિશે ૧ વાક્યની સમજૂતી..."
                  className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  તસવીર સૌજન્ય / ક્રેડિટ (Credit)
                </label>
                <input
                  type="text"
                  name="featured_image_credit"
                  value={formData.featured_image_credit}
                  onChange={handleChange}
                  placeholder="દા.ત. પીટીઆઈ / સમય પિક્ચર્સ..."
                  className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                SEO શીર્ષક (Meta Title)
              </label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleChange}
                placeholder="Google સર્ચ માટે ૬૦ અક્ષરનું શીર્ષક..."
                className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl px-3 py-2 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                SEO વર્ણન (Meta Description)
              </label>
              <textarea
                name="seo_description"
                rows={3}
                value={formData.seo_description}
                onChange={handleChange}
                placeholder="Google સર્ચ માટે ૧૫૦-૧૬૦ અક્ષરનું સંક્ષિપ્ત વર્ણન..."
                className="w-full text-sm bg-white border border-slate-300 focus:border-red-600 rounded-xl p-3 outline-none text-slate-800"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleEditor;
