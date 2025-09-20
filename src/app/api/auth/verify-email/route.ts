import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Email verification API received body:', body);
    
    const { email, code } = body as {
      email: string;
      code: string;
    };

    // Validate required fields
    if (!email || !code) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    console.log('✅ Calling authService.verifyEmailWithCode with:', { email, code });
    
    const result = await authService.verifyEmailWithCode(email, code);
    console.log('📊 AuthService result:', result);
    
    if (!result.success) {
      console.log('❌ Verification failed:', result.message);
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    console.log('✅ Email verification successful');
    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
      redirectTo: '/dashboard'
    });

  } catch (error) {
    console.error('❌ Email verification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during verification' },
      { status: 500 }
    );
  }
}