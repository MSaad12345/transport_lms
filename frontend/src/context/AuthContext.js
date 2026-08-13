'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const res = await api.me();
      setUser(res.data);
      return res.data;
    } catch {
      api.setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email, password) => {
      const res = await api.login(email, password);
      api.setToken(res.data.token);
      setUser(res.data.user);
      showToast(`Welcome, ${res.data.user.name.split(' ')[0]}`);
      router.push('/dashboard');
      return res.data.user;
    },
    [router, showToast]
  );

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
    router.push('/login');
    showToast('Signed out');
  }, [router, showToast]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser,
      showToast,
      toast,
      isAuthenticated: !!user,
    }),
    [user, loading, login, logout, refreshUser, showToast, toast]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm animate-[fadeIn_0.2s_ease]">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${
              toast.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
