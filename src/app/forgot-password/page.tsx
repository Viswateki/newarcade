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
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-3xl font-bold">
                <span style={{ color: "#00bcd4" }}>ai</span>
                <span style={{ color: colors.foreground }}>arcade</span>
              </span>
            </Link>
          </div>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>
              Forgot Password?
            </h1>
            <p className="text-sm" style={{ color: colors.cardForeground, opacity: 0.7 }}>
              Enter your email address and we'll send you a verification code to reset your password.
            </p>
          </div>
          
          <Link 
            href="/login" 
            className="text-sm hover:underline transition-colors duration-200 inline-flex items-center"
            style={{ color: colors.accent }}
          >
            ← Back to Sign In
          </Link>
        </div>

        {/* Main Form Container */}
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

          {message && (
            <div 
              className="border text-sm px-4 py-3 rounded-lg mb-6"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(20, 83, 45, 0.3)' : 'rgba(240, 253, 244, 0.8)',
                borderColor: theme === 'dark' ? '#16a34a' : '#bbf7d0',
                color: theme === 'dark' ? '#86efac' : '#15803d'
              }}
            >
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
                Email Address
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
                placeholder="Enter your email address"
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
                className="w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 mt-3 border"
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
          
          {/* Additional help text */}
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: colors.border }}>
            <p className="text-xs" style={{ color: colors.cardForeground, opacity: 0.6 }}>
              Don't have an account? <Link href="/signup" className="hover:underline" style={{ color: colors.accent }}>Sign up here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
