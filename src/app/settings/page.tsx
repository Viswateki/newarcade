'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import authService from '@/lib/authService';
import { 
  User, 
  Edit3, 
  Mail, 
  Shield, 
  LogOut,
  UserCircle,
  Users,
  Github,
  Linkedin,
  Save,
  Send,
  Key
} from 'lucide-react';

type SettingsTab = 'profile' | 'edit-profile' | 'change-email' | 'security';

// Profile Overview Component
function ProfileOverview() {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Parse social links if they exist
  const getSocialLinks = () => {
    try {
      if (user?.social_links) {
        return typeof user.social_links === 'string' 
          ? JSON.parse(user.social_links) 
          : user.social_links;
      }
      return {};
    } catch {
      return {};
    }
  };

  const socialLinks = getSocialLinks();

  const profileItems = [
    {
      icon: User,
      label: 'First Name',
      value: user?.firstName || 'Not set',
      isEmpty: !user?.firstName
    },
    {
      icon: Users,
      label: 'Last Name', 
      value: user?.lastName || 'Not set',
      isEmpty: !user?.lastName
    },
    {
      icon: User,
      label: 'Username',
      value: user?.username || 'Not set',
      isEmpty: !user?.username
    },
    {
      icon: Mail,
      label: 'Email Address',
      value: user?.email || 'Not set',
      isEmpty: !user?.email
    },
    {
      icon: Linkedin,
      label: 'LinkedIn Profile',
      value: socialLinks.linkedin || 'Not set',
      isEmpty: !socialLinks.linkedin
    },
    {
      icon: Github,
      label: 'GitHub Profile',
      value: socialLinks.github || 'Not set', 
      isEmpty: !socialLinks.github
    }
  ];

  return (
    <div>
      <h1 
        className="text-2xl font-bold mb-6"
        style={{ color: colors.foreground }}
      >
        Profile Overview
      </h1>

      <div className="space-y-4">
        {profileItems.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-4 rounded-lg"
            style={{ backgroundColor: colors.muted }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#3B82F6' }}
            >
              <item.icon className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div 
                className="text-xs font-medium opacity-70 mb-1"
                style={{ color: colors.foreground }}
              >
                {item.label}
              </div>
              <div 
                className={`text-sm font-medium truncate ${item.isEmpty ? 'opacity-60' : ''}`}
                style={{ color: colors.foreground }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Edit Profile Component
function EditProfile() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const getSocialLinks = () => {
    try {
      if (user?.social_links) {
        return typeof user.social_links === 'string' 
          ? JSON.parse(user.social_links) 
          : user.social_links;
      }
      return {};
    } catch {
      return {};
    }
  };

  const socialLinks = getSocialLinks();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    linkedinProfile: socialLinks.linkedin || '',
    githubProfile: socialLinks.github || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setMessage(null);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (!user?.id) {
        setMessage({ type: 'error', text: 'User not found. Please log in again.' });
        return;
      }

      const result = await authService.updateProfile(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        linkedinProfile: formData.linkedinProfile,
        githubProfile: formData.githubProfile
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // The AuthContext should automatically update, but we can trigger a refresh if needed
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 
        className="text-2xl font-bold mb-6"
        style={{ color: colors.foreground }}
      >
        Edit Profile
      </h1>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
              style={{
                backgroundColor: colors.muted,
                borderColor: colors.border,
                color: colors.foreground
              }}
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
              style={{
                backgroundColor: colors.muted,
                borderColor: colors.border,
                color: colors.foreground
              }}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
              style={{
                backgroundColor: colors.muted,
                borderColor: colors.border,
                color: colors.foreground
              }}
              placeholder="Enter your username"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.foreground, opacity: 0.5 }} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
            LinkedIn Profile URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={formData.linkedinProfile}
              onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
              style={{
                backgroundColor: colors.muted,
                borderColor: colors.border,
                color: colors.foreground
              }}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.foreground, opacity: 0.5 }} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
            GitHub Profile URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={formData.githubProfile}
              onChange={(e) => handleInputChange('githubProfile', e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
              style={{
                backgroundColor: colors.muted,
                borderColor: colors.border,
                color: colors.foreground
              }}
              placeholder="https://github.com/yourusername"
            />
            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.foreground, opacity: 0.5 }} />
          </div>
        </div>

        {message && (
          <div 
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleSaveChanges}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}

// Change Email Component
function ChangeEmail() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    newEmail: '',
    currentPassword: '',
    verificationCode: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setMessage(null);
  };

  const handleSendVerificationCode = async () => {
    if (!formData.newEmail || !formData.currentPassword) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await authService.sendEmailChangeVerification(
        formData.currentPassword, 
        formData.newEmail
      );
      
      if (result.success) {
        setStep('verify');
        setMessage({ 
          type: 'success', 
          text: `Verification code sent to ${formData.newEmail}. Please check your inbox.` 
        });
        
        // In development, show the verification code
        if (result.verificationCode) {
          console.log('🔑 Verification code (dev only):', result.verificationCode);
          setMessage({ 
            type: 'info', 
            text: `Verification code sent to ${formData.newEmail}. Code: ${result.verificationCode} (dev mode)` 
          });
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message 
        });
      }
    } catch (error) {
      console.error('Send verification error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to send verification code. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndChange = async () => {
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit verification code.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await authService.changeEmail(
        formData.newEmail, 
        formData.verificationCode
      );
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message 
        });
        setFormData({ newEmail: '', currentPassword: '', verificationCode: '' });
        setStep('form');
        
        // Give user time to see the success message before redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message 
        });
      }
    } catch (error) {
      console.error('Verify and change email error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to change email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setFormData(prev => ({ ...prev, verificationCode: '' }));
    setMessage(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" style={{ color: colors.foreground }}>
        Change Email Address
      </h1>

      <div className="p-6 rounded-xl mb-8 border" style={{ backgroundColor: '#1e3a8a20', borderColor: '#3B82F6' }}>
        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-blue-500 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-600 mb-3">How Email Change Works:</h3>
            <ul className="space-y-2 text-sm" style={{ color: colors.foreground, opacity: 0.8 }}>
              <li>• Enter your new email address and current password</li>
              <li>• We'll send a 6-digit verification code to your new email</li>
              <li>• Enter the code to complete the email change</li>
              <li>• Your current email remains active until verification</li>
            </ul>
          </div>
        </div>
      </div>

      {step === 'form' ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.foreground }}>
              Current email address:
            </label>
            <p className="text-lg font-medium" style={{ color: colors.foreground }}>
              {user?.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: colors.foreground }}>
              New Email Address
            </label>
            <input
              type="email"
              value={formData.newEmail}
              onChange={(e) => handleInputChange('newEmail', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              style={{
                backgroundColor: colors.muted,
                borderColor: colors.border,
                color: colors.foreground
              }}
              placeholder="Enter your new email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: colors.foreground }}>
              Current Password
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              style={{
                backgroundColor: colors.muted,
                borderColor: colors.border,
                color: colors.foreground
              }}
              placeholder="Enter your current password to confirm"
            />
            <p className="text-sm mt-2" style={{ color: colors.foreground, opacity: 0.6 }}>
              We need your password to verify this change for security reasons.
            </p>
          </div>

          {message && (
            <div 
              className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : message.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleSendVerificationCode}
            disabled={loading || !formData.newEmail || !formData.currentPassword}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border" style={{ backgroundColor: colors.muted, borderColor: colors.border }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold" style={{ color: colors.foreground }}>
                Verify Your New Email
              </h3>
            </div>
            <p className="mb-6" style={{ color: colors.foreground, opacity: 0.8 }}>
              We've sent a 6-digit verification code to <strong>{formData.newEmail}</strong>. 
              Please enter it below to complete the email change.
            </p>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: colors.foreground }}>
                Verification Code
              </label>
              <input
                type="text"
                value={formData.verificationCode}
                onChange={(e) => handleInputChange('verificationCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-center text-2xl tracking-widest"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground
                }}
                placeholder="000000"
                maxLength={6}
              />
            </div>
          </div>

          {message && (
            <div 
              className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : message.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleBackToForm}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleVerifyAndChange}
              disabled={loading || formData.verificationCode.length !== 6}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              <span>{loading ? 'Verifying...' : 'Verify & Change Email'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Security Settings Component  
function SecuritySettings() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setMessage(null);

    if (field === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        feedback = 'Very weak - Add more characters';
        break;
      case 2:
        feedback = 'Weak - Add uppercase, numbers, or symbols';
        break;
      case 3:
        feedback = 'Fair - Almost there!';
        break;
      case 4:
        feedback = 'Good - Strong password';
        break;
      case 5:
        feedback = 'Excellent - Very strong password';
        break;
    }

    setPasswordStrength({ score, feedback });
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1: return '#ef4444';
      case 2: return '#f59e0b';
      case 3: return '#eab308';
      case 4: return '#22c55e';
      case 5: return '#059669';
      default: return '#6b7280';
    }
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password.' });
      return false;
    }
    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'Please enter a new password.' });
      return false;
    }
    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from your current password.' });
      return false;
    }
    return true;
  };

  const handleUpdatePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message + ' Please log in again with your new password.' 
        });

        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength({ score: 0, feedback: '' });

        // Redirect to login after successful password change
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message 
        });
      }
    } catch (error) {
      console.error('Update password error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update password. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.foreground }}>
        Security Settings
      </h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: colors.foreground }}>
            Current Password
          </label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: colors.muted,
              borderColor: colors.border,
              color: colors.foreground
            }}
            placeholder="Enter your current password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: colors.foreground }}>
            New Password
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: colors.muted,
              borderColor: colors.border,
              color: colors.foreground
            }}
            placeholder="Enter your new password"
          />
          
          {formData.newPassword && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: colors.foreground, opacity: 0.7 }}>
                  Password strength:
                </span>
                <span className="text-sm font-medium" style={{ color: getPasswordStrengthColor() }}>
                  {passwordStrength.feedback}
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: colors.border }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: getPasswordStrengthColor()
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: colors.foreground }}>
            Confirm New Password
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: colors.muted,
              borderColor: colors.border,
              color: colors.foreground
            }}
            placeholder="Confirm your new password"
          />
          
          {formData.confirmPassword && (
            <div className="mt-2">
              {formData.newPassword === formData.confirmPassword ? (
                <span className="text-sm text-green-600">✓ Passwords match</span>
              ) : (
                <span className="text-sm text-red-600">✗ Passwords do not match</span>
              )}
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl border" style={{ backgroundColor: colors.muted, borderColor: colors.border }}>
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-3" style={{ color: colors.foreground }}>
                Password Security Tips:
              </h3>
              <ul className="space-y-1 text-sm" style={{ color: colors.foreground, opacity: 0.8 }}>
                <li>• Use at least 8 characters</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Add numbers and special characters</li>
                <li>• Avoid common words or personal information</li>
                <li>• Use a unique password for each account</li>
              </ul>
            </div>
          </div>
        </div>

        {message && (
          <div 
            className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleUpdatePassword}
          disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Key className="w-5 h-5" />
          )}
          <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { colors, theme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const sidebarItems = [
    {
      id: 'profile' as SettingsTab,
      label: 'Profile',
      icon: User,
      active: activeTab === 'profile'
    },
    {
      id: 'edit-profile' as SettingsTab,
      label: 'Edit Profile',
      icon: Edit3,
      active: activeTab === 'edit-profile'
    },
    {
      id: 'change-email' as SettingsTab,
      label: 'Change Email',
      icon: Mail,
      active: activeTab === 'change-email'
    },
    {
      id: 'security' as SettingsTab,
      label: 'Security',
      icon: Shield,
      active: activeTab === 'security'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileOverview />;
      case 'edit-profile':
        return <EditProfile />;
      case 'change-email':
        return <ChangeEmail />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <ProfileOverview />;
    }
  };

  return (
    <ProtectedRoute>
      <div 
        className="min-h-screen pt-20 px-4 pb-8"
        style={{ backgroundColor: colors.background }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div 
                className="rounded-xl p-5 shadow-sm border"
                style={{ 
                  backgroundColor: colors.card,
                  borderColor: colors.border 
                }}
              >
                {/* User Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mb-3"
                    style={{ backgroundColor: colors.accent }}
                  >
                    {getUserInitials()}
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        item.active 
                          ? 'text-white' 
                          : ''
                      }`}
                      style={{
                        backgroundColor: item.active ? '#3B82F6' : 'transparent',
                        color: item.active ? '#ffffff' : colors.foreground
                      }}
                      onMouseEnter={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = colors.muted;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Sign Out Button */}
                <div className="border-t mt-6 pt-4" style={{ borderColor: colors.border }}>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-red-400 hover:text-red-300"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#330000' : '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div 
                className="rounded-xl p-6 shadow-sm border"
                style={{ 
                  backgroundColor: colors.card,
                  borderColor: colors.border 
                }}
              >
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
