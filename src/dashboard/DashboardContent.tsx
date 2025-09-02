'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { blogService } from '@/lib/blogService_new';
import UserBlogsSection from './UserBlogsSection';
import { 
  FaTachometerAlt, 
  FaBlog, 
  FaTools, 
  FaHeart, 
  FaComment, 
  FaPlus,
  FaEye,
  FaThumbsUp,
  FaClock,
  FaChartLine,
  FaAward,
  FaBookmark
} from 'react-icons/fa';
import Link from 'next/link';

// Quick Stats Cards
const QuickStatsCard = ({ title, value, icon, change, color }: any) => {
  const { colors } = useTheme();
  
  return (
    <div 
      className="group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      {/* Background gradient */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"
        style={{ backgroundColor: color }}
      ></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-70 mb-2">{title}</p>
          <p className="text-3xl font-bold mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change && (
            <p className={`text-sm font-medium ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div 
          className="p-4 rounded-xl group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: color + '15' }}
        >
          <div style={{ color: color }}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

// Recent Activity Card
const RecentActivityCard = ({ userBlogs }: { userBlogs: any[] }) => {
  const { colors } = useTheme();
  
  // Generate activities from user's actual blogs
  const activities = userBlogs.slice(0, 4).map(blog => ({
    type: 'blog',
    title: `${blog.status === 'draft' ? '[DRAFT] ' : ''}Published "${blog.title}"`,
    time: new Date(blog.$createdAt).toLocaleDateString(),
    icon: FaBlog,
    status: blog.status
  }));

  // Add default message if no activities
  if (activities.length === 0) {
    activities.push({
      type: 'info',
      title: 'No recent activity',
      time: 'Start by creating your first blog!',
      icon: FaClock,
      status: 'info'
    });
  }

  return (
    <div 
      className="p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <FaClock className="w-5 h-5 mr-3" style={{ color: colors.accent }} />
          Recent Activity
        </h3>
        <Link href="/blogs" className="text-sm font-medium hover:underline" style={{ color: colors.accent }}>
          View all
        </Link>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-opacity-50 transition-colors duration-200" style={{ backgroundColor: colors.accent + '05' }}>
            <div 
              className="p-2.5 rounded-lg flex-shrink-0"
              style={{ backgroundColor: colors.accent + '15' }}
            >
              <activity.icon className="w-4 h-4" style={{ color: colors.accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.title}</p>
              <p className="text-xs opacity-60 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Actions Card
const QuickActionsCard = () => {
  const { colors } = useTheme();
  
  const actions = [
    { title: 'Write Blog', href: '/create-blog', icon: FaBlog, description: 'Share your knowledge' },
    { title: 'Submit Tool', href: '/submit-tool', icon: FaTools, description: 'Add a new tool' },
    { title: 'Browse Tools', href: '/tools', icon: FaEye, description: 'Explore developer tools' },
    { title: 'Read Blogs', href: '/blogs', icon: FaBookmark, description: 'Discover content' },
  ];

  return (
    <div 
      className="p-6 rounded-xl border transition-all duration-300"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FaPlus className="w-5 h-5 mr-2" style={{ color: colors.accent }} />
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md group"
            style={{ borderColor: colors.border }}
          >
            <div className="text-center">
              <div 
                className="p-3 rounded-lg mx-auto mb-2 w-fit group-hover:scale-110 transition-transform duration-200"
                style={{ backgroundColor: colors.accent + '20' }}
              >
                <action.icon className="w-5 h-5" style={{ color: colors.accent }} />
              </div>
              <p className="text-sm font-medium">{action.title}</p>
              <p className="text-xs opacity-70 mt-1">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Popular Content Card
const PopularContentCard = ({ userBlogs }: { userBlogs: any[] }) => {
  const { colors } = useTheme();
  
  // Sort blogs by views and take top 4
  const popularContent = userBlogs
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4)
    .map(blog => ({
      title: blog.title,
      views: blog.views || 0,
      type: 'blog' as const,
      id: blog.$id
    }));

  // Add default message if no content
  if (popularContent.length === 0) {
    popularContent.push({
      title: 'No content yet',
      views: 0,
      type: 'blog' as const,
      id: ''
    });
  }

  return (
    <div 
      className="p-6 rounded-xl border transition-all duration-300"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FaChartLine className="w-5 h-5 mr-2" style={{ color: colors.accent }} />
        Your Popular Content
      </h3>
      
      <div className="space-y-3">
        {popularContent.map((content, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.accent + '20' }}
              >
                <FaBlog className="w-4 h-4" style={{ color: colors.accent }} />
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">{content.title}</p>
                <p className="text-xs opacity-70">
                  {content.views} views
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardContent() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState({
    blogs: 0,
    tools: 0,
    views: 0,
    likes: 0
  });
  const [userBlogs, setUserBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's blogs and calculate stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.$id) return;

      try {
        setLoading(true);
        
        // Fetch user's blogs (including drafts for dashboard)
        const { blogs } = await blogService.getBlogs({
          author: user.$id,
          limit: 50, // Get all user blogs for stats
          // Don't filter by status in dashboard - show all user's blogs
        });

        setUserBlogs(blogs);

        // Calculate stats from real data
        const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
        const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);

        setStats({
          blogs: blogs.length,
          tools: 0, // TODO: Implement tools when ready
          views: totalViews,
          likes: totalLikes
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default empty state on error
        setUserBlogs([]);
        setStats({
          blogs: 0,
          tools: 0,
          views: 0,
          likes: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.$id]);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div 
                className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4" 
                style={{ borderColor: colors.accent + '30', borderTopColor: colors.accent }}
              ></div>
              <p className="text-lg font-medium opacity-70">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div 
            className="relative overflow-hidden p-8 rounded-2xl border shadow-sm"
            style={{ 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              color: colors.cardForeground 
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ backgroundColor: colors.accent }}></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full" style={{ backgroundColor: colors.accent }}></div>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-current to-current bg-clip-text">
                  Welcome back, {user?.name?.split(' ')[0] || 'Developer'}! 👋
                </h1>
                <p className="text-lg opacity-70 max-w-2xl">
                  Here's what's happening with your content and community activity.
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  style={{ backgroundColor: colors.accent }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <p className="text-sm opacity-70">Content Creator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <QuickStatsCard
            title="Published Blogs"
            value={stats.blogs}
            icon={<FaBlog className="w-6 h-6" />}
            change={stats.blogs > 0 ? null : null}
            color={colors.accent}
          />
          <QuickStatsCard
            title="Tools Submitted"
            value={stats.tools}
            icon={<FaTools className="w-6 h-6" />}
            change={null}
            color="#10B981"
          />
          <QuickStatsCard
            title="Total Views"
            value={stats.views}
            icon={<FaEye className="w-6 h-6" />}
            change={null}
            color="#F59E0B"
          />
          <QuickStatsCard
            title="Total Likes"
            value={stats.likes}
            icon={<FaHeart className="w-6 h-6" />}
            change={null}
            color="#EF4444"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div>
          <QuickActionsCard />
        </div>
        
        {/* Recent Activity */}
        <div>
          <RecentActivityCard userBlogs={userBlogs} />
        </div>
        
        {/* Popular Content */}
        <div>
          <PopularContentCard userBlogs={userBlogs} />
        </div>
        
        {/* Achievement Card */}
        <div 
          className="p-6 rounded-xl border transition-all duration-300"
          style={{ 
            backgroundColor: colors.card, 
            borderColor: colors.border,
            color: colors.cardForeground 
          }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaAward className="w-5 h-5 mr-2" style={{ color: colors.accent }} />
            Achievements
          </h3>
          <div className="space-y-3">
            {stats.blogs > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FaAward className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">First Blog Published</p>
                  <p className="text-xs opacity-70">Content Creator</p>
                </div>
              </div>
            )}
            {stats.blogs >= 5 && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaBlog className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Prolific Writer</p>
                  <p className="text-xs opacity-70">Published 5+ blogs</p>
                </div>
              </div>
            )}
            {stats.views >= 100 && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FaEye className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Popular Content</p>
                  <p className="text-xs opacity-70">100+ total views</p>
                </div>
              </div>
            )}
            {stats.blogs === 0 && (
              <div className="text-center py-4">
                <p className="text-sm opacity-70">Start writing to unlock achievements!</p>
                <Link 
                  href="/create-blog" 
                  className="text-sm mt-2 inline-block"
                  style={{ color: colors.accent }}
                >
                  Create your first blog →
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Community Stats */}
        <div 
          className="lg:col-span-2 p-6 rounded-xl border transition-all duration-300"
          style={{ 
            backgroundColor: colors.card, 
            borderColor: colors.border,
            color: colors.cardForeground 
          }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaChartLine className="w-5 h-5 mr-2" style={{ color: colors.accent }} />
            Your Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.accent }}>
                {stats.views.toLocaleString()}
              </div>
              <p className="text-sm opacity-70">Total Blog Views</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.accent }}>
                {stats.likes}
              </div>
              <p className="text-sm opacity-70">Total Likes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.accent }}>
                {userBlogs.length > 0 ? Math.round((stats.likes / Math.max(stats.views, 1)) * 100) : 0}%
              </div>
              <p className="text-sm opacity-70">Engagement Rate</p>
            </div>
          </div>
        </div>
      </div>

        {/* User's Blogs Section */}
        <div className="mt-8">
          <UserBlogsSection user={user} />
        </div>
      </div>
    </main>
  );
}
