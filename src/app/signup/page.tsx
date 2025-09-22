'use client';

import { Client, Account, OAuthProvider, ID } from 'appwrite';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

const handleOAuthSignup = (provider: 'google' | 'github') => {
  // OAuth functionality disabled for now
  console.log(`${provider} signup clicked but functionality disabled`);
};

const handleEmailSignup = async (email: string, password: string, username: string) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        username,
        linkedinProfile: '', // Will be filled later in dashboard
        githubProfile: '',   // Will be filled later in dashboard
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error('Server returned invalid response');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    if (data.requiresVerification) {
      // Redirect to verification page with email parameter
      window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
    } else {
      window.location.href = '/dashboard';
    }
  } catch (error: any) {
    throw new Error(error.message || 'Signup failed');
  }
};

export default function Signup() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const { colors, theme } = useTheme();
  const { signup, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'oauth_failed') {
      setError('OAuth authentication failed. Please try again.');
    }
  }, [searchParams]);

  // Don't render the form if user is authenticated or still loading
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm opacity-70">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate required fields
    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      await signup(email, password, username);
      // Redirect to verify-email page since signup usually requires email verification
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-16 pt-24"
      style={{ backgroundColor: colors.background }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: colors.foreground }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.7 }}>
              Enter your details below to create your account.
            </p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Link 
              href="/" 
              className="text-xs hover:underline transition-colors duration-200"
              style={{ color: colors.accent }}
            >
              ← Back to Home
            </Link>
            <Link 
              href="/login" 
              className="text-xs hover:underline transition-colors duration-200"
              style={{ color: colors.accent }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Main Form Container */}
        <div 
          className="p-6 rounded-lg border shadow-lg"
          style={{ 
            backgroundColor: colors.card,
            borderColor: colors.border,
            boxShadow: theme === 'dark' 
              ? '0 20px 40px -12px rgba(0, 0, 0, 0.8)' 
              : '0 20px 40px -12px rgba(0, 0, 0, 0.15)'
          }}
        >
          {error && (
            <div className="border text-sm px-4 py-2.5 rounded-lg mb-4" style={{
              backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
              borderColor: theme === 'dark' ? '#dc2626' : '#fecaca',
              color: theme === 'dark' ? '#fca5a5' : '#dc2626'
            }}>
              {error}
            </div>
          )}

          {!showEmailSignup ? (
            <div className="space-y-4">
              {/* Helpful guidance message */}
              <div className="text-center mb-6">
                <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.8 }}>
                  <strong>Recommended:</strong> Sign up with Google or GitHub for faster access
                </p>
              </div>

              <button
                className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center border hover:opacity-90"
                style={{ 
                  backgroundColor: colors.accent, 
                  color: 'white',
                  borderColor: colors.accent
                }}
                onClick={() => handleOAuthSignup('google')}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>
              
              <button
                className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center border hover:opacity-90"
                style={{ 
                  backgroundColor: '#24292e', 
                  color: 'white',
                  borderColor: '#24292e'
                }}
                onClick={() => handleOAuthSignup('github')}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Sign up with GitHub
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: colors.border }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span 
                    className="px-4 text-sm"
                    style={{ backgroundColor: colors.card, color: colors.cardForeground }}
                  >
                    Or create account with email
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowEmailSignup(true)}
                className="w-full border font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:opacity-80"
                style={{ 
                  borderColor: colors.border, 
                  color: colors.foreground,
                  backgroundColor: 'transparent'
                }}
              >
                Sign up with Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: colors.cardForeground }}
                >
                  Username *
                  <span className="text-xs opacity-60 ml-2">
                    ({username.length}/12 characters)
                  </span>
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 12) {
                      setUsername(value);
                    }
                  }}
                  maxLength={12}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none text-sm"
                  style={{ 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                    color: colors.foreground,
                    '--tw-ring-color': colors.accent
                  } as React.CSSProperties}
                  placeholder="Choose a unique username (max 12 chars)"
                />
              </div>

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: colors.cardForeground }}
                >
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none text-sm"
                  style={{ 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                    color: colors.foreground,
                    '--tw-ring-color': colors.accent
                  } as React.CSSProperties}
                  placeholder="m@example.com"
                />
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: colors.cardForeground }}
                >
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none text-sm"
                  style={{ 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                    color: colors.foreground,
                    '--tw-ring-color': colors.accent
                  } as React.CSSProperties}
                  placeholder="Create a strong password"
                />
              </div>

              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: colors.cardForeground }}
                >
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none text-sm ${
                    confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: colors.background, 
                    borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' : colors.border,
                    color: colors.foreground,
                    '--tw-ring-color': colors.accent
                  } as React.CSSProperties}
                  placeholder="Confirm your password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-5"
                style={{ 
                  backgroundColor: colors.accent, 
                  color: 'white' 
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create & Verify'
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowEmailSignup(false)}
                className="w-full text-sm hover:underline transition-colors duration-200 py-1.5 mt-3"
                style={{ color: colors.accent }}
              >
                ← Back to other options
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <span className="text-sm" style={{ color: colors.cardForeground, opacity: 0.7 }}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
