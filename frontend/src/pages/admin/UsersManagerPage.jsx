import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Users, UserPlus, Shield, UserCheck, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function UsersManagerPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    designation: '',
    phone: '',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    apiClient.get('/admin/users')
      .then(res => {
        if (res.data.success) {
          setUsers(res.data.data);
        }
      })
      .catch(err => {
        console.error('Fetch users error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.post('/admin/users', formData);
      if (res.data.success) {
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', role: 'staff', designation: '', phone: '', bio: '' });
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'પત્રકાર ઉમેરવામાં ક્ષતિ આવી.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await apiClient.patch(`/admin/users/${user.id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert('સ્ટેટસ બદલવામાં ક્ષતિ આવી.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-red-700" />
            પત્રકારો & સ્ટાફ મેનેજમેન્ટ (Team & Journalists)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati mt-0.5">
            સમાચાર ડેરી ૨૪x૭ ના સંપાદકો, સંવાદદાતાઓ અને જિલ્લા પ્રતિનિધિઓનું સંચાલન
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold font-gujarati shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>નવા પત્રકાર ઉમેરો</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-gujarati">સ્ટાફ લિસ્ટ લોડ થઈ રહ્યું છે...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-gujarati">પત્રકાર / વિગતો</th>
                  <th className="px-4 py-3.5 font-gujarati">હોદ્દો (Designation)</th>
                  <th className="px-4 py-3.5 font-gujarati">રોલ (Role)</th>
                  <th className="px-4 py-3.5 font-gujarati">લખાયેલા અહેવાલો</th>
                  <th className="px-4 py-3.5 font-gujarati">સ્થિતિ</th>
                  <th className="px-5 py-3.5 text-right font-gujarati">ક્રિયા</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                        u.role === 'channel_head' ? 'bg-red-800' : 'bg-slate-700'
                      }`}>
                        {u.name ? u.name[0] : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 font-gujarati">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-gujarati text-slate-600">
                      {u.designation || 'રિપોર્ટર'}
                    </td>
                    <td className="px-4 py-4">
                      {u.role === 'channel_head' ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full font-gujarati">
                          <Shield className="w-3 h-3 text-red-700" />
                          <span>ચેનલ હેડ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full font-gujarati">
                          <UserCheck className="w-3 h-3 text-slate-500" />
                          <span>સ્ટાફ રિપોર્ટર</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-xs text-slate-800">
                      {u.articles_count || 0} સમાચાર
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-gujarati ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status === 'active' ? 'સક્રિય (Active)' : 'નિષ્ક્રિય (Inactive)'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {u.role !== 'channel_head' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="text-xs font-bold font-gujarati inline-flex items-center gap-1 cursor-pointer"
                        >
                          {u.status === 'active' ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-emerald-600" />
                              <span className="text-slate-600 text-[11px]">બંધ કરો</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                              <span className="text-emerald-700 text-[11px]">સક્રિય કરો</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 font-gujarati mb-4">નવા પત્રકાર / સ્ટાફ સભ્ય ઉમેરો</h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">પૂરું નામ *</label>
                <input
                  type="text"
                  required
                  placeholder="દા.ત. સંજયભાઈ જોશી"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="reporter@samachardairy247.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">રોલ *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-gujarati"
                  >
                    <option value="staff">સ્ટાફ રિપોર્ટર (Staff)</option>
                    <option value="channel_head">મુખ્ય સંપાદક (Channel Head)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">હોદ્દો (Designation)</label>
                  <input
                    type="text"
                    placeholder="દા.ત. સુરત બ્યુરો ચીફ"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-gujarati"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">મોબાઇલ નંબર</label>
                <input
                  type="text"
                  placeholder="+91 98XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">પરિચય (Bio in Gujarati)</label>
                <textarea
                  rows={2}
                  placeholder="પત્રકારની વિશેષતા અને અનુભવ..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-gujarati"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold font-gujarati cursor-pointer"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold font-gujarati transition disabled:opacity-50"
                >
                  {submitting ? 'સેવ થઈ રહ્યું છે...' : 'પત્રકાર ઉમેરો'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
