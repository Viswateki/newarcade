"use client";
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import NavigationWrapper from '@/components/NavigationWrapper';
import { FiUpload, FiImage, FiGlobe, FiCheck, FiX } from 'react-icons/fi';

const SubmitToolPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <SubmitToolContent />
    </ProtectedRoute>
  );
};

const SubmitToolContent: React.FC = () => {
  const { theme, colors } = useTheme();
  
  // Form state
  const [formData, setFormData] = useState({
    toolName: '',
    toolImage: null as File | null,
    logoBackgroundColor: 'white',
    description: '',
    categories: [] as string[],
    fallbackIcon: 'Bot',
    websiteLink: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'AI Writing', 'Image Generation', 'AI Chatbots',
    'Coding Assistants', 'Audio & Voice', 'Productivity',
    'Data Analysis', 'Design Tools', 'Content Creation',
    'Marketing', 'Education', 'Research'
  ];

  const fallbackIcons = [
    'Bot', 'Tool', 'Code', 'Design', 'Analytics', 'Chat',
    'Image', 'Audio', 'Video', 'Text', 'Search', 'Star'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, toolImage: 'File size must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, toolImage: 'Please upload a valid image file' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, toolImage: file }));
      setErrors(prev => ({ ...prev, toolImage: '' }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    
    // Clear category error
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.toolName.trim()) {
      newErrors.toolName = 'Tool name is required';
    } else if (formData.toolName.length > 20) {
      newErrors.toolName = 'Tool name must be 20 characters or less';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one category';
    } else if (formData.categories.length > 3) {
      newErrors.categories = 'Please select maximum 3 categories';
    }
    
    if (!formData.websiteLink.trim()) {
      newErrors.websiteLink = 'Website link is required';
    } else if (!isValidUrl(formData.websiteLink)) {
      newErrors.websiteLink = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just log the form data
      console.log('Submitting tool:', {
        ...formData,
        toolImage: formData.toolImage ? formData.toolImage.name : null
      });
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          toolName: '',
          toolImage: null,
          logoBackgroundColor: 'white',
          description: '',
          categories: [],
          fallbackIcon: 'Bot',
          websiteLink: ''
        });
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const themeColors = {
    background: colors.background,
    cardBg: colors.card,
    text: colors.foreground,
    textSecondary: colors.muted,
    border: colors.border,
    buttonBg: colors.accent,
    buttonText: colors.foreground,
    accent: colors.accent,
    input: theme === 'dark' ? '#374151' : '#f9fafb',
    inputBorder: theme === 'dark' ? '#4b5563' : '#d1d5db',
    hover: theme === 'dark' ? '#4b5563' : '#e5e7eb'
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: themeColors.background }}
    >
      <NavigationWrapper />
      <div className="pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: themeColors.text }}
          >
            Submit Your AI Tool
          </h1>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: themeColors.textSecondary }}
          >
            Share your AI tool with our community. Fill out the form below to get your tool featured on AiArcade.
          </p>
        </div>

        {/* Form */}
        <div 
          className="rounded-2xl p-8 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tool Name */}
            <div>
              <label 
                htmlFor="toolName" 
                className="block text-sm font-semibold mb-2"
                style={{ color: themeColors.text }}
              >
                Tool Name <span className="text-red-500">*</span>
                <span 
                  className="font-normal text-xs ml-2"
                  style={{ color: themeColors.textSecondary }}
                >
                  (max 20 characters)
                </span>
              </label>
              <input
                type="text"
                id="toolName"
                name="toolName"
                value={formData.toolName}
                onChange={handleInputChange}
                placeholder="e.g., ChatGPT, Claude"
                maxLength={20}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.toolName ? 'border-red-500' : ''
                }`}
                style={{ 
                  backgroundColor: themeColors.input,
                  borderColor: errors.toolName ? '#ef4444' : themeColors.inputBorder,
                  color: themeColors.text
                }}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.toolName && (
                  <span className="text-red-500 text-xs">{errors.toolName}</span>
                )}
                <span 
                  className="text-xs ml-auto"
                  style={{ color: themeColors.textSecondary }}
                >
                  {formData.toolName.length}/20 characters
                </span>
              </div>
            </div>

            {/* Tool Image */}
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: themeColors.text }}
              >
                Tool Image 
                <span 
                  className="font-normal text-xs ml-2"
                  style={{ color: themeColors.textSecondary }}
                >
                  (Any size up to 5MB)
                </span>
              </label>
              <div className="flex items-start gap-4">
                <div 
                  className="flex items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed"
                  style={{ 
                    borderColor: themeColors.inputBorder,
                    backgroundColor: themeColors.input
                  }}
                >
                  {formData.toolImage ? (
                    <img 
                      src={URL.createObjectURL(formData.toolImage)}
                      alt="Tool preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <FiImage 
                      className="w-8 h-8"
                      style={{ color: themeColors.textSecondary }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <label 
                    htmlFor="toolImage"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FiUpload className="w-4 h-4" />
                    Choose Image
                  </label>
                  <input
                    type="file"
                    id="toolImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p 
                    className="text-xs mt-2"
                    style={{ color: themeColors.textSecondary }}
                  >
                    📁 Upload any image size up to 5MB<br />
                    Supported formats: JPG, PNG, WebP • Square, rectangular, or any dimensions welcome
                  </p>
                  {errors.toolImage && (
                    <span className="text-red-500 text-xs block mt-1">{errors.toolImage}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Background Color */}
            <div>
              <label 
                className="block text-sm font-semibold mb-3"
                style={{ color: themeColors.text }}
              >
                Logo Background Color
              </label>
              <p 
                className="text-xs mb-3"
                style={{ color: themeColors.textSecondary }}
              >
                Choose the background color that makes your logo most visible
              </p>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="logoBackgroundColor"
                    value="white"
                    checked={formData.logoBackgroundColor === 'white'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="w-6 h-6 bg-gray-50 border border-gray-300 rounded"></div>
                  <span style={{ color: themeColors.text }}>White</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="logoBackgroundColor"
                    value="black"
                    checked={formData.logoBackgroundColor === 'black'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="w-6 h-6 bg-gray-800 border border-gray-300 rounded"></div>
                  <span style={{ color: themeColors.text }}>Black</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-semibold mb-2"
                style={{ color: themeColors.text }}
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this tool does and its key features..."
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                  errors.description ? 'border-red-500' : ''
                }`}
                style={{ 
                  backgroundColor: themeColors.input,
                  borderColor: errors.description ? '#ef4444' : themeColors.inputBorder,
                  color: themeColors.text
                }}
              />
              {errors.description && (
                <span className="text-red-500 text-xs mt-1 block">{errors.description}</span>
              )}
            </div>

            {/* Categories */}
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: themeColors.text }}
              >
                Categories <span className="text-red-500">*</span>
                <span 
                  className="font-normal text-xs ml-2"
                  style={{ color: themeColors.textSecondary }}
                >
                  (Select 1-3 categories)
                </span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      formData.categories.includes(category)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'hover:border-blue-300'
                    }`}
                    style={{ 
                      backgroundColor: formData.categories.includes(category) 
                        ? (theme === 'dark' ? '#1e3a8a30' : '#eff6ff')
                        : themeColors.input,
                      borderColor: formData.categories.includes(category)
                        ? '#3b82f6'
                        : themeColors.inputBorder,
                      color: formData.categories.includes(category)
                        ? (theme === 'dark' ? '#93c5fd' : '#1d4ed8')
                        : themeColors.text
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {errors.categories && (
                <span className="text-red-500 text-xs mt-2 block">{errors.categories}</span>
              )}
              <p className="text-xs mt-2" style={{ color: themeColors.textSecondary }}>
                Please select at least one category
              </p>
            </div>

            {/* Fallback Icon */}
            <div>
              <label 
                htmlFor="fallbackIcon" 
                className="block text-sm font-semibold mb-2"
                style={{ color: themeColors.text }}
              >
                Fallback Icon
              </label>
              <select
                id="fallbackIcon"
                name="fallbackIcon"
                value={formData.fallbackIcon}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: themeColors.input,
                  borderColor: themeColors.inputBorder,
                  color: themeColors.text
                }}
              >
                {fallbackIcons.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <p 
                className="text-xs mt-1"
                style={{ color: themeColors.textSecondary }}
              >
                This icon will be displayed if you don't upload a custom logo.
              </p>
            </div>

            {/* Website Link */}
            <div>
              <label 
                htmlFor="websiteLink" 
                className="block text-sm font-semibold mb-2"
                style={{ color: themeColors.text }}
              >
                Website Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiGlobe 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: themeColors.textSecondary }}
                />
                <input
                  type="url"
                  id="websiteLink"
                  name="websiteLink"
                  value={formData.websiteLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.websiteLink ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: themeColors.input,
                    borderColor: errors.websiteLink ? '#ef4444' : themeColors.inputBorder,
                    color: themeColors.text
                  }}
                />
              </div>
              {errors.websiteLink && (
                <span className="text-red-500 text-xs mt-1 block">{errors.websiteLink}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : submitStatus === 'success'
                    ? 'bg-green-600 hover:bg-green-700'
                    : submitStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    Tool Submitted Successfully!
                  </>
                ) : submitStatus === 'error' ? (
                  <>
                    <FiX className="w-5 h-5" />
                    Submission Failed - Try Again
                  </>
                ) : (
                  <>
                    <FiUpload className="w-5 h-5" />
                    Submit Tool
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Submission Guidelines */}
          <div 
            className="mt-8 p-6 rounded-lg border"
            style={{ 
              backgroundColor: themeColors.input,
              borderColor: themeColors.inputBorder
            }}
          >
            <h3 
              className="font-semibold mb-3"
              style={{ color: themeColors.text }}
            >
              Submission Guidelines:
            </h3>
            <ul 
              className="text-sm space-y-1"
              style={{ color: themeColors.textSecondary }}
            >
              <li>• Make sure the tool is related to AI or machine learning</li>
              <li>• Provide an accurate and helpful description</li>
              <li>• Use the correct website URL</li>
              <li>• Choose the most appropriate category</li>
              <li>• Check for duplicates before submitting</li>
            </ul>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitToolPage;
