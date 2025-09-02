/**
 * Performance Optimization Utilities
 * Provides tools for improving app performance
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Lazy loading hook for images
export function useLazyLoading() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = useMemo(
    () => items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  );

  const offsetY = visibleStart * itemHeight;
  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight,
    setScrollTop,
    visibleStart,
    visibleEnd,
  };
}

// Memoized component for blog cards
export const MemoizedBlogCard = React.memo(function BlogCard({
  blog,
  onClick,
  getCategoryColor,
}: {
  blog: any;
  onClick: (id: string) => void;
  getCategoryColor: (category: string) => string;
}) {
  const handleClick = useCallback(() => {
    onClick(blog.$id);
  }, [blog.$id, onClick]);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      onClick={handleClick}
    >
      {/* Blog card content */}
    </div>
  );
});

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    componentMounts: 0,
    lastUpdate: Date.now(),
  });

  const startTime = useRef<number>(0);

  const startRender = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - startTime.current;
    setMetrics(prev => ({
      ...prev,
      renderTime,
      componentMounts: prev.componentMounts + 1,
      lastUpdate: Date.now(),
    }));
  }, []);

  return { metrics, startRender, endRender };
}

// Cache management for API calls
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const apiCache = new ApiCache();

// Image optimization component
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
}) {
  const { ref, isIntersecting } = useLazyLoading();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(priority ? src : '');

  useEffect(() => {
    if (isIntersecting && !priority && !imageSrc) {
      setImageSrc(src);
    }
  }, [isIntersecting, priority, src, imageSrc]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => setImageLoaded(true)}
          className={`transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {!imageLoaded && placeholder === 'blur' && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ aspectRatio: `${width}/${height}` }}
        />
      )}
    </div>
  );
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const navigation = entries[0];
    
    if (navigation) {
      console.log('Performance Metrics:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize,
      });
    }
  }
}

// Code splitting helper
export function loadComponent<T = any>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>
) {
  return React.lazy(importFunc);
}

// Memory usage monitor
export function useMemoryMonitor() {
  const [memory, setMemory] = useState<any>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        setMemory((performance as any).memory);
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memory;
}

// Service Worker registration
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
