'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { blogService } from '@/lib/blogService_new';
import { Blog, Comment } from '@/lib/appwrite';
import NavigationWrapper from '@/components/NavigationWrapper';
import { 
  FaEye, 
  FaHeart, 
  FaComment,
  FaBookmark,
  FaPlus
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// BlogCard component moved outside to prevent re-creation
const BlogCard = ({ 
  blog, 
  user, 
  bookmarkedBlogs, 
  commentsData, 
  commentInputs, 
  loadingComments, 
  handleBookmark, 
  handleComment, 
  handleInputChange, 
  fetchBlogComments, 
  formatDate 
}: { 
  blog: Blog; 
  user: any; 
  bookmarkedBlogs: Set<string>; 
  commentsData: {[blogId: string]: Comment[]};
  commentInputs: {[blogId: string]: string};
  loadingComments: {[blogId: string]: boolean};
  handleBookmark: (blogId: string) => void;
  handleComment: (blogId: string) => void;
  handleInputChange: (blogId: string, value: string) => void;
  fetchBlogComments: (blogId: string) => void;
  formatDate: (dateString: string) => string;
}) => {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
      {/* Header with dots menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Title */}
          <Link href={`/blog/${blog.$id}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer mb-3">
              {blog.title || 'Untitled Blog'}
            </h2>
          </Link>
        </div>
        
        {/* Three dots menu */}
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Main content area with horizontal layout */}
      <div className="flex gap-6">
        {/* Left side - Content */}
        <div className="flex-1">
          {/* Author and date */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {blog.author_name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">{blog.author_name || 'Anonymous'}</span>
              <span>•</span>
              <span>{formatDate(blog.$createdAt!)}</span>
              <span>•</span>
              <span>{blog.readTime || '5 min read'}</span>
            </div>
          </div>

          {/* Blog excerpt */}
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
            {blog.excerpt || blog.content?.substring(0, 200) + '...' || 'No content available'}
          </p>

          {/* Tags */}
          {blog.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(typeof blog.tags === 'string' ? blog.tags.split(',') : blog.tags)
                .slice(0, 3)
                .map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                  >
                    {tag.trim()}
                  </span>
                ))}
            </div>
          )}

          {/* Engagement buttons */}
          <div className="flex items-center justify-between">
            {/* Left side - Stats */}
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500">
                <FaHeart className="w-4 h-4" />
                <span className="text-sm">{blog.likes || 0}</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500">
                <FaComment className="w-4 h-4" />
                <span className="text-sm">{blog.comments_count || 0}</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-yellow-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-sm">{blog.likes || 40}</span>
              </button>
            </div>

            {/* Right side - Bookmark */}
            <button
              onClick={() => handleBookmark(blog.$id!)}
              className={`transition-colors ${
                bookmarkedBlogs.has(blog.$id!) 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              <FaBookmark className={`w-4 h-4 ${bookmarkedBlogs.has(blog.$id!) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right side - Image */}
        {blog.featured_image && (
          <div className="w-48 h-32 flex-shrink-0">
            <img
              src={blog.featured_image}
              alt={blog.title || 'Blog image'}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        {/* Existing Comments */}
        {commentsData[blog.$id!] && commentsData[blog.$id!].length > 0 && (
          <div className="mb-4 space-y-3">
            {commentsData[blog.$id!].slice(0, 2).map((comment: Comment) => (
              <div key={comment.$id} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {comment.user_name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.user_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.$createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
            {commentsData[blog.$id!].length > 2 && (
              <button 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => fetchBlogComments(blog.$id!)}
              >
                Show more comments
              </button>
            )}
          </div>
        )}

        {/* Comment Input */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInputs[blog.$id!] || ''}
              onChange={(e) => handleInputChange(blog.$id!, e.target.value)}
              disabled={loadingComments[blog.$id!]}
              className="w-full px-4 py-2 pr-12 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button 
              onClick={() => handleComment(blog.$id!)}
              disabled={loadingComments[blog.$id!] || !commentInputs[blog.$id!]?.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              {loadingComments[blog.$id!] ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default function BlogsPage() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState<Set<string>>(new Set());
  const [commentsData, setCommentsData] = useState<{[blogId: string]: Comment[]}>({});
  const [commentInputs, setCommentInputs] = useState<{[blogId: string]: string}>({});
  const [loadingComments, setLoadingComments] = useState<{[blogId: string]: boolean}>({});

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch {
      return 'Recently';
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Prevent automatic scrolling
  useEffect(() => {
    const preventAutoScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('scroll', preventAutoScroll, { passive: false });
    return () => {
      document.removeEventListener('scroll', preventAutoScroll);
    };
  }, []);

  const fetchBlogs = async () => {
    try {
      const result = await blogService.getBlogs({ 
        offset: (page - 1) * 20, 
        limit: 20, 
        status: 'published'
      });
      
      if (page === 1) {
        setBlogs(result.blogs);
      } else {
        setBlogs(prev => [...prev, ...result.blogs]);
      }
      setHasMore(result.blogs.length === 20);

      // Fetch bookmark status for each blog if user is logged in
      if (user) {
        const bookmarkChecks = await Promise.all(
          result.blogs.map(blog => blogService.checkIfBookmarked(blog.$id!, user.$id))
        );
        
        const newBookmarkedBlogs = new Set<string>();
        result.blogs.forEach((blog, index) => {
          if (bookmarkChecks[index]) {
            newBookmarkedBlogs.add(blog.$id!);
          }
        });
        
        if (page === 1) {
          setBookmarkedBlogs(newBookmarkedBlogs);
        } else {
          setBookmarkedBlogs(prev => new Set([...prev, ...newBookmarkedBlogs]));
        }
      }

      // Fetch comments for each blog
      const commentsPromises = result.blogs.map(blog => 
        blogService.getComments(blog.$id!).catch(() => [] as Comment[])
      );
      const commentsResults = await Promise.all(commentsPromises);
      
      const newCommentsData: {[blogId: string]: Comment[]} = {};
      result.blogs.forEach((blog, index) => {
        newCommentsData[blog.$id!] = commentsResults[index];
      });
      
      if (page === 1) {
        setCommentsData(newCommentsData);
      } else {
        setCommentsData(prev => ({ ...prev, ...newCommentsData }));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await blogService.likeBlog(blogId, user.$id);
      setBlogs(prev => prev.map(blog => 
        blog.$id === blogId ? { ...blog, likes: (blog.likes || 0) + 1 } : blog
      ));
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
      // Check if the blog is already bookmarked
      const isBookmarked = bookmarkedBlogs.has(blogId);
      
      if (isBookmarked) {
        // Remove bookmark if already bookmarked
        await blogService.removeBookmark(blogId, user.$id);
        setBlogs(prev => prev.map(blog => 
          blog.$id === blogId ? { ...blog, bookmarks: Math.max(0, (blog.bookmarks || 0) - 1) } : blog
        ));
        setBookmarkedBlogs(prev => {
          const newSet = new Set(prev);
          newSet.delete(blogId);
          return newSet;
        });
      } else {
        // Add bookmark if not bookmarked
        await blogService.bookmarkBlog(blogId, user.$id);
        setBlogs(prev => prev.map(blog => 
          blog.$id === blogId ? { ...blog, bookmarks: (blog.bookmarks || 0) + 1 } : blog
        ));
        setBookmarkedBlogs(prev => new Set([...prev, blogId]));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleComment = async (blogId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const commentText = commentInputs[blogId]?.trim();
    if (!commentText) return;

    try {
      setLoadingComments(prev => ({ ...prev, [blogId]: true }));
      
      const comment = await blogService.addComment(blogId, user.$id, commentText, user.name);
      
      // Update comments data
      setCommentsData(prev => ({
        ...prev,
        [blogId]: [comment, ...(prev[blogId] || [])]
      }));
      
      // Update blog comments count
      setBlogs(prev => prev.map(blog => 
        blog.$id === blogId ? { ...blog, comments_count: (blog.comments_count || 0) + 1 } : blog
      ));
      
      // Clear input
      setCommentInputs(prev => ({ ...prev, [blogId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [blogId]: false }));
    }
  };

  const fetchBlogComments = async (blogId: string) => {
    try {
      const comments = await blogService.getComments(blogId);
      setCommentsData(prev => ({
        ...prev,
        [blogId]: comments
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Simple input handler
  const handleInputChange = (blogId: string, value: string) => {
    console.log('Input change:', blogId, value); // Debug log
    setCommentInputs(prev => ({
      ...prev,
      [blogId]: value
    }));
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 flex flex-col">
      <NavigationWrapper />

      {/* Main Content Container */}
      <div className="flex-1 pt-28 pb-4 flex flex-col overflow-hidden">
        
        {/* Header Section - Fixed */}
        <div className="flex-shrink-0 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6">
          <div className="space-y-4">
            {/* Simple Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Discover
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Explore popular blogs that inspire, educate, and entertain.
            </p>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
              <button className="pb-4 border-b-2 border-gray-900 dark:border-white font-medium text-gray-900 dark:text-white">
                Recommended
              </button>
              <button className="pb-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Add new
              </button>
              <button className="pb-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                First posts
              </button>
              <button className="pb-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Tags
              </button>
              <button className="pb-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Reddit
              </button>
              <button className="pb-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Latest
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-full">
            <div 
              className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
              style={{ 
                scrollBehavior: 'auto',
                overscrollBehavior: 'contain'
              }}
            >
              {/* Blog Container */}
              <div className="space-y-6 pb-8"
                style={{
                  scrollMarginTop: '0px',
                  scrollPaddingTop: '0px'
                }}
              >
            {loading && blogs.length === 0 ? (
              // Loading Skeleton
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                        <div className="flex items-center space-x-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
                        </div>
                      </div>
                      <div className="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : blogs.length > 0 ? (
              <>
                {/* Blogs List */}
                <div className="space-y-6">
                  {blogs.map(blog => (
                    <BlogCard 
                      key={blog.$id} 
                      blog={blog}
                      user={user}
                      bookmarkedBlogs={bookmarkedBlogs}
                      commentsData={commentsData}
                      commentInputs={commentInputs}
                      loadingComments={loadingComments}
                      handleBookmark={handleBookmark}
                      handleComment={handleComment}
                      handleInputChange={handleInputChange}
                      fetchBlogComments={fetchBlogComments}
                      formatDate={formatDate}
                    />
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
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Empty State
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No stories found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Be the first to share your story with the community
                </p>
                <Link href="/create-blog">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Write Your First Story
                  </button>
                </Link>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Link href="/create-blog">
            <button 
              className="group w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center text-2xl hover:scale-110"
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