'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  User, 
  CreditCard, 
  Bell, 
  LogOut, 
  Crown,
  ChevronDown 
} from 'lucide-react';

interface UserAccountDropdownProps {
  className?: string;
}

export function UserAccountDropdown({ className = '' }: UserAccountDropdownProps) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      icon: Crown,
      label: 'Upgrade to Pro',
      action: () => console.log('Upgrade clicked'),
      highlight: true
    },
    {
      icon: User,
      label: 'Account',
      action: () => console.log('Account clicked')
    },
    {
      icon: CreditCard,
      label: 'Billing',
      action: () => console.log('Billing clicked')
    },
    {
      icon: Bell,
      label: 'Notifications',
      action: () => console.log('Notifications clicked')
    },
    {
      icon: LogOut,
      label: 'Log out',
      action: handleLogout,
      danger: true
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* User Account Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-opacity-80"
        style={{ 
          backgroundColor: colors.card,
          color: colors.foreground 
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* User Avatar */}
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ 
              backgroundColor: colors.accent,
              color: colors.background 
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          {/* User Info */}
          <div className="flex flex-col items-start text-left">
            <span className="font-medium text-sm">{user.name}</span>
            <span 
              className="text-xs opacity-70"
              style={{ color: colors.foreground }}
            >
              {user.email}
            </span>
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div 
            className="absolute bottom-full left-0 mb-2 w-64 rounded-lg shadow-lg border z-50 py-2"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border 
            }}
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                  style={{ 
                    backgroundColor: colors.accent,
                    color: colors.background 
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium" style={{ color: colors.foreground }}>
                    {user.name}
                  </div>
                  <div 
                    className="text-sm opacity-70"
                    style={{ color: colors.foreground }}
                  >
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="flex items-center gap-3 w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-opacity-80"
                    style={{ 
                      color: item.danger ? '#ef4444' : 
                             item.highlight ? colors.accent : 
                             colors.foreground,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.muted;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserAccountDropdown;