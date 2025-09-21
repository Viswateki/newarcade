import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/authService';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Login API received body:', { email: body.email });
    
    const { email, password } = body as {
      email: string;
      password: string;
    };

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('✅ Calling authService.login with:', { email });
    
    const result = await authService.login({ email, password });
    console.log('📊 AuthService login result:', { 
      success: result.success, 
      requiresVerification: result.requiresVerification 
    });
    
    // If login successful, return user
    if (result.success && result.user) {
      console.log('✅ Login successful');
      return NextResponse.json({
        success: true,
        message: result.message,
        user: result.user
      });
    }

    // If user exists but needs verification, send verification email
    if (result.requiresVerification && result.verificationCode && result.email && result.userName) {
      console.log('📧 Sending verification email for login attempt...');
      try {
        await emailService.sendVerificationCode(
          result.email,
          result.verificationCode,
          result.userName
        );
        console.log('✅ Verification email sent successfully');
        
        return NextResponse.json({
          success: false,
          message: result.message,
          requiresVerification: true,
          email: result.email
        });
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
        return NextResponse.json({
          success: false,
          message: 'Email not verified and failed to send verification code. Please try again.',
          requiresVerification: true,
          email: result.email,
          showCode: result.verificationCode // Show code if email fails
        });
      }
    }

    // Regular login failure
    console.log('❌ Login failed:', result.message);
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 401 }
    );

  } catch (error) {
    console.error('❌ Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during login' },
      { status: 500 }
    );
  }
}