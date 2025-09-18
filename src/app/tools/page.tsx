"use client";
import React, { useState, useEffect, useRef } from 'react';
import NavigationWrapper from '@/components/NavigationWrapper';
import GradientText from '@/components/GradientText';
import { useTheme } from '@/contexts/ThemeContext';
import { toolsService } from '@/lib/toolsService';
import { Tool, getToolImageUrl } from '@/lib/appwrite';

const BrowseToolsPage = () => {
  const { theme, colors } = useTheme();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Toggle category collapse
  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Debug: Log theme colors
  console.log('Theme:', theme, 'Colors:', colors);

  // Fetch tools from Appwrite
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all tools with proper image URLs
        const toolsData = await toolsService.getAllToolsWithImages();
        console.log('Fetched tools data:', toolsData);
        setTools(toolsData);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToolClick = (tool: Tool) => {
    console.log('Tool clicked:', tool); // Debug log
    
    // Try different possible property names for the website link
    const websiteUrl = tool.websiteLink || 
                      (tool as any).website || 
                      (tool as any).url || 
                      (tool as any).link ||
                      (tool as any).websiteUrl;
    
    console.log('Website URL found:', websiteUrl); // Debug website link
    
    if (websiteUrl) {
      window.open(websiteUrl, '_blank');
    } else {
      console.warn('No website link found for tool:', tool.name);
      // Show user feedback
      alert(`Sorry, no website link available for ${tool.name}`);
    }
  };

  // Skeleton loader component
  const ToolCardSkeleton = () => {
    const { colors, theme } = useTheme();
    
    return (
      <div className="flex-shrink-0 w-28 md:w-32 flex flex-col items-center text-center">
        <div 
          className="w-20 h-20 md:w-24 md:h-24 overflow-hidden p-0.5 relative"
          style={{
            backgroundColor: colors.card,
            borderRadius: '32px',
            transform: 'rotate(-2deg)',
          }}
        >
          {/* Shimmer effect */}
          <div 
            className="w-full h-full rounded-[28px] relative overflow-hidden"
            style={{ backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)' }}
          >
            <div 
              className="absolute inset-0 -translate-x-full animate-shimmer"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'}, transparent)`,
                animationDuration: '1.5s',
                animationIterationCount: 'infinite'
              }}
            />
          </div>
        </div>
        <div 
          className="w-16 h-3 mt-3 rounded"
          style={{ backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)' }}
        />
      </div>
    );
  };

  // Enhanced categorization logic - returns single primary category
  const getPrimaryCategoryForTool = (tool: Tool): string => {
    // Secondary categorization based on tags and descriptions
    const toolName = tool.name?.toLowerCase() || '';
    const toolDesc = tool.description?.toLowerCase() || '';
    const toolTags = tool.tags?.map((tag: string) => tag.toLowerCase()) || [];
    const allText = [toolName, toolDesc, ...toolTags].join(' ');
    
    // Priority order: most specific to least specific
    
    // Official/Popular bots (highest priority for well-known companies)
    if (toolName.includes('google') || toolName.includes('openai') || toolName.includes('microsoft') ||
        toolName.includes('github') || toolName.includes('notion') || toolName.includes('grammarly') ||
        allText.includes('official') || tool.featured) {
      return 'Official bots';
    }
    
    // Image generation bots
    if (allText.includes('image') || allText.includes('photo') || allText.includes('art') || 
        allText.includes('dall-e') || allText.includes('midjourney') || allText.includes('generate') ||
        allText.includes('visual') || allText.includes('picture')) {
      return 'Image generation bots';
    }
    
    // Video generation bots
    if (allText.includes('video') || allText.includes('film') || allText.includes('movie') ||
        allText.includes('animation') || allText.includes('clip') || allText.includes('editing')) {
      return 'Video generation bots';
    }
    
    // Audio generation bots
    if (allText.includes('audio') || allText.includes('music') || allText.includes('sound') ||
        allText.includes('voice') || allText.includes('song') || allText.includes('podcast')) {
      return 'Audio generation bots';
    }
    
    // Writing/Content bots
    if (allText.includes('writing') || allText.includes('content') || allText.includes('copy') ||
        allText.includes('text') || allText.includes('article') || allText.includes('blog') ||
        allText.includes('grammar') || allText.includes('editing')) {
      return 'Writing bots';
    }
    
    // Search/Research bots
    if (allText.includes('search') || allText.includes('research') || allText.includes('data') ||
        allText.includes('analytics') || allText.includes('insights') || allText.includes('information') ||
        allText.includes('knowledge') || allText.includes('notes')) {
      return 'Search bots';
    }
    
    // Chat/Conversational bots
    if (allText.includes('chat') || allText.includes('conversation') || allText.includes('assistant') ||
        allText.includes('companion') || allText.includes('talk') || allText.includes('dialogue')) {
      return 'Chat bots';
    }
    
    // Productivity bots
    if (allText.includes('productivity') || allText.includes('work') || allText.includes('business') ||
        allText.includes('meeting') || allText.includes('schedule') || allText.includes('organization')) {
      return 'Productivity bots';
    }
    
    // Default to original category or uncategorized
    return tool.category || 'Uncategorized';
  };

  const groupedTools = tools.reduce((acc, tool) => {
    const primaryCategory = getPrimaryCategoryForTool(tool);
    
    if (!acc[primaryCategory]) {
      acc[primaryCategory] = [];
    }
    // Only add if not already in this category (avoid duplicates)
    if (!acc[primaryCategory].find(t => t.$id === tool.$id)) {
      acc[primaryCategory].push(tool);
    }
    
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <>
      <NavigationWrapper />
      <div 
        className="min-h-screen antialiased font-sans transition-all duration-500 relative"
        style={{
          backgroundColor: colors.background,
          color: colors.foreground
        }}
      >
        {/* Loading & Error States */}
        {loading && (
          <div 
            className="pt-24 pb-8 md:pt-32 md:pb-16 px-6 md:px-8 lg:px-12 xl:px-16 w-full transition-opacity duration-300 relative z-10"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground
            }}
          >
            <header className="mb-8 text-center">
              <GradientText 
                className="text-4xl md:text-5xl font-extrabold mb-2"
                colors={theme === 'dark' 
                  ? ['#ffffff', '#f1f5f9', '#e2e8f0', '#ffffff'] 
                  : ['#1f2937', '#374151', '#4b5563', '#1f2937']
                }
                animationSpeed={6}
              >
                Browse AI Bots
              </GradientText>
              <p className="text-lg" style={{ color: colors.cardForeground }}>
                Discovering the latest tools...
              </p>
            </header>

            {/* Skeleton Categories */}
            {[1, 2, 3].map((category) => (
              <div key={category} className="mb-12">
                <div className="flex justify-between items-center mb-4 px-1">
                  <div 
                    className="h-6 w-32 rounded"
                    style={{ backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)' }}
                  />
                  <div 
                    className="h-8 w-16 rounded-lg"
                    style={{ backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)' }}
                  />
                </div>
                <div className="flex space-x-6 overflow-x-hidden py-4">
                  {[1, 2, 3, 4, 5, 6].map((tool) => (
                    <ToolCardSkeleton key={tool} />
                  ))}
                </div>
              </div>
            ))}

            {/* Add shimmer animation */}
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              .animate-shimmer {
                animation: shimmer 1.5s infinite;
              }
            `}</style>
          </div>
        )}

        {error && (
          <div 
            className="flex items-center justify-center min-h-screen fixed inset-0 z-50 transition-opacity duration-300"
            style={{ backgroundColor: colors.background }}
          >
            <div className="text-center max-w-md mx-auto px-6">
              {/* Fun SVG illustration */}
              <div className="w-32 h-32 mx-auto mb-6">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Robot body */}
                  <rect
                    x="60"
                    y="80"
                    width="80"
                    height="80"
                    rx="20"
                    fill={theme === 'dark' ? '#374151' : '#F3F4F6'}
                    stroke={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                    strokeWidth="2"
                  />
                  {/* Robot head */}
                  <rect
                    x="70"
                    y="40"
                    width="60"
                    height="50"
                    rx="15"
                    fill={theme === 'dark' ? '#4B5563' : '#E5E7EB'}
                    stroke={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                    strokeWidth="2"
                  />
                  {/* Eyes (X marks) */}
                  <g stroke="#EF4444" strokeWidth="3" strokeLinecap="round">
                    <line x1="80" y1="55" x2="90" y2="65" />
                    <line x1="90" y1="55" x2="80" y2="65" />
                    <line x1="110" y1="55" x2="120" y2="65" />
                    <line x1="120" y1="55" x2="110" y2="65" />
                  </g>
                  {/* Mouth (sad) */}
                  <path
                    d="M 85 75 Q 100 70 115 75"
                    stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Antenna */}
                  <line
                    x1="100"
                    y1="40"
                    x2="100"
                    y2="25"
                    stroke={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                    strokeWidth="2"
                  />
                  <circle
                    cx="100"
                    cy="25"
                    r="4"
                    fill="#EF4444"
                  />
                  {/* Arms */}
                  <line
                    x1="60"
                    y1="100"
                    x2="40"
                    y2="120"
                    stroke={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="140"
                    y1="100"
                    x2="160"
                    y2="120"
                    stroke={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Sparks/Error indicators */}
                  <g fill="#FCD34D" opacity="0.8">
                    <polygon points="30,90 35,100 25,100" />
                    <polygon points="170,110 175,120 165,120" />
                    <polygon points="50,70 55,80 45,80" />
                  </g>
                </svg>
              </div>

              <h3 className="text-2xl font-bold mb-4" style={{ color: colors.foreground }}>
                Oops! Robot needs repairs
              </h3>
              <p className="mb-6 text-base leading-relaxed" style={{ color: colors.muted }}>
                {error} Our robot assistant is taking a quick break. Let's get it back online!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`pt-24 pb-8 md:pt-32 md:pb-16 px-6 md:px-8 lg:px-12 xl:px-16 w-full transition-opacity duration-300 relative z-10 ${loading || error ? 'opacity-0' : 'opacity-100'}`}>
          <header className="mb-8 text-center">
            <GradientText 
              className="text-4xl md:text-5xl font-extrabold mb-2"
              colors={theme === 'dark' 
                ? ['#ffffff', '#f1f5f9', '#e2e8f0', '#ffffff'] 
                : ['#1f2937', '#374151', '#4b5563', '#1f2937']
              }
              animationSpeed={6}
            >
              Browse AI Bots
            </GradientText>
            <p className="text-lg" style={{ color: colors.cardForeground }}>
              Discover and explore a wide range of AI tools for different needs.
            </p>
          </header>

          <main>
            {/* Define category order for better UX */}
            {(() => {
              const categoryOrder = [
                'Official bots',
                'Chat bots', 
                'Image generation bots',
                'Video generation bots',
                'Audio generation bots',
                'Writing bots',
                'Search bots',
                'Productivity bots',
                'Uncategorized'
              ];
              
              // Get sorted categories, showing ordered ones first, then any others
              const allCategories = Object.keys(groupedTools);
              const orderedCategories = categoryOrder.filter(cat => allCategories.includes(cat));
              const otherCategories = allCategories.filter(cat => !categoryOrder.includes(cat));
              const finalCategories = [...orderedCategories, ...otherCategories];
              
              return finalCategories.map(category => (
                <ToolSection
                  key={category}
                  title={category}
                  tools={groupedTools[category] || []}
                  onToolClick={handleToolClick}
                  isCollapsed={collapsedCategories.has(category)}
                  onToggleCollapse={() => toggleCategoryCollapse(category)}
                />
              ));
            })()}
          </main>
        </div>
      </div>
    </>
  );
};

// ToolSection component for horizontal scrolling
interface ToolSectionProps {
  title: string;
  tools: Tool[];
  onToolClick: (tool: Tool) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ToolSection: React.FC<ToolSectionProps> = ({ title, tools, onToolClick, isCollapsed = false, onToggleCollapse }) => {
  const { colors, theme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Check scroll position to show/hide buttons
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px tolerance
    }
  };

  // Check scroll position on mount and when tools change
  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tools]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Fixed scroll amount for more predictable behavior
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
      
      // Update button visibility after scroll
      setTimeout(checkScrollPosition, 300);
    }
  };

  // Simplified mouse wheel scrolling - let browser handle it naturally
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Only intervene if it's a vertical scroll and we want horizontal movement
    if (scrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      // Convert vertical scroll to horizontal only if there's no natural horizontal scroll
      const scrollAmount = e.deltaY * 0.5;
      scrollRef.current.scrollLeft += scrollAmount;
      e.preventDefault();
    }
    // For horizontal scrolling (e.deltaX), let the browser handle it naturally
    
    // Update button visibility
    setTimeout(checkScrollPosition, 50);
  };

  // Simplified touch support - let browser handle natural scrolling
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.touches[0]) {
      const touch = e.touches[0];
      (scrollRef.current as any).touchStartX = touch.clientX;
      (scrollRef.current as any).touchStartTime = Date.now();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      // Update button visibility after touch interaction
      setTimeout(checkScrollPosition, 100);
    }
  };

  // Add mouse drag scrolling functionality
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      const startX = e.pageX - scrollRef.current.offsetLeft;
      const scrollLeft = scrollRef.current.scrollLeft;
      let hasMoved = false;
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!scrollRef.current) return;
        
        const x = e.pageX - scrollRef.current.offsetLeft;
        const distance = Math.abs(x - startX);
        
        // Only start dragging if mouse moved more than 5 pixels
        if (distance > 5) {
          hasMoved = true;
          (scrollRef.current as any).isDragging = true;
          e.preventDefault();
          const walk = (x - startX) * 2; // Scroll speed multiplier
          scrollRef.current.scrollLeft = scrollLeft - walk;
          scrollRef.current.style.cursor = 'grabbing';
        }
      };
      
      const handleMouseUp = () => {
        if (scrollRef.current) {
          (scrollRef.current as any).isDragging = false;
          scrollRef.current.style.cursor = 'grab';
          setTimeout(checkScrollPosition, 100);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Add keyboard support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      let scrollAmount = 0;
      
      switch (e.key) {
        case 'ArrowLeft':
          scrollAmount = -200;
          break;
        case 'ArrowRight':
          scrollAmount = 200;
          break;
        case 'Home':
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          e.preventDefault();
          setTimeout(checkScrollPosition, 300);
          return;
        case 'End':
          scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
          e.preventDefault();
          setTimeout(checkScrollPosition, 300);
          return;
      }
      
      if (scrollAmount !== 0) {
        e.preventDefault();
        scrollRef.current.scrollTo({
          left: scrollRef.current.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
        setTimeout(checkScrollPosition, 300);
      }
    }
  };

  return (
    <div className="mb-12 relative group">
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-3">
          <GradientText 
            className="text-lg md:text-xl font-bold capitalize"
            colors={['#06b6d4', '#3b82f6', '#8b5cf6', '#06b6d4']}
            animationSpeed={4}
          >
            {title}
          </GradientText>
          {/* Collapse button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-full transition-all duration-200 hover:bg-opacity-20"
              style={{ backgroundColor: 'transparent', color: colors.muted }}
              aria-label={isCollapsed ? 'Expand category' : 'Collapse category'}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            color: '#3B82F6',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
          aria-label={isExpanded ? 'Collapse section' : 'Expand to grid view'}
        >
          <span className="text-sm font-semibold">
            {isExpanded ? 'Show less' : 'See all'}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      
      {/* Collapsible content */}
      {!isCollapsed && (
        <>
          {/* Expanded Grid View */}
          {isExpanded ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 py-4">
              {tools.map((tool: Tool) => (
                <ToolCard key={tool.$id} tool={tool} onToolClick={onToolClick} />
              ))}
            </div>
          ) : (
            /* Horizontal Scroll View */
            <div className="relative">
              <div
                ref={scrollRef}
                className="flex space-x-6 overflow-x-auto py-4 tool-scroll-container scrollbar-hide focus:outline-none scroll-snap-x"
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onScroll={checkScrollPosition}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="region"
                aria-label="AI Tools horizontal scroll area. Use arrow keys, mouse wheel, or drag to navigate."
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  cursor: 'grab',
                  scrollSnapType: 'x mandatory'
                }}
              >
                {tools.map((tool: Tool) => (
                  <ToolCard key={tool.$id} tool={tool} onToolClick={onToolClick} />
                ))}
              </div>
          
              {/* Fog Effect and Scroll Arrows */}
              <style>{`
                .tool-scroll-container {
                  scroll-behavior: smooth;
                  -webkit-overflow-scrolling: touch;
                  -ms-overflow-style: none;  /* IE and Edge */
                  scrollbar-width: none;     /* Firefox */
                }
                .tool-scroll-container::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .tool-scroll-container:focus {
                  outline: 2px solid #3B82F6;
                  outline-offset: 2px;
                  border-radius: 8px;
                }
                .tool-scroll-container:active {
                  cursor: grabbing !important;
                }
                .scroll-snap-x > * {
                  scroll-snap-align: start;
                }
                .fog-effect::before,
                .fog-effect::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  width: 80px;
                  pointer-events: none;
                  z-index: 10;
                }
                .fog-effect::before {
                  left: 0;
                  background: linear-gradient(to right, ${colors.background} 0%, ${colors.background}80 50%, transparent 100%);
                }
                .fog-effect::after {
                  right: 0;
                  background: linear-gradient(to left, ${colors.background} 0%, ${colors.background}80 50%, transparent 100%);
                }
              `}</style>

              {/* Scroll Arrows with the fog container */}
              <div className="fog-effect absolute inset-y-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {canScrollLeft && (
                  <button
                    onClick={() => handleScroll('left')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 backdrop-blur-lg p-3 rounded-full transition-all duration-300 hover:scale-110 z-30 shadow-xl"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      color: colors.foreground,
                      border: `2px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                    }}
                    aria-label="Scroll left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                )}
                {canScrollRight && (
                  <button
                    onClick={() => handleScroll('right')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 backdrop-blur-lg p-3 rounded-full transition-all duration-300 hover:scale-110 z-30 shadow-xl"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      color: colors.foreground,
                      border: `2px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                    }}
                    aria-label="Scroll right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ToolCard component for a single tool
interface ToolCardProps {
  tool: Tool;
  onToolClick: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onToolClick }) => {
  const { colors, theme } = useTheme();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);
  
  // Debug log to see what logo data we have
  React.useEffect(() => {
    console.log('Tool logo data for', tool.name, {
      logo: tool.logo,
      imageurl: tool.imageurl,
      toolImage: tool.toolImage,
      logoBackgroundColor: tool.logoBackgroundColor,
      fallbackIcon: tool.fallbackIcon
    });
  }, [tool]);

  // Determine the best logo URL to use
  const getLogoUrl = () => {
    // First, try to use the computed image URL from the service
    if (tool.computedImageUrl) {
      console.log('Using computed image URL for', tool.name, tool.computedImageUrl);
      return tool.computedImageUrl;
    }
    
    // Fallback to the original logic for backward compatibility
    const logoUrl = tool.logo || 
                   tool.imageurl || 
                   tool.toolImage || 
                   tool.fallbackIcon;
    
    if (logoUrl) {
      // Use the getToolImageUrl helper function
      const computedUrl = getToolImageUrl(tool);
      console.log('Using fallback computed URL for', tool.name, computedUrl);
      return computedUrl;
    }
    
    // Final fallback to placeholder with first letter
    console.log('Using placeholder for', tool.name);
    return `https://placehold.co/100x100/1C64F2/ffffff?text=${tool.name?.charAt(0) || 'T'}`;
  };

  const logoUrl = getLogoUrl();
  
  const handleClick = (e: React.MouseEvent) => {
    console.log('ToolCard clicked:', tool.name); // Debug log
    
    // Stop event propagation to prevent scroll container from handling it
    e.stopPropagation();
    e.preventDefault();
    
    // Check if we were dragging (with a small delay to ensure drag state is set properly)
    const scrollContainer = e.currentTarget.closest('.tool-scroll-container');
    const isDragging = scrollContainer && (scrollContainer as any).isDragging;
    
    if (isDragging) {
      console.log('Click prevented due to dragging');
      return;
    }
    
    console.log('Calling onToolClick for:', tool.name);
    onToolClick(tool);
  };

  // Also add a direct click handler as backup
  const handleDirectClick = () => {
    console.log('Direct click handler for:', tool.name);
    onToolClick(tool);
  };
  
  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDirectClick} // Backup for double-click
      className="flex-shrink-0 w-28 md:w-32 flex flex-col items-center text-center cursor-pointer group transition-all duration-300 hover:scale-110 hover:rotate-1 scroll-snap-align-start relative z-10"
      style={{ 
        scrollSnapAlign: 'start',
        pointerEvents: 'auto' // Ensure clicks are enabled
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${tool.name} tool in new tab`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('Keyboard activation for:', tool.name);
          onToolClick(tool);
        }
      }}
    >
      <div 
        className="w-20 h-20 md:w-24 md:h-24 overflow-hidden p-0.5 transition-all duration-300 group-hover:shadow-xl shadow-md relative"
        style={{
          backgroundColor: tool.logoBackgroundColor || colors.card,
          borderRadius: '32px',
          transform: 'rotate(-2deg)',
          background: tool.logoBackgroundColor 
            ? `linear-gradient(135deg, ${tool.logoBackgroundColor} 0%, ${tool.logoBackgroundColor}dd 100%)`
            : `linear-gradient(135deg, ${colors.card} 0%, ${theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} 100%)`,
          border: `1px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
          boxShadow: theme === 'dark' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)'
        }}
      >
        {/* Subtle glow effect */}
        <div 
          className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            filter: 'blur(8px)',
            transform: 'scale(1.1)'
          }}
        />
        <img
          src={logoUrl}
          alt={`${tool.name} icon`}
          className="w-full h-full object-cover relative z-10 cursor-pointer"
          style={{
            borderRadius: '28px',
            transform: 'rotate(2deg)',
            objectFit: tool.logo || tool.imageurl || tool.toolImage ? 'contain' : 'cover', // Use contain for actual logos, cover for placeholders
            padding: tool.logo || tool.imageurl || tool.toolImage ? '4px' : '0', // Add padding for real logos
          }}
          onClick={handleDirectClick} // Additional click handler on image
          onError={(e) => {
            // Improved fallback logic
            const target = e.target as HTMLImageElement;
            console.log('Image failed to load for', tool.name, 'trying fallback');
            
            // Try different fallback options
            if (tool.fallbackIcon && target.src !== tool.fallbackIcon) {
              target.src = tool.fallbackIcon;
            } else {
              // Final fallback to placeholder
              target.src = "https://placehold.co/100x100/1C64F2/ffffff?text=" + (tool.name?.charAt(0) || 'T');
            }
          }}
        />
      </div>
      <p 
        className="text-xs md:text-sm mt-3 font-medium transition-all duration-300 group-hover:opacity-80 group-focus:ring-2 group-focus:ring-blue-500/50 rounded cursor-pointer"
        style={{ color: colors.foreground }}
        onClick={handleDirectClick} // Make the text clickable too
      >
        {tool.name}
      </p>
    </div>
  );
};

export default BrowseToolsPage;