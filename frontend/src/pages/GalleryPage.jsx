import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import GallerySection from '../components/media/GallerySection';

const GalleryPage = () => {
  const { slug } = useParams();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'ફોટો સ્ટોરીઝ અને ગેલેરી | સમાચાર ડાયરી 24x9';
    apiClient.get('/galleries')
      .then(res => {
        if (res.data.success) {
          setGalleries(res.data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
          <Camera size={20} />
          <span>તસવીરી અહેવાલો</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mb-2">
          ફોટો સ્ટોરીઝ & વિઝ્યુઅલ ગેલેરી
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
          ગુજરાતના ઉત્સવો, પ્રાકૃતિક સૌંદર્ય, ઈવેન્ટ્સ અને મહત્ત્વપૂર્ણ ઘટનાઓની શ્રેષ્ઠ તસવીરો.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 size={36} className="animate-spin text-emerald-700 mb-2" />
          <span className="text-xs font-bold">ફોટો ગેલેરી લોડ થઈ રહી છે...</span>
        </div>
      ) : (
        <GallerySection galleries={galleries} />
      )}
    </div>
  );
};

export default GalleryPage;
