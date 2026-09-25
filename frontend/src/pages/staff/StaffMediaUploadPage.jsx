import React, { useState } from 'react';
import apiClient from '../../api/client';
import { UploadCloud, Check, Copy, Image, FileText, AlertCircle } from 'lucide-react';

export default function StaffMediaUploadPage() {
  const [file, setFile] = useState(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);
    if (caption) formData.append('caption', caption);
    if (credit) formData.append('credit', credit);

    try {
      const res = await apiClient.post('/staff/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0,
      });

      if (res.data.success) {
        setUploadedMedia(prev => [res.data.data, ...prev]);
        setFile(null);
        setAltText('');
        setCaption('');
        setCredit('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'ફાઇલ અપલોડ કરવામાં નિષ્ફળતા મળી.');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-gujarati text-slate-900">મીડિયા અપલોડ (Media Library & Upload)</h1>
        <p className="text-xs text-slate-500 font-gujarati mt-0.5">
          અહેવાલ માટે ફોટોગ્રાફ્સ અપલોડ કરો અને ડાયરેક્ટ ઈમેજ URL મેળવી તમારા સમાચારમાં વાપરો.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-8 text-center bg-slate-50 hover:bg-red-50/20 transition cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            required
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          {file ? (
            <div>
              <p className="text-sm font-bold text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-slate-700 font-gujarati">અહીં ક્લિક કરો અથવા ફોટો ડ્રેગ કરો</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP ફોર્મેટ (મહત્તમ ૫૦ MB)</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">કેપ્શન (Caption)</label>
            <input
              type="text"
              placeholder="ફોટોનું વિવરણ..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">ફોટો ક્રેડિટ (Credit)</label>
            <input
              type="text"
              placeholder="દા.ત. PTI / Samachar Dairy"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">Alt ટેક્સ્ટ</label>
            <input
              type="text"
              placeholder="SEO Alt વર્ણન..."
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 font-gujarati flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>અપલોડ થઈ રહ્યો છે...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>સર્વર પર અપલોડ કરો</span>
            </>
          )}
        </button>
      </form>

      {/* Uploaded Media Stream */}
      {uploadedMedia.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 font-gujarati">તાજેતરમાં અપલોડ કરેલ મીડિયા</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {uploadedMedia.map((m) => (
              <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <img
                  src={m.url}
                  alt={m.filename}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-slate-800 truncate">{m.filename}</p>
                  <p className="text-slate-400 text-[10px]">{(m.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={() => copyToClipboard(m.url, m.id)}
                    className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-slate-700 transition"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">લિંક કોપી થઈ ગઈ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>URL કોપી કરો</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
