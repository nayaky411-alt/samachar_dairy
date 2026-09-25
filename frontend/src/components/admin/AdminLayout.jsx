import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, ExternalLink, LogOut, Shield, User as UserIcon } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const AdminLayout = () => {
  const { user, isChannelHead, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith('/admin/staff');

  useEffect(() => {
    if (isChannelHead) {
      apiClient.get('/admin/approval-queue')
        .then(res => {
          if (res.data.success) {
            setPendingCount(res.data.data.counts?.total || 0);
          }
        })
        .catch(() => {});
    }
  }, [isChannelHead]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 1. Admin Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="bg-red-700 text-white text-xs font-black px-2 py-0.5 rounded">
                સમાચાર ડેરી
              </span>
              <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                {isStaffRoute ? 'સ્ટાફ રિપોર્ટર પોર્ટલ (Staff Portal)' : 'મુખ્ય સંપાદક કંટ્રોલ રૂમ (Channel Head)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Workspace Switcher for Channel Head */}
            {isChannelHead && (
              <div className="hidden md:flex items-center gap-1 bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/60 text-xs">
                <Link
                  to="/admin/channel-head"
                  className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                    !isStaffRoute
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title="મુખ્ય સંપાદક કંટ્રોલ રૂમ"
                >
                  <span>🛡️ સંપાદક CMS</span>
                </Link>

                <Link
                  to="/admin/staff"
                  className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                    isStaffRoute
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title="સ્ટાફ રિપોર્ટર પોર્ટલ"
                >
                  <span>✍️ સ્ટાફ પોર્ટલ</span>
                </Link>

                <a
                  href={isStaffRoute ? "/admin/channel-head" : "/admin/staff"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-1.5 py-1 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded-md transition"
                  title="નવી ટેબમાં સાથે ખોલો (Open other workspace in New Tab)"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            <Link
              to="/"
              target="_blank"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors"
            >
              <span>લાઇવ સાઇટ જુઓ</span>
              <ExternalLink size={12} />
            </Link>

            {/* Notification Indicator */}
            {isChannelHead && pendingCount > 0 && (
              <Link
                to="/admin/channel-head/approval-queue"
                className="relative p-1.5 rounded-full hover:bg-slate-800 text-amber-400"
                title={`${pendingCount} pending submissions`}
              >
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
              </Link>
            )}

            {/* User Profile Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
              <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center font-bold">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-bold text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{user?.designation || user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar pendingCount={pendingCount} />
        </div>

        {/* Mobile Slide-Over Sidebar Drawer */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="relative z-10 w-72 bg-white h-full shadow-2xl">
              <AdminSidebar pendingCount={pendingCount} onClose={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
