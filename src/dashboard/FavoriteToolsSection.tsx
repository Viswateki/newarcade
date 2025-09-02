'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaHeart, FaStar, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import { databaseService, Favorite } from '@/lib/database';

interface FavoriteToolsSectionProps {
  user: any;
}

export default function FavoriteToolsSection({ user }: FavoriteToolsSectionProps) {
  const { colors } = useTheme();
  const [favoriteTools, setFavoriteTools] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user?.$id) {
        setLoading(true);
        const userFavorites = await databaseService.getUserFavorites(user.$id);
        setFavoriteTools(userFavorites);
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.$id]);

  const removeFavorite = async (favoriteId: string, toolName: string) => {
    const success = await databaseService.removeFromFavorites(favoriteId);
    if (success) {
      setFavoriteTools(tools => tools.filter(tool => tool.$id !== favoriteId));
      
      // Log activity
      await databaseService.createActivity({
        user_id: user.$id,
        type: 'tool_unfavorited',
        title: 'Removed Favorite',
        description: `Removed "${toolName}" from favorites`,
        timestamp: new Date().toISOString(),
        target_id: favoriteId
      });
    }
  };

  if (loading) {
    return (
      <div 
        className="p-6 rounded-xl border animate-pulse"
        style={{ 
          backgroundColor: colors.card, 
          borderColor: colors.border 
        }}
      >
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-xl border transition-all duration-300 transform hover:scale-[1.01] animate-slideInUp"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <div className="flex items-center space-x-2 mb-6">
        <FaHeart className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-bold">Favorite Tools ({favoriteTools.length})</h2>
      </div>

      {favoriteTools.length === 0 ? (
        <div className="text-center py-8">
          <FaHeart className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg opacity-60 mb-2">No favorite tools yet</p>
          <p className="text-sm opacity-40">Save tools you love for quick access!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {favoriteTools.map((tool, index) => (
            <div 
              key={tool.$id}
              className="p-3 rounded-lg border transition-all duration-300 hover:shadow-md group"
              style={{ 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-sm">{tool.tool_name}</h3>
                    {tool.tool_rating > 0 && (
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <FaStar className="w-3 h-3" />
                        <span className="text-xs">{tool.tool_rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs opacity-70 mb-2 line-clamp-1">{tool.tool_description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {tool.tool_category}
                    </span>
                    <span className="text-xs opacity-50">
                      Added {new Date(tool.added_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => window.open(tool.tool_url, '_blank')}
                    className="p-1 hover:bg-blue-100 text-blue-500 rounded transition-colors duration-200"
                    title="Visit Tool"
                  >
                    <FaExternalLinkAlt className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => tool.$id && removeFavorite(tool.$id, tool.tool_name)}
                    className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors duration-200"
                    title="Remove from Favorites"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-center">
        <button className="text-purple-500 hover:text-purple-600 text-sm font-medium transition-colors duration-200">
          Browse Tools →
        </button>
      </div>
    </div>
  );
}
