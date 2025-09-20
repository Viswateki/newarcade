// Manual fix for the two tools with file IDs

const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    bucketId: '68cbde6800235bbba199',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function manualFix() {
    try {
        console.log('🔧 Manual fix for Cluad and Ideogram...');
        
        // Get all tools first to find the IDs
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
        
        // Find Cluad and Ideogram
        const cluad = result.documents.find(tool => tool.name === 'Cluad');
        const ideogram = result.documents.find(tool => tool.name === 'Ideogram');
        
        if (cluad) {
            console.log(`\n📝 Fixing Cluad (${cluad.$id}):`);
            console.log(`   Current imageUrl: ${cluad.imageUrl}`);
            
            const newUrl = `${config.endpoint}/storage/buckets/${config.bucketId}/files/68ce833800375bce7df0/view?project=${config.projectId}`;
            console.log(`   New imageUrl: ${newUrl}`);
            
            const updateUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents/${cluad.$id}`;
            
            const updateResponse = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'X-Appwrite-Project': config.projectId,
                    'X-Appwrite-Key': config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageUrl: newUrl
                })
            });
            
            if (updateResponse.ok) {
                console.log(`   ✅ Updated!`);
            } else {
                const errorText = await updateResponse.text();
                console.log(`   ❌ Failed to update: ${updateResponse.status} - ${errorText}`);
            }
        }
        
        if (ideogram) {
            console.log(`\n📝 Fixing Ideogram (${ideogram.$id}):`);
            console.log(`   Current imageUrl: ${ideogram.imageUrl}`);
            
            const newUrl = `${config.endpoint}/storage/buckets/${config.bucketId}/files/68ce834000234175f8e8/view?project=${config.projectId}`;
            console.log(`   New imageUrl: ${newUrl}`);
            
            const updateUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents/${ideogram.$id}`;
            
            const updateResponse = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'X-Appwrite-Project': config.projectId,
                    'X-Appwrite-Key': config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageUrl: newUrl
                })
            });
            
            if (updateResponse.ok) {
                console.log(`   ✅ Updated!`);
            } else {
                const errorText = await updateResponse.text();
                console.log(`   ❌ Failed to update: ${updateResponse.status} - ${errorText}`);
            }
        }
        
        console.log('\n🎯 Manual fix completed!');
        
    } catch (error) {
        console.error('Error in manual fix:', error);
    }
}

manualFix();