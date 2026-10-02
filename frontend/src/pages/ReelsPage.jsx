import React, { useEffect, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Instagram } from '../components/common/BrandIcons';
import apiClient from '../api/client';
import ReelsSection from '../components/media/ReelsSection';

const ReelsPage = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'સત્તાવાર રીલ્સ અને શોર્ટ વિડીયો | સમાચાર ડાયરી 24x9';
    apiClient.get('/reels')
      .then(res => {
        if (res.data.success) {
          setReels(res.data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-800 via-pink-700 to-red-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-200 mb-2">
          <Instagram size={20} />
          <span>ઇન્સ્ટાગ્રામ શોર્ટ્સ & રીલ્સ</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mb-2">
          શોર્ટ વિડીયો હબ (Reels & Shorts)
        </h1>
        <p className="text-xs sm:text-sm text-pink-100 max-w-2xl">
          ઝડપી સમાચાર, રસપ્રદ માહિતી અને ગુજરાતના વાયરલ વિડીયો માત્ર થોડી સેકન્ડ્સમાં.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 size={36} className="animate-spin text-pink-600 mb-2" />
          <span className="text-xs font-bold">રીલ્સ લોડ થઈ રહી છે...</span>
        </div>
      ) : (
        <ReelsSection reels={reels} />
      )}
    </div>
  );
};

export default ReelsPage;
