import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/authService';
import { emailService } from '@/lib/emailService';

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
          // Send verification email using direct emailService call
          try {
            await emailService.sendVerificationCode(
              email, 
              resendResult.verificationCode, 
              resendResult.userName || 'User'
            );
            
            console.log('✅ Verification code resent and email sent successfully');
            return NextResponse.json({
              success: true,
              message: 'Verification code sent! Please check your email.',
              requiresVerification: true
            });
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
        // Use emailService directly instead of making HTTP request
        await emailService.sendVerificationCode(
          email, 
          result.verificationCode, 
          result.userName || username
        );
        
        console.log('✅ Registration and verification email sent successfully');
      } catch (emailError) {
        console.error('❌ Registration successful but failed to send verification email:', emailError);
        console.error('❌ Email error details:', {
          name: emailError instanceof Error ? emailError.name : 'Unknown',
          message: emailError instanceof Error ? emailError.message : String(emailError),
          stack: emailError instanceof Error ? emailError.stack : 'No stack trace'
        });
        // Still return success since user was created
      }
    }

    console.log('✅ Registration completed');
    
    // Always return success and indicate that email should be checked
    const responseMessage = result.requiresVerification 
      ? 'Registration successful! A verification code has been sent to your email. Please check your inbox (and spam folder).'
      : result.message;
    
    return NextResponse.json({
      success: true,
      message: responseMessage,
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