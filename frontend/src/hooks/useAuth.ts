'use client';
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) { setIsLoading(false); return; }
    try {
      const res = await authApi.getMe();
      setUser(res.data.data);
    } catch (_) {
      Cookies.remove('token');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token, user: userData } = res.data.data;
    Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
    localStorage.setItem('token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/admin/login';
  }, []);

  return { user, isLoading, isAuthenticated: !!user, login, logout };
}
