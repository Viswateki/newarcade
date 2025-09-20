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
  FaPlus,
  FaShare
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// BlogCard component moved outside to prevent re-creation
const BlogCard = ({ 
  blog, 
  user, 
  commentsData, 
  commentInputs, 
  loadingComments,
  replyingTo,
  replyInputs,
  showAllComments,
  handleComment, 
  handleInputChange, 
  fetchBlogComments, 
  formatDate,
  handleReplyToggle,
  handleReplyInputChange,
  handleReplySubmit,
  handleDeleteComment,
  handleCancelReply,
  handleToggleShowComments,
  handleReplyToReply
}: { 
  blog: Blog; 
  user: any; 
  commentsData: {[blogId: string]: Comment[]};
  commentInputs: {[blogId: string]: string};
  loadingComments: {[blogId: string]: boolean};
  replyingTo: {[commentId: string]: boolean};
  replyInputs: {[commentId: string]: string};
  showAllComments: {[blogId: string]: boolean};
  handleComment: (blogId: string) => void;
  handleInputChange: (blogId: string, value: string) => void;
  fetchBlogComments: (blogId: string) => void;
  formatDate: (dateString: string) => string;
  handleReplyToggle: (commentId: string) => void;
  handleReplyInputChange: (commentId: string, value: string) => void;
  handleReplySubmit: (blogId: string, parentCommentId: string) => void;
  handleDeleteComment: (commentId: string, blogId: string) => void;
  handleCancelReply: (commentId: string) => void;
  handleToggleShowComments: (blogId: string) => void;
  handleReplyToReply: (parentCommentId: string, replyToUserName: string) => void;
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

              <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-green-500">
                <FaShare className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
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
        {/* Comment Input at the top */}
        <div className="flex items-center space-x-3 mb-6">
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

        {/* Comments heading */}
        {commentsData[blog.$id!] && commentsData[blog.$id!].length > 0 && (
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Comments ({commentsData[blog.$id!].length})
          </h4>
        )}

        {/* Existing Comments */}
        {commentsData[blog.$id!] && commentsData[blog.$id!].length > 0 ? (
          <div className="mb-4 space-y-4">
            {commentsData[blog.$id!]
              .filter(comment => !comment.parent_comment_id) // Only show main comments first
              .slice(0, showAllComments[blog.$id!] ? undefined : 3) // Show 3 initially, all when expanded
              .map((comment: Comment) => (
              <div key={comment.$id} className="space-y-3">
                {/* Main Comment */}
                <div className="flex items-start space-x-3">
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 mb-2">
                      {comment.content}
                    </p>
                    
                    {/* Comment Actions */}
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleReplyToggle(comment.$id!)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        Reply
                      </button>
                      <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                        Like
                      </button>
                      {comment.user_id === user?.$id && (
                        <button 
                          onClick={() => handleDeleteComment(comment.$id!, blog.$id!)}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Replies to this comment - YouTube style */}
                    {commentsData[blog.$id!]
                      .filter(reply => reply.parent_comment_id === comment.$id)
                      .map((reply: Comment) => (
                        <div key={reply.$id} className="mt-3 ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {reply.user_name?.charAt(0).toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {reply.user_name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(reply.$createdAt!).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                {reply.reply_to_user && reply.reply_to_user !== comment.user_name && (
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    @{reply.reply_to_user}{' '}
                                  </span>
                                )}
                                {reply.content}
                              </p>
                              
                              {/* Reply Actions - YouTube style */}
                              <div className="flex items-center space-x-4 mt-2">
                                <button 
                                  onClick={() => handleReplyToReply(comment.$id!, reply.user_name)}
                                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors font-medium"
                                >
                                  Reply
                                </button>
                                <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                                  👍
                                </button>
                                <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                                  👎
                                </button>
                                {reply.user_id === user?.$id && (
                                  <button 
                                    onClick={() => handleDeleteComment(reply.$id!, blog.$id!)}
                                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Reply Input Form */}
                    {replyingTo[comment.$id!] && (
                      <div className="mt-3 ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </span>
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              placeholder={"Reply to " + (comment.user_name || 'Anonymous') + "..."}
                              value={replyInputs[comment.$id!] || ''}
                              onChange={(e) => handleReplyInputChange(comment.$id!, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleReplySubmit(blog.$id!, comment.$id!);
                                }
                              }}
                              disabled={loadingComments["reply-" + comment.$id]}
                              data-reply-id={comment.$id}
                              className="w-full px-3 py-2 pr-20 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                              autoFocus
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                              <button 
                                onClick={() => handleCancelReply(comment.$id!)}
                                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                title="Cancel reply"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleReplySubmit(blog.$id!, comment.$id!)}
                                disabled={loadingComments["reply-" + comment.$id] || !replyInputs[comment.$id!]?.trim()}
                                className="p-1 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                                title="Send reply"
                              >
                                {loadingComments["reply-" + comment.$id] ? (
                                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show More/Fewer Comments Button */}
            {commentsData[blog.$id!] && commentsData[blog.$id!].filter(comment => !comment.parent_comment_id).length > 3 && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  className="w-full text-center py-2 px-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 hover:text-blue-700 text-sm font-medium rounded-lg transition-colors"
                  onClick={() => handleToggleShowComments(blog.$id!)}
                >
                  {showAllComments[blog.$id!] ? 
                    '▲ Show fewer comments' : 
                    `▼ Show more comments (${commentsData[blog.$id!].filter(comment => !comment.parent_comment_id).length - 3} more)`
                  }
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
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
  const [commentsData, setCommentsData] = useState<{[blogId: string]: Comment[]}>({});
  const [commentInputs, setCommentInputs] = useState<{[blogId: string]: string}>({});
  const [loadingComments, setLoadingComments] = useState<{[blogId: string]: boolean}>({});
  const [replyingTo, setReplyingTo] = useState<{[commentId: string]: boolean}>({});
  const [replyInputs, setReplyInputs] = useState<{[commentId: string]: string}>({});
  const [showAllComments, setShowAllComments] = useState<{[blogId: string]: boolean}>({});
  
  // Request deduplication - track recent comment submissions
  const recentRequests = React.useRef<Map<string, number>>(new Map());

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
      await blogService.likeBlog(blogId, user.id);
      setBlogs(prev => prev.map(blog => 
        blog.$id === blogId ? { ...blog, likes: (blog.likes || 0) + 1 } : blog
      ));
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleComment = async (blogId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const commentText = commentInputs[blogId]?.trim();
    if (!commentText) {
      console.log('No comment text provided');
      return;
    }
    
    // Prevent duplicate submissions with deduplication
    if (loadingComments[blogId]) {
      console.log('Comment submission already in progress for blog:', blogId);
      return;
    }
    
    // Check for recent duplicate requests - only prevent EXACT same content within 2 seconds
    const requestKey = `${blogId}-${user.id}-${commentText}`;
    const now = Date.now();
    const lastRequest = recentRequests.current.get(requestKey);
    
    if (lastRequest && (now - lastRequest) < 2000) {
      console.log('Duplicate request detected (exact same content within 2 seconds), ignoring. Time since last:', now - lastRequest, 'ms');
      return;
    }
    
    // Track this request
    recentRequests.current.set(requestKey, now);
    
    // Cleanup old requests (older than 10 seconds)
    const cutoff = now - 10000;
    for (const [key, timestamp] of recentRequests.current.entries()) {
      if (timestamp < cutoff) {
        recentRequests.current.delete(key);
      }
    }

    try {
      setLoadingComments(prev => ({ ...prev, [blogId]: true }));
      
      const comment = await blogService.addComment(blogId, user.id, commentText, user.name);
      
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
      
      console.log('Comment added successfully:', comment);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      
      // Show user-friendly error message
      if (error.message?.includes('already exists') || error.message?.includes('Document with the requested ID already exists')) {
        console.log('Duplicate comment detected, trying to refresh comments...');
        // Refresh comments to show any successfully added comments
        await fetchBlogComments(blogId);
      } else {
        console.log('Failed to add comment:', error.message);
        alert('Failed to add comment. Please try again.');
      }
    } finally {
      setLoadingComments(prev => ({ ...prev, [blogId]: false }));
      
      // Remove from recent requests after completion
      setTimeout(() => {
        recentRequests.current.delete(requestKey);
      }, 1000);
    }
  };

  const fetchBlogComments = async (blogId: string) => {
    try {
      console.log('Fetching comments for blog:', blogId);
      const comments = await blogService.getComments(blogId);
      console.log('Fetched comments:', comments.length, 'comments for blog', blogId);
      
      // Debug: Log comment structure
      comments.forEach(comment => {
        console.log('Comment structure:', {
          id: comment.$id,
          user: comment.user_name,
          content: comment.content?.substring(0, 50),
          parent_id: comment.parent_comment_id || 'NO_PARENT',
          reply_to: comment.reply_to_user || 'NO_REPLY_TO',
          is_main_comment: !comment.parent_comment_id
        });
      });
      
      setCommentsData(prev => ({
        ...prev,
        [blogId]: comments
      }));
    } catch (error) {
      console.error('Error fetching comments for blog', blogId, ':', error);
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

  // Reply handlers
  const handleReplyInputChange = (commentId: string, value: string) => {
    setReplyInputs(prev => ({
      ...prev,
      [commentId]: value
    }));
  };

  const handleReplyToggle = (commentId: string) => {
    setReplyingTo(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    // Clear reply input when closing
    if (replyingTo[commentId]) {
      setReplyInputs(prev => ({
        ...prev,
        [commentId]: ''
      }));
    }
  };

  // YouTube-style: Handle reply to a reply (still goes under main comment)
  const handleReplyToReply = (parentCommentId: string, replyToUserName: string) => {
    setReplyingTo(prev => ({
      ...prev,
      [parentCommentId]: true
    }));
    
    // Pre-fill the reply input with @mention
    setReplyInputs(prev => ({
      ...prev,
      [parentCommentId]: `@${replyToUserName} `
    }));
    
    // Focus the input after a brief delay
    setTimeout(() => {
      const input = document.querySelector(`input[data-reply-id="${parentCommentId}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 100);
  };

  const handleReplySubmit = async (blogId: string, parentCommentId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const replyText = replyInputs[parentCommentId]?.trim();
    if (!replyText) {
      console.log('No reply text provided');
      return;
    }

    // Prevent duplicate submissions with deduplication
    if (loadingComments["reply-" + parentCommentId]) {
      console.log('Reply submission already in progress for comment:', parentCommentId);
      return;
    }
    
    // Check for recent duplicate requests - only prevent EXACT same reply within 2 seconds
    const requestKey = `reply-${blogId}-${parentCommentId}-${user.id}-${replyText}`;
    const now = Date.now();
    const lastRequest = recentRequests.current.get(requestKey);
    
    if (lastRequest && (now - lastRequest) < 2000) {
      console.log('Duplicate reply request detected (exact same content within 2 seconds), ignoring. Time since last:', now - lastRequest, 'ms');
      return;
    }
    
    // Track this request
    recentRequests.current.set(requestKey, now);

    try {
      setLoadingComments(prev => ({ ...prev, ["reply-" + parentCommentId]: true }));
      
      // Find the parent comment to get the user being replied to
      const parentComment = commentsData[blogId]?.find(comment => comment.$id === parentCommentId);
      
      // YouTube-style reply logic: Extract @mention if present
      let replyToUser = '';
      let cleanContent = replyText;
      
      // Check if reply starts with @mention
      const mentionMatch = replyText.match(/^@(\w+)\s+(.*)$/);
      if (mentionMatch) {
        replyToUser = mentionMatch[1];
        cleanContent = mentionMatch[2].trim();
      } else {
        // If no @mention, replying to the main comment author
        replyToUser = parentComment?.user_name || '';
      }
      
      console.log('Reply details:', {
        parentCommentId,
        parentComment: parentComment?.user_name,
        replyToUser,
        originalText: replyText,
        cleanContent
      });
      
      // Add reply comment with parent info
      const reply = await blogService.addComment(
        blogId, 
        user.id, 
        cleanContent, // Use clean content without @mention
        user.name, 
        undefined, // userAvatar
        parentCommentId, 
        replyToUser
      );
      
      // Update comments data
      setCommentsData(prev => ({
        ...prev,
        [blogId]: [reply, ...(prev[blogId] || [])]
      }));
      
      // Update blog comments count
      setBlogs(prev => prev.map(blog => 
        blog.$id === blogId ? { ...blog, comments_count: (blog.comments_count || 0) + 1 } : blog
      ));
      
      // Clear reply input and close reply form
      setReplyInputs(prev => ({ ...prev, [parentCommentId]: '' }));
      setReplyingTo(prev => ({ ...prev, [parentCommentId]: false }));
      
      console.log('Reply added successfully:', reply);
    } catch (error: any) {
      console.error('Error adding reply:', error);
      
      // Show user-friendly error message
      if (error.message?.includes('already exists') || error.message?.includes('Document with the requested ID already exists')) {
        console.log('Duplicate reply detected, trying to refresh comments...');
        // Refresh comments to show any successfully added replies
        await fetchBlogComments(blogId);
      } else {
        console.log('Failed to add reply:', error.message);
        alert('Failed to add reply. Please try again.');
      }
    } finally {
      setLoadingComments(prev => ({ ...prev, ["reply-" + parentCommentId]: false }));
      
      // Remove from recent requests after completion
      setTimeout(() => {
        recentRequests.current.delete(requestKey);
      }, 1000);
    }
  };

  // Delete comment handler
  // Delete comment handler
  const handleDeleteComment = async (commentId: string, blogId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setLoadingComments(prev => ({ ...prev, [`delete-${commentId}`]: true }));
      
      await blogService.deleteComment(commentId, blogId);
      
      // Remove comment from local state
      setCommentsData(prev => ({
        ...prev,
        [blogId]: prev[blogId]?.filter(comment => comment.$id !== commentId) || []
      }));
      
      // Update blog comments count
      setBlogs(prev => prev.map(blog => 
        blog.$id === blogId ? { ...blog, comments_count: Math.max((blog.comments_count || 0) - 1, 0) } : blog
      ));
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [`delete-${commentId}`]: false }));
    }
  };

  // Cancel reply handler
  const handleCancelReply = (commentId: string) => {
    setReplyingTo(prev => ({ ...prev, [commentId]: false }));
    setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
  };

  // Toggle show all comments handler
  const handleToggleShowComments = (blogId: string) => {
    setShowAllComments(prev => ({ ...prev, [blogId]: !prev[blogId] }));
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
                      commentsData={commentsData}
                      commentInputs={commentInputs}
                      loadingComments={loadingComments}
                      replyingTo={replyingTo}
                      replyInputs={replyInputs}
                      showAllComments={showAllComments}
                      handleComment={handleComment}
                      handleInputChange={handleInputChange}
                      fetchBlogComments={fetchBlogComments}
                      formatDate={formatDate}
                      handleReplyToggle={handleReplyToggle}
                      handleReplyInputChange={handleReplyInputChange}
                      handleReplySubmit={handleReplySubmit}
                      handleDeleteComment={handleDeleteComment}
                      handleCancelReply={handleCancelReply}
                      handleToggleShowComments={handleToggleShowComments}
                      handleReplyToReply={handleReplyToReply}
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