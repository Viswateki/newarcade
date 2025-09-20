import { account, databases } from './appwrite';
import { Query } from 'appwrite';

/**
 * Debug script to test Appwrite connection and permissions
 * Use this in the browser console to diagnose issues
 */
export async function debugAppwrite() {
  console.log('🔍 Starting Appwrite Debug Session...');
  console.log('=' .repeat(60));
  
  const results: Record<string, any> = {};
  
  // Test 1: Check environment variables
  console.log('📋 1. Checking Environment Variables...');
  const envVars = {
    PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    USER_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
    STORAGE_BUCKET_ID: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`${status} ${key}: ${value ? `${value.substring(0, 10)}...` : 'MISSING'}`);
  });
  
  results.environment = envVars;
  
  // Test 2: Check current session
  console.log('\n🔐 2. Checking Current Session...');
  try {
    const session = await account.getSession('current');
    console.log('✅ Active session found:', {
      id: session.$id,
      provider: session.provider,
      createdAt: session.$createdAt,
      expiresAt: session.expire
    });
    results.session = { exists: true, session };
  } catch (error: any) {
    console.log('ℹ️  No active session (expected for logged out users)');
    results.session = { exists: false, error: error?.message };
  }
  
  // Test 3: Try to get account info (if logged in)
  console.log('\n👤 3. Checking Account Info...');
  try {
    const user = await account.get();
    console.log('✅ Account info retrieved:', {
      id: user.$id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerification,
      createdAt: user.$createdAt
    });
    results.account = { success: true, user };
    
    // Test 4: Check database permissions (if logged in)
    console.log('\n🗄️  4. Testing Database Permissions...');
    try {
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
      const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!;
      
      const response = await databases.listDocuments(
        databaseId,
        userCollectionId,
        [Query.equal('userId', user.$id)]
      );
      
      console.log('✅ Database query successful:', {
        total: response.total,
        documents: response.documents.length
      });
      results.database = { success: true, total: response.total };
      
    } catch (dbError: any) {
      console.log('❌ Database query failed:', dbError);
      console.log('🔧 Common fixes:');
      console.log('   - In Appwrite Console → Databases → [Your Database] → users collection → Settings → Permissions');
      console.log('   - Add: "Users" with "Read" and "Write" permissions');
      console.log('   - Or add: "Any" with "Read" permission for public access');
      results.database = { success: false, error: dbError?.message, code: dbError?.code };
    }
    
  } catch (accountError: any) {
    console.log('ℹ️  Not logged in or account access failed');
    results.account = { success: false, error: accountError?.message };
  }
  
  // Test 5: Test registration endpoint (simulate)
  console.log('\n📝 5. Testing Registration Endpoint Structure...');
  const testRegisterData = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    username: `testuser${Date.now()}`
  };
  
  console.log('📤 Would test registration with:', {
    email: testRegisterData.email,
    username: testRegisterData.username,
    password: '[HIDDEN]'
  });
  
  console.log('ℹ️  To test registration, run: testRegistration() from test-registration.js');
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Debug Summary:');
  console.log('✅ Environment:', Object.values(envVars).every(v => v) ? 'OK' : 'MISSING VARS');
  console.log('✅ Session:', results.session?.exists ? 'ACTIVE' : 'NONE');
  console.log('✅ Account:', results.account?.success ? 'OK' : 'NOT LOGGED IN');
  console.log('✅ Database:', results.database?.success ? 'OK' : (results.database ? 'PERMISSION ERROR' : 'NOT TESTED'));
  
  console.log('\n💡 Next Steps:');
  if (!results.session?.exists) {
    console.log('   1. Try registering or logging in first');
  }
  if (results.account?.success && !results.database?.success) {
    console.log('   1. Fix collection permissions in Appwrite Console');
    console.log('   2. Ensure "Users" role has "Read" and "Write" permissions');
  }
  if (results.database?.success) {
    console.log('   1. Everything looks good! Registration should work.');
  }
  
  return results;
}

// Export for browser console use
if (typeof window !== 'undefined') {
  (window as any).debugAppwrite = debugAppwrite;
  console.log('🧪 debugAppwrite() function loaded! Run debugAppwrite() to start debugging.');
}