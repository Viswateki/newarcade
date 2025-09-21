import React from 'react';
import {
  FiCpu,
  FiCode,
  FiImage,
  FiMic,
  FiVideo,
  FiFileText,
  FiSearch,
  FiStar,
  FiTool,
  FiZap,
  FiEye,
  FiEdit3,
  FiTrendingUp,
  FiDatabase,
  FiMessageSquare,
  FiPieChart,
  FiSettings,
  FiLayers,
  FiBarChart,
  FiTarget,
  FiCamera,
  FiHeadphones,
  FiMonitor,
  FiSmartphone,
  FiGlobe,
  FiBookOpen,
  FiAward,
  FiActivity,
  FiBox,
  FiGrid,
  FiHeart,
  FiShield,
  FiClock,
  FiCompass,
  FiWifi,
  FiUser,
  FiPlay,
  FiType,
  FiTrendingDown
} from 'react-icons/fi';

// Icon mapping for fallback icons
export const fallbackIcons = {
  // AI & Technology
  'Bot': FiUser, // Using User as Bot alternative
  'Brain': FiCpu, // Using Cpu as Brain alternative
  'Cpu': FiCpu,
  'Zap': FiZap,
  'Tool': FiTool,
  'Settings': FiSettings,
  'Database': FiDatabase,
  'Shield': FiShield,
  'Wifi': FiWifi,

  // Content & Media
  'Image': FiImage,
  'Video': FiVideo,
  'Camera': FiCamera,
  'Mic': FiMic,
  'Headphones': FiHeadphones,
  'FileText': FiFileText,
  'Edit': FiEdit3,
  'BookOpen': FiBookOpen,

  // Communication & Social  
  'MessageSquare': FiMessageSquare,
  'Globe': FiGlobe,
  'Monitor': FiMonitor,
  'Smartphone': FiSmartphone,
  'Heart': FiHeart,

  // Analytics & Business
  'TrendingUp': FiTrendingUp,
  'BarChart': FiBarChart,
  'PieChart': FiPieChart,
  'Activity': FiActivity,
  'Target': FiTarget,
  'Award': FiAward,
  'Trends': FiTrendingDown, // Using TrendingDown as Trends alternative

  // Development & Code
  'Code': FiCode,
  'Search': FiSearch,
  'Layers': FiLayers,
  'Box': FiBox,
  'Grid': FiGrid,
  'Compass': FiCompass,

  // General
  'Star': FiStar,
  'Eye': FiEye,
  'Lightbulb': FiPlay, // Using Play as Lightbulb alternative
  'Clock': FiClock
} as const;

// Type for icon names
export type FallbackIconName = keyof typeof fallbackIcons;

// Get array of available icon names
export const availableFallbackIcons: FallbackIconName[] = Object.keys(fallbackIcons) as FallbackIconName[];

// Icon categories for better organization
export const iconCategories = {
  'AI & Technology': ['Bot', 'Brain', 'Cpu', 'Zap', 'Tool', 'Settings', 'Database', 'Shield', 'Wifi'] as FallbackIconName[],
  'Content & Media': ['Image', 'Video', 'Camera', 'Mic', 'Headphones', 'FileText', 'Edit', 'BookOpen'] as FallbackIconName[],
  'Communication': ['MessageSquare', 'Globe', 'Monitor', 'Smartphone', 'Heart'] as FallbackIconName[],
  'Analytics': ['TrendingUp', 'BarChart', 'PieChart', 'Activity', 'Target', 'Award', 'Trends'] as FallbackIconName[],
  'Development': ['Code', 'Search', 'Layers', 'Box', 'Grid', 'Compass'] as FallbackIconName[],
  'General': ['Star', 'Eye', 'Lightbulb', 'Clock'] as FallbackIconName[]
};

// Background colors for fallback icons
export const fallbackIconColors = [
  { name: 'Blue', value: '#3B82F6', textColor: '#FFFFFF' },
  { name: 'Purple', value: '#8B5CF6', textColor: '#FFFFFF' },
  { name: 'Green', value: '#10B981', textColor: '#FFFFFF' },
  { name: 'Red', value: '#EF4444', textColor: '#FFFFFF' },
  { name: 'Orange', value: '#F59E0B', textColor: '#FFFFFF' },
  { name: 'Pink', value: '#EC4899', textColor: '#FFFFFF' },
  { name: 'Indigo', value: '#6366F1', textColor: '#FFFFFF' },
  { name: 'Teal', value: '#14B8A6', textColor: '#FFFFFF' },
  { name: 'Cyan', value: '#06B6D4', textColor: '#FFFFFF' },
  { name: 'Emerald', value: '#059669', textColor: '#FFFFFF' },
  { name: 'Slate', value: '#475569', textColor: '#FFFFFF' },
  { name: 'Gray', value: '#6B7280', textColor: '#FFFFFF' },
  { name: 'White', value: '#FFFFFF', textColor: '#374151' },
  { name: 'Black', value: '#1F2937', textColor: '#FFFFFF' }
];

// Props for FallbackIcon component
interface FallbackIconProps {
  iconName: FallbackIconName;
  backgroundColor?: string;
  textColor?: string;
  size?: number;
  className?: string;
}

// Fallback Icon component
export const FallbackIcon: React.FC<FallbackIconProps> = ({ 
  iconName, 
  backgroundColor = 'transparent', 
  textColor = '#FFFFFF',
  size = 48,
  className = '' 
}) => {
  const IconComponent = fallbackIcons[iconName];
  
  if (!IconComponent) {
    // Fallback to default icon if iconName not found
    const DefaultIcon = fallbackIcons['Tool'];
    return (
      <div 
        className={`rounded-lg flex items-center justify-center ${className}`}
        style={{ 
          backgroundColor, 
          color: textColor, 
          width: size, 
          height: size 
        }}
      >
        <DefaultIcon size={size * 0.6} />
      </div>
    );
  }

  return (
    <div 
      className={`rounded-lg flex items-center justify-center ${className}`}
      style={{ 
        backgroundColor, 
        color: textColor, 
        width: size, 
        height: size 
      }}
    >
      <IconComponent size={size * 0.6} />
    </div>
  );
};

// Generate fallback icon URL (for when we need a URL instead of component)
export const generateFallbackIconUrl = (
  iconName: FallbackIconName, 
  backgroundColor: string = '#3B82F6',
  size: number = 100
): string => {
  // For now, return placeholder URL with first letter of icon name
  // In a real implementation, you might want to generate SVG data URLs
  const letter = iconName.charAt(0).toUpperCase();
  const bgColor = backgroundColor.replace('#', '');
  return `https://placehold.co/${size}x${size}/${bgColor}/ffffff?text=${letter}`;
};

// Get recommended icon based on tool category
export const getRecommendedIcon = (category: string): FallbackIconName => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('ai') || categoryLower.includes('chatbot')) {
    return 'Bot';
  }
  if (categoryLower.includes('image') || categoryLower.includes('photo')) {
    return 'Image';
  }
  if (categoryLower.includes('video')) {
    return 'Video';
  }
  if (categoryLower.includes('audio') || categoryLower.includes('voice')) {
    return 'Mic';
  }
  if (categoryLower.includes('code') || categoryLower.includes('programming')) {
    return 'Code';
  }
  if (categoryLower.includes('writing') || categoryLower.includes('text')) {
    return 'Edit';
  }
  if (categoryLower.includes('analytics') || categoryLower.includes('data')) {
    return 'BarChart';
  }
  if (categoryLower.includes('design')) {
    return 'Layers';
  }
  if (categoryLower.includes('productivity')) {
    return 'Zap';
  }
  if (categoryLower.includes('research') || categoryLower.includes('search')) {
    return 'Search';
  }
  if (categoryLower.includes('marketing')) {
    return 'TrendingUp';
  }
  if (categoryLower.includes('education')) {
    return 'BookOpen';
  }
  
  // Default fallback
  return 'Tool';
};

// Icon selector component for forms
interface FallbackIconSelectorProps {
  selectedIcon: FallbackIconName;
  selectedColor: string;
  onIconChange: (icon: FallbackIconName) => void;
  onColorChange: (color: string) => void;
  className?: string;
}

export const FallbackIconSelector: React.FC<FallbackIconSelectorProps> = ({
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange,
  className = ''
}) => {
  return (
    <div className={className}>
      {/* Color Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <div className="grid grid-cols-7 gap-2">
          {fallbackIconColors.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => onColorChange(color.value)}
              className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                selectedColor === color.value ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Icon Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Preview</label>
        <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
          <FallbackIcon 
            iconName={selectedIcon} 
            backgroundColor={selectedColor}
            size={64} 
          />
        </div>
      </div>

      {/* Icon Selection by Category */}
      <div>
        <label className="block text-sm font-medium mb-2">Choose Icon</label>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {Object.entries(iconCategories).map(([categoryName, icons]) => (
            <div key={categoryName}>
              <h4 className="text-xs font-semibold text-gray-600 mb-2">{categoryName}</h4>
              <div className="grid grid-cols-6 gap-2">
                {icons.map((iconName) => {
                  const IconComponent = fallbackIcons[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => onIconChange(iconName)}
                      className={`p-2 rounded-lg border hover:bg-gray-50 transition-colors ${
                        selectedIcon === iconName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      title={iconName}
                    >
                      <IconComponent size={20} className="text-gray-600" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};