'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  api,
  setTokens,
  clearTokens,
  getAccessToken,
  getStoredRefreshToken,
  type User,
  type AuthResponse,
} from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setState((s) => ({ ...s, user: null, isAuthenticated: false, loading: false }));
      return;
    }
    try {
      const user = await api.auth.me();
      setState((s) => ({ ...s, user, isAuthenticated: true, loading: false }));
    } catch {
      clearTokens();
      setState((s) => ({ ...s, user: null, isAuthenticated: false, loading: false }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const stored = getStoredRefreshToken();
    if (!stored) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/auth/refresh`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${stored}` },
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AuthResponse | null) => {
        if (cancelled) return;
        if (data) {
          setTokens(data.accessToken, data.refreshToken);
          setState((s) => ({ ...s, user: data.user, isAuthenticated: true, loading: false }));
        } else {
          clearTokens();
          setState((s) => ({ ...s, user: null, isAuthenticated: false, loading: false }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTokens();
          setState((s) => ({ ...s, user: null, isAuthenticated: false, loading: false }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data: AuthResponse = await api.auth.login(email, password);
    setTokens(data.accessToken, data.refreshToken);
    setState((s) => ({
      ...s,
      user: data.user,
      isAuthenticated: true,
      loading: false,
    }));
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const data: AuthResponse = await api.auth.register(fullName, email, password);
      setTokens(data.accessToken, data.refreshToken);
      setState((s) => ({
        ...s,
        user: data.user,
        isAuthenticated: true,
        loading: false,
      }));
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      clearTokens();
      setState((s) => ({ ...s, user: null, isAuthenticated: false }));
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
