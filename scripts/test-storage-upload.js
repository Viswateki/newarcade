// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { Client, Storage, ID } = require('node-appwrite');

// Appwrite config
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const storage = new Storage(client);

async function testStorageUpload() {
    try {
        console.log('🧪 Testing storage upload...\n');
        
        // Test different bucket IDs
        const bucketIds = {
            'STORAGE_BUCKET_ID': process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
            'TOOLS_STORAGE_BUCKET_ID': process.env.NEXT_PUBLIC_APPWRITE_TOOLS_STORAGE_COLLECTION_ID
        };
        
        console.log('📋 Available buckets:');
        Object.entries(bucketIds).forEach(([name, id]) => {
            console.log(`  ${name}: ${id}`);
        });
        
        // Try to list buckets to see what's available
        console.log('\n🔍 Checking bucket accessibility...');
        
        for (const [name, bucketId] of Object.entries(bucketIds)) {
            if (!bucketId) {
                console.log(`❌ ${name}: Not set`);
                continue;
            }
            
            try {
                // Try to list files in the bucket (this will test permissions)
                const files = await storage.listFiles(bucketId);
                console.log(`✅ ${name} (${bucketId}): Accessible - ${files.files.length} files`);
            } catch (error) {
                console.log(`❌ ${name} (${bucketId}): Error - ${error.message}`);
                
                // Check if it's a permissions issue or bucket doesn't exist
                if (error.message.includes('not found')) {
                    console.log(`   💡 Bucket doesn't exist in Appwrite Console`);
                } else if (error.message.includes('permission')) {
                    console.log(`   💡 Permission denied - check bucket settings`);
                } else {
                    console.log(`   💡 Other error: ${error.type || 'unknown'}`);
                }
            }
        }
        
        console.log('\n🔧 Recommendations:');
        console.log('1. Use the bucket that shows as "✅ Accessible"');
        console.log('2. If no buckets are accessible, check Appwrite Console:');
        console.log('   - Go to Storage section');
        console.log('   - Verify bucket exists');
        console.log('   - Check bucket permissions (allow file creation)');
        console.log('3. Consider using STORAGE_BUCKET_ID as fallback');
        
    } catch (error) {
        console.error('❌ Error testing storage:', error);
    }
}

testStorageUpload();