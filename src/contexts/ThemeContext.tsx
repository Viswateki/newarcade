"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
  card: string;
  cardForeground: string;
  beige: string;
  beigeText: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Get theme colors based on current theme
  const getThemeColors = (): ThemeColors => {
    if (theme === 'dark') {
      return {
        background: '#0f1419', // Softer dark background
        foreground: '#f8f9fa', // Softer white instead of pure white
        muted: '#374151',
        accent: '#00bcd4', // Match aiarcade brand color
        border: '#374151',
        card: '#1a1f29', // Softer dark card
        cardForeground: '#e5e7eb',
        beige: '#f5f5dc',
        beigeText: '#2c2c2c'
      };
    }
    return {
      background: '#f8f9fa', // Even softer off-white background
      foreground: '#2d3748', // Softer dark gray instead of black
      muted: '#f1f3f4',
      accent: '#00bcd4', // Match aiarcade brand color
      border: '#e2e8f0',
      card: '#f7f8f9', // Very soft off-white card
      cardForeground: '#374151', // Soft dark gray text
      beige: '#2c2c2c',
      beigeText: '#f5f5dc'
    };
  };

  const colors = getThemeColors();

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Always render the provider, but handle mounting state internally
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
