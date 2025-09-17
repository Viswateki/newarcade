"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationWrapper from '@/components/NavigationWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { toolsService } from '@/lib/toolsService';
import { Tool } from '@/lib/appwrite';
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiStar, 
  FiUsers, 
  FiExternalLink, 
  FiArrowLeft,
  FiImage,
  FiMessageSquare,
  FiCode,
  FiMusic,
  FiTool,
  FiBarChart,
  FiPenTool,
  FiVideo,
  FiEdit3,
  FiLoader
} from 'react-icons/fi';

const BrowseToolsPage: React.FC = () => {
  const { theme, colors } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<{ name: string; icon: any; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tools and categories from Appwrite
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all tools
        const toolsData = await toolsService.getAllTools();
        console.log('Fetched tools data:', toolsData);
        setTools(toolsData);

        // Generate categories with counts
        const allCategories = toolsData.map(tool => tool.category).filter(cat => cat && cat.trim() !== '');
        const uniqueCategories = [...new Set(allCategories)];
        
        const categoriesWithCount = [
          { name: "All Categories", icon: FiGrid, count: toolsData.length },
          ...uniqueCategories.map(cat => ({
            name: cat,
            icon: getCategoryIcon(cat),
            count: toolsData.filter(tool => tool.category === cat).length
          }))
        ];
        
        setCategories(categoriesWithCount);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get category icons
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
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
      default:
        return FiTool;
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tool.tags && tool.tags.some(tag => tag?.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === "All Categories" || tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "reviews":
        return (b.reviews || 0) - (a.reviews || 0);
      case "name":
        return (a.name || '').localeCompare(b.name || '');
      case "featured":
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  const getPricingColor = (pricing: string | undefined) => {
    const pricingLower = pricing?.toLowerCase() || 'unknown';
    switch (pricingLower) {
      case "free":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "freemium":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "paid":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <>
        <div className={`min-h-screen transition-colors duration-300`} style={{ backgroundColor: colors.background }}>
          <NavigationWrapper />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FiLoader className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading tools...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className={`min-h-screen transition-colors duration-300`} style={{ backgroundColor: colors.background }}>
          <NavigationWrapper />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`min-h-screen transition-colors duration-300`} style={{ backgroundColor: colors.background }}>
        <NavigationWrapper />
        
        <main className="container mx-auto px-4 pt-8 pb-16 max-w-7xl">
          {/* Header Section */}
            <div className="text-center mb-12 pt-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Browse <span className="text-cyan-400">AI</span> Tools
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
                Discover the perfect AI tools for your needs. Search, filter, and explore our curated collection.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search AI tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="featured">Featured First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      viewMode === "grid"
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <FiGrid className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      viewMode === "list"
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <FiList className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {sortedTools.length} of {tools.length} AI tools
              </p>
            </div>

            {/* Tools Grid/List */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-6"
            }>
              {sortedTools.map((tool) => (
                <div
                  key={tool.$id}
                  className={`bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border border-gray-200 dark:border-gray-700 group ${
                    viewMode === "list" ? "flex items-center p-4" : "p-6"
                  }`}
                  onClick={() => tool.websiteLink && window.open(tool.websiteLink, '_blank')}
                >
                  {viewMode === "grid" ? (
                    <>
                      {/* Grid View */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${tool.cardColor || 'from-cyan-500 to-blue-500'} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-2xl">{tool.logo || tool.fallbackIcon || '🔧'}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {tool.name}
                            </h3>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getPricingColor(tool.pricing)}`}>
                              {tool.pricing || 'Free'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {tool.featured && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded-full">
                              Featured
                            </span>
                          )}
                          {tool.new && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed text-sm">
                        {tool.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="font-medium">{tool.rating || 0}</span>
                          <span>({tool.reviews || 0})</span>
                        </div>
                        <span className="text-cyan-600 dark:text-cyan-400 text-xs">{tool.category}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {tool.tags && tool.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button 
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tool.websiteLink) {
                            window.open(tool.websiteLink, '_blank');
                          }
                        }}
                      >
                        View Tool
                        <FiExternalLink className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="flex items-center gap-6 flex-1">
                        <div className={`w-14 h-14 bg-gradient-to-r ${tool.cardColor || 'from-cyan-500 to-blue-500'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                          <span className="text-2xl">{tool.logo || tool.fallbackIcon || '🔧'}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {tool.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {tool.featured && (
                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded-full">
                                  Featured
                                </span>
                              )}
                              {tool.new && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                            {tool.description}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{tool.rating || 0}</span>
                              <span>({tool.reviews || 0})</span>
                            </div>
                            <span className="text-cyan-600 dark:text-cyan-400">{tool.category}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPricingColor(tool.pricing)}`}>
                              {tool.pricing || 'Free'}
                            </span>
                          </div>
                        </div>
                        
                        <button 
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tool.websiteLink) {
                              window.open(tool.websiteLink, '_blank');
                            }
                          }}
                        >
                          View Tool
                          <FiExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {sortedTools.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiSearch className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No tools found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  We couldn't find any AI tools matching your search criteria. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All Categories");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Back to Home */}
            <div className="text-center mt-20 pt-12 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Continue exploring our platform
              </p>
            </div>
          </main>
        </div>
      </>
  );
};

export default BrowseToolsPage;
