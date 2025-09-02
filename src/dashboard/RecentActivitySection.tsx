'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaClock, FaEye, FaThumbsUp, FaComment, FaTools, FaBook, FaUser } from 'react-icons/fa';
import { databaseService, Activity } from '@/lib/database';

interface RecentActivitySectionProps {
  user: any;
}

export default function RecentActivitySection({ user }: RecentActivitySectionProps) {
  const { colors } = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (user?.$id) {
        setLoading(true);
        try {
          const userActivities = await databaseService.getUserActivity(user.$id);
          setActivities(userActivities);
        } catch (error) {
          console.error('Error fetching activities:', error);
          setActivities([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchActivities();
  }, [user?.$id]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'blog_published': return <FaBook className="w-4 h-4" />;
      case 'tool_submitted': return <FaTools className="w-4 h-4" />;
      case 'review_written': return <FaComment className="w-4 h-4" />;
      case 'tool_favorited': return <FaThumbsUp className="w-4 h-4" />;
      case 'tool_unfavorited': return <FaEye className="w-4 h-4" />;
      case 'profile_updated': return <FaUser className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'blog_published': return '#8b5cf6';
      case 'tool_submitted': return '#10b981';
      case 'review_written': return '#3b82f6';
      case 'tool_favorited': return '#ef4444';
      case 'tool_unfavorited': return '#6b7280';
      case 'profile_updated': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div 
        className="p-6 rounded-xl border animate-pulse"
        style={{ 
          backgroundColor: colors.card, 
          borderColor: colors.border 
        }}
      >
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-xl border transition-all duration-300 animate-slideInRight"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: colors.accent + '20' }}
        >
          <FaClock className="w-5 h-5" style={{ color: colors.accent }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm opacity-70">Your latest actions</p>
        </div>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <FaClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No recent activity</h4>
            <p className="text-sm opacity-70">Start exploring tools and writing blogs to see your activity here</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.$id}
              className="flex items-start space-x-3 p-3 rounded-lg transition-colors duration-200 hover:bg-opacity-50"
              style={{ backgroundColor: colors.background }}
            >
              <div 
                className="p-2 rounded-full mt-1"
                style={{ 
                  backgroundColor: getActivityColor(activity.type) + '20',
                  color: getActivityColor(activity.type)
                }}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1 mb-1">
                  {activity.title}
                </h4>
                <p className="text-xs opacity-70 line-clamp-2 mb-2">
                  {activity.description}
                </p>
                <span className="text-xs opacity-60">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-6 text-center">
          <button 
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: colors.accent }}
          >
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
}
