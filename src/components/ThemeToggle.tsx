'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border transition-all duration-300 hover:scale-105"
      style={{ 
        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937'
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <FaSun className="w-4 h-4" />
      ) : (
        <FaMoon className="w-4 h-4" />
      )}
    </button>
  );
}
