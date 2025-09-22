import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    const { userId, newName, newUsername } = await request.json();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!;
    
    // Find the user document
    const userResponse = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal('userId', userId)]
    );

    if (userResponse.documents.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const userDoc = userResponse.documents[0];
    
    // Prepare update data
    const updateData: any = {};
    if (newName) updateData.name = newName;
    if (newUsername) updateData.username = newUsername;
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No update data provided'
      }, { status: 400 });
    }

    // Update the user document
    const updatedUser = await databases.updateDocument(
      databaseId,
      userCollectionId,
      userDoc.$id,
      updateData
    );

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      oldData: {
        name: userDoc.name,
        username: userDoc.username
      },
      newData: {
        name: updatedUser.name,
        username: updatedUser.username
      }
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update user',
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}