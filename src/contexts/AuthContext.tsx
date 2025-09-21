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
  login: (email: string, password: string) => Promise<{ requiresVerification?: boolean; email?: string; showCode?: string }>;
  signup: (email: string, password: string, username: string, linkedinProfile?: string, githubProfile?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUserExists: (email: string) => Promise<{ exists: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session management helpers (client-side only)
const storeUserSession = (user: User): void => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Store user data
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    // Set session expiry for 7 days
    const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('auth_session_expiry', expiry.toString());
    
  } catch (error) {
    console.error('Error storing user session:', error);
  }
};

const clearUserSession = (): void => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_session_expiry');
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};

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
      
      if (currentUser) {
        setUser(currentUser);
        console.log('User authenticated successfully');
      } else {
        setUser(null);
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      if (result.success && result.user) {
        // Successful login
        setUser(result.user);
        
        // Store session in localStorage (client-side)
        storeUserSession(result.user);
        
        return {};
      } else if (result.requiresVerification) {
        // User exists but needs verification
        return { 
          requiresVerification: true, 
          email: result.email,
          showCode: result.showCode 
        };
      } else {
        // Login failed
        throw new Error(result.message);
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
      
      // Clear session from localStorage (client-side)
      clearUserSession();
      
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force clear user state and session even if logout fails
      clearUserSession();
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