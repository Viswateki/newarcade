import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/authService';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing registration flow...');
    
    const testEmail = 'test-' + Date.now() + '@example.com';
    const testUsername = 'testuser' + Date.now();
    const testPassword = 'testpassword123';
    
    console.log('📧 Test data:', { email: testEmail, username: testUsername });
    
    // Test registration
    const result = await authService.register({
      email: testEmail,
      password: testPassword,
      username: testUsername,
      linkedinProfile: '',
      githubProfile: ''
    });
    
    console.log('📊 Registration result:', result);
    
    if (result.success && result.requiresVerification && result.verificationCode) {
      console.log('📧 Testing email sending...');
      
      try {
        // Test email sending
        await emailService.sendVerificationCode(
          testEmail,
          result.verificationCode,
          result.userName || testUsername
        );
        
        console.log('✅ Email sent successfully');
        
        return NextResponse.json({
          success: true,
          message: 'Registration test successful - email sent',
          testData: {
            email: testEmail,
            username: testUsername,
            verificationCode: result.verificationCode
          }
        });
        
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        
        return NextResponse.json({
          success: false,
          message: 'Registration successful but email failed',
          error: emailError instanceof Error ? emailError.message : String(emailError),
          testData: {
            email: testEmail,
            username: testUsername,
            verificationCode: result.verificationCode
          }
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: 'Registration failed',
        result
      });
    }
    
  } catch (error) {
    console.error('🧪 Test registration error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}