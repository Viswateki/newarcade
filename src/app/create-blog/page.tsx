'use client';

import React, { useState, useRef } from 'react';
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
  FaArrowLeft
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
  const [currentStep, setCurrentStep] = useState(1);

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
        
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400 to-red-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
        </div>
        
        {/* Main Content Container */}
        <div className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Enhanced Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full mb-6">
                <FaMagic className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Create Amazing Content</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-black mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  arcade
                </span>
                <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
                  {' '}blogs
                </span>
              </h1>
              
              <p className="text-xl opacity-80 max-w-2xl mx-auto leading-relaxed" style={{ color: colors.foreground }}>
                Share your knowledge, inspire others, and build your personal brand with our intuitive blog creation platform
              </p>
              
              {/* Progress Indicator */}
              <div className="flex justify-center space-x-4 mt-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep >= step 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {currentStep > step ? <FaCheckCircle /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                        currentStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center space-x-6 mt-6">
                <button
                  type="button"
                  onClick={() => setIsPreview(!isPreview)}
                  className="group flex items-center space-x-3 px-8 py-4 border-2 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg font-semibold backdrop-blur-sm"
                  style={{ 
                    borderColor: colors.border,
                    color: colors.foreground,
                    backgroundColor: colors.card + '80'
                  }}
                >
                  <FaEye className="group-hover:animate-pulse" />
                  <span>{isPreview ? '✏️ Edit Mode' : '👁️ Preview Mode'}</span>
                </button>
              </div>
            </div>

            {!isPreview ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Step 1: Featured Image */}
                <div 
                  className="group p-8 rounded-3xl border-2 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm"
                  style={{ 
                    backgroundColor: colors.card + 'F0', 
                    borderColor: colors.border,
                  }}
                  onFocus={() => setCurrentStep(1)}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      1
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Featured Image
                    </h2>
                  </div>
                  
                  {formData.featured_image ? (
                    <div className="relative group/image">
                      <img 
                        src={formData.featured_image} 
                        alt="Featured" 
                        className="w-full h-80 object-cover rounded-2xl shadow-lg transition-transform duration-300 group-hover/image:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover/image:opacity-100 transition-all duration-300 rounded-2xl flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                          className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 shadow-lg hover:scale-110"
                        >
                          <FaTimes size={24} />
                        </button>
                      </div>
                      
                      {/* Image overlay info */}
                      <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl p-4 opacity-0 group-hover/image:opacity-100 transition-all duration-300">
                        <p className="text-sm font-medium" style={{ color: colors.foreground }}>
                          Perfect! Your featured image is ready ✨
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer hover:bg-opacity-50 transition-all duration-300 group/upload"
                      style={{ borderColor: colors.border }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="group-hover/upload:scale-110 transition-transform duration-300">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
                          <FaUpload className={imageUploading ? 'animate-spin' : 'group-hover/upload:animate-bounce'} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4" style={{ color: colors.foreground }}>
                          {imageUploading ? 'Uploading Your Masterpiece...' : 'Upload Featured Image'}
                        </h3>
                        <p className="opacity-70 text-lg mb-2" style={{ color: colors.foreground }}>
                          Drag & drop or click to select an amazing image
                        </p>
                        <p className="opacity-50 text-sm" style={{ color: colors.foreground }}>
                          Supports JPEG, PNG, WebP, GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Step 2: Title and Content */}
                <div 
                  className="group p-8 rounded-3xl border-2 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm"
                  style={{ 
                    backgroundColor: colors.card + 'F0', 
                    borderColor: colors.border,
                  }}
                  onFocus={() => setCurrentStep(2)}
                >
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      2
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Title & Content
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="What's your amazing story about? ✨"
                      className="w-full text-4xl font-black border-none outline-none bg-transparent placeholder-opacity-40 focus:placeholder-opacity-70 transition-all duration-300 py-4"
                      style={{ color: colors.cardForeground }}
                    />
                    
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      placeholder="Add a compelling subtitle that hooks your readers 🎯"
                      className="w-full text-xl border-none outline-none bg-transparent opacity-80 placeholder-opacity-40 focus:placeholder-opacity-70 transition-all duration-300 py-3"
                      style={{ color: colors.cardForeground }}
                    />
                  </div>

                  {/* Enhanced Formatting Toolbar */}
                  <div className="mt-8 p-6 rounded-2xl border-2" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                    <h4 className="text-lg font-semibold mb-4" style={{ color: colors.foreground }}>Formatting Tools</h4>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { icon: FaBold, action: () => insertFormatting('**', '**'), title: 'Bold', shortcut: 'Ctrl+B' },
                        { icon: FaItalic, action: () => insertFormatting('*', '*'), title: 'Italic', shortcut: 'Ctrl+I' },
                        { icon: FaQuoteLeft, action: () => insertFormatting('\n> '), title: 'Quote', shortcut: 'Ctrl+Q' },
                        { icon: FaCode, action: () => insertFormatting('`', '`'), title: 'Code', shortcut: 'Ctrl+`' },
                        { icon: FaListUl, action: () => insertFormatting('\n- '), title: 'Bullet List', shortcut: 'Ctrl+L' },
                        { icon: FaListOl, action: () => insertFormatting('\n1. '), title: 'Numbered List', shortcut: 'Ctrl+Shift+L' },
                      ].map((tool, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={tool.action}
                          className="group/btn p-4 rounded-xl hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg"
                          style={{ backgroundColor: colors.card }}
                          title={`${tool.title} (${tool.shortcut})`}
                        >
                          <tool.icon className="text-lg group-hover/btn:text-blue-500 transition-colors duration-300" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    id="content"
                    name="content"
                    required
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Start writing your amazing story... Share your knowledge, experiences, and insights with the world! 🚀"
                    className="w-full min-h-[600px] border-none outline-none bg-transparent text-lg leading-relaxed resize-none placeholder-opacity-40 focus:placeholder-opacity-70 transition-all duration-300 mt-6 p-6 rounded-2xl"
                    style={{ 
                      color: colors.cardForeground,
                      backgroundColor: colors.background + '50'
                    }}
                  />
                </div>

                {/* Step 3: Details & Settings */}
                <div 
                  className="group p-8 rounded-3xl border-2 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm"
                  style={{ 
                    backgroundColor: colors.card + 'F0', 
                    borderColor: colors.border,
                  }}
                  onFocus={() => setCurrentStep(3)}
                >
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      3
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Details & Settings
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Excerpt */}
                    <div className="lg:col-span-2">
                      <label className="block text-lg font-semibold mb-4" style={{ color: colors.cardForeground }}>
                        <FaHeart className="inline mr-2 text-red-500" />
                        Excerpt (Hook your readers!)
                      </label>
                      <textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        placeholder="Write a compelling excerpt that will make readers want to dive into your full story..."
                        className="w-full p-6 border-2 rounded-2xl resize-none transition-all duration-300 focus:ring-4 focus:ring-blue-300 focus:border-blue-500"
                        style={{ 
                          backgroundColor: colors.background, 
                          borderColor: colors.border,
                          color: colors.foreground 
                        }}
                        rows={4}
                      />
                    </div>

                    {/* Enhanced Category Selection */}
                    <div>
                      <label className="block text-lg font-semibold mb-4" style={{ color: colors.cardForeground }}>
                        <FaStar className="inline mr-2 text-yellow-500" />
                        Category *
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {CATEGORIES.map(category => (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                              formData.category === category.value
                                ? 'border-blue-500 shadow-lg shadow-blue-200 dark:shadow-blue-800'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                            style={{ 
                              backgroundColor: formData.category === category.value 
                                ? colors.background 
                                : colors.card,
                              color: colors.cardForeground
                            }}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">{category.icon}</div>
                              <div className="text-sm font-medium">{category.value}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Tags */}
                    <div>
                      <label className="block text-lg font-semibold mb-4" style={{ color: colors.cardForeground }}>
                        <FaMagic className="inline mr-2 text-purple-500" />
                        Tags
                      </label>
                      <div className="flex space-x-3 mb-4">
                        <input
                          type="text"
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add relevant tags..."
                          className="flex-1 p-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-purple-300 focus:border-purple-500"
                          style={{ 
                            backgroundColor: colors.background, 
                            borderColor: colors.border,
                            color: colors.foreground 
                          }}
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <FaPlus />
                        </button>
                      </div>
                      
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {formData.tags.map(tag => (
                            <span
                              key={tag}
                              className="group inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <span>#{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-red-500 transition-colors group-hover:scale-110"
                              >
                                <FaTimes size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Featured Toggle */}
                  <div className="mt-8 p-6 rounded-2xl" style={{ backgroundColor: colors.background }}>
                    <label className="flex items-center space-x-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-6 h-6 rounded border-2 text-blue-600 focus:ring-blue-500 transition-all duration-300"
                      />
                      <span className="text-lg font-medium group-hover:text-blue-600 transition-colors duration-300" style={{ color: colors.cardForeground }}>
                        <FaStar className="inline mr-2 text-yellow-500" />
                        Mark as Featured Blog ⭐
                      </span>
                    </label>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-8">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="group flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-all duration-300 text-lg font-medium"
                  >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span>Cancel</span>
                  </button>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        setFormData(prev => ({ ...prev, status: 'draft' }));
                        handleSubmit(e as any);
                      }}
                      disabled={isLoading}
                      className="group flex items-center space-x-3 px-8 py-4 border-2 rounded-2xl hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                      style={{ 
                        borderColor: colors.border,
                        color: colors.foreground,
                        backgroundColor: colors.card
                      }}
                    >
                      <FaSave className="group-hover:animate-pulse" />
                      <span>Save Draft</span>
                    </button>
                    
                    <button
                      type="submit"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
                      disabled={isLoading}
                      className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <FaRocket className={isLoading ? 'animate-spin' : 'group-hover:animate-bounce'} />
                      <span>{isLoading ? 'Publishing Magic...' : 'Publish Blog'}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              // Enhanced Preview Mode
              <div 
                className="p-12 rounded-3xl border-2 shadow-2xl backdrop-blur-sm"
                style={{ 
                  backgroundColor: colors.card + 'F0', 
                  borderColor: colors.border,
                }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-full">
                    <FaEye className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Preview Mode</span>
                  </div>
                </div>

                {formData.featured_image && (
                  <img 
                    src={formData.featured_image} 
                    alt="Featured" 
                    className="w-full h-80 object-cover rounded-2xl mb-12 shadow-lg"
                  />
                )}
                
                <h1 className="text-6xl font-black mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                  {formData.title || 'Your Amazing Title Here'}
                </h1>
                
                {formData.subtitle && (
                  <h2 className="text-2xl opacity-80 mb-12 font-medium leading-relaxed" style={{ color: colors.cardForeground }}>
                    {formData.subtitle}
                  </h2>
                )}
                
                <div className="prose prose-lg max-w-none leading-relaxed" style={{ color: colors.cardForeground }}>
                  {formData.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-8 text-lg">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-12 pt-8 border-t-2" style={{ borderColor: colors.border }}>
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium shadow-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}