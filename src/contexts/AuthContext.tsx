'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/auth';

interface User {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  $createdAt: string;
  $updatedAt: string;
  prefs?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  oAuthLogin: (provider: 'google' | 'github') => Promise<void>;
  checkUserExists: (email: string) => Promise<{ exists: boolean; isOAuthOnly: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      await authService.createAccount(email, password, name);
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const oAuthLogin = async (provider: 'google' | 'github') => {
    try {
      await authService.oAuthLogin(provider);
    } catch (error) {
      throw error;
    }
  };

  const checkUserExists = async (email: string) => {
    try {
      return await authService.checkUserExists(email);
    } catch (error) {
      return { exists: false, isOAuthOnly: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        oAuthLogin,
        checkUserExists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
