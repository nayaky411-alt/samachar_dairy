import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { FolderTree, Plus, Edit, Trash2, Check, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export default function CategoriesManagerPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    name_gu: '',
    slug: '',
    color: '#991b1b',
    order: 0,
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    apiClient.get('/admin/categories')
      .then(res => {
        if (res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch(err => {
        console.error('Fetch categories error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await apiClient.put(`/admin/categories/${editingId}`, formData);
      } else {
        await apiClient.post('/admin/categories', formData);
      }
      setFormData({ name: '', name_gu: '', slug: '', color: '#991b1b', order: 0, is_active: true });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'કેટેગરી સેવ કરવામાં ક્ષતિ આવી.');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      name_gu: cat.name_gu,
      slug: cat.slug,
      color: cat.color || '#991b1b',
      order: cat.order || 0,
      is_active: !!cat.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', name_gu: '', slug: '', color: '#991b1b', order: 0, is_active: true });
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-red-700" />
          કેટેગરી મેનેજર (Categories Manager)
        </h1>
        <p className="text-xs text-slate-500 font-gujarati mt-0.5">
          સમાચાર કેટેગરીઝનું સંચાલન, ગુજરાતી અને અંગ્રેજી નામકરણ અને નેવિગેશન બારમાં પ્રદર્શન ક્રમ
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-gujarati">{error}</span>
        </div>
      )}

      {/* Category Create/Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 font-gujarati flex items-center gap-1.5">
          {editingId ? <Edit className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-red-700" />}
          <span>{editingId ? 'કેટેગરી સંપાદિત કરો (Edit Category)' : 'નવી કેટેગરી ઉમેરો (Add Category)'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">ગુજરાતી નામ *</label>
            <input
              type="text"
              required
              placeholder="દા.ત. શેરબજાર"
              value={formData.name_gu}
              onChange={(e) => setFormData({ ...formData, name_gu: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-gujarati focus:ring-2 focus:ring-red-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">English Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Stock Market"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Slug *</label>
            <input
              type="text"
              required
              placeholder="e.g. stock-market"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">ક્રમ (Order)</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold font-gujarati transition"
          >
            {editingId ? 'અપડેટ કરો' : 'સેવ કરો'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold font-gujarati transition"
            >
              રદ કરો
            </button>
          )}
        </div>
      </form>

      {/* Categories Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 font-gujarati">કુલ કેટેગરીઝ ({categories.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-gujarati">કેટેગરીઝ લોડ થઈ રહી છે...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-gujarati">ગુજરાતી નામ</th>
                  <th className="px-4 py-3">English Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3 font-gujarati">ક્રમ</th>
                  <th className="px-5 py-3 text-right font-gujarati">ક્રિયા</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900 font-gujarati text-sm">
                      {cat.name_gu}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-bold">
                      {cat.order || 0}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 text-slate-600 hover:text-blue-700 rounded-lg hover:bg-slate-100 transition"
                        title="સંપાદિત કરો"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
