'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaTachometerAlt, FaBell, FaSearch } from 'react-icons/fa';

interface DashboardHeaderProps {
  user: any;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const { colors } = useTheme();

  return (
    <div 
      className="p-6 rounded-xl border mb-6 transition-all duration-300"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaTachometerAlt className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-sm opacity-70">Here's what's happening with your account today.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title="Search"
          >
            <FaSearch className="w-4 h-4" />
          </button>
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
            title="Notifications"
          >
            <FaBell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
