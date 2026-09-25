import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Sliders, ArrowUp, ArrowDown, Check, ToggleLeft, ToggleRight, Save, AlertCircle } from 'lucide-react';

export default function HomepageManagerPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchSections = () => {
    setLoading(true);
    apiClient.get('/admin/homepage/sections')
      .then(res => {
        if (res.data.success) {
          setSections(res.data.data);
        }
      })
      .catch(err => {
        console.error('Fetch homepage sections error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setSections(updated);
  };

  const moveDown = (index) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setSections(updated);
  };

  const toggleActive = (index) => {
    const updated = [...sections];
    updated[index].is_active = !updated[index].is_active;
    setSections(updated);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        sections: sections.map((sec, idx) => ({
          id: sec.id,
          sort_order: idx + 1,
          is_active: !!sec.is_active,
        })),
      };

      const res = await apiClient.put('/admin/homepage/sections/order', payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'હોમપેજ ક્રમ સાચવવામાં ક્ષતિ આવી.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-red-700" />
            હોમપેજ લેઆઉટ મેનેજર (Homepage Section CMS)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati mt-0.5">
            હોમપેજ પર વિવિધ બ્લોક્સ (હીરો સ્ટોરીઝ, ગુજરાત મેપ, શેરબજાર, વિડિયોઝ, રીલ્સ) નો ક્રમ બદલો અને દ્રશ્યતા નિયંત્રિત કરો.
          </p>
        </div>
        <button
          onClick={handleSaveOrder}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold font-gujarati shadow-md transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'સાચવી રહ્યા છીએ...' : 'ક્રમ સેવ કરો'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-gujarati">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>હોમપેજનો નવો ક્રમ સફળતાપૂર્વક અપડેટ થઈ ગયો છે અને લાઈવ થઈ ગયો છે!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-gujarati">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sections Reorder List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">સેક્શન્સ લોડ થઈ રહ્યા છે...</div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">કોઈ સેક્શન્સ મળ્યા નથી.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className={`p-4 flex items-center justify-between gap-4 transition ${
                  sec.is_active ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 font-gujarati text-sm">
                      {sec.title_gu || sec.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      key: {sec.section_key} | પ્રકાર: {sec.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Move Up/Down buttons */}
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                    title="ઉપર ખસેડો"
                  >
                    <ArrowUp className="w-4 h-4 text-slate-600" />
                  </button>

                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === sections.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                    title="નીચે ખસેડો"
                  >
                    <ArrowDown className="w-4 h-4 text-slate-600" />
                  </button>

                  {/* Active Toggle */}
                  <button
                    onClick={() => toggleActive(idx)}
                    className="ml-2 flex items-center gap-1 text-xs font-bold cursor-pointer font-gujarati"
                    title="સક્રિય / નિષ્ક્રિય સ્વિચ"
                  >
                    {sec.is_active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
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
