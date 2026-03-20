import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, login, logout: storeLogout, updateUser } =
    useAuthStore();

  const sendOtp = useCallback(async (mobileNumber: string) => {
    const response = await api.post('/api/auth/send-otp', { mobileNumber });
    return response.data;
  }, []);

  const verifyOtp = useCallback(
    async (mobileNumber: string, otp: string) => {
      const response = await api.post('/api/auth/verify-otp', { mobileNumber, otp });
      const payload = response.data?.data ?? response.data;
      const { user: userData, accessToken, refreshToken } = payload;
      await login(userData, { accessToken, refreshToken });
      return userData;
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Proceed with local logout even if API call fails
    }
    await storeLogout();
  }, [storeLogout]);

  const refreshSession = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        useAuthStore.setState({ isLoading: false });
        return false;
      }

      const res = await api.get('/api/auth/me');
      const payload = res.data.data ?? res.data;
      setUser(payload.user);
      return true;
    } catch {
      useAuthStore.setState({ isLoading: false, isAuthenticated: false, user: null });
      return false;
    }
  }, [setUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    sendOtp,
    verifyOtp,
    logout,
    refreshSession,
    updateUser,
  };
};
