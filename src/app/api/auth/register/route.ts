import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Registration API received body:', body);
    
    const { email, password, username, linkedinProfile, githubProfile, resendOnly } = body as {
      email: string;
      password?: string;
      username?: string;
      linkedinProfile?: string;
      githubProfile?: string;
      resendOnly?: boolean;
    };

    // Handle resend verification code
    if (resendOnly && email) {
      console.log('📧 Resending verification code for:', email);
      
      try {
        const resendResult = await authService.resendVerificationCode(email);
        
        if (resendResult.success && resendResult.verificationCode) {
          // Send verification email using internal API call
          try {
            const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const emailResponse = await fetch(`${baseUrl}/api/auth/send-email-verification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                code: resendResult.verificationCode,
                name: resendResult.userName || 'User',
                type: 'registration'
              })
            });
            
            const emailResult = await emailResponse.json();
            
            if (emailResult.success) {
              console.log('✅ Verification code resent and email sent successfully');
              return NextResponse.json({
                success: true,
                message: 'Verification code sent! Please check your email.',
                requiresVerification: true
              });
            } else {
              console.error('❌ Failed to send verification email:', emailResult.message);
              return NextResponse.json(
                { success: false, message: 'Failed to send verification email' },
                { status: 500 }
              );
            }
          } catch (emailError) {
            console.error('❌ Failed to send verification email:', emailError);
            return NextResponse.json(
              { success: false, message: 'Failed to send verification email' },
              { status: 500 }
            );
          }
        } else {
          console.log('❌ Failed to resend verification code:', resendResult.message);
          return NextResponse.json(
            { success: false, message: resendResult.message },
            { status: 400 }
          );
        }
      } catch (resendError) {
        console.error('❌ Resend verification code error:', resendError);
        return NextResponse.json(
          { success: false, message: 'Failed to resend verification code' },
          { status: 500 }
        );
      }
    }

    // Validate required fields for new registration
    if (!email || !password || !username) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('✅ Calling authService.register with:', {
      email,
      username,
      linkedinProfile: linkedinProfile || '',
      githubProfile: githubProfile || ''
    });
    
    let result;
    try {
      result = await authService.register({ 
        email, 
        password, 
        username, 
        linkedinProfile: linkedinProfile || '', 
        githubProfile: githubProfile || ''
      });
      console.log('📊 AuthService result:', result);
    } catch (authError) {
      console.error('❌ AuthService error:', authError);
      return NextResponse.json(
        { success: false, message: 'Registration failed: ' + (authError as Error).message },
        { status: 500 }
      );
    }
    
    if (!result.success) {
      console.log('❌ Registration failed:', result.message);
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.message.includes('already exists') || result.message.includes('already taken') ? 409 : 400 }
      );
    }

    // Send verification email if registration was successful and requires verification
    if (result.requiresVerification && result.verificationCode) {
      console.log('📧 Sending verification email for registration...');
      console.log('📧 Email details:', { email, code: result.verificationCode, name: username });
      try {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const emailResponse = await fetch(`${baseUrl}/api/auth/send-email-verification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code: result.verificationCode,
            name: result.userName || username, // Use userName from result or fallback to username
            type: 'registration'
          })
        });
        
        console.log('📧 Email API response status:', emailResponse.status);
        const emailResult = await emailResponse.json();
        console.log('📧 Email API response:', emailResult);
        
        if (emailResult.success) {
          console.log('✅ Registration and verification email sent successfully');
        } else {
          console.error('❌ Registration successful but failed to send verification email:', emailResult.message);
          // Don't fail the registration, just log the email error
        }
      } catch (emailError) {
        console.error('❌ Registration successful but failed to send verification email:', emailError);
        // Still return success since user was created
      }
    }

    console.log('✅ Registration completed');
    return NextResponse.json({
      success: true,
      message: result.message,
      requiresVerification: result.requiresVerification,
      user: result.user
    });
  } catch (error) {
    console.error('📢 API Registration error:', error);
    console.error('📢 Error type:', typeof error);
    console.error('📢 Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('📢 Error message:', error instanceof Error ? error.message : String(error));
    console.error('📢 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, message: 'Failed to register user: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}