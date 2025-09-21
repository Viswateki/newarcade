'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  LayoutDashboard,
  Mail
} from 'lucide-react';

interface ImprovedUserDropdownProps {
  className?: string;
}

export function ImprovedUserDropdown({ className = '' }: ImprovedUserDropdownProps) {
  const { colors, theme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function for consistent hover styles
  const getHoverHandlers = (isLogout = false) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      if (isLogout) {
        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#330000' : '#fef2f2';
        e.currentTarget.style.color = theme === 'dark' ? '#ff6b6b' : '#dc2626';
      } else {
        e.currentTarget.style.backgroundColor = colors.muted;
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      if (isLogout) {
        e.currentTarget.style.color = colors.foreground;
      }
    }
  });

  // Utility function to truncate email
  const truncateEmail = (email: string, maxLength: number = 30) => {
    if (!email) return '';
    if (email.length <= maxLength) return email;
    
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    
    const maxLocalLength = Math.floor(maxLength * 0.6);
    const maxDomainLength = maxLength - maxLocalLength - 1; // -1 for @
    
    const truncatedLocal = localPart.length > maxLocalLength 
      ? `${localPart.substring(0, maxLocalLength - 3)}...`
      : localPart;
    
    const truncatedDomain = domain.length > maxDomainLength
      ? `...${domain.substring(domain.length - maxDomainLength + 3)}`
      : domain;
    
    return `${truncatedLocal}@${truncatedDomain}`;
  };

  // Get user initials for avatar
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Menu items for guests
  const guestMenuItems = [
    {
      icon: LogIn,
      label: 'Sign In',
      href: '/login',
      description: 'Access your account'
    },
    {
      icon: UserPlus,
      label: 'Sign Up',
      href: '/signup',
      description: 'Create a new account'
    }
  ];

  // Menu items for authenticated users
  const userMenuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
      description: 'View your dashboard'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      description: 'Manage your account'
    }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent"
        style={{ color: colors.foreground }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.muted;
          e.currentTarget.style.borderColor = colors.border;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        {user ? (
          <>
            {/* User Avatar */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ backgroundColor: colors.accent }}
            >
              {getUserInitials(user.name || user.username, user.email)}
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="truncate max-w-32">{user.name || user.username}</span>
            </div>
          </>
        ) : (
          <>
            <User className="w-5 h-5" />
            <span>Account</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border backdrop-blur-sm py-2 z-50 animate-in slide-in-from-top-2 duration-200"
          style={{ 
            backgroundColor: `${colors.card}f0`, // Add some transparency
            borderColor: colors.border,
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)'
          }}
        >
          {user ? (
            <>
              {/* Enhanced User info header */}
              <div className="px-4 py-4 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: colors.accent }}
                  >
                    {getUserInitials(user.name || user.username, user.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate" title={user.name || user.username}>
                      {user.name || user.username}
                    </div>
                    <div 
                      className="text-xs opacity-70 flex items-center gap-1 mt-1"
                      title={user.email}
                    >
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {truncateEmail(user.email || '', 28)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced User menu items */}
              <div className="py-2">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 group"
                    style={{ color: colors.foreground }}
                    {...getHoverHandlers(false)}
                  >
                    <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-60">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Enhanced Logout button */}
              <div className="border-t pt-2" style={{ borderColor: colors.border }}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 w-full text-left group"
                  style={{ color: colors.foreground }}
                  {...getHoverHandlers(true)}
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs opacity-60">End your session</div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            /* Enhanced Guest menu items */
            <div className="py-2">
              {guestMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 group"
                  style={{ color: colors.foreground }}
                  {...getHoverHandlers(false)}
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-60">{item.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImprovedUserDropdown;