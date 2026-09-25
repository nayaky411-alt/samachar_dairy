import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { 
  Film, CheckCircle, AlertCircle, Send, ArrowLeft, 
  Upload, HardDrive, Trash2, RefreshCw, Image as ImageIcon, 
  Clock, Check, Play, FileVideo, Sparkles
} from 'lucide-react';
import { Instagram } from '../../components/common/BrandIcons';
import { useAuth } from '../../context/AuthContext';

export default function StaffSubmitReelPage() {
  const navigate = useNavigate();
  const { user, isChannelHead } = useAuth();
  const [sourceType, setSourceType] = useState('instagram'); // 'instagram' | 'uploaded'

  // Aux state (categories, districts, cities)
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  // Max video limit from config
  const [maxUploadMb, setMaxUploadMb] = useState(100);

  // Status state
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  // -----------------------------------------------------------
  // 1. INSTAGRAM REEL FORM STATE
  // -----------------------------------------------------------
  const [instaData, setInstaData] = useState({
    title: '',
    caption: '',
    instagram_url: '',
    thumbnail_url: '',
    category_id: '',
    district_id: '',
    city_id: '',
  });

  // -----------------------------------------------------------
  // 2. LOCAL VIDEO UPLOAD FORM STATE
  // -----------------------------------------------------------
  const [videoData, setVideoData] = useState({
    title: '',
    caption: '',
    description: '',
    category_id: '',
    district_id: '',
    city_id: '',
  });

  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [videoMeta, setVideoMeta] = useState({
    duration: '',
    durationSeconds: 0,
    sizeMB: '',
    width: 0,
    height: 0,
  });

  // Thumbnail states
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);
  const [isAutoThumbnail, setIsAutoThumbnail] = useState(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Fetch categories, districts, cities and video config
    apiClient.get('/categories').then(res => {
      if (res.data.success) setCategories(res.data.data.categories || res.data.data || []);
    }).catch(() => {});

    apiClient.get('/districts').then(res => {
      if (res.data.success) setDistricts(res.data.data.districts || res.data.data || []);
    }).catch(() => {});

    apiClient.get('/cities').then(res => {
      if (res.data.success) setCities(res.data.data.cities || res.data.data || []);
    }).catch(() => {});

    apiClient.get('/videos/config').then(res => {
      if (res.data.success && res.data.data?.max_upload_mb) {
        setMaxUploadMb(res.data.data.max_upload_mb);
      }
    }).catch(() => {});
  }, []);

  // Filter cities by district
  const handleDistrictChange = (districtId, isVideo = false) => {
    if (isVideo) {
      setVideoData(prev => ({ ...prev, district_id: districtId, city_id: '' }));
    } else {
      setInstaData(prev => ({ ...prev, district_id: districtId, city_id: '' }));
    }

    if (!districtId) {
      setFilteredCities([]);
    } else {
      const filtered = cities.filter(c => String(c.district_id) === String(districtId));
      setFilteredCities(filtered);
    }
  };

  // -----------------------------------------------------------
  // VIDEO FILE SELECTION & PREVIEW LOGIC
  // -----------------------------------------------------------
  const handleVideoFileSelect = (file) => {
    if (!file) return;

    setError(null);

    // Validate type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];

    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      setError('અમાન્ય ફાઇલ પ્રકાર. કૃપા કરીને MP4, WebM અથવા MOV ફોર્મેટનો વિડિયો પસંદ કરો (Allowed: MP4, WebM, MOV).');
      return;
    }

    // Validate size
    const maxBytes = maxUploadMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`વિડિયોનું કદ ${maxUploadMb} MB કરતાં વધુ છે. કૃપા કરીને નાની સાઇઝની ફાઇલ પસંદ કરો.`);
      return;
    }

    // Revoke old URL if any
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedVideoFile(file);
    setVideoPreviewUrl(objectUrl);

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setVideoMeta(prev => ({ ...prev, sizeMB: `${sizeInMB} MB` }));

    // Auto populate title if empty
    if (!videoData.title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setVideoData(prev => ({ ...prev, title: cleanName }));
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (!videoPlayerRef.current) return;
    const vid = videoPlayerRef.current;
    const durSec = Math.floor(vid.duration) || 0;
    const mins = Math.floor(durSec / 60);
    const secs = durSec % 60;
    const formattedDuration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    setVideoMeta(prev => ({
      ...prev,
      duration: formattedDuration,
      durationSeconds: durSec,
      width: vid.videoWidth || 0,
      height: vid.videoHeight || 0,
    }));

    // Auto-capture a thumbnail frame at 1s if no custom thumbnail uploaded yet
    setTimeout(() => {
      captureFrameAsThumbnail();
    }, 500);
  };

  const captureFrameAsThumbnail = () => {
    if (!videoPlayerRef.current || !canvasRef.current) return;
    const vid = videoPlayerRef.current;
    const canvas = canvasRef.current;
    
    try {
      canvas.width = vid.videoWidth || 640;
      canvas.height = vid.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      setThumbnailPreviewUrl(dataUrl);
      setSelectedThumbnailFile(dataUrl); // store base64 data URL
      setIsAutoThumbnail(true);
    } catch (e) {
      console.warn('Canvas frame capture failed:', e);
    }
  };

  const handleCustomThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('થંબનેલ માટે માત્ર ઇમેજ ફાઇલ (JPG, PNG, WebP) પસંદ કરો.');
      return;
    }

    setSelectedThumbnailFile(file);
    setIsAutoThumbnail(false);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedVideoFile(null);
    setVideoPreviewUrl(null);
    setSelectedThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setVideoMeta({ duration: '', durationSeconds: 0, sizeMB: '', width: 0, height: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleVideoFileSelect(files[0]);
    }
  };

  // -----------------------------------------------------------
  // FORM SUBMISSION: INSTAGRAM REEL
  // -----------------------------------------------------------
  const handleInstagramSubmit = async (e, targetStatus = 'pending_review') => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const isPublish = isChannelHead && targetStatus === 'published';
    const payload = {
      ...instaData,
      status: isPublish ? 'published' : 'pending_review',
      publish_immediately: isPublish ? 1 : 0,
    };

    try {
      const res = await apiClient.post('/staff/reels', payload);
      if (res.data.success) {
        setSuccessMessage(
          isPublish
            ? 'ઇન્સ્ટાગ્રામ રીલ સફળતાપૂર્વક સીધી લાઈવ પબ્લિશ થઈ ગઈ છે અને હોમપેજ પર "શોર્ટ વિડીયો & રીલ્સ" સેક્શનમાં દેખાશે!'
            : 'ઇન્સ્ટાગ્રામ રીલ સફળતાપૂર્વક ચકાસણી માટે મોકલાઈ ગઈ છે! ડેશબોર્ડ પર લઈ જઈ રહ્યા છીએ...'
        );
        setTimeout(() => navigate(isChannelHead ? '/admin/dashboard' : '/admin/staff'), 2200);
      }
    } catch (err) {
      console.error('Reel submission error:', err);
      setError(err.response?.data?.message || 'રીલ સબમિટ કરવામાં ક્ષતિ આવી.');
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------------------------------------
  // FORM SUBMISSION: LOCAL VIDEO UPLOAD
  // -----------------------------------------------------------
  const handleVideoUploadSubmit = async (status = 'pending_review') => {
    if (!selectedVideoFile) {
      setError('કૃપા કરીને પહેલાં કમ્પ્યુટરમાંથી વિડિયો ફાઇલ પસંદ કરો (Select a video file).');
      return;
    }

    if (!videoData.title.trim()) {
      setError('વિડિયોનું ગુજરાતી શીર્ષક (Title) દાખલ કરવું ફરજિયાત છે.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    const isPublish = isChannelHead && status === 'published';

    const formData = new FormData();
    formData.append('title', videoData.title.trim());
    formData.append('caption', videoData.caption || '');
    formData.append('description', videoData.description || '');
    if (videoData.category_id) formData.append('category_id', videoData.category_id);
    if (videoData.district_id) formData.append('district_id', videoData.district_id);
    if (videoData.city_id) formData.append('city_id', videoData.city_id);

    formData.append('video', selectedVideoFile);
    formData.append('duration', videoMeta.duration);
    if (videoMeta.width) formData.append('width', videoMeta.width);
    if (videoMeta.height) formData.append('height', videoMeta.height);
    formData.append('status', status);
    if (isPublish) {
      formData.append('publish_immediately', '1');
    }

    // Thumbnail: file or base64 string
    if (selectedThumbnailFile) {
      formData.append('thumbnail', selectedThumbnailFile);
    }

    try {
      const res = await apiClient.post('/staff/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 0, // No timeout for large video uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      if (res.data.success) {
        setSuccessMessage(
          isPublish
            ? 'વિડિયો સફળતાપૂર્વક અપલોડ થઈ ગયો છે અને હોમપેજ પર "શોર્ટ વિડીયો & રીલ્સ" સેક્શનમાં લાઈવ થઈ ગયો છે!'
            : status === 'pending_review'
            ? 'વિડિયો સફળતાપૂર્વક અપલોડ થયો છે અને મુખ્ય સંપાદક (Channel Head) ની મંજૂરી માટે મોકલાયો છે!'
            : 'વિડિયો ડ્રાફ્ટ તરીકે સફળતાપૂર્વક સાચવવામાં આવ્યો છે.'
        );
        setTimeout(() => navigate(isChannelHead ? '/admin/dashboard' : '/admin/staff'), 2400);
      }
    } catch (err) {
      console.error('Video upload error:', err);
      let errorMsg = 'વિડિયો અપલોડ કરવામાં ક્ષતિ આવી. કૃપા કરીને ફાઇલ કદ અને ઇન્ટરનેટ કનેક્શન તપાસો.';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMsg = 'વિડિયો અપલોડ કરવામાં વધુ સમય લાગ્યો (Timeout). કૃપા કરીને તમારું નેટવર્ક કનેક્શન તપાસો અથવા ફરીથી પ્રયાસ કરો.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <Film className="w-6 h-6 text-pink-600" />
            રીલ & વિડિયો સબમિશન (Submit Reel & Video)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati">
            ઇન્સ્ટાગ્રામ રીલ લિંક ઉમેરો અથવા તમારા કમ્પ્યુટર પરથી સીધો વિડિયો અપલોડ કરો.
          </p>
        </div>
      </div>

      {/* Source Selector Segmented Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => { setSourceType('instagram'); setError(null); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            sourceType === 'instagram'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Instagram size={18} className="text-pink-600 shrink-0" />
          <span className="font-gujarati">ઇન્સ્ટાગ્રામ રીલ URL</span>
        </button>

        <button
          type="button"
          onClick={() => { setSourceType('uploaded'); setError(null); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            sourceType === 'uploaded'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <HardDrive size={18} className="shrink-0" />
          <span className="font-gujarati">કમ્પ્યુટરમાંથી વિડિયો અપલોડ કરો</span>
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-sm flex items-start gap-3 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="font-gujarati">
            <p className="font-bold">{successMessage}</p>
            <p className="text-xs text-emerald-700 mt-0.5">ડેશબોર્ડ પર લઈ જઈ રહ્યા છીએ...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="font-gujarati">{error}</span>
        </div>
      )}

      {/* ========================================================
          OPTION 1: INSTAGRAM REEL URL WORKFLOW
          ======================================================== */}
      {sourceType === 'instagram' && (
        <form onSubmit={handleInstagramSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <Instagram size={16} className="text-pink-600" />
            <span>ઇન્સ્ટાગ્રામ રીલ વિગતો (Instagram Reel URL)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
              રીલનું ગુજરાતી શીર્ષક (Title) *
            </label>
            <input
              type="text"
              required
              placeholder="દા.ત. સોમનાથ મહાદેવ મંદિરે ભવ્ય સંધ્યા આરતીનો દિવ્ય નજારો..."
              value={instaData.title}
              onChange={(e) => setInstaData({ ...instaData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white font-gujarati outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
              ઇન્સ્ટાગ્રામ રીલ URL (Instagram Reel Link) *
            </label>
            <input
              type="url"
              required
              placeholder="https://www.instagram.com/reel/C3_EXAMPLE/"
              value={instaData.instagram_url}
              onChange={(e) => setInstaData({ ...instaData, instagram_url: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
              થંબનેલ ઇમેજ URL (Thumbnail - વૈકલ્પિક)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={instaData.thumbnail_url}
              onChange={(e) => setInstaData({ ...instaData, thumbnail_url: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
                કેટેગરી (Category)
              </label>
              <select
                value={instaData.category_id}
                onChange={(e) => setInstaData({ ...instaData, category_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati outline-none"
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
                value={instaData.district_id}
                onChange={(e) => handleDistrictChange(e.target.value, false)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati outline-none"
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
              કેપ્શન અને હેશટેગ્સ (Caption)
            </label>
            <textarea
              rows={3}
              placeholder="#GujaratNews #BreakingNews #SamacharDairy247..."
              value={instaData.caption}
              onChange={(e) => setInstaData({ ...instaData, caption: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white font-gujarati outline-none"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {isChannelHead && (
              <button
                type="button"
                disabled={submitting}
                onClick={(e) => handleInstagramSubmit(e, 'published')}
                className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 font-gujarati flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>પ્રક્રિયા ચાલુ છે...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>સીધું લાઈવ પબ્લિશ કરો (Live to "શોર્ટ વિડીયો & રીલ્સ")</span>
                  </>
                )}
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full ${isChannelHead ? 'sm:w-auto px-6 bg-slate-800 hover:bg-slate-900' : 'sm:flex-1 bg-red-700 hover:bg-red-800'} text-white rounded-xl text-sm font-bold transition disabled:opacity-50 font-gujarati flex items-center justify-center gap-2 shadow-sm cursor-pointer`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>સબમિટ થઈ રહી છે...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isChannelHead ? 'ચકાસણી માટે મોકલો' : 'મંજૂરી માટે ચેનલ હેડને મોકલો'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================
          OPTION 2: LOCAL VIDEO UPLOAD WORKFLOW
          ======================================================== */}
      {sourceType === 'uploaded' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <FileVideo size={16} className="text-red-700" />
              <span>વિડિયો ફાઇલ અપલોડ અને વિગતો (Local Video Upload)</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              મહત્તમ કદ: {maxUploadMb} MB
            </span>
          </div>

          {/* STEP 1: Video File Selection (Drag & Drop or Preview) */}
          {!videoPreviewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-red-600 bg-red-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-red-500 bg-slate-50/80 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi"
                onChange={(e) => handleVideoFileSelect(e.target.files?.[0])}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-3 shadow-inner">
                <Upload size={28} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-gujarati">
                અહીં વિડિયો ડ્રેગ કરીને મૂકો અથવા ક્લિક કરીને પસંદ કરો
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Drag & drop your MP4, WebM or MOV video file here, or click to browse from computer.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <span>સપોર્ટેડ ફોર્મેટ્સ: MP4, WebM, MOV</span>
                <span>•</span>
                <span>Max: {maxUploadMb} MB</span>
              </div>
            </div>
          ) : (
            /* Selected Video Player & Metadata Card */
            <div className="space-y-3 bg-slate-900 rounded-2xl p-4 text-white overflow-hidden shadow-md">
              <div className="relative aspect-video max-h-[380px] bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <video
                  ref={videoPlayerRef}
                  src={videoPreviewUrl}
                  controls
                  playsInline
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Video Info Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-300 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <FileVideo size={14} className="text-red-400" />
                    <span className="font-bold text-white truncate max-w-xs">{selectedVideoFile?.name}</span>
                  </div>
                  {videoMeta.sizeMB && (
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-amber-400">
                      {videoMeta.sizeMB}
                    </span>
                  )}
                  {videoMeta.duration && (
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <Clock size={11} />
                      {videoMeta.duration}
                    </span>
                  )}
                  {videoMeta.width > 0 && (
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {videoMeta.width}x{videoMeta.height}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>બદલો</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>દૂર કરો</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Title & Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
              વિડિયોનું ગુજરાતી શીર્ષક (Video Title) *
            </label>
            <input
              type="text"
              required
              placeholder="દા.ત. અમદાવાદમાં મેટ્રો રેલના નવા રૂટનું ભવ્ય લોકાર્પણ..."
              value={videoData.title}
              onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white font-gujarati outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
                કેટેગરી (Category) *
              </label>
              <select
                value={videoData.category_id}
                onChange={(e) => setVideoData({ ...videoData, category_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati outline-none"
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
                જિલ્લો (District) *
              </label>
              <select
                value={videoData.district_id}
                onChange={(e) => handleDistrictChange(e.target.value, true)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati outline-none"
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

          {filteredCities.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
                શહેર / તાલુકો (City / Area)
              </label>
              <select
                value={videoData.city_id}
                onChange={(e) => setVideoData({ ...videoData, city_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati outline-none"
              >
                <option value="">શહેર પસંદ કરો</option>
                {filteredCities.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name_gu} ({ct.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-gujarati">
              કેપ્શન & વિગતવાર વર્ણન (Caption & Description)
            </label>
            <textarea
              rows={3}
              placeholder="વિડિયો રિપોર્ટ અંગે સંક્ષિપ્ત માહિતી અને મહત્વના મુદ્દાઓ..."
              value={videoData.caption}
              onChange={(e) => setVideoData({ ...videoData, caption: e.target.value, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:bg-white font-gujarati outline-none"
            ></textarea>
          </div>

          {/* STEP 3: Thumbnail Management (Auto-Capture or Custom Upload) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider font-gujarati flex items-center gap-1.5">
                <ImageIcon size={14} className="text-red-700" />
                <span>વિડિયો થંબનેલ (Video Cover Thumbnail)</span>
              </label>
              {videoPreviewUrl && (
                <button
                  type="button"
                  onClick={captureFrameAsThumbnail}
                  className="text-xs text-red-700 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                  title="પ્લેયરમાં વર્તમાન ફ્રેમમાંથી થંબનેલ કેપ્ચર કરો"
                >
                  <Sparkles size={13} />
                  <span>વિડિયોમાંથી ફ્રેમ કેપ્ચર કરો</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {thumbnailPreviewUrl ? (
                <div className="relative w-36 h-20 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 shadow-2xs group flex-shrink-0">
                  <img src={thumbnailPreviewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                    {isAutoThumbnail ? 'Auto Frame' : 'Custom'}
                  </div>
                </div>
              ) : (
                <div className="w-36 h-20 bg-slate-200 text-slate-400 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-[10px] flex-shrink-0">
                  <ImageIcon size={20} className="mb-1" />
                  <span>કોઈ થંબનેલ નથી</span>
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCustomThumbnailSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Upload size={13} />
                  <span>કમ્પ્યુટરમાંથી કસ્ટમ ફોટો અપલોડ કરો</span>
                </button>
                <p className="text-[11px] text-slate-500">
                  તમે તમારા કમ્પ્યુટર પરથી સ્પેશિયલ થંબનેલ અપલોડ કરી શકો છો અથવા વિડિયોમાંથી ઓટો-જનરેટેડ ફ્રેમનો ઉપયોગ કરી શકો છો.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {submitting && (
            <div className="space-y-2 p-4 bg-red-50/60 border border-red-200 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-red-950 font-gujarati flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>વિડિયો અપલોડ થઈ રહ્યો છે (Uploading video to storage)...</span>
                </span>
                <span className="text-red-700 font-mono text-sm">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
                <div
                  className="bg-red-700 h-full rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 font-gujarati">
                કૃપા કરીને અપલોડ પ્રક્રિયા પૂર્ણ થાય ત્યાં સુધી પેજ બંધ કે રિફ્રેશ કરશો નહીં.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              disabled={submitting || !selectedVideoFile}
              onClick={() => handleVideoUploadSubmit('draft')}
              className="w-full sm:w-auto px-5 py-3 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition disabled:opacity-50 font-gujarati cursor-pointer shadow-2xs"
            >
              ડ્રાફ્ટ સાચવો (Save Draft)
            </button>

            {isChannelHead && (
              <button
                type="button"
                disabled={submitting || !selectedVideoFile}
                onClick={() => handleVideoUploadSubmit('published')}
                className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 font-gujarati flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>અપલોડ થઈ રહ્યો છે...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>સીધું લાઈવ પબ્લિશ કરો (Live to "શોર્ટ વિડીયો & રીલ્સ")</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              disabled={submitting || !selectedVideoFile}
              onClick={() => handleVideoUploadSubmit('pending_review')}
              className={`w-full ${isChannelHead ? 'sm:w-auto px-5 bg-slate-800 hover:bg-slate-900' : 'sm:flex-1 bg-red-700 hover:bg-red-800'} text-white rounded-xl text-sm font-bold transition disabled:opacity-50 font-gujarati flex items-center justify-center gap-2 shadow-sm cursor-pointer`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>અપલોડ થઈ રહ્યો છે...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isChannelHead ? 'ચકાસણી માટે મોકલો' : 'મંજૂરી માટે ચેનલ હેડને મોકલો (Submit for Review)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
