import { create } from 'zustand';
import type { Admin } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  admin: null,
  token: localStorage.getItem('stanzom_admin_token'),
  isAuthenticated: false,
  isLoading: true,
  isSuperAdmin: false,

  login: async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const { admin, token } = response.data;
    localStorage.setItem('stanzom_admin_token', token);
    set({
      admin,
      token,
      isAuthenticated: true,
      isSuperAdmin: admin.role === 'SUPER_ADMIN',
    });
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('stanzom_admin_token');
      set({
        admin: null,
        token: null,
        isAuthenticated: false,
        isSuperAdmin: false,
      });
    }
  },

  checkAuth: async () => {
    const { token } = get();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const response = await authService.getMe();
      const admin = response.data;
      set({
        admin,
        isAuthenticated: true,
        isSuperAdmin: admin.role === 'SUPER_ADMIN',
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('stanzom_admin_token');
      set({
        admin: null,
        token: null,
        isAuthenticated: false,
        isSuperAdmin: false,
        isLoading: false,
      });
    }
  },
}));
