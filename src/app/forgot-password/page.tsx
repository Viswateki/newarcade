'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/lib/authService';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: email input, 2: code sent
  const { colors, theme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('🔄 Requesting password reset for:', email);
      
      // Send password recovery request
      const result = await authService.sendPasswordRecovery(email);
      
      if (result.success && result.verificationCode) {
        // Send email via API
        try {
          const emailResponse = await fetch('/api/auth/send-email-verification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              code: result.verificationCode,
              name: result.userName || 'User',
              type: 'password-reset'
            })
          });

          const emailResult = await emailResponse.json();
          
          if (emailResult.success) {
            setMessage('Password reset code sent! Check your inbox and then click "Enter Reset Code" below.');
            setStep(2);
            console.log('✅ Password reset email sent successfully');
          } else {
            setError('Failed to send reset email. Please try again.');
          }
        } catch (emailError) {
          console.error('❌ Failed to send reset email:', emailError);
          setError('Failed to send reset email. Please check your connection.');
        }
      } else {
        setMessage(result.message);
      }
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError(err.message || 'Failed to send recovery email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToReset = () => {
    // Navigate to reset password page with email
    router.push(`/set-password?email=${encodeURIComponent(email)}&type=reset`);
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
              Forgot Password?
            </h1>
            <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.7 }}>
              Enter your email address and we'll send you a verification code to reset your password.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link 
              href="/login" 
              className="text-xs hover:underline transition-colors duration-200 whitespace-nowrap"
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
            <div 
              className="border text-sm px-4 py-2.5 rounded-lg mb-4"
              style={{
                backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
                borderColor: theme === 'dark' ? '#dc2626' : '#fecaca',
                color: theme === 'dark' ? '#fca5a5' : '#dc2626'
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div 
              className="border text-sm px-4 py-2.5 rounded-lg mb-4"
              style={{
                backgroundColor: theme === 'dark' ? '#064e3b' : '#f0fdf4',
                borderColor: theme === 'dark' ? '#059669' : '#bbf7d0',
                color: theme === 'dark' ? '#6ee7b7' : '#059669'
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-1.5"
                style={{ color: colors.cardForeground }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50 transition-all duration-200 outline-none text-sm"
                style={{ 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.foreground,
                  '--tw-ring-color': colors.accent
                } as React.CSSProperties}
                placeholder="Enter your email address"
                required
              />
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
                  Sending Reset Code...
                </div>
              ) : (
                'Send Reset Code'
              )}
            </button>
            
            {step === 2 && (
              <button
                type="button"
                onClick={handleProceedToReset}
                className="w-full font-medium py-2.5 px-4 rounded-lg transition-all duration-200 border"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: colors.accent,
                  color: colors.accent
                }}
              >
                Enter Reset Code →
              </button>
            )}
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-sm" style={{ color: colors.cardForeground, opacity: 0.7 }}>
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="hover:underline transition-colors duration-200" 
                style={{ color: colors.accent }}
              >
                Sign up here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
