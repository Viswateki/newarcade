// Fix file IDs to full Appwrite URLs

const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    bucketId: '68cbde6800235bbba199',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function fixImageUrls() {
    try {
        console.log('🔧 Fixing image URLs...');
        
        // Get all tools
        const dbUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents`;
        
        const response = await fetch(dbUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`Found ${result.documents.length} tools`);
        
        console.log('\n🔧 FIXING IMAGE URLs:');
        console.log('Looking for tools with file IDs that need full URLs...\n');
        
        let fixedCount = 0;
        
        for (const tool of result.documents) {
            const imageUrl = tool.imageUrl;
            
            // Check if it's a file ID (20 characters, hex)
            if (imageUrl && imageUrl.length === 20 && /^[a-f0-9]+$/.test(imageUrl)) {
                console.log(`📝 ${tool.name}:`);
                console.log(`   Current imageUrl: ${imageUrl}`);
                
                const properUrl = `${config.endpoint}/storage/buckets/${config.bucketId}/files/${imageUrl}/view?project=${config.projectId}`;
                console.log(`   New imageUrl: ${properUrl}`);
                
                // Update the tool
                const updateUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents/${tool.$id}`;
                
                const updateResponse = await fetch(updateUrl, {
                    method: 'PATCH',
                    headers: {
                        'X-Appwrite-Project': config.projectId,
                        'X-Appwrite-Key': config.apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        imageUrl: properUrl
                    })
                });
                
                if (updateResponse.ok) {
                    console.log(`   ✅ Updated!`);
                    fixedCount++;
                } else {
                    console.log(`   ❌ Failed to update: ${updateResponse.status}`);
                }
            }
        }
        
        console.log(`\n🎯 SUMMARY:`);
        console.log(`Fixed ${fixedCount} tool logos with proper Appwrite URLs`);
        
        if (fixedCount > 0) {
            console.log('\n✨ All tools with file IDs have been updated with full Appwrite URLs!');
            console.log('The logos should now display correctly on your website.');
        } else {
            console.log('\n💡 No file IDs found that need fixing.');
            console.log('All tools are either using data URLs or already have proper URLs.');
        }
        
    } catch (error) {
        console.error('Error fixing image URLs:', error);
    }
}

fixImageUrls();