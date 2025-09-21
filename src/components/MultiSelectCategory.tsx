import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

// Available categories for AI tools
export const availableCategories = [
  'AI Writing',
  'AI Chatbots', 
  'Image Generation',
  'Video Generation',
  'Audio & Voice',
  'Coding Assistants',
  'Productivity Tools',
  'Data Analysis',
  'Design Tools',
  'Content Creation',
  'Marketing Tools',
  'Education & Learning',
  'Research Tools',
  'SEO Tools',
  'Social Media',
  'Translation',
  'Text-to-Speech',
  'Speech-to-Text',
  'Photo Editing',
  'Business Intelligence',
  'Automation',
  'Email Marketing',
  'Customer Service',
  'HR & Recruiting',
  'Finance & Accounting',
  'Health & Fitness',
  'E-commerce',
  'Gaming',
  'Music & Audio',
  'Legal Tech'
];

// Category descriptions for tooltips
export const categoryDescriptions: Record<string, string> = {
  'AI Writing': 'Tools for content creation, copywriting, and text generation',
  'AI Chatbots': 'Conversational AI assistants and chatbot platforms',
  'Image Generation': 'AI-powered image creation and generation tools',
  'Video Generation': 'AI tools for creating and editing videos',
  'Audio & Voice': 'Voice synthesis, audio processing, and music generation',
  'Coding Assistants': 'AI-powered development tools and code assistance',
  'Productivity Tools': 'Tools to enhance workflow and productivity',
  'Data Analysis': 'AI tools for data processing and analytics',
  'Design Tools': 'AI-assisted design and creative tools',
  'Content Creation': 'Tools for creating various types of content',
  'Marketing Tools': 'AI-powered marketing and advertising tools',
  'Education & Learning': 'Educational AI tools and learning platforms',
  'Research Tools': 'AI tools for research and information gathering',
  'SEO Tools': 'Search engine optimization and web analytics',
  'Social Media': 'Social media management and content tools',
  'Translation': 'Language translation and localization tools',
  'Text-to-Speech': 'Convert text to natural-sounding speech',
  'Speech-to-Text': 'Transcription and voice recognition tools',
  'Photo Editing': 'AI-powered photo enhancement and editing',
  'Business Intelligence': 'AI tools for business analytics and insights',
  'Automation': 'Workflow automation and process optimization',
  'Email Marketing': 'AI-powered email campaigns and marketing',
  'Customer Service': 'AI customer support and service tools',
  'HR & Recruiting': 'Human resources and talent acquisition AI',
  'Finance & Accounting': 'Financial AI tools and accounting assistance',
  'Health & Fitness': 'AI tools for health monitoring and fitness',
  'E-commerce': 'AI tools for online retail and commerce',
  'Gaming': 'AI tools and platforms for gaming',
  'Music & Audio': 'AI music composition and audio processing',
  'Legal Tech': 'AI tools for legal research and documentation'
};

// Props for the multi-select category component
interface MultiSelectCategoryProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  maxCategories?: number;
  minCategories?: number;
  error?: string;
  className?: string;
  themeColors?: {
    background: string;
    text: string;
    border: string;
    selected: string;
    selectedText: string;
    hover: string;
  };
}

export const MultiSelectCategory: React.FC<MultiSelectCategoryProps> = ({
  selectedCategories,
  onCategoriesChange,
  maxCategories = 3,
  minCategories = 1,
  error,
  className = '',
  themeColors = {
    background: '#ffffff',
    text: '#374151',
    border: '#d1d5db',
    selected: '#3b82f6',
    selectedText: '#ffffff',
    hover: '#f3f4f6'
  }
}) => {
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      // Remove category
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      // Add category if under max limit
      if (selectedCategories.length < maxCategories) {
        onCategoriesChange([...selectedCategories, category]);
      }
    }
  };

  const isSelected = (category: string) => selectedCategories.includes(category);
  const canAddMore = selectedCategories.length < maxCategories;
  const hasMinimum = selectedCategories.length >= minCategories;

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold" style={{ color: themeColors.text }}>
            Categories 
            <span className="text-red-500">*</span>
          </label>
          <span className="text-xs" style={{ color: themeColors.text }}>
            {selectedCategories.length}/{maxCategories} selected
          </span>
        </div>
        <p className="text-xs mb-3" style={{ color: themeColors.text }}>
          Select {minCategories} to {maxCategories} categories that best describe your tool
        </p>
        
        {/* Selected categories display */}
        {selectedCategories.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: themeColors.selected, 
                    color: themeColors.selectedText 
                  }}
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg" 
           style={{ borderColor: error ? '#ef4444' : themeColors.border }}>
        {availableCategories.map((category) => {
          const selected = isSelected(category);
          const disabled = !selected && !canAddMore;
          
          return (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryToggle(category)}
              disabled={disabled}
              className={`
                relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                ${selected ? 'ring-2 ring-offset-1' : ''}
              `}
              style={{ 
                backgroundColor: selected ? themeColors.selected : themeColors.background,
                color: selected ? themeColors.selectedText : themeColors.text,
                border: `1px solid ${selected ? themeColors.selected : themeColors.border}`
              }}
              title={categoryDescriptions[category]}
              onMouseEnter={(e) => {
                if (!selected && !disabled) {
                  e.currentTarget.style.backgroundColor = themeColors.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (!selected && !disabled) {
                  e.currentTarget.style.backgroundColor = themeColors.background;
                }
              }}
            >
              <span className="flex items-center justify-between">
                {category}
                {selected && <FiCheck size={16} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Validation messages */}
      <div className="mt-2 space-y-1">
        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}
        
        {!hasMinimum && !error && (
          <p className="text-red-500 text-xs">
            Please select at least {minCategories} categor{minCategories === 1 ? 'y' : 'ies'}
          </p>
        )}
        
        {selectedCategories.length === maxCategories && (
          <p className="text-amber-600 text-xs">
            Maximum categories reached. Remove a category to select a different one.
          </p>
        )}

        <p className="text-xs" style={{ color: themeColors.text }}>
          💡 Tip: Choose categories that best represent your tool's primary functions
        </p>
      </div>
    </div>
  );
};

// Validation function for categories
export const validateCategories = (
  categories: string[], 
  minCategories = 1, 
  maxCategories = 3
): { isValid: boolean; error?: string } => {
  if (categories.length < minCategories) {
    return {
      isValid: false,
      error: `Please select at least ${minCategories} categor${minCategories === 1 ? 'y' : 'ies'}`
    };
  }
  
  if (categories.length > maxCategories) {
    return {
      isValid: false,
      error: `Please select no more than ${maxCategories} categories`
    };
  }

  // Check if all categories are valid
  const invalidCategories = categories.filter(cat => !availableCategories.includes(cat));
  if (invalidCategories.length > 0) {
    return {
      isValid: false,
      error: `Invalid categories: ${invalidCategories.join(', ')}`
    };
  }

  return { isValid: true };
};

// Get suggested categories based on tool description
export const getSuggestedCategories = (
  toolName: string, 
  description: string, 
  maxSuggestions = 3
): string[] => {
  const text = `${toolName} ${description}`.toLowerCase();
  const suggestions: { category: string; score: number }[] = [];

  // Keyword mapping for suggestions
  const keywordMapping = {
    'AI Writing': ['writing', 'content', 'copywriting', 'text generation', 'article', 'blog'],
    'AI Chatbots': ['chatbot', 'chat', 'conversation', 'assistant', 'bot'],
    'Image Generation': ['image', 'photo', 'picture', 'visual', 'generate image', 'dall-e', 'midjourney'],
    'Video Generation': ['video', 'animation', 'movie', 'clip', 'generate video'],
    'Audio & Voice': ['audio', 'voice', 'sound', 'music', 'speech', 'podcast'],
    'Coding Assistants': ['code', 'programming', 'development', 'developer', 'coding', 'github'],
    'Productivity Tools': ['productivity', 'workflow', 'efficiency', 'organize', 'task'],
    'Data Analysis': ['data', 'analytics', 'analysis', 'statistics', 'insights', 'dashboard'],
    'Design Tools': ['design', 'graphic', 'ui', 'ux', 'creative', 'illustration'],
    'Marketing Tools': ['marketing', 'advertising', 'promotion', 'campaign', 'lead'],
    'Translation': ['translate', 'translation', 'language', 'multilingual'],
    'SEO Tools': ['seo', 'search engine', 'optimization', 'ranking', 'keywords'],
    'Social Media': ['social media', 'facebook', 'twitter', 'instagram', 'linkedin'],
    'Research Tools': ['research', 'information', 'knowledge', 'academic', 'study']
  };

  // Calculate scores for each category
  for (const [category, keywords] of Object.entries(keywordMapping)) {
    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += keyword.length; // Longer keywords get higher scores
      }
    });
    
    if (score > 0) {
      suggestions.push({ category, score });
    }
  }

  // Sort by score and return top suggestions
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(s => s.category);
};