'use client';

import { useState } from 'react';
import { authService } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { colors, theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.forgotPassword(email);
      setMessage('Password recovery email sent! Check your inbox for further instructions.');
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>
              Forgot Password?
            </h1>
            <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.7 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          <Link 
            href="/login" 
            className="text-sm hover:underline transition-colors duration-200"
            style={{ color: colors.accent }}
          >
            ← Back to Sign In
          </Link>
        </div>

        {/* Main Form Container */}
        <div 
          className="p-8 rounded-lg border shadow-lg"
          style={{ 
            backgroundColor: colors.card,
            borderColor: colors.border,
            boxShadow: theme === 'dark' 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
          }}
        >
          {error && (
            <div className="border text-sm px-4 py-3 rounded-lg mb-6" style={{
              backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
              borderColor: theme === 'dark' ? '#dc2626' : '#fecaca',
              color: theme === 'dark' ? '#fca5a5' : '#dc2626'
            }}>
              {error}
            </div>
          )}

          {message && (
            <div className="border text-sm px-4 py-3 rounded-lg mb-6" style={{
              backgroundColor: theme === 'dark' ? '#14532d' : '#f0fdf4',
              borderColor: theme === 'dark' ? '#16a34a' : '#bbf7d0',
              color: theme === 'dark' ? '#86efac' : '#15803d'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.cardForeground }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none"
                style={{ 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.foreground,
                  '--tw-ring-color': colors.accent
                } as React.CSSProperties}
                placeholder="m@example.com"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: colors.accent, 
                color: 'white' 
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
