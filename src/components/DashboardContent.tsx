'use client';

import React from 'react';
import { BarChart3, FileText, Wrench, BookOpen, User2, Settings } from 'lucide-react';

interface DashboardContentProps {
  activeUrl: string;
}

export function DashboardContent({ activeUrl }: DashboardContentProps) {
  const renderContent = () => {
    switch (activeUrl) {
      case '/dashboard/analytics':
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <BarChart3 className="size-6 text-blue-400" />
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Visitors Card */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-sm text-slate-400 mb-2">Total Visitors</h3>
                  <p className="text-3xl font-bold text-blue-400">12,543</p>
                </div>

                {/* Page Views Card */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-sm text-slate-400 mb-2">Page Views</h3>
                  <p className="text-3xl font-bold text-green-400">45,123</p>
                </div>

                {/* Bounce Rate Card */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-sm text-slate-400 mb-2">Bounce Rate</h3>
                  <p className="text-3xl font-bold text-orange-400">32%</p>
                </div>
              </div>
            </div>
          </div>
        );

      case '/tools/favorites':
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Wrench className="size-6 text-purple-400" />
                <h1 className="text-2xl font-bold">Favorite Tools</h1>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-xl font-semibold mb-2">Code Formatter</h3>
                  <p className="text-slate-400">Format your code with ease</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-xl font-semibold mb-2">Color Picker</h3>
                  <p className="text-slate-400">Pick colors for your designs</p>
                </div>
              </div>
            </div>
          </div>
        );

      case '/tools/yours':
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Wrench className="size-6 text-green-400" />
                <h1 className="text-2xl font-bold">Your Tools</h1>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-20">
                <p className="text-lg text-slate-400 mb-4">You haven't created any tools yet.</p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Your First Tool
                </button>
              </div>
            </div>
          </div>
        );

      case '/blogs':
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <FileText className="size-6 text-red-400" />
                <h1 className="text-2xl font-bold">Blogs</h1>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold mb-2">Getting Started with Web Development</h3>
                <p className="text-slate-400 mb-2">Learn the basics of web development...</p>
                <span className="text-sm text-slate-500">Published 2 days ago</span>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold mb-2">Advanced React Patterns</h3>
                <p className="text-slate-400 mb-2">Explore advanced patterns in React...</p>
                <span className="text-sm text-slate-500">Published 1 week ago</span>
              </div>
            </div>
          </div>
        );

      case '/learn/create-tool':
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <BookOpen className="size-6 text-indigo-400" />
                <h1 className="text-2xl font-bold">How to Create Your Tool</h1>
              </div>
            </div>
            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-semibold mb-3">Step 1: Plan Your Tool</h2>
                  <p className="text-slate-400">Start by defining what your tool will do and who will use it.</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-semibold mb-3">Step 2: Design the Interface</h2>
                  <p className="text-slate-400">Create wireframes and mockups for your tool's user interface.</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-semibold mb-3">Step 3: Develop the Functionality</h2>
                  <p className="text-slate-400">Write the code that makes your tool work.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case '/learn/deploy-tool':
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <BookOpen className="size-6 text-teal-400" />
                <h1 className="text-2xl font-bold">How to Deploy Your Tool</h1>
              </div>
            </div>
            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-semibold mb-3">Deployment Options</h2>
                  <p className="text-slate-400">Choose from various deployment platforms like Vercel, Netlify, or AWS.</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-semibold mb-3">Configuration</h2>
                  <p className="text-slate-400">Set up your environment variables and build settings.</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-semibold mb-3">Go Live</h2>
                  <p className="text-slate-400">Deploy your tool and make it available to users.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case '/learn/submit-tools':
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <BookOpen className="size-6 text-pink-400" />
                <h1 className="text-2xl font-bold">How to Submit Tools</h1>
              </div>
            </div>
            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-semibold mb-3">Submission Guidelines</h2>
                  <p className="text-slate-400">Follow our guidelines to ensure your tool meets quality standards.</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-semibold mb-3">Review Process</h2>
                  <p className="text-slate-400">Our team will review your tool within 24-48 hours.</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h2 className="text-xl font-semibold mb-3">Publication</h2>
                  <p className="text-slate-400">Once approved, your tool will be featured in our marketplace.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case '/dashboard/profile':
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <User2 className="size-6 text-amber-400" />
                <h1 className="text-2xl font-bold">Profile</h1>
              </div>
            </div>
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      T
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Teki Viswagna</h2>
                      <p className="text-slate-400">tekiviswagna@gmail.com</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Full Name</label>
                      <input type="text" value="Teki Viswagna" className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
                      <input type="email" value="tekiviswagna@gmail.com" className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                    </div>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case '/dashboard/settings':
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Settings className="size-6 text-gray-400" />
                <h1 className="text-2xl font-bold">Settings</h1>
              </div>
            </div>
            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Email Notifications</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dark Mode</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Public Profile</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show Online Status</span>
                      <input type="checkbox" className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-6 border-b border-slate-700">
              <h1 className="text-2xl font-bold">Welcome to Dashboard</h1>
            </div>
            <div className="p-6">
              <div className="text-center py-20">
                <h2 className="text-xl font-semibold mb-4">Select an item from the sidebar to get started</h2>
                <p className="text-slate-400">Choose any option from the left sidebar to view content here.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderContent();
}