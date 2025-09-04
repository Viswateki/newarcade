'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { blogService } from '@/lib/blogService_new';
import { formatTags } from '@/lib/tagsHelper';
import { Blog } from '@/lib/appwrite';
import NavigationWrapper from '@/components/NavigationWrapper';
import { 
  FaEye, 
  FaHeart, 
  FaComment
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function BlogsPage() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const filterAndSortBlogs = useCallback(() => {
    let filtered = [...blogs];

    // Exclude featured blogs from regular list to avoid duplication
    const featuredBlogIds = featuredBlogs.map(blog => blog.$id);
    filtered = filtered.filter(blog => !featuredBlogIds.includes(blog.$id));

    // Sort blogs by latest
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    setFilteredBlogs(filtered);
  }, [blogs, featuredBlogs]);

  useEffect(() => {
    fetchBlogs();
    fetchFeaturedBlogs();
  }, []);

  useEffect(() => {
    filterAndSortBlogs();
  }, [filterAndSortBlogs]);

  const fetchBlogs = async () => {
    setLoading(true);
    console.log('Fetching blogs with params:', { 
      page, 
      offset: (page - 1) * 20, 
      limit: 20 
    });
    
    try {
      // First, try to fetch ALL blogs to see if any exist
      const allBlogs = await blogService.getBlogs({ 
        offset: 0, 
        limit: 100,
        // Remove status filter to see all blogs
      });
      console.log('ALL blogs in database:', allBlogs);
      
      // Then fetch published blogs
      const publishedBlogs = await blogService.getBlogs({ 
        offset: (page - 1) * 20, 
        limit: 20, 
        status: 'published'
      });
      
      console.log('Fetched published blogs:', publishedBlogs);
      
      if (page === 1) {
        setBlogs(publishedBlogs.blogs);
      } else {
        setBlogs(prev => [...prev, ...publishedBlogs.blogs]);
      }
      setHasMore(publishedBlogs.blogs.length === 20);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      const featured = await blogService.getBlogs({ 
        featured: true, 
        limit: 3,
        status: 'published'
      });
      setFeaturedBlogs(featured.blogs);
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
    }
  };

  const handleLike = async (blogId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const isLiked = await blogService.checkIfLiked(blogId, user.$id);
      
      if (isLiked) {
        await blogService.unlikeBlog(blogId, user.$id);
      } else {
        await blogService.likeBlog(blogId, user.$id);
      }
      
      // Refresh the blog data
      fetchBlogs();
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleBookmark = async (blogId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const isBookmarked = await blogService.checkIfBookmarked(blogId, user.$id);
      
      if (isBookmarked) {
        await blogService.removeBookmark(blogId, user.$id);
      } else {
        await blogService.bookmarkBlog(blogId, user.$id);
      }
    } catch (error) {
      console.error('Error bookmarking blog:', error);
    }
  };

  const formatReadingTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const BlogCard = ({ blog, featured = false }: { blog: Blog; featured?: boolean }) => (
    <article 
      className={`aspect-auto p-8 border rounded-3xl transition-all duration-300 hover:shadow-2xl ${
        featured ? 'overflow-hidden' : ''
      }`}
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        boxShadow: colors.background === '#fafbfc' ? '0 25px 50px -12px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      {featured && blog.featured_image && (
        <div className="aspect-video overflow-hidden mb-6 rounded-2xl">
          <img 
            src={blog.featured_image} 
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      {/* Author Info */}
      <div className="flex gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
          {blog.author_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h6 className="text-lg font-medium" style={{ color: colors.cardForeground }}>
            {blog.author_name}
          </h6>
          <p className="text-sm opacity-60" style={{ color: colors.cardForeground }}>
            {blog.category}
          </p>
        </div>
      </div>

      {/* Content */}
      <Link href={`/blog/${blog.$id}`}>
        <div className="cursor-pointer">
          <h2 className={`font-bold mb-3 group-hover:text-blue-600 transition-colors ${
            featured ? 'text-2xl' : 'text-xl'
          }`} style={{ color: colors.cardForeground }}>
            {blog.title}
          </h2>
          
          {blog.subtitle && (
            <h3 className="text-lg opacity-70 mb-3" style={{ color: colors.cardForeground }}>
              {blog.subtitle}
            </h3>
          )}
          
          <p className="opacity-70 mb-4 leading-relaxed" style={{ color: colors.cardForeground }}>
            {blog.excerpt}
          </p>
        </div>
      </Link>

      {!featured && blog.featured_image && (
        <div className="mb-6">
          <img 
            src={blog.featured_image} 
            alt={blog.title}
            className="w-full h-48 object-cover rounded-2xl"
          />
        </div>
      )}

      {/* Tags */}
      {formatTags(blog.tags).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {formatTags(blog.tags).slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-sm transition-colors"
              style={{ 
                backgroundColor: colors.background,
                color: colors.cardForeground,
                border: `1px solid ${colors.border}`
              }}
            >
              {tag}
            </span>
          ))}
          {formatTags(blog.tags).length > 3 && (
            <span className="text-sm opacity-60" style={{ color: colors.cardForeground }}>
              +{formatTags(blog.tags).length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border }}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleLike(blog.$id!)}
            className="flex items-center space-x-1 text-sm opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: colors.cardForeground }}
          >
            <FaHeart />
            <span>{blog.likes}</span>
          </button>
          
          <Link href={`/blog/${blog.$id}#comments`}>
            <div className="flex items-center space-x-1 text-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: colors.cardForeground }}
            >
              <FaComment />
              <span>{blog.comments_count}</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-1 text-sm opacity-60" style={{ color: colors.cardForeground }}>
            <FaEye />
            <span>{blog.views}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm opacity-60" style={{ color: colors.cardForeground }}>
          <span>{formatDate(blog.updated_at)}</span>
          <span>•</span>
          <span>{formatReadingTime(blog.reading_time)}</span>
        </div>
      </div>
    </article>
  );

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <NavigationWrapper />
      <div className="py-8" style={{ color: colors.foreground }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
          {/* Header */}
          <div className="mb-10 space-y-4 px-6 md:px-0">
            <h2 className="text-center text-2xl font-bold md:text-4xl" style={{ color: colors.foreground }}>
              We have some fans.
            </h2>
          </div>

        {/* Blog Grid - Masonry Layout */}
        <div className="space-y-8">
          {loading && blogs.length === 0 ? (
            <div className="md:columns-2 lg:columns-3 gap-8 space-y-8">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="aspect-auto p-8 border rounded-3xl animate-pulse break-inside-avoid"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }}
                >
                  <div className="flex gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-32 bg-gray-300 rounded mb-6"></div>
                  <div className="flex space-x-2 mb-6">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-300">
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-300 rounded w-8"></div>
                      <div className="h-4 bg-gray-300 rounded w-8"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBlogs.length > 0 ? (
            <>
              <div className="md:columns-2 lg:columns-3 gap-8 space-y-8">
                {/* Featured blogs first */}
                {featuredBlogs.map(blog => (
                  <div key={`featured-${blog.$id}`} className="break-inside-avoid">
                    <BlogCard blog={blog} featured />
                  </div>
                ))}
                {/* Regular blogs */}
                {filteredBlogs.map(blog => (
                  <div key={blog.$id} className="break-inside-avoid">
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <div className="text-center pt-8">
                  <button
                    onClick={() => {
                      setPage(prev => prev + 1);
                      fetchBlogs();
                    }}
                    disabled={loading}
                    className="px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: colors.accent,
                      color: colors.background
                    }}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl opacity-20 mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
                No stories found
              </h3>
              <p className="opacity-70" style={{ color: colors.foreground }}>
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Write Story CTA */}
        <div className="fixed bottom-8 right-8 z-50">
          <Link href="/create-blog">
            <button 
              className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-xl"
              style={{
                backgroundColor: colors.accent,
                color: colors.background
              }}
            >
              ✏️
            </button>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}