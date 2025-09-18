import React from 'react';
import { 
  FiGrid, 
  FiImage, 
  FiMessageSquare, 
  FiEdit3, 
  FiVideo, 
  FiBarChart, 
  FiTool, 
  FiCode,
  FiMusic,
  FiTrendingUp,
  FiZap,
  FiSearch,
  FiFileText,
  FiDatabase,
  FiShield,
  FiHeadphones
} from 'react-icons/fi';

interface CategoryPillsProps {
  categories: { name: string; icon: any; count: number }[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'all categories':
        return FiGrid;
      case 'image generation':
        return FiImage;
      case 'ai chatbots':
        return FiMessageSquare;
      case 'ai writing':
        return FiEdit3;
      case 'content creation':
        return FiVideo;
      case 'research':
        return FiBarChart;
      case 'productivity':
        return FiTool;
      case 'coding assistants':
        return FiCode;
      case 'music':
        return FiMusic;
      case 'analytics':
        return FiTrendingUp;
      case 'automation':
        return FiZap;
      case 'search':
        return FiSearch;
      case 'document processing':
        return FiFileText;
      case 'data analysis':
        return FiDatabase;
      case 'security':
        return FiShield;
      case 'audio':
        return FiHeadphones;
      default:
        return FiTool;
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category.toLowerCase()) {
      case 'all categories':
        return 'from-gray-500 to-gray-600';
      case 'image generation':
        return 'from-purple-500 to-pink-500';
      case 'ai chatbots':
        return 'from-blue-500 to-cyan-500';
      case 'ai writing':
        return 'from-green-500 to-emerald-500';
      case 'content creation':
        return 'from-red-500 to-orange-500';
      case 'research':
        return 'from-indigo-500 to-purple-500';
      case 'productivity':
        return 'from-yellow-500 to-orange-500';
      case 'coding assistants':
        return 'from-slate-500 to-gray-600';
      case 'music':
        return 'from-pink-500 to-rose-500';
      case 'analytics':
        return 'from-teal-500 to-cyan-500';
      case 'automation':
        return 'from-amber-500 to-yellow-500';
      case 'search':
        return 'from-blue-600 to-indigo-600';
      case 'document processing':
        return 'from-green-600 to-teal-600';
      case 'data analysis':
        return 'from-violet-500 to-purple-600';
      case 'security':
        return 'from-red-600 to-pink-600';
      case 'audio':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-cyan-500 to-blue-500';
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Browse by Category
      </h3>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const IconComponent = getCategoryIcon(category.name);
          const gradient = getCategoryGradient(category.name);
          const isSelected = selectedCategory === category.name;
          
          return (
            <button
              key={category.name}
              onClick={() => onCategorySelect(category.name)}
              className={`group relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                isSelected
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg shadow-blue-500/25`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-md'
              }`}
            >
              {/* Icon with gradient background */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSelected 
                  ? 'bg-white/20' 
                  : `bg-gradient-to-r ${gradient}`
              }`}>
                <IconComponent className={`w-4 h-4 ${
                  isSelected 
                    ? 'text-white' 
                    : 'text-white'
                }`} />
              </div>
              
              {/* Category name and count */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {category.name}
                </span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {category.count}
                </span>
              </div>

              {/* Hover effect background */}
              {!isSelected && (
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPills;