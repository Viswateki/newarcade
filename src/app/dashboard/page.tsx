'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { dashboardStatsService, DashboardStats } from '@/lib/dashboardStats';
import ChromaGrid, { ChromaItem } from '@/components/ChromaGrid';
import { userProfileImageService } from '@/lib/userProfileImageService';
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
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageRemoving, setImageRemoving] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  // Sync local image URL with user context
  useEffect(() => {
    if (user?.image && !localImageUrl) {
      // If user has an image but we don't have a local override, sync it
      setLocalImageUrl(user.image);
    } else if (!user?.image && localImageUrl) {
      // If user doesn't have an image but we have a local one, it might be outdated
      // Don't clear immediately as the user context might be stale
    }
  }, [user?.image, localImageUrl]);

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

  // Force refresh user data without throttling (for immediate updates after image operations)
  const forceRefreshUser = async () => {
    try {
      console.log('🔄 Force refreshing user data (bypassing throttle)...');
      
      // Try multiple refresh attempts to ensure update
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, i * 500)); // Wait 0, 500, 1000ms
        
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache' // Ensure fresh data
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.user) {
            console.log(`✅ Fresh user data received (attempt ${i + 1}):`, result.user);
            // Clear local image state since context is now updated
            setLocalImageUrl(null);
            // Call refreshUser to update context
            refreshUser();
            break; // Success, exit loop
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to force refresh user data:', error);
      // Fallback to normal refresh
      setTimeout(() => {
        refreshUser();
      }, 100);
    }
  };

  // Create better default image SVG
  const getDefaultImage = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 280' fill='none'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f8fafc'/%3E%3Cstop offset='100%25' stop-color='%23e2e8f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='280' fill='url(%23bg)' rx='10'/%3E%3Ccircle cx='150' cy='120' r='35' fill='%23cbd5e1' stroke='%2394a3b8' stroke-width='2'/%3E%3Cpath d='M150 120m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0' fill='white'/%3E%3Ccircle cx='150' cy='110' r='8' fill='%2394a3b8'/%3E%3Cpath d='M142 120c0-4 3-8 8-8s8 4 8 8v6h-16v-6z' fill='%2394a3b8'/%3E%3Cpath d='M120 200h60c0-15-13-25-30-25s-30 10-30 25z' fill='%23cbd5e1'/%3E%3Ctext x='150' y='235' text-anchor='middle' fill='%23475569' font-family='system-ui, -apple-system, sans-serif' font-size='13' font-weight='500'%3EClick to Upload Image%3C/text%3E%3C/svg%3E";
  };

  const handleImageRemove = async () => {
    if (!user?.id) {
      alert('User not found. Please log in again.');
      return;
    }

    setImageRemoving(true);
    try {
      console.log('Removing profile image for user:', user.id);

      // Remove the image from storage if it exists
      if (user.image) {
        await userProfileImageService.deleteUserImage(user.image);
      }

      // Update user profile to remove image URL
      await userProfileImageService.updateUserProfileImage(user.id, '');

      // Clear local image URL immediately for instant display
      setLocalImageUrl('');

      // Refresh user data to get the updated profile
      await refreshUser();

      alert('✅ Profile image removed successfully!');
      
    } catch (error) {
      console.error('Error removing image:', error);
      
      let errorMessage = 'Failed to remove image. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`❌ Remove failed: ${errorMessage}`);
    } finally {
      setImageRemoving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user?.id) {
      alert('User not found. Please log in again.');
      return;
    }

    setImageLoading(true);
    try {
      console.log('Starting image upload:', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        userId: user.id
      });

      // Upload image and update user profile
      const imageUrl = await userProfileImageService.uploadAndReplaceUserImage(
        file, 
        user.id, 
        user.image // Pass current image to delete if exists
      );

      console.log('Image upload successful:', imageUrl);

      // Set local image URL immediately for instant display
      setLocalImageUrl(imageUrl);

      // Force refresh user data by calling API directly to bypass throttling
      await forceRefreshUser();

      alert(`✅ Profile image updated successfully!\n\nFile: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('file type') || error.message.includes('image files')) {
          errorMessage = 'Please upload only image files (JPEG, PNG, WebP, GIF, BMP)';
        } else if (error.message.includes('size') || error.message.includes('10MB')) {
          errorMessage = 'Please upload an image smaller than 10MB';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`❌ Upload failed: ${errorMessage}`);
    } finally {
      setImageLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div 
      className="min-h-screen transition-colors duration-300 pt-16"
      style={{ backgroundColor: colors.background, color: colors.foreground }}
    >
      <div className="max-w-[1400px] mx-auto p-6 lg:p-8">
        {/* Header Section with User Info */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            {/* Welcome Text */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
                Welcome back, {user.name || user.username}!
              </h1>
              <p className="text-sm lg:text-base opacity-70 mt-1">
                @{user.username} • Dashboard User
              </p>
            </div>
            
            {/* Arcade Coins Badge */}
            <div 
              className="flex items-center gap-3 px-6 py-3 rounded-full shadow-sm border w-fit"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                $
              </div>
              <div>
                <p className="text-sm opacity-70 font-medium">Arcade Coins</p>
                <p className="text-xl font-bold">{user.arcadeCoins || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Profile Card */}
          <div className="xl:col-span-1">
            <ChromaGrid 
              items={[
                {
                  image: (localImageUrl === '' ? getDefaultImage() : localImageUrl) || user?.image || getDefaultImage(),
                  title: "",
                  subtitle: "",
                  linkedinProfile: user?.linkedinProfile || "",
                  githubProfile: user?.githubProfile || "",
                  email: user?.email || "",
                  borderColor: "#06B6D4",
                  gradient: "linear-gradient(195deg,#06B6D4,#000)",
                  url: "#upload-image",
                  isProfileCard: true,
                  isLoading: imageLoading || imageRemoving,
                  loadingText: imageLoading ? 'Uploading...' : imageRemoving ? 'Removing...' : undefined
                }
              ]}
              radius={250}
              damping={0.45}
              fadeOut={0.0}
              ease="power3.out"
              onRemoveImage={(item: ChromaItem) => {
                if (!imageLoading && !imageRemoving) {
                  handleImageRemove();
                }
              }}
              onCardClick={(item: ChromaItem) => {
                if (item.url === "#upload-image" && !imageLoading && !imageRemoving) {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  };
                  input.click();
                }
              }}
            />
          </div>

          {/* Right Column - Stats and Actions */}
          <div className="xl:col-span-3 space-y-6">
            {/* Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-xl shadow-sm border animate-pulse"
                    style={{ 
                      backgroundColor: colors.card, 
                      borderColor: colors.border 
                    }}
                  >
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div 
                  className="p-6 rounded-xl shadow-sm border hover:shadow-md transition-all"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalBlogs || 0}</p>
                      <p className="text-sm opacity-70 font-medium">Blogs</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-6 rounded-xl shadow-sm border hover:shadow-md transition-all"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <Wrench className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalTools || 0}</p>
                      <p className="text-sm opacity-70 font-medium">Tools</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-6 rounded-xl shadow-sm border hover:shadow-md transition-all"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{(stats?.totalBlogViews || 0) + (stats?.totalToolViews || 0)}</p>
                      <p className="text-sm opacity-70 font-medium">Views</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-6 rounded-xl shadow-sm border hover:shadow-md transition-all"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                      <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalBlogLikes || 0}</p>
                      <p className="text-sm opacity-70 font-medium">Likes</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-6 rounded-xl shadow-sm border hover:shadow-md transition-all"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                      <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalBlogComments || 0}</p>
                      <p className="text-sm opacity-70 font-medium">Comments</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div 
              className="p-6 rounded-xl shadow-sm border"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }}
            >
              <h2 className="text-lg font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/create-blog"
                  className="group p-6 rounded-xl border-2 border-dashed transition-all hover:border-solid hover:shadow-lg hover:scale-[1.02] text-center"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background + '50'
                  }}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Write Blog</h3>
                      <p className="text-sm opacity-70">Share your thoughts</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/submit-tool"
                  className="group p-6 rounded-xl border-2 border-dashed transition-all hover:border-solid hover:shadow-lg hover:scale-[1.02] text-center"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background + '50'
                  }}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                      <Wrench className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Submit Tool</h3>
                      <p className="text-sm opacity-70">Add new tools</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/tools"
                  className="group p-6 rounded-xl border-2 border-dashed transition-all hover:border-solid hover:shadow-lg hover:scale-[1.02] text-center"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.background + '50'
                  }}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                      <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Browse Tools</h3>
                      <p className="text-sm opacity-70">Discover tools</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div 
              className="p-6 rounded-xl shadow-sm border"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }}
            >
              <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {stats?.totalBlogs && stats.totalBlogs > 0 ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Blog posts written</p>
                      <p className="text-xs opacity-70">{stats.totalBlogs} total</p>
                    </div>
                  </div>
                ) : null}
                
                {stats?.totalTools && stats.totalTools > 0 ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <Wrench className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Tools submitted</p>
                      <p className="text-xs opacity-70">{stats.totalTools} total</p>
                    </div>
                  </div>
                ) : null}

                {(!stats?.totalBlogs || stats.totalBlogs === 0) && (!stats?.totalTools || stats.totalTools === 0) ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <LayoutDashboard className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm opacity-70">No activity yet</p>
                    <p className="text-xs opacity-50 mt-1">Start by writing a blog or submitting a tool!</p>
                  </div>
                ) : null}
              </div>
            </div>
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