'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

function VerifyEmailContent() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { colors, theme } = useTheme();

  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('Submitting verification for:', { email, code });
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        setError('Server returned invalid response');
        return;
      }
      
      console.log('Verification response:', data);

      if (data.success) {
        setMessage(data.message);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Call the register API again to resend the code
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          resendOnly: true 
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        setError('Server returned invalid response');
        return;
      }

      if (data.success) {
        setMessage('Verification code sent! Please check your email.');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <div>Redirecting...</div>;
  }

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
              Verify Your Email
            </h1>
            <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.7 }}>
              Please verify your email to complete your account creation.
            </p>
            <p className="text-sm mt-1" style={{ color: colors.cardForeground, opacity: 0.7 }}>
              We've sent a 6-digit verification code to:
            </p>
            <p className="text-sm font-medium mt-1" style={{ color: colors.accent }}>
              {email}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link 
              href="/signup" 
              className="text-xs hover:underline transition-colors duration-200 whitespace-nowrap"
              style={{ color: colors.accent }}
            >
              Back to Sign Up
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
          <form className="space-y-6" onSubmit={handleVerification}>
            <div>
              <label 
                htmlFor="code" 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.cardForeground }}
              >
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none text-center text-2xl font-mono tracking-widest"
                style={{ 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.foreground,
                  '--tw-ring-color': colors.accent
                } as React.CSSProperties}
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>

            {error && (
              <div className="border text-sm px-4 py-2.5 rounded-lg" style={{
                backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
                borderColor: theme === 'dark' ? '#dc2626' : '#fecaca',
                color: theme === 'dark' ? '#fca5a5' : '#dc2626'
              }}>
                {error}
              </div>
            )}

            {message && (
              <div className="border text-sm px-4 py-2.5 rounded-lg" style={{
                backgroundColor: theme === 'dark' ? '#064e3b' : '#f0fdf4',
                borderColor: theme === 'dark' ? '#059669' : '#bbf7d0',
                color: theme === 'dark' ? '#6ee7b7' : '#059669'
              }}>
                {message}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: colors.accent, 
                  color: 'white' 
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="text-sm hover:underline transition-colors duration-200"
                  style={{ color: colors.accent }}
                >
                  Didn't receive the code? Send again
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}