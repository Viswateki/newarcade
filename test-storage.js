// Test script to verify storage bucket access
const { Client, Storage } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);
const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID;

async function testStorageAccess() {
    try {
        console.log('🔧 Testing storage bucket access...');
        console.log('📍 Bucket ID:', STORAGE_BUCKET_ID);
        console.log('📍 Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
        console.log('📍 Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
        console.log('📍 API Key starts with:', process.env.APPWRITE_API_KEY.substring(0, 20) + '...');
        
        // First, try to list all buckets to see what's available
        console.log('📋 Listing all buckets...');
        const buckets = await storage.listBuckets();
        console.log('✅ Found buckets:', buckets.total);
        
        buckets.buckets.forEach(bucket => {
            console.log(`  📦 ${bucket.name} (ID: ${bucket.$id})`);
            console.log(`     - Enabled: ${bucket.enabled}`);
            console.log(`     - Max file size: ${bucket.maximumFileSize} bytes`);
            console.log(`     - File security: ${bucket.fileSecurity}`);
        });
        
        // Try to get the specific bucket
        if (buckets.buckets.find(b => b.$id === STORAGE_BUCKET_ID)) {
            console.log('\n🎯 Testing specific bucket...');
            const bucket = await storage.getBucket(STORAGE_BUCKET_ID);
            console.log('✅ Target bucket details:', {
                id: bucket.$id,
                name: bucket.name,
                enabled: bucket.enabled,
                maximumFileSize: bucket.maximumFileSize,
                allowedFileExtensions: bucket.allowedFileExtensions,
                fileSecurity: bucket.fileSecurity
            });
            
            // Try to list files
            const files = await storage.listFiles(STORAGE_BUCKET_ID);
            console.log('📁 Files in bucket:', files.total);
        } else {
            console.log('❌ Target bucket not found in available buckets!');
        }
        
    } catch (error) {
        console.error('❌ Storage test failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Error type:', error.type);
    }
}

testStorageAccess();