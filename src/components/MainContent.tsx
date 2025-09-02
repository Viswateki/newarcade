'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FiTool, FiBookOpen, FiUpload, FiStar, FiTrendingUp, FiUsers, FiZap } from 'react-icons/fi';

interface MainContentProps {
  toolsCategories?: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    count: string;
    color: string;
    gradient: string;
  }>;
  featuredTools?: Array<{
    name: string;
    description: string;
    rating: number;
    users: string;
  }>;
  learningPaths?: Array<{
    title: string;
    progress: number;
    color: string;
  }>;
  communityFeatures?: Array<{
    title: string;
    description: string;
    members?: string;
    reviews?: string;
    events?: string;
    mentors?: string;
    icon: React.ReactNode;
  }>;
}

export default function MainContent({ 
  toolsCategories, 
  featuredTools, 
  learningPaths, 
  communityFeatures 
}: MainContentProps) {
  const { colors } = useTheme();

  return (
    <main 
      className="py-8 px-4 transition-colors duration-300"
      style={{ backgroundColor: colors.background, color: colors.foreground }}
    >
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Tools Categories */}
        {toolsCategories && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">Explore Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {toolsCategories.map((category, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 group cursor-pointer"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    color: colors.cardForeground 
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className="text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm opacity-70 mb-4">{category.description}</p>
                  <div className="text-sm font-medium opacity-80">{category.count}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Tools */}
        {featuredTools && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">Featured Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTools.map((tool, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 group cursor-pointer"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    color: colors.cardForeground 
                  }}
                >
                  <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                  <p className="text-sm opacity-70 mb-4">{tool.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center">
                      <FiStar className="w-4 h-4 mr-1 text-yellow-500" />
                      {tool.rating}
                    </span>
                    <span className="opacity-70">{tool.users} users</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Learning Paths */}
        {learningPaths && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">Learning Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learningPaths.map((path, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg group cursor-pointer"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    color: colors.cardForeground 
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4">{path.title}</h3>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <div 
                      className="w-full bg-gray-200 rounded-full h-2"
                      style={{ backgroundColor: colors.border }}
                    >
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${path.progress}%`,
                          backgroundColor: colors.accent
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Community Features */}
        {communityFeatures && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {communityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 group cursor-pointer"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    color: colors.cardForeground 
                  }}
                >
                  <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm opacity-70 mb-4">{feature.description}</p>
                  <div className="text-sm font-medium opacity-80">
                    {feature.members || feature.reviews || feature.events || feature.mentors}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
      </div>
    </main>
  );
}
