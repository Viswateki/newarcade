'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Dashboard() {
  const { colors } = useTheme();

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background, color: colors.foreground }}
    >
      {/* Dashboard content will be added later */}
    </div>
  );
}