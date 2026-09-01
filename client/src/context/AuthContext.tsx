import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Worker, AppNotification } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  worker: Worker | null;
  token: string | null;
  isLoading: boolean;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedCommunityId: string;
  setSelectedCommunityId: (id: string) => void;
  notifications: AppNotification[];
  unreadNotifsCount: number;
  login: (email: string, pass: string) => Promise<void>;
  demoLogin: (persona: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAllNotifsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sahakari_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Region and Community selection
  const [selectedRegionId, setSelectedRegionId] = useState<string>('reg-cbe');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('comm-cbe-2');

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  const refreshUserData = async () => {
    try {
      if (localStorage.getItem('sahakari_token')) {
        const data = await api.auth.getMe();
        setUser(data.user);
        setWorker(data.worker);
        if (data.user.region_id) setSelectedRegionId(data.user.region_id);
        if (data.user.community_id) setSelectedCommunityId(data.user.community_id);
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to restore user session', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!localStorage.getItem('sahakari_token')) return;
      const data = await api.notifications.getAll();
      setNotifications(data.notifications || []);
      setUnreadNotifsCount(data.unreadCount || 0);
    } catch (err) {
      // ignore
    }
  };

  const markAllNotifsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setUnreadNotifsCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  useEffect(() => {
    // If no token exists on startup, default to Priya Raman demo customer for instant preview!
    if (!token) {
      demoLogin('priya');
    } else {
      refreshUserData();
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(email, pass);
      localStorage.setItem('sahakari_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setWorker(data.worker);
      if (data.user.region_id) setSelectedRegionId(data.user.region_id);
      if (data.user.community_id) setSelectedCommunityId(data.user.community_id);
      fetchNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (persona: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.demoLogin(persona);
      localStorage.setItem('sahakari_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setWorker(data.worker);
      if (data.user.region_id) setSelectedRegionId(data.user.region_id);
      if (data.user.community_id) setSelectedCommunityId(data.user.community_id);
      fetchNotifications();
    } catch (err) {
      console.error('Demo login error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sahakari_token');
    setToken(null);
    setUser(null);
    setWorker(null);
    setNotifications([]);
    setUnreadNotifsCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        worker,
        token,
        isLoading,
        selectedRegionId,
        setSelectedRegionId,
        selectedCommunityId,
        setSelectedCommunityId,
        notifications,
        unreadNotifsCount,
        login,
        demoLogin,
        logout,
        refreshUserData,
        fetchNotifications,
        markAllNotifsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
