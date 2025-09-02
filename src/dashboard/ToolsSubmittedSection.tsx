'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaTools, FaPlus, FaEye, FaEdit, FaCalendar, FaStar } from 'react-icons/fa';
import { databaseService, Tool } from '@/lib/database';

interface ToolsSubmittedSectionProps {
  user: any;
}

export default function ToolsSubmittedSection({ user }: ToolsSubmittedSectionProps) {
  const { colors } = useTheme();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      if (user?.$id) {
        setLoading(true);
        const userTools = await databaseService.getUserTools(user.$id);
        setTools(userTools);
        setLoading(false);
      }
    };

    fetchTools();
  }, [user?.$id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitTool = async () => {
    // This would open a modal or redirect to a tool submission form
    const toolData = {
      name: 'New Tool',
      description: 'Tool description',
      category: 'Development',
      url: 'https://example.com',
      author_id: user.$id,
      status: 'pending' as const,
      rating: 0,
      submitted_at: new Date().toISOString()
    };

    const newTool = await databaseService.createTool(toolData);
    if (newTool) {
      setTools([newTool, ...tools]);
      await databaseService.createActivity({
        user_id: user.$id,
        type: 'tool_submitted',
        title: 'Submitted Tool',
        description: `Submitted "${toolData.name}"`,
        timestamp: new Date().toISOString(),
        target_id: newTool.$id
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
      className="p-6 rounded-xl border transition-all duration-300 transform hover:scale-[1.01] animate-slideInRight"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FaTools className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold">Tools Submitted ({tools.length})</h2>
        </div>
        <button
          className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleSubmitTool}
        >
          <FaPlus className="w-3 h-3" />
          <span className="text-sm">Submit</span>
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-8">
          <FaTools className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg opacity-60 mb-2">No tools submitted yet</p>
          <p className="text-sm opacity-40">Share your favorite tools with the community!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tools.map((tool, index) => (
            <div 
              key={tool.$id}
              className="p-4 rounded-lg border transition-all duration-300 hover:shadow-md"
              style={{ 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{tool.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tool.status)}`}>
                  {tool.status}
                </span>
              </div>
              
              <p className="text-sm opacity-70 mb-3">{tool.description}</p>
              
              <div className="flex items-center justify-between text-xs opacity-60">
                <div className="flex items-center space-x-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{tool.category}</span>
                  <div className="flex items-center space-x-1">
                    <FaCalendar />
                    <span>{new Date(tool.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {tool.status === 'approved' && tool.rating > 0 && (
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <FaStar />
                    <span>{tool.rating}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-3">
                <button 
                  onClick={() => window.open(tool.url, '_blank')}
                  className="flex-1 text-xs bg-blue-500 text-white py-1 rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  <FaEye className="inline w-3 h-3 mr-1" />
                  View
                </button>
                <button 
                  className="flex-1 text-xs border py-1 rounded hover:bg-gray-50 transition-colors duration-200" 
                  style={{ borderColor: colors.border }}
                >
                  <FaEdit className="inline w-3 h-3 mr-1" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tools.length > 0 && (
        <div className="mt-4 text-center">
          <span className="text-sm opacity-70">
            {tools.length} tools submitted
          </span>
        </div>
      )}
    </div>
  );
}
