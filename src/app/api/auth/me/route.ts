import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';

export async function GET(request: NextRequest) {
  try {
    // Try to get current session
    const session = await account.getSession('current');
    
    if (session) {
      // Get user account info
      const user = await account.get();
      
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerification
        },
        session: {
          id: session.$id,
          provider: session.provider,
          createdAt: session.$createdAt
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        authenticated: false,
        message: 'No active session'
      });
    }
  } catch (error: any) {
    console.error('Session check error:', error);
    
    // If no session exists, that's expected for logged out users
    if (error?.type === 'general_unauthorized_scope') {
      return NextResponse.json({
        success: true,
        authenticated: false,
        message: 'No active session'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to check session',
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}