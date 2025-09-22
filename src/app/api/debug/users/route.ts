import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

export async function GET(request: NextRequest) {
  try {
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!;
    
    console.log('🔍 Debug: Fetching all users from database...');
    
    const response = await databases.listDocuments(
      databaseId,
      userCollectionId
    );

    console.log(`📊 Found ${response.documents.length} users`);
    
    const users = response.documents.map(user => ({
      id: user.userId,
      email: user.email,
      name: user.name,
      username: user.username,
      type: user.type,
      arcadeCoins: user.arcadeCoins,
      image: user.image,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.$createdAt,
      updatedAt: user.$updatedAt
    }));

    // Find any users with "viswagna" in name or username
    const suspiciousUsers = users.filter(user => 
      (user.name && user.name.toLowerCase().includes('viswagna')) ||
      (user.username && user.username.toLowerCase().includes('viswagna'))
    );

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      allUsers: users,
      suspiciousUsers,
      message: 'User data retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Debug API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve user data',
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}