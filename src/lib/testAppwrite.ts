/**
 * Appwrite Connection and Collection Test
 * Add this to your API route or run in browser console to test Appwrite connection
 */

import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

export async function testAppwriteConnection() {
  console.log('🧪 Testing Appwrite Connection...');
  
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!;
  
  console.log('📋 Environment Variables:');
  console.log('- Database ID:', databaseId);
  console.log('- Collection ID:', userCollectionId);
  
  try {
    // Test 1: List databases
    console.log('\n📂 Step 1: Testing database access...');
    // This might not work without proper permissions, but let's try
    
    // Test 2: List documents in the collection (should work if collection exists)
    console.log('\n📄 Step 2: Testing collection access...');
    const documents = await databases.listDocuments(databaseId, userCollectionId);
    console.log('✅ Collection accessible. Document count:', documents.total);
    
    // Test 3: Try to create a minimal test document
    console.log('\n🔬 Step 3: Testing document creation...');
    const testDoc = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        userId: 'test_' + Date.now(),
        username: 'test_user',
        name: 'Test User',
        email: 'test@example.com',
        type: 'user'
      }
    );
    
    console.log('✅ Test document created successfully:', testDoc.$id);
    
    // Clean up test document
    await databases.deleteDocument(databaseId, userCollectionId, testDoc.$id);
    console.log('🗑️ Test document cleaned up');
    
    return { success: true, message: 'All tests passed!' };
    
  } catch (error) {
    console.error('❌ Appwrite test failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { success: false, error };
  }
}

// For browser console use
if (typeof window !== 'undefined') {
  (window as any).testAppwriteConnection = testAppwriteConnection;
}