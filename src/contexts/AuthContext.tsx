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
  social_links?: string | object;
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
  refreshUser: () => Promise<void>;
  forceRefreshUser: () => Promise<void>;
  clearUserCache: () => void;
  updateUserInContext: (updatedUserData: Partial<User>) => void;
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
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...');
      
      // First, try to get user from localStorage directly for faster response
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('auth_user');
        const sessionExpiry = localStorage.getItem('auth_session_expiry');
        
        console.log('🔍 localStorage check:', {
          hasAuthUser: !!storedUser,
          hasSessionExpiry: !!sessionExpiry
        });
        
        // If we have valid stored data, set user immediately
        if (storedUser && sessionExpiry) {
          try {
            const expiryTime = parseInt(sessionExpiry);
            const currentTime = Date.now();
            
            if (currentTime <= expiryTime) {
              const user = JSON.parse(storedUser);
              console.log('✅ Setting user from localStorage immediately:', user.email);
              setUser(user);
              setLoading(false);
              return; // Exit early if we have valid cached data
            } else {
              console.log('❌ Session expired, clearing storage');
              localStorage.removeItem('auth_user');
              localStorage.removeItem('auth_session_expiry');
            }
          } catch (e) {
            console.log('❌ Error parsing stored session, clearing');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_session_expiry');
          }
        }
      }
      
      // If no valid cached data, check with authService
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        console.log('✅ User authenticated via authService:', currentUser.email);
        setUser(currentUser);
      } else {
        console.log('❌ No authenticated user found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log('🏁 Auth check completed, loading set to false');
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
        console.log('✅ Login successful, setting user:', result.user);
        setUser(result.user);
        
        // Store session in localStorage (client-side) - authService already did this, but let's be sure
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
      // Use the API route instead of calling authService directly
      // This ensures the verification email is sent
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          linkedinProfile: linkedinProfile || '',
          githubProfile: githubProfile || '',
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Signup failed');
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

  const refreshUser = async () => {
    try {
      // Prevent too frequent refreshes (minimum 5 seconds between refreshes)
      const now = Date.now();
      if (now - lastRefresh < 5000) {
        console.log('⏭️ User data refresh skipped (too frequent)');
        return;
      }
      
      console.log('🔄 Refreshing user data from database...');
      
      // Get fresh user data by calling the API instead of using cached data
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📡 API response:', result);
        
        if (result.success && result.user) {
          console.log('✅ Fresh user data received:', result.user);
          setUser(result.user);
          storeUserSession(result.user);
          setLastRefresh(now);
        } else if (result.success && result.authenticated === false) {
          // Only log out if the API explicitly says the user is not authenticated
          console.log('⚠️ User not authenticated according to API - logging out');
          setUser(null);
          clearUserSession();
        } else {
          console.log('❌ No user data found in API response - keeping current user');
          // Don't clear user state if API response is unclear
        }
      } else if (response.status === 501) {
        // API endpoint is disabled - this is expected, don't log out user
        console.log('⚠️ API endpoint disabled, keeping current user session');
        return;
      } else {
        console.log('❌ API call failed with status:', response.status);
        // Don't clear user state on API failure - keep current user logged in
      }
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      // Don't clear user state on error - keep current user logged in
    }
  };

  const forceRefreshUser = async () => {
    try {
      console.log('🔄 Force refreshing user data (bypassing throttle)...');
      
      // Clear any cached user data first
      clearUserCache();
      
      // Force fresh API call without cache
      const response = await fetch('/api/auth/me?' + new URLSearchParams({
        t: Date.now().toString() // Cache bust parameter
      }), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📡 Force refresh API response:', result);
        
        if (result.success && result.user) {
          console.log('✅ Fresh user data received via force refresh:', result.user);
          setUser(result.user);
          storeUserSession(result.user);
          setLastRefresh(Date.now());
        } else if (result.success && result.authenticated === false) {
          // Only log out if the API explicitly says the user is not authenticated
          console.log('⚠️ User not authenticated according to API - logging out');
          setUser(null);
          clearUserSession();
        } else {
          console.log('❌ No user data found in force refresh API response - keeping current user');
          // Don't clear user state if API response is unclear
        }
      } else {
        console.log('❌ Force refresh API call failed with status:', response.status);
        // Don't clear user state on API failure - keep current user logged in
      }
    } catch (error) {
      console.error('❌ Failed to force refresh user data:', error);
      // Don't clear user state on error - keep current user logged in
    }
  };

  const clearUserCache = () => {
    try {
      console.log('🧹 Clearing user cache...');
      clearUserSession();
      setLastRefresh(0); // Reset throttling
    } catch (error) {
      console.error('❌ Failed to clear user cache:', error);
    }
  };

  const updateUserInContext = (updatedUserData: Partial<User>) => {
    try {
      if (!user) {
        console.log('⚠️ Cannot update user context - no current user');
        return;
      }

      console.log('🔄 Updating user in context with data:', updatedUserData);
      
      // Merge the updated data with current user data
      const updatedUser = {
        ...user,
        ...updatedUserData
      };

      // Update the context state
      setUser(updatedUser);
      
      // Update the stored session
      storeUserSession(updatedUser);
      
      console.log('✅ User context updated successfully');
    } catch (error) {
      console.error('❌ Failed to update user in context:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      checkUserExists,
      refreshUser,
      forceRefreshUser,
      clearUserCache,
      updateUserInContext
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