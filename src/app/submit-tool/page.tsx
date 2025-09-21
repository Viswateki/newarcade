"use client";
import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import NavigationWrapper from '@/components/NavigationWrapper';
import { MultiSelectCategory, getSuggestedCategories } from '@/components/MultiSelectCategory';
import { ColorPicker } from '@/components/ColorPicker';
import { FallbackIconSelector, getRecommendedIcon, type FallbackIconName, FallbackIcon } from '@/components/FallbackIconSystem';
import { toolSubmissionService, type ToolSubmissionData } from '@/lib/toolSubmissionService';
import { validateURLQuick } from '@/lib/urlValidationService';
import { FiUpload, FiImage, FiGlobe, FiCheck, FiX, FiAlertCircle, FiInfo, FiEye, FiEyeOff, FiRefreshCw, FiLoader, FiShield, FiLock } from 'react-icons/fi';

const SubmitToolPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <SubmitToolContent />
    </ProtectedRoute>
  );
};

const SubmitToolContent: React.FC = () => {
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<ToolSubmissionData>({
    name: '',
    description: '',
    categories: [],
    websiteLink: '',
    logoImage: undefined,
    logoBackgroundColor: '#3B82F6',
    fallbackIcon: 'Tool',
    privacy: 'public'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [urlValidationStatus, setUrlValidationStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [showFallbackIconSelector, setShowFallbackIconSelector] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');

  // Handle input changes
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

    // Auto-suggest categories based on name and description
    if (name === 'name' || name === 'description') {
      if (formData.categories.length === 0) {
        const suggestions = getSuggestedCategories(
          name === 'name' ? value : formData.name,
          name === 'description' ? value : formData.description,
          2
        );
        if (suggestions.length > 0) {
          setFormData(prev => ({ ...prev, categories: suggestions }));
        }
      }
    }

    // Auto-suggest fallback icon based on categories
    if (name === 'name' && formData.categories.length === 0) {
      const recommendedIcon = getRecommendedIcon(value);
      setFormData(prev => ({ ...prev, fallbackIcon: recommendedIcon }));
    }
  };

  // Handle URL validation with debounce
  const validateURL = useCallback(async (url: string) => {
    if (!url || url.length < 8) {
      setUrlValidationStatus('idle');
      return;
    }

    setUrlValidationStatus('checking');
    
    try {
      const validation = validateURLQuick(url);
      setUrlValidationStatus(validation.isValid ? 'valid' : 'invalid');
      
      if (!validation.isValid && validation.errors.length > 0) {
        setErrors(prev => ({ ...prev, websiteLink: validation.errors[0] }));
      } else if (validation.isValid && errors.websiteLink) {
        setErrors(prev => ({ ...prev, websiteLink: '' }));
      }
    } catch (error) {
      setUrlValidationStatus('invalid');
    }
  }, [errors.websiteLink]);

  // Debounced URL validation
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateURL(formData.websiteLink);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formData.websiteLink, validateURL]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logoImage: 'File size must be less than 5MB' }));
        return;
      }
      
      // Validate file type - be more specific and helpful
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      
      const isValidMimeType = allowedTypes.includes(file.type);
      const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);
      
      if (!isValidMimeType && !isValidExtension) {
        setErrors(prev => ({ 
          ...prev, 
          logoImage: `Please upload a valid image file (JPEG, PNG, WebP, or GIF). Your file: ${file.type || 'unknown type'}, .${fileExtension || 'no extension'}` 
        }));
        return;
      }
      
      setFormData(prev => ({ ...prev, logoImage: file }));
      setErrors(prev => ({ ...prev, logoImage: '' }));
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreviewUrl(previewUrl);
    }
  };

  // Handle category changes
  const handleCategoriesChange = (categories: string[]) => {
    setFormData(prev => ({ ...prev, categories }));
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: '' }));
    }

    // Update recommended icon based on first category
    if (categories.length > 0 && !formData.logoImage) {
      const recommendedIcon = getRecommendedIcon(categories[0]);
      setFormData(prev => ({ ...prev, fallbackIcon: recommendedIcon }));
    }
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, logoBackgroundColor: color }));
    if (errors.logoBackgroundColor) {
      setErrors(prev => ({ ...prev, logoBackgroundColor: '' }));
    }
  };

  // Handle fallback icon change
  const handleFallbackIconChange = (iconName: FallbackIconName) => {
    setFormData(prev => ({ ...prev, fallbackIcon: iconName }));
  };

  // Handle privacy change
  const handlePrivacyChange = (privacy: 'public' | 'private') => {
    setFormData(prev => ({ ...prev, privacy }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setErrors({ general: 'Please log in to submit a tool' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrors({});
    setWarnings([]);
    
    try {
      const result = await toolSubmissionService.submitTool(formData, user.id || user.email || '');
      
      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Tool submitted successfully!');
        setWarnings(result.warnings || []);
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            description: '',
            categories: [],
            websiteLink: '',
            logoImage: undefined,
            logoBackgroundColor: '#3B82F6',
            fallbackIcon: 'Tool',
            privacy: 'public'
          });
          setLogoPreviewUrl('');
          setSubmitStatus('idle');
          setSubmitMessage('');
          setWarnings([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 5000);
        
      } else {
        setSubmitStatus('error');
        setErrors(result.errors || {});
        setWarnings(result.warnings || []);
        setSubmitMessage(result.message || 'Submission failed. Please check the errors below.');
        
        // If there's a network error, show a retry button
        if (result.message?.includes('Network') || result.message?.includes('connection')) {
          setSubmitMessage(result.message + ' You can try submitting again.');
        }
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('An unexpected error occurred. Please try again.');
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

          {/* Success/Error Messages */}
          {submitStatus !== 'idle' && (
            <div className={`mb-6 p-4 rounded-lg border ${
              submitStatus === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {submitStatus === 'success' ? 
                  <FiCheck className="w-5 h-5 mt-0.5 flex-shrink-0" /> :
                  <FiX className="w-5 h-5 mt-0.5 flex-shrink-0" />
                }
                <div className="flex-1">
                  <p className="font-medium">{submitMessage}</p>
                  {warnings.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">⚠️ Warnings:</p>
                      <ul className="mt-1 text-sm list-disc list-inside space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Object.keys(errors).length > 0 && submitStatus === 'error' && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">❌ Errors:</p>
                      <ul className="mt-1 text-sm space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field} className="flex items-start gap-2">
                            <span className="font-medium capitalize">{field}:</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div 
            className="rounded-2xl p-8 shadow-lg"
            style={{ backgroundColor: themeColors.cardBg }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Tool Name */}
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: themeColors.text }}
                >
                  Tool Name <span className="text-red-500">*</span>
                  <span 
                    className="font-normal text-xs ml-2"
                    style={{ color: themeColors.textSecondary }}
                  >
                    (max 50 characters)
                  </span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., ChatGPT, Claude, Midjourney"
                  maxLength={50}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: themeColors.input,
                    borderColor: errors.name ? '#ef4444' : themeColors.inputBorder,
                    color: themeColors.text
                  }}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.name && (
                    <span className="text-red-500 text-xs">{errors.name}</span>
                  )}
                  <span 
                    className="text-xs ml-auto"
                    style={{ color: themeColors.textSecondary }}
                  >
                    {formData.name.length}/50 characters
                  </span>
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
                  <span 
                    className="font-normal text-xs ml-2"
                    style={{ color: themeColors.textSecondary }}
                  >
                    (20-500 characters)
                  </span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this tool does, its key features, and how it helps users..."
                  rows={4}
                  maxLength={500}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: themeColors.input,
                    borderColor: errors.description ? '#ef4444' : themeColors.inputBorder,
                    color: themeColors.text
                  }}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <span className="text-red-500 text-xs">{errors.description}</span>
                  )}
                  <span 
                    className="text-xs ml-auto"
                    style={{ color: themeColors.textSecondary }}
                  >
                    {formData.description.length}/500 characters
                  </span>
                </div>
              </div>

              {/* Categories */}
              <MultiSelectCategory
                selectedCategories={formData.categories}
                onCategoriesChange={handleCategoriesChange}
                maxCategories={3}
                minCategories={1}
                error={errors.categories}
                themeColors={{
                  background: themeColors.input,
                  text: themeColors.text,
                  border: themeColors.inputBorder,
                  selected: '#3b82f6',
                  selectedText: '#ffffff',
                  hover: themeColors.hover
                }}
                className="space-y-4"
              />

              {/* Website Link */}
              <div>
                <label 
                  htmlFor="websiteLink" 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: themeColors.text }}
                >
                  Website Link <span className="text-red-500">*</span>
                  <span 
                    className="font-normal text-xs ml-2"
                    style={{ color: themeColors.textSecondary }}
                  >
                    (Will be validated for security)
                  </span>
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
                    className={`w-full pl-12 pr-12 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.websiteLink ? 'border-red-500' : urlValidationStatus === 'valid' ? 'border-green-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: themeColors.input,
                      borderColor: errors.websiteLink ? '#ef4444' : urlValidationStatus === 'valid' ? '#10b981' : themeColors.inputBorder,
                      color: themeColors.text
                    }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {urlValidationStatus === 'checking' && (
                      <FiLoader className="w-5 h-5 animate-spin text-blue-500" />
                    )}
                    {urlValidationStatus === 'valid' && (
                      <FiShield className="w-5 h-5 text-green-500" />
                    )}
                    {urlValidationStatus === 'invalid' && (
                      <FiAlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                {errors.websiteLink && (
                  <span className="text-red-500 text-xs mt-1 block">{errors.websiteLink}</span>
                )}
              </div>

              {/* Tool Image Upload */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: themeColors.text }}
                >
                  Tool Logo/Image
                  <span 
                    className="font-normal text-xs ml-2"
                    style={{ color: themeColors.textSecondary }}
                  >
                    (Optional - Max 5MB)
                  </span>
                </label>
                <div className="flex items-start gap-4">
                  <div 
                    className="flex items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed"
                    style={{ 
                      borderColor: themeColors.inputBorder,
                      backgroundColor: formData.logoImage ? formData.logoBackgroundColor : themeColors.input
                    }}
                  >
                    {formData.logoImage ? (
                      <img 
                        src={logoPreviewUrl}
                        alt="Tool preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <FallbackIcon 
                        iconName={(formData.fallbackIcon || 'Tool') as FallbackIconName}
                        backgroundColor={formData.logoBackgroundColor}
                        size={48}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <label 
                      htmlFor="logoImage"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                    >
                      <FiUpload className="w-4 h-4" />
                      Upload Logo
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="logoImage"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p 
                      className="text-xs mt-2"
                      style={{ color: themeColors.textSecondary }}
                    >
                      📁 Upload your tool's logo or image<br />
                      Supported: JPG, PNG, WebP, GIF • Max 5MB
                    </p>
                    {errors.logoImage && (
                      <span className="text-red-500 text-xs block mt-1">{errors.logoImage}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo Background Color Picker */}
              <ColorPicker
                selectedColor={formData.logoBackgroundColor}
                onColorChange={handleColorChange}
                showCustomInput={true}
                previewContent={
                  <FallbackIcon 
                    iconName={(formData.fallbackIcon || 'Tool') as FallbackIconName}
                    backgroundColor={formData.logoBackgroundColor}
                    size={64}
                  />
                }
                themeColors={{
                  background: themeColors.input,
                  text: themeColors.text,
                  border: themeColors.inputBorder
                }}
                className="space-y-4"
              />

              {/* Fallback Icon Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label 
                    className="block text-sm font-semibold"
                    style={{ color: themeColors.text }}
                  >
                    Fallback Icon
                    <span 
                      className="font-normal text-xs ml-2"
                      style={{ color: themeColors.textSecondary }}
                    >
                      (Used if no logo is uploaded)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFallbackIconSelector(!showFallbackIconSelector)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {showFallbackIconSelector ? 'Hide Icons' : 'Choose Icon'}
                  </button>
                </div>
                
                {showFallbackIconSelector && (
                  <FallbackIconSelector
                    selectedIcon={(formData.fallbackIcon || 'Tool') as FallbackIconName}
                    selectedColor={formData.logoBackgroundColor}
                    onIconChange={handleFallbackIconChange}
                    onColorChange={handleColorChange}
                    className="mt-4"
                  />
                )}
                
                {!showFallbackIconSelector && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FallbackIcon 
                      iconName={(formData.fallbackIcon || 'Tool') as FallbackIconName}
                      backgroundColor={formData.logoBackgroundColor}
                      size={32}
                    />
                    <span className="text-sm" style={{ color: themeColors.text }}>
                      Current: {formData.fallbackIcon}
                    </span>
                  </div>
                )}
              </div>

              {/* Privacy Setting */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{ color: themeColors.text }}
                >
                  Tool Visibility <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handlePrivacyChange('public')}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      formData.privacy === 'public' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ 
                      backgroundColor: formData.privacy === 'public' ? '#eff6ff' : themeColors.input,
                      borderColor: formData.privacy === 'public' ? '#3b82f6' : themeColors.inputBorder
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FiEye className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium" style={{ color: themeColors.text }}>
                          Public
                        </div>
                        <div className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                          Visible to all users after approval
                        </div>
                      </div>
                      {formData.privacy === 'public' && (
                        <FiCheck className="w-5 h-5 text-blue-600 ml-auto" />
                      )}
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handlePrivacyChange('private')}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      formData.privacy === 'private' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ 
                      backgroundColor: formData.privacy === 'private' ? '#eff6ff' : themeColors.input,
                      borderColor: formData.privacy === 'private' ? '#3b82f6' : themeColors.inputBorder
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FiLock className="w-5 h-5 text-amber-600" />
                      <div>
                        <div className="font-medium" style={{ color: themeColors.text }}>
                          Private
                        </div>
                        <div className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                          Only visible to you
                        </div>
                      </div>
                      {formData.privacy === 'private' && (
                        <FiCheck className="w-5 h-5 text-blue-600 ml-auto" />
                      )}
                    </div>
                  </button>
                </div>
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
                      <FiLoader className="w-5 h-5 animate-spin" />
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
                      Submit Tool for Review
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
                className="font-semibold mb-3 flex items-center gap-2"
                style={{ color: themeColors.text }}
              >
                <FiInfo className="w-5 h-5" />
                Submission Guidelines
              </h3>
              <ul 
                className="text-sm space-y-2"
                style={{ color: themeColors.textSecondary }}
              >
                <li>• Make sure the tool is related to AI or machine learning</li>
                <li>• Provide an accurate and helpful description (20-500 characters)</li>
                <li>• Use the correct website URL with HTTPS when possible</li>
                <li>• Choose 1-3 appropriate categories that best describe your tool</li>
                <li>• Upload a clear logo/image or choose an appropriate fallback icon</li>
                <li>• Check for duplicates before submitting</li>
                <li>• Tools will be reviewed before being published publicly</li>
                <li>• Private tools are only visible to you and won't be listed publicly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitToolPage;
