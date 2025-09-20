// Test script to verify image loading from Appwrite storage bucket
// This script will help you see what images are uploaded and match them with tools

console.log('🔍 Testing Image Loading Setup...');

// Manual configuration (replace with your actual values)
const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    toolsStorageBucketId: '68cbde6800235bbba199',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function testWithFetch() {
    try {
        console.log('\n� Checking tools storage bucket...');
        console.log('Storage Bucket ID:', config.toolsStorageBucketId);
        
        // Test storage bucket access
        const storageUrl = `${config.endpoint}/storage/buckets/${config.toolsStorageBucketId}/files`;
        
        const storageResponse = await fetch(storageUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });
        
        if (storageResponse.ok) {
            const storageData = await storageResponse.json();
            console.log(`✅ Found ${storageData.files.length} files in storage bucket:`);
            
            storageData.files.forEach((file, index) => {
                console.log(`${index + 1}. ${file.name} (ID: ${file.$id})`);
                console.log(`   Type: ${file.mimeType}`);
                console.log(`   View URL: ${config.endpoint}/storage/buckets/${config.toolsStorageBucketId}/files/${file.$id}/view?project=${config.projectId}`);
                console.log('');
            });
            
            // Generate update commands
            console.log('\n🔧 To update your tools with these images, run these commands in your database:');
            console.log('Example SQL-like updates (adapt for your database interface):');
            console.log('');
            
            storageData.files.forEach((file) => {
                const toolName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
                console.log(`UPDATE tools SET logo = '${file.$id}' WHERE name ILIKE '%${toolName}%';`);
            });
            
        } else {
            console.log('❌ Failed to access storage bucket:', storageResponse.status, storageResponse.statusText);
        }
        
        // Test database access
        console.log('\n�️ Checking tools database...');
        const dbUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents`;
        
        const dbResponse = await fetch(dbUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });
        
        if (dbResponse.ok) {
            const dbData = await dbResponse.json();
            console.log(`✅ Found ${dbData.documents.length} tools in database`);
            
            console.log('\n📝 Current tool logo fields:');
            dbData.documents.slice(0, 10).forEach((tool, index) => {
                console.log(`${index + 1}. ${tool.name}:`);
                console.log(`   logo: ${tool.logo || 'EMPTY'}`);
                console.log(`   imageurl: ${tool.imageurl || 'EMPTY'}`);
                console.log(`   toolImage: ${tool.toolImage || 'EMPTY'}`);
                console.log('');
            });
            
        } else {
            console.log('❌ Failed to access database:', dbResponse.status, dbResponse.statusText);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testWithFetch();