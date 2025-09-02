'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
  FaBlog, 
  FaTools, 
  FaTachometerAlt, 
  FaUser, 
  FaBell, 
  FaSearch,
  FaSignOutAlt,
  FaPlus,
  FaBookOpen,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

interface AuthenticatedNavProps {
  user: any;
}

export default function AuthenticatedNav({ user }: AuthenticatedNavProps) {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems = [
    { label: 'Home', href: '/', icon: FaHome },
    { label: 'Dashboard', href: '/dashboard', icon: FaTachometerAlt },
    { label: 'Blogs', href: '/blogs', icon: FaBlog },
    { label: 'Tools', href: '/tools', icon: FaTools },
  ];

  const quickActions = [
    { label: 'Write Blog', href: '/create-blog', icon: FaPlus },
    { label: 'Submit Tool', href: '/submit-tool', icon: FaTools },
  ];

  return (
    <nav 
      className="sticky top-0 z-50 backdrop-blur-lg border-b transition-all duration-300"
      style={{ 
        backgroundColor: `${colors.background}95`, 
        borderColor: colors.border 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/logo.svg" alt="DevTools Hub" />
              <span className="ml-2 text-xl font-bold" style={{ color: colors.foreground }}>
                DevTools Hub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ color: colors.foreground }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white transition-colors duration-200"
                  style={{ backgroundColor: colors.accent }}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Link>
              ))}
            </div>

            {/* Search */}
            <button className="p-2 rounded-md transition-colors duration-200">
              <FaSearch className="w-4 h-4" style={{ color: colors.foreground }} />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-md transition-colors duration-200 relative">
              <FaBell className="w-4 h-4" style={{ color: colors.foreground }} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-md transition-colors duration-200"
                style={{ color: colors.foreground }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: colors.accent }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.name || 'User'}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg border z-50"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 border-b" style={{ borderColor: colors.border }}>
                      <p className="text-sm font-medium" style={{ color: colors.foreground }}>
                        {user?.name}
                      </p>
                      <p className="text-xs opacity-70" style={{ color: colors.foreground }}>
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm hover:bg-opacity-10"
                      style={{ color: colors.foreground }}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaTachometerAlt className="w-4 h-4 mr-3" />
                      Dashboard
                    </Link>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm hover:bg-opacity-10"
                      style={{ color: colors.foreground }}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md"
                style={{ color: colors.foreground }}
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="w-5 h-5" />
                ) : (
                  <FaBars className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: colors.border }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium"
                  style={{ color: colors.foreground }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t pt-2" style={{ borderColor: colors.border }}>
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium"
                    style={{ color: colors.accent }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <action.icon className="w-5 h-5 mr-3" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
