'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugUserPage() {
  const { user, forceRefreshUser, clearUserCache } = useAuth();
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDirectApiData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me?' + new URLSearchParams({
        t: Date.now().toString()
      }), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      const result = await response.json();
      setApiData(result);
    } catch (error) {
      console.error('Error fetching API data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    await forceRefreshUser();
    await fetchDirectApiData(); // Also refresh the direct API call
  };

  const handleClearCache = () => {
    clearUserCache();
    localStorage.clear(); // Clear all localStorage
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Data Debug</h1>
        
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={handleForceRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Force Refresh User
            </button>
            <button 
              onClick={fetchDirectApiData}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch Direct API Data'}
            </button>
            <button 
              onClick={handleClearCache}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Cache
            </button>
          </div>

          {/* Context User Data */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User from AuthContext</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          {/* Direct API Data */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Direct API Response</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
              {apiData ? JSON.stringify(apiData, null, 2) : 'Click "Fetch Direct API Data" to load'}
            </pre>
          </div>

          {/* LocalStorage Data */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">LocalStorage Data</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
              {typeof window !== 'undefined' ? JSON.stringify({
                auth_user: localStorage.getItem('auth_user'),
                auth_session_expiry: localStorage.getItem('auth_session_expiry')
              }, null, 2) : 'Loading...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}