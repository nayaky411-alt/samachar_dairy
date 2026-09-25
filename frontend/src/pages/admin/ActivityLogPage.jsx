import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { History, Shield, Clock, RefreshCw, User } from 'lucide-react';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  const fetchLogs = () => {
    setLoading(true);
    apiClient.get(`/admin/activity-logs?page=${page}`)
      .then(res => {
        if (res.data.success) {
          setLogs(res.data.data);
          setMeta(res.data.meta || {});
        }
      })
      .catch(err => {
        console.error('Fetch logs error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-red-700" />
            ઓડિટ ટ્રેઇલ & એડિટોરિયલ લોગ (Activity Audit Log)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati mt-0.5">
            સમાચારની મંજૂરી, અસ્વીકાર, સંપાદન અને પબ્લિશિંગના તમામ નિર્ણયોનો સમયબદ્ધ ઇતિહાસ
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-bold font-gujarati self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>રીફ્રેશ</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">ઓડિટ લોગ લોડ થઈ રહ્યો છે...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">કોઈ ઓડિટ રેકોર્ડ ઉપલબ્ધ નથી.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-gujarati">ક્રિયા (Action)</th>
                  <th className="px-4 py-3.5 font-gujarati">વપરાશકર્તા (User)</th>
                  <th className="px-4 py-3.5 font-gujarati">વિગત (Details)</th>
                  <th className="px-4 py-3.5 font-gujarati">IP એડ્રેસ</th>
                  <th className="px-5 py-3.5 text-right font-gujarati">તારીખ & સમય</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.user?.name || 'સિસ્ટમ (System)'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-gujarati max-w-sm truncate">
                      {log.description || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500">
                      {new Date(log.created_at).toLocaleString('gu-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.last_page > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-gujarati">
              પૃષ્ઠ {meta.current_page} / {meta.last_page}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50 font-gujarati"
              >
                પાછળ
              </button>
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50 font-gujarati"
              >
                આગળ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
