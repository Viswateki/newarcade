'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import NavigationWrapper from '@/components/NavigationWrapper';
import DashboardContent from '@/dashboard/DashboardContent';
import { useTheme } from '@/contexts/ThemeContext';

export default function Dashboard() {
  const { colors } = useTheme();

  return (
    <ProtectedRoute>
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: colors.background }}
      >
        <NavigationWrapper />
        <DashboardContent />
      </div>
    </ProtectedRoute>
  );
}
