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
  FaUpload
} from 'react-icons/fa';

const CATEGORIES = [
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
    status: 'published' as 'draft' | 'published', // Changed default to published
    featured: false,
    featured_image: '',
    seo_description: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

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
        readTime: Math.ceil(formData.content.split(' ').length / 200).toString(), // Convert to string
        tags: formData.tags.join(', '), // Convert array to string for Appwrite
        views: 0,
        likes: 0,
        comments_count: 0,
        bookmarks: 0,
        rating: 0,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      };

      console.log('Creating blog with data:', blogData);
      console.log('Form status before submission:', formData.status);
      console.log('Final blog data status:', blogData.status);

      // Validate blog data before sending to Appwrite
      if (!validateBlogData(blogData)) {
        console.error('Blog validation failed:', blogData);
        alert('Missing required blog data. Please check the console for details.');
        return;
      }

      const createdBlog = await blogService.createBlog(blogData);
      console.log('Blog created successfully:', createdBlog);
      
      alert('Blog published successfully!');
      router.push('/blogs');
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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only image files (JPEG, PNG, WebP, GIF)');
      return;
    }

    // Validate file size (max 5MB)
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
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  return (
    <ProtectedRoute>
      <div 
        className="min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <NavigationWrapper />
        
        {/* Main Content Container with proper spacing */}
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-12 space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
                  arcade blogs
                </h1>
                <p className="opacity-80 text-xl" style={{ color: colors.foreground }}>
                  Create and share amazing content with the community
                </p>
              </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center space-x-2 px-6 py-3 border-2 rounded-xl hover:bg-opacity-80 transition-all duration-300 shadow-md font-semibold"
              style={{ 
                borderColor: colors.border,
                color: colors.foreground 
              }}
            >
              <FaEye />
              <span>{isPreview ? '✏️ Edit' : '👁️ Preview'}</span>
            </button>
          </div>
        </div>

        {!isPreview ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Featured Image Upload */}
            <div 
              className="p-8 rounded-2xl border-2 shadow-lg"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <label className="block text-lg font-semibold mb-6" style={{ color: colors.cardForeground }}>
                Featured Image
              </label>
              
              {formData.featured_image ? (
                <div className="relative group">
                  <img 
                    src={formData.featured_image} 
                    alt="Featured" 
                    className="w-full h-80 object-cover rounded-xl shadow-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-3 border-dashed rounded-xl p-12 text-center cursor-pointer hover:bg-opacity-50 transition-all duration-300 group"
                  style={{ borderColor: colors.border }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <FaUpload className="mx-auto text-6xl mb-6 opacity-60" style={{ color: colors.foreground }} />
                    <p className="text-xl font-medium mb-2" style={{ color: colors.foreground }}>
                      {imageUploading ? 'Uploading...' : 'Upload Featured Image'}
                    </p>
                    <p className="opacity-60 text-sm" style={{ color: colors.foreground }}>
                      Click to browse or drag and drop an image
                    </p>
                    <p className="opacity-40 text-xs mt-2" style={{ color: colors.foreground }}>
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

            {/* Title and Subtitle */}
            <div 
              className="p-8 rounded-2xl border-2 shadow-lg"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter your blog title..."
                className="w-full text-4xl font-bold border-none outline-none bg-transparent mb-6 placeholder-opacity-40 focus:placeholder-opacity-60 transition-all duration-300"
                style={{ color: colors.cardForeground }}
              />
              
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Add a compelling subtitle (optional)"
                className="w-full text-xl border-none outline-none bg-transparent opacity-70 placeholder-opacity-40 focus:placeholder-opacity-60 transition-all duration-300"
                style={{ color: colors.cardForeground }}
              />
            </div>

            {/* Content Editor */}
            <div 
              className="p-8 rounded-2xl border-2 shadow-lg"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Formatting Toolbar */}
              <div className="flex flex-wrap gap-3 mb-6 p-4 border-b-2" style={{ borderColor: colors.border }}>
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="p-3 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-sm"
                  style={{ backgroundColor: colors.background }}
                  title="Bold"
                >
                  <FaBold />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="p-3 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-sm"
                  style={{ backgroundColor: colors.background }}
                  title="Italic"
                >
                  <FaItalic />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n> ')}
                  className="p-3 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-sm"
                  style={{ backgroundColor: colors.background }}
                  title="Quote"
                >
                  <FaQuoteLeft />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('`', '`')}
                  className="p-3 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-sm"
                  style={{ backgroundColor: colors.background }}
                  title="Code"
                >
                  <FaCode />
                </button>
              </div>

              <textarea
                id="content"
                name="content"
                required
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Start writing your amazing blog content..."
                className="w-full min-h-[500px] border-none outline-none bg-transparent text-lg leading-relaxed resize-none placeholder-opacity-40 focus:placeholder-opacity-60 transition-all duration-300"
                style={{ color: colors.cardForeground }}
              />
            </div>

            {/* Meta Information */}
            <div 
              className="p-8 rounded-2xl border-2 shadow-lg space-y-6"
              style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Blog Details
              </h3>
              
              {/* Excerpt */}
              <div>
                <label className="block text-lg font-semibold mb-3" style={{ color: colors.cardForeground }}>
                  Excerpt (Short Description)
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Write a compelling excerpt that will grab readers' attention..."
                  className="w-full p-4 border-2 rounded-xl resize-none transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                    color: colors.foreground 
                  }}
                  rows={4}
                />
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold mb-3" style={{ color: colors.cardForeground }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                    style={{ 
                      backgroundColor: colors.background, 
                      borderColor: colors.border,
                      color: colors.foreground 
                    }}
                  >
                    <option value="">Choose a category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-3" style={{ color: colors.cardForeground }}>
                    Tags
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add relevant tags..."
                      className="flex-1 p-4 border-2 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        backgroundColor: colors.background, 
                        borderColor: colors.border,
                        color: colors.foreground 
                      }}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium shadow-sm"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-600 transition-colors"
                          >
                            <FaTimes size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center space-x-6 p-4 rounded-xl" style={{ backgroundColor: colors.background }}>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg font-medium" style={{ color: colors.cardForeground }}>
                    Mark as Featured Blog
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700 transition-colors text-lg font-medium"
              >
                ← Cancel
              </button>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={(e) => {
                    setFormData(prev => ({ ...prev, status: 'draft' }));
                    handleSubmit(e as any);
                  }}
                  disabled={isLoading}
                  className="px-8 py-4 border-2 rounded-xl hover:bg-opacity-80 transition-all duration-300 font-semibold shadow-md"
                  style={{ 
                    borderColor: colors.border,
                    color: colors.foreground 
                  }}
                >
                  Save Draft
                </button>
                
                <button
                  type="submit"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg"
                >
                  {isLoading ? '✨ Publishing...' : '🚀 Publish Blog'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          // Preview Mode
          <div 
            className="p-12 rounded-2xl border-2 shadow-lg"
            style={{ 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}
          >
            {formData.featured_image && (
              <img 
                src={formData.featured_image} 
                alt="Featured" 
                className="w-full h-80 object-cover rounded-xl mb-10 shadow-md"
              />
            )}
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {formData.title || 'Your Amazing Title Here'}
            </h1>
            
            {formData.subtitle && (
              <h2 className="text-2xl opacity-80 mb-8 font-medium" style={{ color: colors.cardForeground }}>
                {formData.subtitle}
              </h2>
            )}
            
            <div className="prose max-w-none text-lg leading-relaxed" style={{ color: colors.cardForeground }}>
              {formData.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-6">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-10 pt-8 border-t-2" style={{ borderColor: colors.border }}>
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium shadow-sm"
                  >
                    {tag}
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