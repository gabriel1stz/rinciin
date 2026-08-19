// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, SendOtpResult } from '../types/auth';
import { authService } from '../services/auth.service';
import { storage } from '../utils/storage';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<SendOtpResult>;
  verifyOtp: (phone: string, otp: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  loginWithOrder: (orderId: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserProfile = useCallback(async () => {
    try {
      const accessToken = storage.getAccessToken();
      if (!accessToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      if (accessToken === 'demo_jwt_token_local') {
        const localUser = storage.getUser();
        if (localUser) setUser(localUser);
        setIsLoading(false);
        return;
      }
      const fetchedUser = await authService.getMe();
      setUser(fetchedUser);
      storage.setUser(fetchedUser);
    } catch {
      storage.clearAuth();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  const sendOtp = async (phone: string): Promise<SendOtpResult> => {
    return await authService.sendOtp(phone);
  };

  const verifyOtp = async (phone: string, otp: string): Promise<User> => {
    const res = await authService.verifyOtp(phone, otp);
    storage.setAccessToken(res.accessToken);
    storage.setRefreshToken(res.refreshToken);
    storage.setUser(res.user);
    setUser(res.user);
    return res.user;
  };

  const loginWithGoogle = async (idToken: string): Promise<User> => {
    const res = await authService.googleLogin(idToken);
    storage.setAccessToken(res.accessToken);
    storage.setRefreshToken(res.refreshToken);
    storage.setUser(res.user);
    setUser(res.user);
    return res.user;
  };

  const loginWithOrder = async (orderId: string): Promise<User> => {
    const res = await authService.sessionFromOrderId(orderId);
    storage.setAccessToken(res.accessToken);
    storage.setRefreshToken(res.refreshToken);
    storage.setUser(res.user);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    const refreshToken = storage.getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (err) {
        console.warn('Logout API failed:', err);
      }
    }
    storage.clearAuth();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        loginWithOrder,
        logout,
        updateUser,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
