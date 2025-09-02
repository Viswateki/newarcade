'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaUser, FaEdit, FaCamera, FaSignOutAlt, FaEnvelope, FaCalendar, FaBook, FaTools, FaStar, FaHeart } from 'react-icons/fa';
import { dashboardStatsService, DashboardStats } from '@/lib/dashboardStats';

interface UserProfileCardProps {
  user: any;
  onLogout: () => void;
}

export default function UserProfileCard({ user, onLogout }: UserProfileCardProps) {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.$id) {
        setLoadingStats(true);
        const userStats = await dashboardStatsService.getUserStats(user.$id);
        setStats(userStats);
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user?.$id]);

  return (
    <div 
      className="p-6 rounded-xl border transition-all duration-300 transform hover:scale-[1.01] animate-slideInLeft"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 mx-auto bg-blue-500"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button 
            className="absolute bottom-2 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
            title="Change Profile Picture"
          >
            <FaCamera className="w-3 h-3" />
          </button>
        </div>
        
        <h2 className="text-xl font-bold mb-1">{user?.name || 'User Name'}</h2>
        <p className="text-sm opacity-70 mb-4">{user?.email || 'user@example.com'}</p>
        
        <div className="flex items-center justify-center space-x-2 text-xs opacity-60 mb-4">
          <FaCalendar />
          <span>Joined {new Date(user?.$createdAt || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>

      {/* User Stats */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-3 opacity-80">Statistics</h4>
        {loadingStats ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 p-2 rounded-lg" style={{ backgroundColor: colors.background }}>
              <FaBook className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs opacity-70">Blogs</p>
                <p className="text-sm font-semibold">{stats?.totalBlogs || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg" style={{ backgroundColor: colors.background }}>
              <FaTools className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs opacity-70">Tools</p>
                <p className="text-sm font-semibold">{stats?.totalTools || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg" style={{ backgroundColor: colors.background }}>
              <FaStar className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-xs opacity-70">Reviews</p>
                <p className="text-sm font-semibold">{stats?.totalReviews || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg" style={{ backgroundColor: colors.background }}>
              <FaHeart className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs opacity-70">Favorites</p>
                <p className="text-sm font-semibold">{stats?.totalFavorites || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
          <FaEnvelope className="w-4 h-4 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs opacity-70">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
          <FaUser className="w-4 h-4 text-green-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Role</p>
            <p className="text-xs opacity-70">Community Member</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <FaEdit className="w-3 h-3" />
          <span className="text-sm">Edit Profile</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          title="Logout"
        >
          <FaSignOutAlt className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
