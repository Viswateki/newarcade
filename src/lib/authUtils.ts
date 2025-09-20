/**
 * Authentication utilities for handling cross-browser compatibility
 */

export const clearBrowserCache = () => {
  if (typeof window !== 'undefined') {
    // Clear any local storage auth states
    localStorage.removeItem('auth_state');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Force clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }
};

export const forceSessionRefresh = async () => {
  if (typeof window !== 'undefined') {
    // Create a small delay to ensure cookies are properly set
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Trigger a storage event to sync auth state across tabs
    localStorage.setItem('auth_refresh', Date.now().toString());
    localStorage.removeItem('auth_refresh');
  }
};

export const handleBrowserSpecificAuth = () => {
  if (typeof window !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
    const isEdge = userAgent.includes('edg');
    
    if (isChrome) {
      // Chrome-specific handling
      // Ensure SameSite=None for cross-origin cookies
      document.cookie = "chrome_auth_fix=1; SameSite=None; Secure";
    } else if (isEdge) {
      // Edge-specific handling
      document.cookie = "edge_auth_fix=1; SameSite=Lax";
    }
  }
};

export const detectAuthState = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for various Appwrite session cookies
  const cookies = document.cookie.split(';');
  const sessionCookies = [
    'a_session_console',
    'a_session_console_legacy', 
    'a_session',
    `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
  ];
  
  return cookies.some(cookie => {
    const name = cookie.trim().split('=')[0];
    return sessionCookies.includes(name);
  });
};