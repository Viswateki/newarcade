import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/authService';

// POST /api/auth/reset-password -> request reset code
export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ 
        message: 'If the account exists, a recovery email will be sent.' 
      });
    }

    const result = await authService.sendPasswordRecovery(email);
    
    return NextResponse.json({ 
      message: result.message 
    });
  } catch (error) {
    console.error('Password recovery request failed:', error);
    return NextResponse.json({ 
      message: 'If the account exists, a recovery email will be sent.' 
    });
  }
}

// PUT /api/auth/reset-password -> verify code and set new password
export async function PUT(request: NextRequest) {
  try {
    const { userId, secret, newPassword } = (await request.json()) as { 
      userId?: string; 
      secret?: string; 
      newPassword?: string; 
    };
    
    if (!userId || !secret || !newPassword) {
      return NextResponse.json(
        { message: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    const result = await authService.resetPassword(userId, secret, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { 
          message: result.message, 
          errors: result.errors 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: result.message 
    });
  } catch (error) {
    console.error('Password reset failed:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}