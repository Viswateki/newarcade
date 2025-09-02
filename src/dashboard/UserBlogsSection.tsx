'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaBook, FaPlus, FaEye, FaEdit, FaCalendar, FaStar, FaTrash } from 'react-icons/fa';
import { blogService } from '@/lib/blogService_new';

interface UserBlogsSectionProps {
  user: any;
}

export default function UserBlogsSection({ user }: UserBlogsSectionProps) {
  const { colors } = useTheme();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (user?.$id) {
        setLoading(true);
        try {
          const { blogs: userBlogs } = await blogService.getBlogs({
            author: user.$id,
            limit: 20,
            status: 'published'
          });
          setBlogs(userBlogs);
        } catch (error) {
          console.error('Error fetching user blogs:', error);
          setBlogs([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserBlogs();
  }, [user?.$id]);

  const handleCreateBlog = () => {
    // Navigate to create blog page
    window.location.href = '/create-blog';
  };

  const handleEditBlog = (blogId: string | undefined) => {
    if (blogId) {
      // Navigate to edit blog page
      window.location.href = `/blog/${blogId}`;
    }
  };

  const handleDeleteBlog = async (blogId: string | undefined) => {
    if (!blogId) return;
    
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogService.deleteBlog(blogId);
        // Refresh the blogs list
        const { blogs: updatedBlogs } = await blogService.getBlogs({
          author: user.$id,
          limit: 20,
        });
        setBlogs(updatedBlogs);
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete blog. Please try again.');
      }
    }
  };

  const handlePublishBlog = async (blogId: string | undefined) => {
    if (!blogId) return;
    
    try {
      await blogService.updateBlog(blogId, { status: 'published' });
      // Refresh the blogs list
      const { blogs: updatedBlogs } = await blogService.getBlogs({
        author: user.$id,
        limit: 20,
      });
      setBlogs(updatedBlogs);
      alert('Blog published successfully!');
    } catch (error) {
      console.error('Error publishing blog:', error);
      alert('Failed to publish blog. Please try again.');
    }
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
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-xl border transition-all duration-300 animate-slideInUp"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: colors.accent + '20' }}
          >
            <FaBook className="w-5 h-5" style={{ color: colors.accent }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">My Blogs</h3>
            <p className="text-sm opacity-70">{blogs.length} published</p>
          </div>
        </div>
        <button 
          onClick={handleCreateBlog}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          style={{ 
            backgroundColor: colors.accent, 
            color: 'white' 
          }}
        >
          <FaPlus className="w-4 h-4" />
          <span>New Blog</span>
        </button>
      </div>

      <div className="space-y-4">
        {blogs.length === 0 ? (
          <div className="text-center py-8">
            <FaBook className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No blogs yet</h4>
            <p className="text-sm opacity-70 mb-4">Start sharing your knowledge with the community</p>
            <button 
              onClick={handleCreateBlog}
              className="px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              style={{ 
                backgroundColor: colors.accent, 
                color: 'white' 
              }}
            >
              Write your first blog
            </button>
          </div>
        ) : (
          blogs.map((blog) => (
            <div 
              key={blog.$id}
              className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
              style={{ 
                backgroundColor: colors.background, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-base line-clamp-1">
                      {blog.title}
                    </h4>
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        blog.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                  <p className="text-sm opacity-70 mb-3 line-clamp-2">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center space-x-4 text-xs opacity-60">
                    <div className="flex items-center space-x-1">
                      <FaCalendar />
                      <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaEye />
                      <span>{blog.views || 0} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaStar />
                      <span>{blog.likes || 0} likes</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {blog.status === 'draft' && (
                    <button 
                      onClick={() => handlePublishBlog(blog.$id)}
                      className="p-2 rounded-lg transition-colors duration-200 hover:bg-green-100"
                      title="Publish blog"
                    >
                      <FaPlus className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditBlog(blog.$id)}
                    className="p-2 rounded-lg transition-colors duration-200 hover:bg-blue-100"
                    title="Edit blog"
                  >
                    <FaEdit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBlog(blog.$id)}
                    className="p-2 rounded-lg transition-colors duration-200 hover:bg-red-100"
                    title="Delete blog"
                  >
                    <FaTrash className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
                <div className="flex items-center justify-between">
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: colors.accent + '20', 
                      color: colors.accent 
                    }}
                  >
                    {blog.category}
                  </span>
                  <span className="text-xs opacity-60">
                    {blog.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {blogs.length > 0 && (
        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.href = '/dashboard/blogs'}
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: colors.accent }}
          >
            View all blogs →
          </button>
        </div>
      )}
    </div>
  );
}
