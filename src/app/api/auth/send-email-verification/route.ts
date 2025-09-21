import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, name, type } = body;

    if (!email || !code || !name) {
      return NextResponse.json(
        { success: false, message: 'Email, code, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send appropriate email based on type
    if (type === 'email-change') {
      await emailService.sendEmailChangeVerification(email, code, name);
    } else if (type === 'password-reset') {
      await emailService.sendPasswordResetCode(email, code, name);
    } else {
      // Default to regular verification
      await emailService.sendVerificationCode(email, code, name);
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Send email verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send verification email' 
      },
      { status: 500 }
    );
  }
}