// Load environment variables first
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Appwrite Configuration...\n');

console.log('📋 Environment Variables:');
console.log('✅ APPWRITE_ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ? 'Set' : '❌ Missing');
console.log('✅ APPWRITE_PROJECT_ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? 'Set' : '❌ Missing');
console.log('✅ DATABASE_ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ? 'Set' : '❌ Missing');
console.log('✅ TOOLS_COLLECTION_ID:', process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID ? 'Set' : '❌ Missing');

console.log('\n📁 Storage Bucket IDs:');
console.log('✅ STORAGE_BUCKET_ID:', process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID ? 'Set' : '❌ Missing');
console.log('🔍 TOOLS_STORAGE_BUCKET_ID (current var):', process.env.NEXT_PUBLIC_APPWRITE_TOOLS_STORAGE_COLLECTION_ID ? 'Set' : '❌ Missing');

console.log('\n🤔 Possible Issues:');
console.log('1. Variable name mismatch: TOOLS_STORAGE_COLLECTION_ID vs TOOLS_STORAGE_BUCKET_ID');
console.log('2. Missing tools storage bucket in Appwrite');
console.log('3. Wrong bucket permissions');

console.log('\n🔍 Let\'s check all possible storage-related env vars:');
const envVars = Object.keys(process.env).filter(key => 
  key.includes('STORAGE') || key.includes('BUCKET') || key.includes('TOOLS')
);

envVars.forEach(key => {
  if (key.startsWith('NEXT_PUBLIC_')) {
    console.log(`  ${key}: ${process.env[key] ? 'Set' : 'Missing'}`);
  }
});

console.log('\n💡 Solutions to try:');
console.log('1. Check if TOOLS_STORAGE_BUCKET_ID exists in Appwrite Console');
console.log('2. Verify bucket permissions allow file creation');
console.log('3. Check if env variable name matches what we\'re using');
console.log('4. Test with regular STORAGE_BUCKET_ID as fallback');