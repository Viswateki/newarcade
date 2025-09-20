'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/authService';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  type: string;
  arcadeCoins: number;
  firstName?: string;
  lastName?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  image?: string;
  isEmailVerified: boolean;
  usernameLastUpdatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, linkedinProfile?: string, githubProfile?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUserExists: (email: string) => Promise<{ exists: boolean }>;
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
      console.log('Checking authentication...');
      const currentUser = await authService.getCurrentUser();
      console.log('Current user:', currentUser);
      
      if (currentUser) {
        setUser(currentUser);
        console.log('User authenticated successfully');
      } else {
        console.log('No authenticated user found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ email, password });
      if (!result.success) {
        throw new Error(result.message);
      }
      if (result.user) {
        setUser(result.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string, linkedinProfile?: string, githubProfile?: string) => {
    try {
      const result = await authService.register({ 
        email, 
        password, 
        username, 
        linkedinProfile, 
        githubProfile 
      });
      if (!result.success) {
        throw new Error(result.message);
      }
      // Don't set user here since they need to verify email first
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force clear user state even if logout fails
      setUser(null);
    }
  };

  const checkUserExists = async (email: string) => {
    try {
      // Simple implementation - just return false for now since OAuth is disabled
      return { exists: false };
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      checkUserExists 
    }}>
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