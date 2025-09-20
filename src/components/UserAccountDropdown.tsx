'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogIn,
  UserPlus,
  ChevronDown,
  LogOut,
  Settings,
  LayoutDashboard
} from 'lucide-react';

interface UserAccountDropdownProps {
  className?: string;
}

export function UserAccountDropdown({ className = '' }: UserAccountDropdownProps) {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Menu items for guests
  const guestMenuItems = [
    {
      icon: LogIn,
      label: 'Sign In',
      href: '/login'
    },
    {
      icon: UserPlus,
      label: 'Sign Up',
      href: '/signup'
    }
  ];

  // Menu items for authenticated users
  const userMenuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        style={{ color: colors.foreground }}
      >
        <User className="w-4 h-4" />
        <span>{user ? (user.name || user.username) : 'Account'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border py-2 z-50"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          {user ? (
            <>
              {/* User info header */}
              <div className="px-4 py-3 border-b" style={{ borderColor: colors.border }}>
                <div className="font-semibold">{user.name || user.username}</div>
                <div className="text-sm opacity-70">{user.email}</div>
              </div>
              
              {/* User menu items */}
              {userMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ color: colors.foreground }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left border-t mt-2 pt-3"
                style={{ color: colors.foreground, borderColor: colors.border }}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            /* Guest menu items */
            guestMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ color: colors.foreground }}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))
          )}
        </div>
      )}
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default UserAccountDropdown;