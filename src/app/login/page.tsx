'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const handleOAuthLogin = (provider: 'google' | 'github') => {
  // OAuth functionality disabled for now
  console.log(`${provider} login clicked but functionality disabled`);
};

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Verification states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { colors, theme } = useTheme();
  const { login, checkUserExists, user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

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

    try {
      const result = await login(email, password);
      
      if (result.requiresVerification) {
        // User needs verification
        setShowVerification(true);
        setVerificationEmail(result.email || email);
        setError(''); // Clear any previous errors
        if (result.showCode) {
          console.log('Debug verification code:', result.showCode);
        }
      } else {
        // Successful login, wait for state to update then redirect
        console.log('✅ Login successful, redirecting to dashboard');
        // Wait a bit longer for the user state to be properly set
        setTimeout(() => {
          router.push('/dashboard');
        }, 200);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: verificationEmail, 
          code: verificationCode 
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Email verified successfully, now try login again
        const loginResult = await login(email, password);
        if (!loginResult.requiresVerification) {
          router.push('/dashboard');
        }
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const result = await response.json();
      
      if (result.success) {
        setError('');
        alert('New verification code sent to your email!');
      } else {
        setError(result.message || 'Failed to resend code');
      }
    } catch (err: any) {
      setError('Failed to resend verification code');
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
              Login to your account
            </h1>
            <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.7 }}>
              Enter your email below to login to your account.
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Link 
              href="/" 
              className="text-sm hover:underline transition-colors duration-200"
              style={{ color: colors.accent }}
            >
              ← Back to Home
            </Link>
            <Link 
              href="/signup" 
              className="text-sm hover:underline transition-colors duration-200"
              style={{ color: colors.accent }}
            >
              Sign Up
            </Link>
          </div>
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

          {!showEmailLogin ? (
            <div className="space-y-4">
              {/* Helpful guidance message */}
              <div className="text-center mb-6">
                <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.8 }}>
                  <strong>Quick Login:</strong> Use the same method you used to sign up
                </p>
              </div>

              <button
                className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center border hover:opacity-90"
                style={{ 
                  backgroundColor: colors.accent, 
                  color: 'white',
                  borderColor: colors.accent
                }}
                onClick={() => handleOAuthLogin('google')}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login with Google
              </button>
              
              <button
                className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center border hover:opacity-90"
                style={{ 
                  backgroundColor: '#24292e', 
                  color: 'white',
                  borderColor: '#24292e'
                }}
                onClick={() => handleOAuthLogin('github')}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Login with GitHub
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
                    Or continue with email
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowEmailLogin(true)}
                className="w-full border font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:opacity-80"
                style={{ 
                  borderColor: colors.border, 
                  color: colors.foreground,
                  backgroundColor: 'transparent'
                }}
              >
                Sign in with Email
              </button>
            </div>
          ) : (
            <>
              {!showVerification ? (
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
                      required
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
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label 
                        htmlFor="password" 
                        className="block text-sm font-medium"
                        style={{ color: colors.cardForeground }}
                      >
                        Password
                      </label>
                      <Link 
                        href="/forgot-password" 
                        className="text-sm hover:underline transition-colors duration-200"
                        style={{ color: colors.accent }}
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none"
                        style={{ 
                          backgroundColor: colors.background, 
                          borderColor: colors.border,
                          color: colors.foreground,
                          '--tw-ring-color': colors.accent
                        } as React.CSSProperties}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 hover:opacity-70 transition-opacity"
                      >
                        {showPassword ? (
                          <FiEyeOff className="w-5 h-5" style={{ color: colors.cardForeground }} />
                        ) : (
                          <FiEye className="w-5 h-5" style={{ color: colors.cardForeground }} />
                        )}
                      </button>
                    </div>
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
                        Signing in...
                      </div>
                    ) : (
                      'Login'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmailLogin(false)}
                    className="w-full text-sm hover:underline transition-colors duration-200 py-2"
                    style={{ color: colors.accent }}
                  >
                    ← Back to other options
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium mb-2" style={{ color: colors.foreground }}>
                      Verify Your Email
                    </h3>
                    <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.8 }}>
                      We've sent a verification code to {verificationEmail}
                    </p>
                  </div>

                  <form onSubmit={handleVerificationSubmit} className="space-y-5">
                    <div>
                      <label 
                        htmlFor="verification-code" 
                        className="block text-sm font-medium mb-2"
                        style={{ color: colors.cardForeground }}
                      >
                        Verification Code
                      </label>
                      <input
                        id="verification-code"
                        type="text"
                        required
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none text-center text-lg tracking-widest"
                        style={{ 
                          backgroundColor: colors.background, 
                          borderColor: colors.border,
                          color: colors.foreground,
                          '--tw-ring-color': colors.accent
                        } as React.CSSProperties}
                        placeholder="000000"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying || verificationCode.length !== 6}
                      className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: colors.accent, 
                        color: 'white' 
                      }}
                    >
                      {isVerifying ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Verify & Sign In'
                      )}
                    </button>
                  </form>

                  <div className="flex justify-between items-center text-sm pt-4">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="hover:underline transition-colors duration-200"
                      style={{ color: colors.accent }}
                    >
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowVerification(false);
                        setVerificationCode('');
                        setError('');
                      }}
                      className="hover:underline transition-colors duration-200"
                      style={{ color: colors.cardForeground }}
                    >
                      ← Back to login
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
