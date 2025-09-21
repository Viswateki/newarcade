import React, { useState } from 'react';
import { Tool, getToolImageUrlFromTool, getToolCategories } from '@/lib/appwrite';
import { toolsStorageService } from '@/lib/toolsStorageService';
import { 
  FiStar, 
  FiExternalLink, 
  FiEye,
  FiHeart,
  FiBookmark
} from 'react-icons/fi';

interface ToolCardProps {
  tool: Tool;
  viewMode: 'grid' | 'list';
  onToolClick: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, viewMode, onToolClick }) => {
  const [imageError, setImageError] = useState(false);
  
  // Get primary category for display
  const getPrimaryCategory = (tool: Tool): string => {
    const categories = getToolCategories(tool);
    if (categories.length > 0 && categories[0] !== 'Uncategorized') {
      return categories[0];
    }
    
    // Auto-categorization fallback (simplified version)
    const toolName = tool.name?.toLowerCase() || '';
    const toolDesc = tool.description?.toLowerCase() || '';
    const allText = [toolName, toolDesc].join(' ');
    
    if (toolName.includes('chatgpt') || toolName.includes('openai') || toolName.includes('google') || toolName.includes('microsoft') || tool.featured) {
      return 'Official bots';
    }
    if (allText.includes('image') || allText.includes('photo') || allText.includes('art')) {
      return 'Image generation bots';
    }
    if (allText.includes('video') || allText.includes('film')) {
      return 'Video generation bots';
    }
    if (allText.includes('audio') || allText.includes('music')) {
      return 'Audio generation bots';
    }
    if (allText.includes('writing') || allText.includes('content')) {
      return 'Writing bots';
    }
    if (allText.includes('search') || allText.includes('research')) {
      return 'Search bots';
    }
    if (allText.includes('chat') || allText.includes('conversation')) {
      return 'Chat bots';
    }
    if (allText.includes('productivity') || allText.includes('work')) {
      return 'Productivity bots';
    }
    
    return 'AI Tools';
  };
  
  const primaryCategory = getPrimaryCategory(tool);
  
  // Get the best available image URL, preferring computedImageUrl if available
  const getImageUrl = () => {
    if (tool.computedImageUrl) {
      return tool.computedImageUrl;
    }
    return getToolImageUrlFromTool(tool);
  };

  // Handle image error with fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  // Render image or fallback icon
  const renderImage = (size: 'small' | 'medium' = 'medium') => {
    const sizeClasses = size === 'small' ? 'w-16 h-16' : 'w-14 h-14';
    const imageUrl = getImageUrl();
    
    return (
      <div className={`${sizeClasses} rounded-xl flex items-center justify-center overflow-hidden`}>
        {!imageError && imageUrl && imageUrl !== '' ? (
          <img 
            src={imageUrl}
            alt={`${tool.name} logo`}
            className="w-full h-full object-contain"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div 
            className="flex items-center justify-center w-full h-full text-white font-bold"
            style={{
              backgroundColor: tool.logoBackgroundColor || '#3B82F6'
            }}
          >
            <span className={`${size === 'small' ? 'text-xl' : 'text-2xl'}`}>
              {tool.fallbackIcon || tool.name?.charAt(0)?.toUpperCase() || '🔧'}
            </span>
          </div>
        )}
      </div>
    );
  };
  if (viewMode === 'list') {
    return (
      <div
        className="group  dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer overflow-hidden"
        onClick={() => onToolClick(tool)}
      >
        <div className="p-6">
          <div className="flex items-center gap-6">
            {/* Tool Logo */}
            <div className="flex-shrink-0">
              {renderImage('small')}
            </div>

            {/* Tool Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {tool.name}
                    </h3>
                    {tool.featured && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded">
                      {primaryCategory}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">+{tool.tags?.length || 0}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <FiEye className="w-4 h-4" />
                    <span>{tool.reviews || 0} views</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FiHeart className="w-4 h-4" />
                  </button>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      const websiteUrl = tool.websiteLink || tool.link;
                      if (websiteUrl) {
                        window.open(websiteUrl, '_blank');
                      }
                    }}
                  >
                    <FiExternalLink className="w-4 h-4" />
                    Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => onToolClick(tool)}
    >
      <div className="p-6">
        {/* Header with logo and badges */}
        <div className="flex items-start justify-between mb-4">
          {renderImage('medium')}
          {tool.featured && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
              NEW
            </span>
          )}
        </div>

        {/* Tool name and category */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {tool.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded">
              {primaryCategory}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">+{tool.tags?.length || 0}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <FiEye className="w-4 h-4" />
          <span>{tool.reviews || 0} views</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <FiHeart className="w-4 h-4" />
          </button>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium">
              View Details
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
              onClick={(e) => {
                e.stopPropagation();
                const websiteUrl = tool.websiteLink || tool.link;
                if (websiteUrl) {
                  window.open(websiteUrl, '_blank');
                }
              }}
            >
              <FiExternalLink className="w-4 h-4" />
              Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;