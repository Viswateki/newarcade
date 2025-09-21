import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/authService';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

export async function GET(request: NextRequest) {
  try {
    // Get current user from our custom auth system
    const currentUser = await authService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        message: 'No active session'
      });
    }

    // Fetch fresh user data from database
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!;
    
    const userResponse = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal('userId', currentUser.id)]
    );

    if (userResponse.documents.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User not found in database'
      });
    }

    const userDoc = userResponse.documents[0];
    
    // Parse social links
    let socialLinks: any = {};
    try {
      if (userDoc.social_links) {
        socialLinks = typeof userDoc.social_links === 'string' 
          ? JSON.parse(userDoc.social_links) 
          : userDoc.social_links;
      }
    } catch (e) {
      console.log('⚠️ Could not parse social links:', e);
      socialLinks = {};
    }

    // Create fresh user object
    const freshUser = {
      id: userDoc.userId,
      email: userDoc.email,
      name: userDoc.name,
      username: userDoc.username,
      type: userDoc.type,
      arcadeCoins: userDoc.arcadeCoins,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      linkedinProfile: socialLinks.linkedin,
      githubProfile: socialLinks.github,
      social_links: userDoc.social_links,
      image: userDoc.image,
      isEmailVerified: userDoc.isEmailVerified,
      usernameLastUpdatedAt: userDoc.usernameLastUpdatedAt,
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: freshUser
    });

  } catch (error: any) {
    console.error('Get user data error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get user data',
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}