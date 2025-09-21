import React, { useState } from 'react';
import { FiCheck, FiRefreshCw, FiEyeOff, FiEye } from 'react-icons/fi';

// Predefined color options with accessibility in mind
export const logoBackgroundColors = [
  // Primary colors
  { name: 'Blue', value: '#3B82F6', textColor: '#FFFFFF', category: 'Primary' },
  { name: 'Red', value: '#EF4444', textColor: '#FFFFFF', category: 'Primary' },
  { name: 'Green', value: '#10B981', textColor: '#FFFFFF', category: 'Primary' },
  { name: 'Yellow', value: '#F59E0B', textColor: '#000000', category: 'Primary' },

  // Secondary colors
  { name: 'Purple', value: '#8B5CF6', textColor: '#FFFFFF', category: 'Secondary' },
  { name: 'Pink', value: '#EC4899', textColor: '#FFFFFF', category: 'Secondary' },
  { name: 'Indigo', value: '#6366F1', textColor: '#FFFFFF', category: 'Secondary' },
  { name: 'Orange', value: '#F97316', textColor: '#FFFFFF', category: 'Secondary' },

  // Tech colors
  { name: 'Teal', value: '#14B8A6', textColor: '#FFFFFF', category: 'Tech' },
  { name: 'Cyan', value: '#06B6D4', textColor: '#FFFFFF', category: 'Tech' },
  { name: 'Emerald', value: '#059669', textColor: '#FFFFFF', category: 'Tech' },
  { name: 'Lime', value: '#65A30D', textColor: '#FFFFFF', category: 'Tech' },

  // Professional colors
  { name: 'Navy', value: '#1E3A8A', textColor: '#FFFFFF', category: 'Professional' },
  { name: 'Slate', value: '#475569', textColor: '#FFFFFF', category: 'Professional' },
  { name: 'Gray', value: '#6B7280', textColor: '#FFFFFF', category: 'Professional' },
  { name: 'Stone', value: '#78716C', textColor: '#FFFFFF', category: 'Professional' },

  // Neutral colors
  { name: 'White', value: '#FFFFFF', textColor: '#374151', category: 'Neutral' },
  { name: 'Light Gray', value: '#F3F4F6', textColor: '#374151', category: 'Neutral' },
  { name: 'Dark Gray', value: '#374151', textColor: '#FFFFFF', category: 'Neutral' },
  { name: 'Black', value: '#111827', textColor: '#FFFFFF', category: 'Neutral' },

  // Gradient-inspired solid colors
  { name: 'Rose', value: '#F43F5E', textColor: '#FFFFFF', category: 'Vibrant' },
  { name: 'Amber', value: '#F59E0B', textColor: '#000000', category: 'Vibrant' },
  { name: 'Sky', value: '#0EA5E9', textColor: '#FFFFFF', category: 'Vibrant' },
  { name: 'Violet', value: '#7C3AED', textColor: '#FFFFFF', category: 'Vibrant' },
];

// Group colors by category
export const colorCategories = logoBackgroundColors.reduce((acc, color) => {
  if (!acc[color.category]) {
    acc[color.category] = [];
  }
  acc[color.category].push(color);
  return acc;
}, {} as Record<string, typeof logoBackgroundColors>);

// Props interface
interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string, colorName?: string) => void;
  showCustomInput?: boolean;
  allowTransparent?: boolean;
  previewContent?: React.ReactNode;
  className?: string;
  themeColors?: {
    background: string;
    text: string;
    border: string;
  };
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
  showCustomInput = true,
  allowTransparent = false,
  previewContent,
  className = '',
  themeColors = {
    background: '#ffffff',
    text: '#374151',
    border: '#d1d5db'
  }
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customColor, setCustomColor] = useState(selectedColor);
  const [previewVisible, setPreviewVisible] = useState(true);

  // Get color info for selected color
  const getColorInfo = (colorValue: string) => {
    return logoBackgroundColors.find(c => c.value.toLowerCase() === colorValue.toLowerCase());
  };

  const selectedColorInfo = getColorInfo(selectedColor);

  // Handle custom color input
  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);
    // Validate hex color format
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
      onColorChange(value, 'Custom');
    }
  };

  // Generate random color
  const generateRandomColor = () => {
    const randomColor = logoBackgroundColors[Math.floor(Math.random() * logoBackgroundColors.length)];
    onColorChange(randomColor.value, randomColor.name);
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Header with preview toggle */}
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold" style={{ color: themeColors.text }}>
            Logo Background Color
          </label>
          {previewContent && (
            <button
              type="button"
              onClick={() => setPreviewVisible(!previewVisible)}
              className="flex items-center gap-1 text-xs hover:opacity-80"
              style={{ color: themeColors.text }}
            >
              {previewVisible ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              {previewVisible ? 'Hide Preview' : 'Show Preview'}
            </button>
          )}
        </div>

        {/* Preview section */}
        {previewVisible && previewContent && (
          <div 
            className="p-4 rounded-lg border-2 border-dashed flex items-center justify-center min-h-20"
            style={{ 
              backgroundColor: selectedColor,
              borderColor: themeColors.border 
            }}
          >
            {previewContent}
          </div>
        )}

        {/* Selected color info */}
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg border-2 border-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
          <div>
            <div className="text-sm font-medium" style={{ color: themeColors.text }}>
              {selectedColorInfo?.name || 'Custom Color'}
            </div>
            <div className="text-xs" style={{ color: themeColors.text }}>
              {selectedColor.toUpperCase()}
            </div>
          </div>
          <button
            type="button"
            onClick={generateRandomColor}
            className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Random color"
          >
            <FiRefreshCw size={16} style={{ color: themeColors.text }} />
          </button>
        </div>

        {/* Color palette */}
        <div className="space-y-4">
          {Object.entries(colorCategories).map(([categoryName, colors]) => (
            <div key={categoryName}>
              <h4 className="text-xs font-semibold mb-2" style={{ color: themeColors.text }}>
                {categoryName}
              </h4>
              <div className="grid grid-cols-8 gap-2">
                {colors.map((color) => {
                  const isSelected = selectedColor.toLowerCase() === color.value.toLowerCase();
                  
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => onColorChange(color.value, color.name)}
                      className={`
                        relative w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110
                        ${isSelected ? 'border-gray-800 shadow-lg' : 'border-gray-300'}
                      `}
                      style={{ backgroundColor: color.value }}
                      title={`${color.name} (${color.value})`}
                    >
                      {isSelected && (
                        <FiCheck 
                          size={16} 
                          className="absolute inset-0 m-auto"
                          style={{ color: color.textColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Transparent option */}
        {allowTransparent && (
          <div>
            <h4 className="text-xs font-semibold mb-2" style={{ color: themeColors.text }}>
              Special
            </h4>
            <button
              type="button"
              onClick={() => onColorChange('transparent', 'Transparent')}
              className={`
                relative w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110
                bg-transparent bg-gradient-to-br from-gray-100 to-gray-200
                ${selectedColor === 'transparent' ? 'border-gray-800 shadow-lg' : 'border-gray-300'}
              `}
              style={{ 
                backgroundImage: selectedColor === 'transparent' ? undefined : 'repeating-conic-gradient(#f3f4f6 0% 25%, transparent 0% 50%) 50% / 10px 10px'
              }}
              title="Transparent background"
            >
              {selectedColor === 'transparent' && (
                <FiCheck 
                  size={16} 
                  className="absolute inset-0 m-auto text-gray-800"
                />
              )}
            </button>
          </div>
        )}

        {/* Custom color input */}
        {showCustomInput && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold" style={{ color: themeColors.text }}>
                Custom Color
              </h4>
              <button
                type="button"
                onClick={() => setShowCustom(!showCustom)}
                className="text-xs text-blue-600 hover:underline"
              >
                {showCustom ? 'Hide' : 'Show'} Custom
              </button>
            </div>
            
            {showCustom && (
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  title="Pick custom color"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  style={{ 
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Color accessibility info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-xs" style={{ color: themeColors.text }}>
            💡 <strong>Tip:</strong> Choose a color that provides good contrast with your logo. 
            Light logos work better on dark backgrounds and vice versa.
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function to determine if a color is light or dark
export const isLightColor = (hexColor: string): boolean => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

// Get appropriate text color for a background color
export const getContrastColor = (backgroundColor: string): string => {
  if (backgroundColor === 'transparent') return '#000000';
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
};

// Validate hex color format
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};