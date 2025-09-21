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

// PUT method for resending verification code
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Resend verification API received body:', body);
    
    const { email } = body as {
      email: string;
    };

    // Validate required fields
    if (!email) {
      console.log('❌ Missing email field');
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('✅ Calling authService.resendVerificationCode with:', { email });
    
    const result = await authService.resendVerificationCode(email);
    console.log('📊 AuthService resend result:', result);
    
    if (!result.success) {
      console.log('❌ Resend failed:', result.message);
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // Send verification email if code generation was successful
    if (result.verificationCode && result.userName) {
      try {
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/send-email-verification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code: result.verificationCode,
            name: result.userName,
            type: 'registration'
          })
        });
        
        const emailResult = await emailResponse.json();
        
        if (emailResult.success) {
          console.log('✅ Resend verification email sent successfully');
        } else {
          console.error('❌ Failed to send resend verification email:', emailResult.message);
          return NextResponse.json({
            success: true,
            message: 'New verification code generated, but email sending failed. Please try again.',
            showCode: result.verificationCode // Show code to user if email fails
          });
        }
      } catch (emailError) {
        console.error('❌ Failed to send resend verification email:', emailError);
        // Still return success since the code was generated
        return NextResponse.json({
          success: true,
          message: 'New verification code generated, but email sending failed. Please try again.',
          showCode: result.verificationCode // Show code to user if email fails
        });
      }
    }

    console.log('✅ Resend verification successful');
    return NextResponse.json({
      success: true,
      message: 'New verification code sent to your email'
    });

  } catch (error) {
    console.error('❌ Resend verification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during resend' },
      { status: 500 }
    );
  }
}