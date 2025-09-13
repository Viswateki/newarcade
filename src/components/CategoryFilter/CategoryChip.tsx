import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryChip = ({ label, isActive, onClick }: CategoryChipProps) => {
  const { colors } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border"
      style={{
        backgroundColor: isActive ? colors.accent : colors.card,
        color: isActive ? '#ffffff' : colors.foreground,
        borderColor: isActive ? colors.accent : colors.border,
        boxShadow: isActive ? '0 4px 12px rgba(0, 188, 212, 0.3)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = colors.muted;
          e.currentTarget.style.borderColor = colors.accent;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = colors.card;
          e.currentTarget.style.borderColor = colors.border;
        }
      }}
    >
      {label}
    </button>
  );
};

export default CategoryChip;
