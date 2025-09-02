'use client';

import { Client, Account } from 'appwrite';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

export default function SetPassword() {
  const [user, setUser] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { colors, theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        // User not authenticated, redirect to login
        router.push('/login');
      } finally {
        setPageLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Update the user's password
      await account.updatePassword(password);
      setSuccess('Password set successfully! You can now login with email and password.');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to set password');
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 px-4"
      style={{ backgroundColor: colors.background }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold">
              <span style={{ color: "#00bcd4" }}>ai</span>
              <span style={{ color: colors.foreground }}>arcade</span>
            </span>
          </Link>
          <Link 
            href="/dashboard" 
            className="text-sm hover:underline transition-colors duration-200"
            style={{ color: colors.accent }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="relative z-10 p-8 rounded-3xl shadow-2xl w-full max-w-md border backdrop-blur-sm"
        style={{ 
          backgroundColor: colors.card + 'f0', // Add slight transparency
          borderColor: colors.border,
          boxShadow: theme === 'dark' 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              🔑
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
            Set Password
          </h1>
          <p className="text-sm opacity-70" style={{ color: colors.cardForeground }}>
            Add a password to your account to enable email/password login
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm" style={{
            backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
            borderColor: theme === 'dark' ? '#dc2626' : '#fecaca',
            color: theme === 'dark' ? '#fca5a5' : '#dc2626'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm" style={{
            backgroundColor: theme === 'dark' ? '#14532d' : '#f0fdf4',
            borderColor: theme === 'dark' ? '#16a34a' : '#bbf7d0',
            color: theme === 'dark' ? '#86efac' : '#15803d'
          }}>
            {success}
          </div>
        )}

        <div className="mb-6 p-4 rounded-xl border" style={{
          backgroundColor: colors.background,
          borderColor: colors.border
        }}>
          <p className="text-sm font-medium" style={{ color: colors.foreground }}>
            <strong>Account:</strong> {user.email}
          </p>
          <p className="text-sm mt-1 opacity-70" style={{ color: colors.cardForeground }}>
            Currently signed in via: {user.prefs?.provider || 'OAuth'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.cardForeground }}
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 outline-none"
              style={{ 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.foreground 
              }}
              placeholder="Enter at least 8 characters"
              required
              minLength={8}
            />
          </div>
          
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.cardForeground }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 outline-none"
              style={{ 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.foreground 
              }}
              placeholder="Confirm your password"
              required
              minLength={8}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white font-medium py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Setting Password...
              </div>
            ) : (
              'Set Password'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            href="/dashboard" 
            className="text-sm font-medium hover:underline transition-colors duration-200"
            style={{ color: colors.accent }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
