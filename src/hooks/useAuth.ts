'use client';

import { useState } from 'react';
import { authService } from '@/lib/authService';

interface UseAuthReturn {
  loading: boolean;
  register: (data: { email: string; password: string; firstName: string; lastName: string; username: string; linkedinProfile?: string; githubProfile?: string }) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  verifyEmail: (userId: string, secret: string) => Promise<{ success: boolean; message: string }>;
  sendVerification: () => Promise<{ success: boolean; message: string }>;
  sendPasswordRecovery: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (userId: string, secret: string, newPassword: string) => Promise<{ success: boolean; message: string; errors?: string[] }>;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);

  const register = async (data: { email: string; password: string; firstName: string; lastName: string; username: string; linkedinProfile?: string; githubProfile?: string }) => {
    setLoading(true);
    try {
      return await authService.register(data);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (userId: string, secret: string) => {
    setLoading(true);
    try {
      return await authService.verifyEmail(userId, secret);
    } finally {
      setLoading(false);
    }
  };

  const sendVerification = async () => {
    setLoading(true);
    try {
      return await authService.sendEmailVerification();
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordRecovery = async (email: string) => {
    setLoading(true);
    try {
      return await authService.sendPasswordRecovery(email);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (userId: string, secret: string, newPassword: string) => {
    setLoading(true);
    try {
      return await authService.resetPassword(userId, secret, newPassword);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    register,
    verifyEmail,
    sendVerification,
    sendPasswordRecovery,
    resetPassword,
  };
};