'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { blogService } from '@/lib/blogService_new';
import { validateBlogData } from '@/lib/blogValidation';
import ProtectedRoute from '@/components/ProtectedRoute';
import NavigationWrapper from '@/components/NavigationWrapper';
import { 
  FaImage, 
  FaBold, 
  FaItalic, 
  FaLink, 
  FaListUl, 
  FaListOl, 
  FaQuoteLeft,
  FaCode,
  FaTimes,
  FaEye,
  FaUpload,
  FaSave,
  FaRocket,
  FaMagic,
  FaHeart,
  FaStar,
  FaCheckCircle,
  FaPlus,
  FaArrowLeft,
  FaHeading,
  FaPalette,
  FaLightbulb,
  FaFeatherAlt
} from 'react-icons/fa';

const CATEGORIES = [
  { value: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { value: 'Programming', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  { value: 'Data Science', icon: '📊', color: 'from-green-500 to-teal-500' },
  { value: 'AI & Machine Learning', icon: '🤖', color: 'from-purple-500 to-pink-500' },
  { value: 'Web Development', icon: '🌐', color: 'from-indigo-500 to-blue-500' },
  { value: 'Mobile Development', icon: '📱', color: 'from-pink-500 to-rose-500' },
  { value: 'DevOps', icon: '🔧', color: 'from-gray-500 to-slate-500' },
  { value: 'Design', icon: '🎨', color: 'from-violet-500 to-purple-500' },
  { value: 'Startup', icon: '🚀', color: 'from-emerald-500 to-green-500' },
  { value: 'Career', icon: '💼', color: 'from-amber-500 to-yellow-500' },
  { value: 'Tutorial', icon: '📚', color: 'from-blue-600 to-indigo-600' },
  { value: 'News', icon: '📰', color: 'from-red-500 to-pink-500' },
  { value: 'Opinion', icon: '💭', color: 'from-teal-500 to-cyan-500' },
  { value: 'Review', icon: '⭐', color: 'from-orange-500 to-red-500' }
];

export default function CreateBlogPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [] as string[],
    status: 'published' as 'draft' | 'published',
    featured: false,
    featured_image: '',
    seo_description: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // Auto-resize textareas
  useEffect(() => {
    const autoResize = (element: HTMLTextAreaElement | null) => {
      if (element) {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
      }
    };

    if (titleRef.current) autoResize(titleRef.current);
    if (contentRef.current) autoResize(contentRef.current);
  }, [formData.title, formData.content]);

  // Calculate word count and reading time
  useEffect(() => {
    const words = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200));
  }, [formData.content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to create a blog post');
      return;
    }

    setIsLoading(true);
    
    try {
      const blogData = {
        ...formData,
        author_id: user.$id,
        author_name: user.name,
        author_avatar: user.prefs?.avatar || '',
        author_bio: user.prefs?.bio || '',
        excerpt: formData.excerpt || formData.content.substring(0, 300) + '...',
        seo_description: formData.seo_description || formData.excerpt || formData.content.substring(0, 160),
        date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reading_time: Math.ceil(formData.content.split(' ').length / 200),
        readTime: Math.ceil(formData.content.split(' ').length / 200).toString(),
        tags: formData.tags.join(', '),
        views: 0,
        likes: 0,
        comments_count: 0,
        bookmarks: 0,
        rating: 0,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      };

      if (!validateBlogData(blogData)) {
        console.error('Blog validation failed:', blogData);
        alert('Missing required blog data. Please check the console for details.');
        return;
      }

      const createdBlog = await blogService.createBlog(blogData);
      console.log('Blog created successfully:', createdBlog);
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/blogs');
      }, 2000);
    } catch (error) {
      console.error('Error creating blog:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Error creating blog post: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only image files (JPEG, PNG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload an image smaller than 5MB');
      return;
    }

    setImageUploading(true);
    try {
      const imageUrl = await blogService.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        featured_image: imageUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newValue }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  // Success Animation Component
  const SuccessModal = () => (
    showSuccess && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div 
          className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl transform animate-pulse"
          style={{ backgroundColor: colors.card }}
        >
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              Blog Published Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">Redirecting to blogs page...</p>
          </div>
        </div>
      </div>
    )
  );

  return (
    <ProtectedRoute>
      <div 
        className="min-h-screen transition-all duration-300"
        style={{ backgroundColor: colors.background }}
      >
        <NavigationWrapper />
        <SuccessModal />
        
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-tr from-pink-400/20 to-red-400/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Modern Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100/80 to-blue-100/80 dark:from-purple-900/50 dark:to-blue-900/50 backdrop-blur-sm rounded-full mb-6 border border-purple-200/50 dark:border-purple-700/50">
                <FaFeatherAlt className="text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Share Your Story</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black mb-4 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 dark:from-gray-100 dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent">
                  Create & Inspire
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Craft compelling stories that resonate with your audience and leave a lasting impact
              </p>
            </div>

            {/* Writing Interface */}
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Title & Category Section */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                
                {/* Title Input */}
                <div className="mb-8">
                  <textarea
                    ref={titleRef}
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Write your title here..."
                    className="w-full text-3xl lg:text-4xl font-bold bg-transparent border-none outline-none resize-none overflow-hidden placeholder-gray-400 leading-tight"
                    style={{ 
                      color: colors.foreground,
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                    rows={1}
                    maxLength={200}
                  />
                  <div className="mt-2 text-sm text-gray-500 flex justify-between">
                    <span>{formData.title.length}/200</span>
                    <span className="text-purple-600">{readingTime} min read</span>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="mb-8">
                  <textarea
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Add a compelling subtitle..."
                    className="w-full text-lg bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed"
                    style={{ color: colors.foreground }}
                    rows={2}
                    maxLength={300}
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    {formData.subtitle.length}/300
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                    Choose Category
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {CATEGORIES.slice(0, 7).map((category) => (
                      <label
                        key={category.value}
                        className="cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={formData.category === category.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div 
                          className={`p-3 rounded-xl border transition-all duration-200 group-hover:scale-105 ${
                            formData.category === category.value
                              ? `bg-gradient-to-r ${category.color} border-transparent text-white shadow-md`
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          style={{
                            backgroundColor: formData.category === category.value ? undefined : colors.card
                          }}
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">{category.icon}</div>
                            <div className={`text-xs font-medium ${
                              formData.category === category.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {category.value.split(' ')[0]}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
                
                {/* Toolbar */}
                <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Bold"
                      >
                        <FaBold className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Italic"
                      >
                        <FaItalic className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('# ', '')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Heading"
                      >
                        <FaHeading className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('> ', '')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Quote"
                      >
                        <FaQuoteLeft className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm"
                        disabled={imageUploading}
                      >
                        <FaImage className="text-xs" />
                        <span>{imageUploading ? 'Uploading...' : 'Image'}</span>
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {wordCount} words
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                  <textarea
                    ref={contentRef}
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Tell your story... What insights do you want to share with the world?"
                    className="w-full min-h-[400px] text-lg bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed"
                    style={{ 
                      color: colors.foreground,
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.8'
                    }}
                  />
                </div>
              </div>

              {/* Tags & Settings */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                
                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    Tags
                  </h3>
                  <div className="flex space-x-3 mb-4">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tags..."
                      className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ 
                        backgroundColor: colors.background, 
                        color: colors.foreground 
                      }}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Featured Image Upload */}
                {formData.featured_image ? (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      Featured Image
                    </h3>
                    <div className="relative group">
                      <img 
                        src={formData.featured_image} 
                        alt="Featured" 
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaImage className="mx-auto text-gray-400 text-2xl mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Click to add featured image</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <button
                    type="button"
                    onClick={() => router.push('/blogs')}
                    className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    <FaArrowLeft />
                    <span>Back</span>
                  </button>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Save Draft
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !formData.title || !formData.content || !formData.category}
                      className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FaRocket className={isLoading ? 'animate-spin' : ''} />
                      <span>{isLoading ? 'Publishing...' : 'Publish Story'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </ProtectedRoute>
  );
}
