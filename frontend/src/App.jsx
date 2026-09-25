import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';

// Public Pages
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import GujaratNewsPage from './pages/GujaratNewsPage';
import CategoryPage from './pages/CategoryPage';
import MarketPage from './pages/MarketPage';
import VideosPage from './pages/VideosPage';
import VideoDetailPage from './pages/VideoDetailPage';
import ReelsPage from './pages/ReelsPage';
import GalleryPage from './pages/GalleryPage';
import SearchPage from './pages/SearchPage';
import AuthorPage from './pages/AuthorPage';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import { 
  EditorialPolicyPage, 
  CorrectionsPolicyPage, 
  PrivacyPolicyPage, 
  TermsPage, 
  AdvertisePage 
} from './pages/StaticPages';

// Admin Components & Layout
import AdminLayout from './components/admin/AdminLayout';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import CreateArticlePage from './pages/staff/CreateArticlePage';
import EditArticlePage from './pages/staff/EditArticlePage';
import StaffArticlesPage from './pages/staff/StaffArticlesPage';
import StaffMediaUploadPage from './pages/staff/StaffMediaUploadPage';
import StaffSubmitReelPage from './pages/staff/StaffSubmitReelPage';
import StaffSubmitVideoPage from './pages/staff/StaffSubmitVideoPage';
import StaffSubmitGalleryPage from './pages/staff/StaffSubmitGalleryPage';

// Channel Head Admin Pages
import ChannelHeadDashboard from './pages/admin/ChannelHeadDashboard';
import ApprovalQueuePage from './pages/admin/ApprovalQueuePage';
import AllArticlesPage from './pages/admin/AllArticlesPage';
import BreakingNewsManagerPage from './pages/admin/BreakingNewsManagerPage';
import CategoriesManagerPage from './pages/admin/CategoriesManagerPage';
import HomepageManagerPage from './pages/admin/HomepageManagerPage';
import AdsManagerPage from './pages/admin/AdsManagerPage';
import UsersManagerPage from './pages/admin/UsersManagerPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import SettingsPage from './pages/admin/SettingsPage';
import MarketSettingsPage from './pages/admin/MarketSettingsPage';
import ContactMessagesPage from './pages/admin/ContactMessagesPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireChannelHead = false }) => {
  const { user, token, loading, isChannelHead } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireChannelHead && !isChannelHead) {
    return <Navigate to="/admin/staff" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <SettingsProvider>
            <Routes>
            {/* Public News Portal Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:slug" element={<ArticleDetailPage />} />
            <Route path="/news/:slug" element={<ArticleDetailPage />} />
            <Route path="/news" element={<GujaratNewsPage />} />
            <Route path="/gujarat-news" element={<GujaratNewsPage />} />
            <Route path="/gujarat" element={<GujaratNewsPage />} />
            <Route path="/district/:slug" element={<GujaratNewsPage />} />
            <Route path="/gujarat/:slug" element={<GujaratNewsPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/videos/:slug" element={<VideoDetailPage />} />
            <Route path="/reels" element={<ReelsPage />} />
            <Route path="/galleries" element={<GalleryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/author/:slug" element={<AuthorPage />} />

            {/* Institutional & Policy Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
            <Route path="/corrections-policy" element={<CorrectionsPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/advertise" element={<AdvertisePage />} />

            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />

            {/* Staff Reporter Workspace (Accessible by Staff & Channel Head) */}
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboard />} />
              <Route path="create-news" element={<CreateArticlePage />} />
              <Route path="articles" element={<StaffArticlesPage />} />
              <Route path="articles/:id/edit" element={<EditArticlePage />} />
              <Route path="upload-media" element={<StaffMediaUploadPage />} />
              <Route path="submit-reel" element={<StaffSubmitReelPage />} />
              <Route path="submit-video" element={<StaffSubmitVideoPage />} />
              <Route path="submit-gallery" element={<StaffSubmitGalleryPage />} />
            </Route>

            {/* Channel Head Editorial Workspace (Strictly Channel Head Only) */}
            <Route
              path="/admin/channel-head"
              element={
                <ProtectedRoute requireChannelHead={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ChannelHeadDashboard />} />
              <Route path="approval-queue" element={<ApprovalQueuePage />} />
              <Route path="articles" element={<AllArticlesPage />} />
              <Route path="breaking" element={<BreakingNewsManagerPage />} />
              <Route path="categories" element={<CategoriesManagerPage />} />
              <Route path="homepage" element={<HomepageManagerPage />} />
              <Route path="advertisements" element={<AdsManagerPage />} />
              <Route path="users" element={<UsersManagerPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="activity-logs" element={<ActivityLogPage />} />
              <Route path="contact-messages" element={<ContactMessagesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="market-settings" element={<MarketSettingsPage />} />
            </Route>

            {/* Admin & Staff Dashboard Aliases */}
            <Route path="/admin" element={<Navigate to="/admin/channel-head" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin/channel-head" replace />} />
            <Route path="/admin/contact-messages" element={<Navigate to="/admin/channel-head/contact-messages" replace />} />
            <Route path="/admin/settings" element={<Navigate to="/admin/channel-head/settings" replace />} />
            <Route path="/admin/market-settings" element={<Navigate to="/admin/channel-head/market-settings" replace />} />
            <Route path="/staff" element={<Navigate to="/admin/staff" replace />} />
            <Route path="/staff/dashboard" element={<Navigate to="/admin/staff" replace />} />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </SettingsProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
