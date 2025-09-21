'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { dashboardStatsService, DashboardStats } from '@/lib/dashboardStats';
import { 
  LayoutDashboard, 
  FileText,
  Wrench,
  Heart,
  Eye,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

function DashboardContent() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const userStats = await dashboardStatsService.getUserStats(user!.id);
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div 
      className="min-h-screen transition-colors duration-300 pt-20 px-4"
      style={{ backgroundColor: colors.background, color: colors.foreground }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name || user.username}!
          </h1>
          <p className="text-lg opacity-70">
            Here's your dashboard overview.
          </p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="p-6 rounded-lg shadow-sm border animate-pulse"
                style={{ 
                  backgroundColor: colors.card, 
                  borderColor: colors.border 
                }}
              >
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div 
              className="p-6 rounded-lg shadow-sm border"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm opacity-70">Blogs Written</h3>
                  <p className="text-2xl font-bold">{stats?.totalBlogs || 0}</p>
                </div>
                <FileText className="w-8 h-8 opacity-70" />
              </div>
            </div>

            <div 
              className="p-6 rounded-lg shadow-sm border"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm opacity-70">Tools Submitted</h3>
                  <p className="text-2xl font-bold">{stats?.totalTools || 0}</p>
                </div>
                <Wrench className="w-8 h-8 opacity-70" />
              </div>
            </div>

            <div 
              className="p-6 rounded-lg shadow-sm border"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm opacity-70">Total Views</h3>
                  <p className="text-2xl font-bold">{(stats?.totalBlogViews || 0) + (stats?.totalToolViews || 0)}</p>
                </div>
                <Eye className="w-8 h-8 opacity-70" />
              </div>
            </div>

            <div 
              className="p-6 rounded-lg shadow-sm border"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm opacity-70">Blog Likes</h3>
                  <p className="text-2xl font-bold">{stats?.totalBlogLikes || 0}</p>
                </div>
                <Heart className="w-8 h-8 opacity-70" />
              </div>
            </div>

            <div 
              className="p-6 rounded-lg shadow-sm border"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm opacity-70">Blog Comments</h3>
                  <p className="text-2xl font-bold">{stats?.totalBlogComments || 0}</p>
                </div>
                <MessageSquare className="w-8 h-8 opacity-70" />
              </div>
            </div>

            <div 
              className="p-6 rounded-lg shadow-sm border"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm opacity-70">Arcade Coins</h3>
                  <p className="text-2xl font-bold">{user.arcadeCoins || 0}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                  $
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div 
          className="p-6 rounded-lg shadow-sm border"
          style={{ 
            backgroundColor: colors.card, 
            borderColor: colors.border 
          }}
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/create-blog"
              className="p-4 rounded-lg border transition-all hover:shadow-md hover:scale-105 text-center"
              style={{ 
                backgroundColor: colors.background, 
                borderColor: colors.border 
              }}
            >
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Write Blog</h3>
            </a>

            <a
              href="/submit-tool"
              className="p-4 rounded-lg border transition-all hover:shadow-md hover:scale-105 text-center"
              style={{ 
                backgroundColor: colors.background, 
                borderColor: colors.border 
              }}
            >
              <Wrench className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Submit Tool</h3>
            </a>

            <a
              href="/tools"
              className="p-4 rounded-lg border transition-all hover:shadow-md hover:scale-105 text-center"
              style={{ 
                backgroundColor: colors.background, 
                borderColor: colors.border 
              }}
            >
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Browse Tools</h3>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}