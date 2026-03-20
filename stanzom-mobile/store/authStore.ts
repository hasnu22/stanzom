import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  mobileNumber: string;
  name?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  favoriteTeamId?: string;
  favoriteSportId?: string;
  seasonPoints?: number;
  seasonAccuracy?: number;
  activeDays?: number;
  referralCode?: string;
  isInfluencer?: boolean;
  sportPreferences?: string[];
  accuracy?: number;
  totalPoints?: number;
  rank?: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  login: (user: User, tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({ user, isAuthenticated: true, isLoading: false }),

  login: async (user, tokens) => {
    await SecureStore.setItemAsync('accessToken', String(tokens.accessToken));
    await SecureStore.setItemAsync('refreshToken', String(tokens.refreshToken));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
