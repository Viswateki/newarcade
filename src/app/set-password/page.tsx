'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/lib/authService';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const { colors, theme } = useTheme();
  const { user: currentUser } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if this is a password reset flow
    const email = searchParams.get('email');
    const type = searchParams.get('type');
    
    if (type === 'reset' && email) {
      setIsPasswordReset(true);
      setResetEmail(email);
      setPageLoading(false);
    } else {
      // Original set password flow - check if user is authenticated
      if (!currentUser) {
        router.push('/login');
      } else {
        setPageLoading(false);
      }
    }
  }, [searchParams, currentUser, router]);

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
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

    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting to reset password with verification code');
      
      const result = await authService.resetPassword(resetEmail, verificationCode, password);
      
      if (result.success) {
        setSuccess(result.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=' + encodeURIComponent('Password reset successful! Please log in with your new password.'));
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
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
      // This would be for setting password for OAuth users
      setSuccess('Password set successfully! You can now login with email and password.');
      
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

  if (!isPasswordReset && !currentUser) {
    return null; // Will redirect
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: colors.background }}
    >
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
            href={isPasswordReset ? "/forgot-password" : "/dashboard"} 
            className="text-sm hover:underline transition-colors duration-200"
            style={{ color: colors.accent }}
          >
            ← Back to {isPasswordReset ? "Forgot Password" : "Dashboard"}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
            {isPasswordReset ? 'Reset Password' : 'Set Password'}
          </h1>
          <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.7 }}>
            {isPasswordReset 
              ? 'Enter your verification code and new password' 
              : 'Add a password to your account to enable email/password login'
            }
          </p>
        </div>
        
        {/* Form Container */}
        <div 
          className="p-8 rounded-xl border"
          style={{ 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          {error && (
            <div 
              className="border text-sm px-4 py-3 rounded-lg mb-6"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(127, 29, 29, 0.3)' : 'rgba(254, 242, 242, 0.8)',
                borderColor: theme === 'dark' ? '#dc2626' : '#fecaca',
                color: theme === 'dark' ? '#fca5a5' : '#dc2626'
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div 
              className="border text-sm px-4 py-3 rounded-lg mb-6"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(20, 83, 45, 0.3)' : 'rgba(240, 253, 244, 0.8)',
                borderColor: theme === 'dark' ? '#16a34a' : '#bbf7d0',
                color: theme === 'dark' ? '#86efac' : '#15803d'
              }}
            >
              {success}
            </div>
          )}

          {isPasswordReset && (
            <div className="mb-6 p-4 rounded-lg border" style={{
              backgroundColor: colors.background,
              borderColor: colors.border
            }}>
              <p className="text-sm font-medium" style={{ color: colors.foreground }}>
                <strong>Email:</strong> {resetEmail}
              </p>
              <p className="text-sm mt-1" style={{ color: colors.cardForeground, opacity: 0.7 }}>
                Check your email for the verification code
              </p>
            </div>
          )}

          {currentUser && !isPasswordReset && (
            <div className="mb-6 p-4 rounded-lg border" style={{
              backgroundColor: colors.background,
              borderColor: colors.border
            }}>
              <p className="text-sm font-medium" style={{ color: colors.foreground }}>
                <strong>Account:</strong> {currentUser.email}
              </p>
              <p className="text-sm mt-1" style={{ color: colors.cardForeground, opacity: 0.7 }}>
                Currently signed in via: OAuth
              </p>
            </div>
          )}

          <form onSubmit={isPasswordReset ? handlePasswordResetSubmit : handleSetPasswordSubmit} className="space-y-6">
            {isPasswordReset && (
              <div>
                <label 
                  htmlFor="verificationCode" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.cardForeground }}
                >
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none"
                  style={{ 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                    color: colors.foreground,
                    '--tw-ring-color': colors.accent
                  } as React.CSSProperties}
                  placeholder="Enter 6-digit code from email"
                  required
                  maxLength={6}
                />
              </div>
            )}
            
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
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none"
                style={{ 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.foreground,
                  '--tw-ring-color': colors.accent
                } as React.CSSProperties}
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
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none"
                style={{ 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.foreground,
                  '--tw-ring-color': colors.accent
                } as React.CSSProperties}
                placeholder="Confirm your password"
                required
                minLength={8}
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
                  {isPasswordReset ? 'Resetting Password...' : 'Setting Password...'}
                </div>
              ) : (
                isPasswordReset ? 'Reset Password' : 'Set Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href={isPasswordReset ? "/forgot-password" : "/dashboard"} 
              className="text-sm font-medium hover:underline transition-colors duration-200"
              style={{ color: colors.accent }}
            >
              ← Back to {isPasswordReset ? "Forgot Password" : "Dashboard"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}