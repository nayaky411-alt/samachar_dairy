import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('samachar_user') || localStorage.getItem('samachar_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('samachar_token') || localStorage.getItem('samachar_token') || null;
  });
  const [loading, setLoading] = useState(true);

  // Synchronize localStorage session into this tab's sessionStorage if not already present
  useEffect(() => {
    const localToken = localStorage.getItem('samachar_token');
    const localUser = localStorage.getItem('samachar_user');
    if (localToken && !sessionStorage.getItem('samachar_token')) {
      sessionStorage.setItem('samachar_token', localToken);
    }
    if (localUser && !sessionStorage.getItem('samachar_user')) {
      sessionStorage.setItem('samachar_user', localUser);
    }
  }, []);

  useEffect(() => {
    if (token) {
      apiClient.get('/auth/me')
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.data.user);
            sessionStorage.setItem('samachar_user', JSON.stringify(res.data.data.user));
            localStorage.setItem('samachar_user', JSON.stringify(res.data.data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      // Prioritize sessionStorage for per-tab session isolation, and update localStorage for persistence
      sessionStorage.setItem('samachar_token', newToken);
      sessionStorage.setItem('samachar_user', JSON.stringify(userData));
      localStorage.setItem('samachar_token', newToken);
      localStorage.setItem('samachar_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      sessionStorage.removeItem('samachar_token');
      sessionStorage.removeItem('samachar_user');
      localStorage.removeItem('samachar_token');
      localStorage.removeItem('samachar_user');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      isChannelHead: user?.role === 'channel_head' || user?.is_channel_head === true,
      isStaff: user?.role === 'staff' || user?.is_staff === true,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
