import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';
import { 
  Mail, 
  Search, 
  CheckCircle, 
  Clock, 
  Archive, 
  Trash2, 
  ExternalLink, 
  Phone, 
  User, 
  Calendar, 
  MessageSquare, 
  Send,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ new: 0, read: 0, replied: 0, archived: 0, total: 0 });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/contact-messages/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching message stats:', err);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get('/admin/contact-messages', { params });
      if (res.data?.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchMessages();
  }, [fetchStats, fetchMessages]);

  const openMessageModal = async (msg) => {
    try {
      const res = await apiClient.get(`/admin/contact-messages/${msg.id}`);
      if (res.data?.success) {
        setActiveMessage(res.data.data);
        setAdminNotes(res.data.data.admin_notes || '');
        // Update local list status to read if it was new
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
        fetchStats();
      }
    } catch {
      setActiveMessage(msg);
      setAdminNotes(msg.admin_notes || '');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!activeMessage) return;
    setActionLoading(true);
    try {
      const res = await apiClient.patch(`/admin/contact-messages/${activeMessage.id}/status`, {
        status: newStatus,
        admin_notes: adminNotes,
      });
      if (res.data?.success) {
        setActiveMessage(res.data.data);
        setMessages(prev => prev.map(m => m.id === activeMessage.id ? res.data.data : m));
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'સ્થિતિ બદલવામાં ક્ષતિ આવી.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('શું તમે ખરેખર આ સંદેશો ડિલીટ કરવા માંગો છો?')) return;
    try {
      const res = await apiClient.delete(`/admin/contact-messages/${id}`);
      if (res.data?.success) {
        if (activeMessage?.id === id) setActiveMessage(null);
        setMessages(prev => prev.filter(m => m.id !== id));
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'ડિલીટ કરવામાં ક્ષતિ આવી.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">નવો સંદેશ (New)</span>;
      case 'read':
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">વાંચેલો (Read)</span>;
      case 'replied':
        return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">જવાબ આપેલ (Replied)</span>;
      case 'archived':
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">આર્કાઇવ (Archived)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-red-700" />
            સંપર્ક સંદેશાઓ (Contact Messages)
          </h1>
          <p className="text-xs text-slate-500 font-gujarati mt-0.5">
            વેબસાઇટ સંપર્ક ફોર્મ દ્વારા વાચકો અને નાગરિકો તરફથી મળેલા સંદેશાઓનું સંચાલન
          </p>
        </div>

        <button
          onClick={() => { fetchStats(); fetchMessages(); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>રીફ્રેશ કરો</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            બધા ({stats.total})
          </button>

          <button
            onClick={() => setSelectedStatus('new')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedStatus === 'new'
                ? 'bg-red-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>નવા (New)</span>
            {stats.new > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                selectedStatus === 'new' ? 'bg-white text-red-700' : 'bg-red-600 text-white'
              }`}>
                {stats.new}
              </span>
            )}
          </button>

          <button
            onClick={() => setSelectedStatus('read')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatus === 'read'
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            વાંચેલા ({stats.read})
          </button>

          <button
            onClick={() => setSelectedStatus('replied')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatus === 'replied'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            જવાબ આપેલ ({stats.replied})
          </button>

          <button
            onClick={() => setSelectedStatus('archived')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedStatus === 'archived'
                ? 'bg-slate-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            આર્કાઇવ ({stats.archived})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="નામ, ઇમેઇલ, વિષય શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-red-600 outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">સંદેશાઓ લોડ થઈ રહ્યા છે...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 font-gujarati">કોઈ સંદેશ મળ્યો નથી</p>
            <p className="text-xs text-slate-400 mt-1 font-gujarati">
              {searchQuery ? 'શોધ પરિણામમાં કોઈ મેચિંગ સંદેશ નથી.' : 'પસંદ કરેલ કેટેગરીમાં હાલ કોઈ સંદેશ ઉપલબ્ધ નથી.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => openMessageModal(msg)}
                className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer ${
                  msg.status === 'new' ? 'bg-red-50/30' : ''
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-sm font-bold truncate ${
                      msg.status === 'new' ? 'text-red-950 font-black' : 'text-slate-900'
                    }`}>
                      {msg.name}
                    </span>
                    {getStatusBadge(msg.status)}
                    <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                    <span className="text-xs text-slate-500 truncate hidden sm:inline">{msg.email}</span>
                  </div>

                  <h3 className={`text-xs md:text-sm truncate ${
                    msg.status === 'new' ? 'font-bold text-slate-950' : 'text-slate-700'
                  }`}>
                    {msg.subject}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {msg.message}
                  </p>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 text-right">
                  <span className="text-[11px] text-slate-400">
                    {new Date(msg.created_at).toLocaleDateString('gu-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openMessageModal(msg)}
                      className="text-xs font-semibold text-red-700 hover:text-red-800"
                    >
                      જુઓ
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-900 font-gujarati">
                    {activeMessage.subject}
                  </h2>
                  {getStatusBadge(activeMessage.status)}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>પ્રાપ્ત તારીખ: {new Date(activeMessage.created_at).toLocaleString('gu-IN')}</span>
                </p>
              </div>

              <button
                onClick={() => setActiveMessage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Metadata Bar */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">પ્રેષક (Sender)</span>
                  <span className="font-bold text-slate-900">{activeMessage.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">ઇમેઇલ (Email)</span>
                  <a
                    href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                    className="font-bold text-blue-700 hover:underline truncate block"
                  >
                    {activeMessage.email}
                  </a>
                </div>
              </div>

              {activeMessage.phone && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">ફોન (Phone)</span>
                    <a href={`tel:${activeMessage.phone}`} className="font-bold text-emerald-700 hover:underline">
                      {activeMessage.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div className="p-6 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                સંદેશો (Full Message Content):
              </span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm leading-relaxed whitespace-pre-line font-gujarati">
                {activeMessage.message}
              </div>

              {/* Admin Internal Notes */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 font-gujarati">
                  આંતરિક સંપાદકીય નોંધ (Admin Internal Notes):
                </label>
                <textarea
                  rows={2}
                  placeholder="સંદેશ સંબંધિત કોઈ ખાસ નોંધ કે ફોલો-અપ વિગત..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-red-600 outline-none"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ઇમેઇલ દ્વારા જવાબ આપો (Reply)</span>
                </a>

                {activeMessage.phone && (
                  <a
                    href={`tel:${activeMessage.phone}`}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>કૉલ કરો</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeMessage.status !== 'replied' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('replied')}
                    className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>જવાબ અપાઈ ગયો (Mark Replied)</span>
                  </button>
                )}

                {activeMessage.status !== 'archived' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('archived')}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Archive className="w-3.5 h-3.5 text-slate-600" />
                    <span>આર્કાઇવ કરો</span>
                  </button>
                )}

                <button
                  disabled={actionLoading}
                  onClick={() => handleDelete(activeMessage.id)}
                  className="p-2 text-slate-400 hover:text-red-700 rounded-xl hover:bg-red-50 transition"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
