import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  PlusCircle,
  Flame,
  FolderTree,
  Sliders,
  Megaphone,
  BarChart3,
  Users,
  Settings,
  History,
  TrendingUp,
  Image as ImageIcon,
  Film,
  Camera,
  ExternalLink,
  ArrowRight,
  Shield,
  PenSquare,
  Mail,
} from 'lucide-react';
import { Youtube } from '../common/BrandIcons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const AdminSidebar = ({ pendingCount = 0, onClose }) => {
  const { isChannelHead } = useAuth();
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith('/admin/staff');
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (isChannelHead) {
      apiClient.get('/admin/contact-messages/stats')
        .then(res => {
          if (res.data?.success && res.data.data?.new !== undefined) {
            setUnreadMessages(res.data.data.new);
          }
        })
        .catch(() => {});
    }
  }, [isChannelHead, location.pathname]);

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-red-700 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
      {/* Brand in Sidebar */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-red-700 text-white font-black text-lg px-2 py-0.5 rounded">
            ડેરી
          </span>
          <div>
            <span className="font-black text-base text-slate-900 block leading-tight">
              {isStaffRoute ? 'પત્રકાર પોર્ટલ' : 'મુખ્ય સંપાદક CMS'}
            </span>
            {isChannelHead && isStaffRoute && (
              <span className="text-[10px] text-red-700 font-bold block leading-tight">
                (Channel Head Access)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Channel Head Dual Workspace Switcher */}
      {isChannelHead && (
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1 flex items-center justify-between">
            <span>કાર્યસ્થળ સ્વિચર (Workspace)</span>
            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Admin</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <Link
              to="/admin/channel-head"
              className={`text-center py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                !isStaffRoute
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
              onClick={onClose}
              title="મુખ્ય સંપાદક કંટ્રોલ રૂમ"
            >
              <span className="text-xs">🛡️ મુખ્ય સંપાદક</span>
              <span className="text-[10px] opacity-80">(Channel Head)</span>
            </Link>

            <Link
              to="/admin/staff"
              className={`text-center py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                isStaffRoute
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
              onClick={onClose}
              title="પત્રકાર કાર્યસ્થળ (Staff Workspace)"
            >
              <span className="text-xs">✍️ પત્રકાર પોર્ટલ</span>
              <span className="text-[10px] opacity-80">(Staff View)</span>
            </Link>
          </div>

          {/* Quick Dual-Window / Tab Launcher */}
          <div className="mt-2 flex items-center justify-between px-1">
            <a
              href={isStaffRoute ? "/admin/channel-head" : "/admin/staff"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-red-700 hover:text-red-800 font-bold flex items-center gap-1 hover:underline"
              title="બીજી ટેબ અથવા વિન્ડોમાં એકસાથે ખોલો"
            >
              <ExternalLink size={12} />
              <span>{isStaffRoute ? 'નવી ટેબમાં ચેનલ હેડ ખોલો' : 'નવી ટેબમાં સ્ટાફ પોર્ટલ ખોલો'}</span>
            </a>
          </div>
        </div>
      )}

      {/* Navigation Links based on active route */}
      <div className="p-3 space-y-1 flex-1">
        {isStaffRoute ? (
          /* Staff Reporter Links */
          <>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              પત્રકાર કાર્યસ્થળ (Staff Workspace)
            </div>
            <NavLink to="/admin/staff" end className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={18} />
                <span>મારું ડેશબોર્ડ (Dashboard)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/staff/create-news" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5 text-red-700 font-bold">
                <PlusCircle size={18} />
                <span>નવા સમાચાર લખો (Create)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/staff/articles" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <FileText size={18} />
                <span>મારા ડ્રાફ્ટ્સ & અહેવાલ</span>
              </div>
            </NavLink>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3 py-1">
              મીડિયા સબમિશન
            </div>
            <NavLink to="/admin/staff/upload-media" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <ImageIcon size={18} />
                <span>મીડિયા અપલોડ (Uploads)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/staff/submit-reel" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <Film size={18} />
                <span>રીલ સબમિટ કરો (Reel)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/staff/submit-video" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <Youtube size={18} />
                <span>યૂટ્યુબ વિડીયો (YouTube)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/staff/submit-gallery" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <Camera size={18} />
                <span>ફોટો ગેલેરી (Gallery)</span>
              </div>
            </NavLink>
          </>
        ) : (
          /* Channel Head Editorial Links */
          <>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              સંપાદકીય નિયંત્રણ (Editorial)
            </div>
            <NavLink to="/admin/channel-head" end className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={18} />
                <span>ડેશબોર્ડ (Dashboard)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/channel-head/approval-queue" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <CheckSquare size={18} />
                <span>મંજૂરી કતાર (Approval)</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </NavLink>

            <NavLink to="/admin/channel-head/articles" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <FileText size={18} />
                <span>તમામ સમાચાર (Articles)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/channel-head/breaking" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <Flame size={18} className="text-red-500" />
                <span>બ્રેકિંગ ન્યૂઝ (Breaking)</span>
              </div>
            </NavLink>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3 py-1">
              સાઇટ મેનેજમેન્ટ (CMS)
            </div>
            <NavLink to="/admin/channel-head/categories" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <FolderTree size={18} />
                <span>કેટેગરીઝ (Categories)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/channel-head/homepage" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <Sliders size={18} />
                <span>હોમપેજ ક્રમ (Layout CMS)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/channel-head/advertisements" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <Megaphone size={18} />
                <span>જાહેરાતો (Ads Manager)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/channel-head/users" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <Users size={18} />
                <span>સ્ટાફ & પત્રકારો (Users)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/channel-head/contact-messages" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <Mail size={18} />
                <span>સંપર્ક સંદેશાઓ (Messages)</span>
              </div>
              {unreadMessages > 0 && (
                <span className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 rounded-full">
                  {unreadMessages}
                </span>
              )}
            </NavLink>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3 py-1">
              વિશ્લેષણ & સેટિંગ્સ
            </div>
            <NavLink to="/admin/channel-head/analytics" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <BarChart3 size={18} />
                <span>એનાલિટિક્સ (Analytics)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/channel-head/activity-logs" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <History size={18} />
                <span>ઓડિટ લોગ (Audit Trail)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/channel-head/market-settings" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <TrendingUp size={18} />
                <span>માર્કેટ સેટિંગ્સ (Market Settings)</span>
              </div>
            </NavLink>

            <NavLink to="/admin/channel-head/settings" className={linkClass} onClick={onClose}>
              <div className="flex items-center gap-2.5">
                <Settings size={18} />
                <span>સેટિંગ્સ (Settings)</span>
              </div>
            </NavLink>
          </>
        )}
      </div>

      {/* Bottom Switcher Callout for Channel Head */}
      {isChannelHead && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 mt-auto">
          {isStaffRoute ? (
            <div>
              <div className="text-[11px] text-slate-600 mb-2">
                <span className="font-bold text-slate-800">સંપાદકીય કંટ્રોલ:</span> સમાચાર ચકાસણી અથવા પબ્લિશ કરવા મુખ્ય CMS પર પાછા જાઓ.
              </div>
              <Link
                to="/admin/channel-head"
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                <span>મુખ્ય સંપાદક CMS ખોલો</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div>
              <div className="text-[11px] text-slate-600 mb-2">
                <span className="font-bold text-slate-800">પત્રકાર મોડ:</span> જાતે સમાચાર લખવા અથવા રીલ/વીડિયો સબમિટ કરવા સ્ટાફ પોર્ટલ વાપરો.
              </div>
              <div className="flex gap-2">
                <Link
                  to="/admin/staff"
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition"
                >
                  <span>સ્ટાફ પોર્ટલ</span>
                </Link>
                <a
                  href="/admin/staff"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition flex items-center justify-center"
                  title="નવી ટેબમાં ખોલો જેથી બંને સાથે ચલાવી શકાય"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
