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
  FaComment,
  FaBookmark,
  FaClock,
  FaUser,
  FaTags,
  FaStar,
  FaSearch,
  FaPlus,
  FaRss
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CategoryFilter from '@/components/CategoryFilter/CategoryFilter';


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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
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
    'Review',
  ];

  const filterAndSortBlogs = useCallback(() => {
    let filtered = [...blogs];

    // Exclude featured blogs from regular list to avoid duplication
    const featuredBlogIds = featuredBlogs.map(blog => blog.$id);
    filtered = filtered.filter(blog => !featuredBlogIds.includes(blog.$id));

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatTags(blog.tags).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(blog => blog.category === selectedCategory);
    }

    // Sort blogs by latest
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    setFilteredBlogs(filtered);
  }, [blogs, featuredBlogs, searchQuery, selectedCategory]);

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

  const BlogCard = ({ blog, featured = false }: { blog: Blog; featured?: boolean }) => {
    return (
      <article 
        className={`group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] flex flex-col ${
          featured ? 'lg:col-span-2 lg:row-span-2' : 'h-[480px]'
        }`}
        style={{ 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Image Section */}
        <Link href={`/blog/${blog.$id}`} className="block">
          <div className={`relative overflow-hidden cursor-pointer ${featured ? 'aspect-[16/9]' : 'h-48'}`}>
            {blog.featured_image ? (
              <>
                <img 
                  src={blog.featured_image} 
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            ) : (
              /* Enhanced gradient placeholder for blogs without images */
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center relative">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {(blog.title || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-md">
                    <p className="text-white font-semibold text-sm">
                      {blog.category || 'General'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Category Badge - Only show on image cards, not on placeholder cards */}
            {blog.featured_image && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 backdrop-blur-md rounded-full text-sm font-medium border bg-white/20 text-white border-white/20">
                  {blog.category || 'General'}
                </span>
              </div>
            )}

            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-sm font-bold">
                  <FaStar className="text-xs" />
                  <span>Featured</span>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col relative">
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                {(blog.author_name || 'Anonymous').charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: colors.cardForeground }}>
                {blog.author_name || 'Anonymous'}
              </p>
              <p className="text-xs opacity-60" style={{ color: colors.cardForeground }}>
                {blog.updated_at ? formatDate(blog.updated_at) : 'Recently published'}
              </p>
            </div>
          </div>

          {/* Title and Subtitle */}
          <Link href={`/blog/${blog.$id}`}>
            <div className="cursor-pointer mb-4 flex-1">
              <h2 className={`font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 mb-2 ${
                featured ? 'text-xl' : 'text-lg'
              }`} style={{ color: colors.cardForeground }}>
                {blog.title || 'Untitled Blog'}
              </h2>
              
              {blog.subtitle && blog.subtitle.trim() && (
                <h3 className={`opacity-70 line-clamp-2 leading-relaxed ${
                  featured ? 'text-base' : 'text-sm'
                }`} style={{ color: colors.cardForeground }}>
                  {blog.subtitle}
                </h3>
              )}

              {/* Content Preview */}
              {(blog.excerpt || blog.content) && (
                <div className={`opacity-60 line-clamp-2 leading-relaxed mt-2 ${
                  featured ? 'text-sm' : 'text-xs'
                }`} style={{ color: colors.cardForeground }}>
                  {blog.excerpt || blog.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                </div>
              )}
            </div>
          </Link>

          {/* Tags */}
          <div className="mb-4">
            {blog.tags && formatTags(blog.tags).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formatTags(blog.tags).slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{ 
                      backgroundColor: colors.accent + '20',
                      color: colors.accent,
                      border: `1px solid ${colors.accent}40`
                    }}
                  >
                    #{tag}
                  </span>
                ))}
                {formatTags(blog.tags).length > 3 && (
                  <span className="text-xs opacity-50 px-2 py-1" style={{ color: colors.cardForeground }}>
                    +{formatTags(blog.tags).length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: colors.accent + '20',
                    color: colors.accent,
                    border: `1px solid ${colors.accent}40`
                  }}
                >
                  #{blog.category || 'General'}
                </span>
              </div>
            )}
          </div>

          {/* Like, Bookmark and Other Stats - Fixed at bottom */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: colors.border }}>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(blog.$id!)}
                  className="group/btn flex items-center space-x-1 text-sm opacity-70 hover:opacity-100 hover:text-red-500 transition-all duration-300"
                  style={{ color: colors.cardForeground }}
                >
                  <FaHeart className="group-hover/btn:scale-125 transition-transform duration-300" />
                  <span>{blog.likes || 0}</span>
                </button>
                
                <Link href={`/blog/${blog.$id}#comments`}>
                  <div className="group/btn flex items-center space-x-1 text-sm opacity-70 hover:opacity-100 hover:text-blue-500 transition-all duration-300 cursor-pointer"
                    style={{ color: colors.cardForeground }}
                  >
                    <FaComment className="group-hover/btn:scale-125 transition-transform duration-300" />
                    <span>{blog.comments_count || 0}</span>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-1 text-sm opacity-70" style={{ color: colors.cardForeground }}>
                  <FaEye />
                  <span>{blog.views || 0}</span>
                </div>
              </div>
              
              <button
                onClick={() => handleBookmark(blog.$id!)}
                className="opacity-70 hover:opacity-100 hover:text-yellow-500 transition-all duration-300 hover:scale-125"
                style={{ color: colors.cardForeground }}
              >
                <FaBookmark className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/30 rounded-2xl transition-all duration-300 pointer-events-none" />
      </article>
    );
  };

  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{ backgroundColor: colors.background }}
    >
      <NavigationWrapper />

      {/* Main Content */}
      <div className="relative pt-28 pb-16">
        
        {/* Header Section */}
        <div className="text-center mb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            <p className="text-3xl lg:text-4xl font-bold opacity-90 max-w-3xl mx-auto leading-relaxed mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Discover stories crafted by our community with love
            </p>

            {/* Search Section */}
            <div className="flex justify-center mb-8">
              <div className="relative w-full max-w-lg">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stories, topics, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    color: colors.cardForeground 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Section */}
        <CategoryFilter
          categories={categories}
          activeCategory={selectedCategory}
          onCategoryClick={setSelectedCategory}
        />

        {/* Active Filters */}
        {(searchQuery || selectedCategory !== 'All') && (
          <div className="flex flex-wrap gap-2 justify-center mt-6 mb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center">
              {searchQuery && (
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  Category: {selectedCategory}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Blog Grid */}
            <div className="space-y-12">
              {loading && blogs.length === 0 ? (
                // Enhanced Loading Skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i}
                      className="overflow-hidden rounded-2xl border h-[420px]"
                      style={{ 
                        backgroundColor: colors.card, 
                        borderColor: colors.border 
                      }}
                    >
                      <div className="aspect-[16/10] bg-gray-300 dark:bg-gray-700"></div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex space-x-4">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
                          </div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (featuredBlogs.length > 0 || filteredBlogs.length > 0) ? (
                <>
                  {/* Featured Blogs Section */}
                  {featuredBlogs.length > 0 && !searchQuery && selectedCategory === 'All' && (
                    <div className="mb-16">
                      <div className="flex items-center space-x-3 mb-8">
                        <FaStar className="text-yellow-500 text-xl" />
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                          Featured Stories
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 auto-rows-max">
                        {featuredBlogs.map((blog, index) => (
                          <div key={`featured-${blog.$id}`} className={index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}>
                            <BlogCard blog={blog} featured={index === 0} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Blogs Section */}
                  {filteredBlogs.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold" style={{ color: colors.foreground }}>
                          {searchQuery || selectedCategory !== 'All' ? 'Search Results' : 'All Stories'}
                        </h2>
                        <span className="text-sm opacity-60" style={{ color: colors.foreground }}>
                          {filteredBlogs.length} {filteredBlogs.length === 1 ? 'story' : 'stories'} found
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                        {filteredBlogs.map(blog => (
                          <BlogCard key={blog.$id} blog={blog} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {hasMore && !searchQuery && selectedCategory === 'All' && (
                    <div className="text-center pt-12">
                      <button
                        onClick={() => {
                          setPage(prev => prev + 1);
                          fetchBlogs();
                        }}
                        disabled={loading}
                        className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <span className="flex items-center space-x-2">
                          <span>{loading ? 'Loading More Stories...' : 'Load More Stories'}</span>
                          {!loading && <FaPlus className="group-hover:rotate-180 transition-transform duration-300" />}
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // Enhanced Empty State
                <div className="text-center py-20">
                  <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                    <div className="text-6xl opacity-40">📝</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: colors.foreground }}>
                    {searchQuery || selectedCategory !== 'All' ? 'No stories match your search' : 'No stories found'}
                  </h3>
                  <p className="opacity-70 text-lg mb-8 max-w-md mx-auto" style={{ color: colors.foreground }}>
                    {searchQuery || selectedCategory !== 'All' 
                      ? 'Try adjusting your search terms or browse all categories'
                      : 'Be the first to share your amazing story with the community'
                    }
                  </p>
                  {searchQuery || selectedCategory !== 'All' ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg"
                    >
                      Browse All Stories
                    </button>
                  ) : (
                    <Link href="/create-blog">
                      <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg">
                        Write Your First Story
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Link href="/create-blog">
            <button 
              className="group w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center text-2xl hover:scale-110"
              title="Write a new story"
            >
              <FaPlus className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}