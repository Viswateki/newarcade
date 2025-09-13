'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NewNavigationMenu } from './NewNavigationMenu';

// Simple skeleton for navigation while loading
function NavigationSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between w-full px-4 py-4">
        {/* Logo skeleton */}
        <div className="h-8 w-20 bg-gray-200/20 dark:bg-gray-700/20 rounded-md animate-pulse"></div>
        
        {/* Center menu skeleton */}
        <div className="hidden md:flex space-x-6">
          <div className="h-6 w-16 bg-gray-200/20 dark:bg-gray-700/20 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200/20 dark:bg-gray-700/20 rounded animate-pulse"></div>
          <div className="h-6 w-18 bg-gray-200/20 dark:bg-gray-700/20 rounded animate-pulse"></div>
        </div>
        
        {/* Account skeleton */}
        <div className="h-8 w-16 bg-gray-200/20 dark:bg-gray-700/20 rounded animate-pulse"></div>
      </div>
    </nav>
  );
}

export default function NavigationWrapper() {
  const { user, loading } = useAuth();
  const { theme, colors } = useTheme();

  // Show skeleton while loading instead of null
  if (loading) {
    return <NavigationSkeleton />;
  }

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <NewNavigationMenu />
    </nav>
  );
}
