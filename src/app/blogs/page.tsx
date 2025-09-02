'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { blogService } from '@/lib/blogService_new';
import { formatTags } from '@/lib/tagsHelper';
import { Blog } from '@/lib/appwrite';
import NavigationWrapper from '@/components/NavigationWrapper';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaHeart, 
  FaCalendar, 
  FaUser, 
  FaTag,
  FaFire,
  FaClock,
  FaArrowUp,
  FaBookmark,
  FaChevronDown,
  FaComment
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
  'All Categories',
  'Technology',
  'Programming',
  'Data Science',
  'AI & Machine Learning',
  'Web Development',
  'Mobile Development', 
  'DevOps',
  'Design',
  'Startup',
  'Career',
  'Tutorial',
  'News',
  'Opinion',
  'Review'
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest', icon: FaClock },
  { value: 'trending', label: 'Trending', icon: FaArrowUp },
  { value: 'popular', label: 'Popular', icon: FaFire },
  { value: 'most-viewed', label: 'Most Viewed', icon: FaEye }
];

export default function BlogsPage() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchBlogs();
    fetchFeaturedBlogs();
  }, []);

  useEffect(() => {
    filterAndSortBlogs();
  }, [blogs, searchTerm, selectedCategory, sortBy]);

  const fetchBlogs = async () => {
    setLoading(true);
    console.log('Fetching blogs with params:', { 
      page, 
      selectedCategory, 
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
        category: selectedCategory === 'All Categories' ? undefined : selectedCategory,
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

  const filterAndSortBlogs = () => {
    let filtered = [...blogs];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatTags(blog.tags).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(blog => blog.category === selectedCategory);
    }

    // Sort blogs
    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
        break;
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-viewed':
        filtered.sort((a, b) => b.views - a.views);
        break;
      default: // latest
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    setFilteredBlogs(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
      className={`group rounded-xl border transition-all duration-300 hover:shadow-lg ${
        featured ? 'p-0 overflow-hidden' : 'p-6'
      }`}
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border 
      }}
    >
      {featured && blog.featured_image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={blog.featured_image} 
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className={featured ? 'p-6' : ''}>
        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {blog.author_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: colors.cardForeground }}>
              {blog.author_name}
            </p>
            <div className="flex items-center space-x-2 text-xs opacity-60" style={{ color: colors.cardForeground }}>
              <span>{formatDate(blog.updated_at)}</span>
              <span>•</span>
              <span>{formatReadingTime(blog.reading_time)}</span>
            </div>
          </div>
          
          <button
            onClick={() => handleBookmark(blog.$id!)}
            className="p-2 rounded-full hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: colors.background }}
          >
            <FaBookmark className="text-sm opacity-60" />
          </button>
        </div>

        {/* Content */}
        <Link href={`/blog/${blog.$id}`}>
          <div className="cursor-pointer">
            <h2 className={`font-bold mb-2 group-hover:text-blue-600 transition-colors ${
              featured ? 'text-2xl' : 'text-xl'
            }`} style={{ color: colors.cardForeground }}>
              {blog.title}
            </h2>
            
            {blog.subtitle && (
              <h3 className="text-lg opacity-70 mb-2" style={{ color: colors.cardForeground }}>
                {blog.subtitle}
              </h3>
            )}
            
            <p className="opacity-70 mb-4 line-clamp-3" style={{ color: colors.cardForeground }}>
              {blog.excerpt}
            </p>
          </div>
        </Link>

        {!featured && blog.featured_image && (
          <div className="mb-4">
            <img 
              src={blog.featured_image} 
              alt={blog.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Tags */}
        {formatTags(blog.tags).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formatTags(blog.tags).slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
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
          
          <div className="flex items-center space-x-1 text-sm">
            <FaTag className="opacity-60" />
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {blog.category}
            </span>
          </div>
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
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Discover Stories
            </h1>
            <p className="text-xl opacity-70 max-w-2xl mx-auto" style={{ color: colors.foreground }}>
              Explore the latest insights, tutorials, and stories from our community of writers
            </p>
        </div>

        {/* Featured Stories */}
        {featuredBlogs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.foreground }}>
              Featured Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBlogs.map(blog => (
                <BlogCard key={blog.$id} blog={blog} featured />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                style={{ 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  color: colors.cardForeground 
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                style={{ 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  color: colors.cardForeground 
                }}
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="lg:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                style={{ 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  color: colors.cardForeground 
                }}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="space-y-6">
          {loading && blogs.length === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="p-6 rounded-xl border animate-pulse"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-32 bg-gray-300 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBlogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBlogs.map(blog => (
                  <BlogCard key={blog.$id} blog={blog} />
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
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
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
        <div className="fixed bottom-8 right-8">
          <Link href="/create-blog">
            <button className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-xl">
              ✏️
            </button>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}