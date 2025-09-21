'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { blogService } from '@/lib/blogService_new';
import { formatTags } from '@/lib/tagsHelper';
import type { Blog } from '@/lib/appwrite';
import CommentsSection from '@/components/CommentsSection';
import { 
  FaHeart, 
  FaShare, 
  FaCalendarAlt, 
  FaClock, 
  FaEye, 
  FaComment,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaCopy,
  FaCheck,
  FaPaperPlane,
  FaArrowLeft,
  FaExpand,
  FaCompress,
  FaAdjust,
  FaTextHeight,
  FaFont,
  FaReply
} from 'react-icons/fa';

export default function BlogPostPage() {
  const { id } = useParams();
  const { colors, theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Reading experience states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [showReadingTools, setShowReadingTools] = useState(false);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  useEffect(() => {
    if (id) {
      fetchBlogData();
    }
  }, [id]);

  useEffect(() => {
    if (blog && user) {
      checkUserInteractions();
    }
  }, [blog, user]);

  // Calculate reading time
  useEffect(() => {
    if (blog) {
      const wordsPerMinute = 200;
      const words = blog.content.trim().split(/\s+/).length;
      const time = Math.ceil(words / wordsPerMinute);
      setEstimatedReadTime(time);
    }
  }, [blog]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setReadingProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate reading time
  useEffect(() => {
    if (blog?.content) {
      const wordsPerMinute = 200;
      const words = blog.content.trim().split(/\s+/).length;
      const time = Math.ceil(words / wordsPerMinute);
      setEstimatedReadTime(time);
    }
  }, [blog]);

  const getImageUrl = (blog: Blog) => {
    return blog.featured_image || null;
  };

  const fetchBlogData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blog post
      const blogPost = await blogService.getBlogById(id as string);
      setBlog(blogPost);
      
      // Increment view count
      await blogService.incrementViews(id as string);
      
      // Fetch related blogs
      if (blogPost.category) {
        const related = await blogService.getBlogs({ 
          category: blogPost.category,
          limit: 4 
        });
        setRelatedBlogs(related.blogs.filter(b => b.$id !== id));
      }
      
    } catch (error) {
      console.error('Error fetching blog:', error);
      router.push('/blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserInteractions = async () => {
    if (!user || !blog || !blog.$id) return;
    
    try {
      const liked = await blogService.checkIfLiked(blog.$id, user.id);
      setIsLiked(liked);
    } catch (error) {
      console.error('Error checking user interactions:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !blog || !blog.$id) return;
    
    try {
      if (isLiked) {
        await blogService.unlikeBlog(blog.$id, user.id);
        setBlog(prev => prev ? { ...prev, likes: prev.likes - 1 } : null);
      } else {
        await blogService.likeBlog(blog.$id, user.id);
        setBlog(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || '';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.accent }}></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: colors.foreground }}>
            Blog post not found
          </h1>
          <button
            onClick={() => router.push('/blogs')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-20"
      style={{ backgroundColor: colors.background }}
    >
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        {/* Back Button and Like */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/blogs')}
            className="flex items-center space-x-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: colors.foreground }}
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </button>
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-300 ${
              isLiked ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
            }`}
          >
            <FaHeart className={`w-4 h-4 ${isLiked ? 'text-red-500' : ''}`} />
            <span className="text-sm">{blog.likes}</span>
          </button>
        </div>

        {/* Category */}
        <div className="mb-4">
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
          >
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h1 
          className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
          style={{ color: colors.foreground }}
        >
          {blog.title}
        </h1>

        {/* Subtitle */}
        {blog.subtitle && (
          <p 
            className="text-lg md:text-xl leading-relaxed mb-6 opacity-80"
            style={{ color: colors.foreground }}
          >
            {blog.subtitle}
          </p>
        )}

        {/* Author & Meta Info */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: colors.accent }}
            >
              {blog.author_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <h3 className="font-medium text-sm" style={{ color: colors.foreground }}>
                {blog.author_name}
              </h3>
              <div className="flex items-center space-x-3 text-xs opacity-70" style={{ color: colors.foreground }}>
                <span className="flex items-center space-x-1">
                  <FaCalendarAlt className="w-3 h-3" />
                  <span>{formatDate(blog.$createdAt)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FaClock className="w-3 h-3" />
                  <span>{getReadingTime(blog.content)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FaEye className="w-3 h-3" />
                  <span>{blog.views} views</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ borderColor: colors.border, color: colors.foreground }}
            >
              <FaShare className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            
            {/* Share Menu */}
            {showShareMenu && (
              <div 
                className="absolute right-0 top-12 mt-2 p-4 rounded-lg shadow-lg border z-10"
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-500 transition-colors"
                  >
                    <FaTwitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-700 transition-colors"
                  >
                    <FaLinkedin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    style={{ color: colors.foreground }}
                  >
                    {copied ? <FaCheck className="w-5 h-5 text-green-500" /> : <FaCopy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image Section - Only show if blog has featured_image */}
      {blog.featured_image && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-[300px] md:h-[400px] object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
            
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span 
                className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border"
                style={{ 
                  backgroundColor: colors.background + 'E6', 
                  color: colors.accent,
                  borderColor: colors.accent + '40'
                }}
              >
                {blog.category}
              </span>
            </div>
            
            {/* Reading Time */}
            <div className="absolute top-4 right-4">
              <span 
                className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border flex items-center space-x-1"
                style={{ 
                  backgroundColor: colors.background + 'E6', 
                  color: colors.foreground,
                  borderColor: colors.border
                }}
              >
                <FaClock className="w-3 h-3" />
                <span>{estimatedReadTime} min read</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Category Badge for blogs without images */}
      {!blog.featured_image && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <span 
              className="px-4 py-2 rounded-full text-sm font-medium border"
              style={{ 
                backgroundColor: colors.accent + '20', 
                color: colors.accent,
                borderColor: colors.accent + '40'
              }}
            >
              {blog.category}
            </span>
            <span 
              className="px-4 py-2 rounded-full text-sm font-medium border flex items-center space-x-2"
              style={{ 
                backgroundColor: colors.background, 
                color: colors.foreground,
                borderColor: colors.border
              }}
            >
              <FaClock className="w-4 h-4" />
              <span>{estimatedReadTime} min read</span>
            </span>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article 
          className="prose prose-lg max-w-none mb-12"
          style={{ 
            color: colors.foreground,
            fontSize: `${fontSize}px`,
            lineHeight: '1.7'
          }}
        >
          <div className="space-y-6">
            {blog.content.split('\n').map((paragraph, index) => {
              if (!paragraph.trim()) return null;
              return (
                <p 
                  key={index} 
                  className="text-justify leading-relaxed mb-6"
                  style={{ 
                    color: colors.foreground,
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.7'
                  }}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </article>

        {/* Tags */}
        {blog.tags && formatTags(blog.tags).length > 0 && (
          <div className="mb-12 pb-8 border-b" style={{ borderColor: colors.border }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.foreground }}>
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {formatTags(blog.tags).map((tag: string) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
                  style={{ 
                    backgroundColor: colors.accent + '15', 
                    color: colors.accent 
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Section */}
        <div className="mb-12 pb-8 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                isLiked ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: isLiked ? undefined : colors.card,
                color: isLiked ? undefined : colors.foreground,
                border: `1px solid ${colors.border}`
              }}
            >
              <FaHeart className={`w-5 h-5 ${isLiked ? 'text-red-500' : ''}`} />
              <span>{blog.likes} {blog.likes === 1 ? 'Like' : 'Likes'}</span>
            </button>
            
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:bg-gray-100 relative"
              style={{
                backgroundColor: colors.card,
                color: colors.foreground,
                border: `1px solid ${colors.border}`
              }}
            >
              <FaShare className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection 
          blogId={blog.$id!}
          currentUser={user}
        />

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: colors.foreground }}>
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <div
                  key={relatedBlog.$id}
                  onClick={() => router.push(`/blog/${relatedBlog.$id}`)}
                  className="cursor-pointer p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <div className="mb-3">
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
                    >
                      {relatedBlog.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: colors.foreground }}>
                    {relatedBlog.title}
                  </h4>
                  <p className="text-sm opacity-70 mb-3 line-clamp-2" style={{ color: colors.foreground }}>
                    {relatedBlog.subtitle || relatedBlog.content.substring(0, 100) + '...'}
                  </p>
                  <div className="flex items-center justify-between text-xs opacity-60" style={{ color: colors.foreground }}>
                    <span>{formatDate(relatedBlog.$createdAt)}</span>
                    <span>{relatedBlog.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
