'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface StatsSectionProps {
  stats: Array<{
    number: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  title?: string;
}

export default function StatsSection({ stats, title }: StatsSectionProps) {
  const { colors } = useTheme();

  return (
    <section 
      className="py-12 px-6 rounded-2xl"
      style={{ backgroundColor: colors.card, color: colors.cardForeground }}
    >
      {title && (
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center group">
            {stat.icon && (
              <div className="text-blue-500 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
            )}
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              {stat.number}
            </div>
            <div className="text-lg font-semibold mb-2">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
