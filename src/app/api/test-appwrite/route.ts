import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

export async function GET(request: NextRequest) {
  console.log('🧪 Testing Appwrite Connection via API...');
  
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!;
  
  try {
    console.log('📋 Environment Check:');
    console.log('- Database ID:', databaseId ? 'SET' : 'MISSING');
    console.log('- Collection ID:', userCollectionId ? 'SET' : 'MISSING');
    console.log('- Database ID value:', databaseId);
    console.log('- Collection ID value:', userCollectionId);
    
    if (!databaseId || !userCollectionId) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        databaseId: !!databaseId,
        userCollectionId: !!userCollectionId
      }, { status: 500 });
    }
    
    // Test collection access
    console.log('📄 Testing collection access...');
    const documents = await databases.listDocuments(databaseId, userCollectionId);
    console.log('✅ Collection accessible. Document count:', documents.total);
    
    // Test minimal document creation
    console.log('🔬 Testing minimal document creation...');
    const testDoc = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        userId: 'test_api_' + Date.now(),
        username: 'test_api_user',
        name: 'Test API User',
        email: 'testapi@example.com',
        type: 'user'
      }
    );
    
    console.log('✅ Test document created:', testDoc.$id);
    
    // Clean up
    await databases.deleteDocument(databaseId, userCollectionId, testDoc.$id);
    console.log('🗑️ Test document cleaned up');
    
    return NextResponse.json({
      success: true,
      message: 'Appwrite connection test passed!',
      documentCount: documents.total,
      testDocumentId: testDoc.$id
    });
    
  } catch (error: any) {
    console.error('❌ Appwrite connection test failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      code: error.code,
      type: error.type,
      details: error
    }, { status: 500 });
  }
}