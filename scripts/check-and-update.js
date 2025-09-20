// Check tool structure and update properly

const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    bucketId: '68cbde6800235bbba199',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function checkAndUpdate() {
    try {
        console.log('🔧 Checking tool structure and updating...');
        
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
            console.log(`\n📝 Cluad structure:`, JSON.stringify(cluad, null, 2));
            
            // Update with existing structure
            const updateData = {
                name: cluad.name,
                description: cluad.description,
                link: cluad.link,
                icon: cluad.icon,
                imageUrl: `${config.endpoint}/storage/buckets/${config.bucketId}/files/68ce833800375bce7df0/view?project=${config.projectId}`,
                category: cluad.category,
                subcategory: cluad.subcategory,
                tags: cluad.tags,
                price: cluad.price
            };
            
            console.log(`\n📝 Updating Cluad with:`, updateData);
            
            const updateUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents/${cluad.$id}`;
            
            const updateResponse = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'X-Appwrite-Project': config.projectId,
                    'X-Appwrite-Key': config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            if (updateResponse.ok) {
                console.log(`   ✅ Cluad updated!`);
            } else {
                const errorText = await updateResponse.text();
                console.log(`   ❌ Failed to update Cluad: ${updateResponse.status} - ${errorText}`);
            }
        }
        
        if (ideogram) {
            console.log(`\n📝 Ideogram structure:`, JSON.stringify(ideogram, null, 2));
            
            // Update with existing structure
            const updateData = {
                name: ideogram.name,
                description: ideogram.description,
                link: ideogram.link,
                icon: ideogram.icon,
                imageUrl: `${config.endpoint}/storage/buckets/${config.bucketId}/files/68ce834000234175f8e8/view?project=${config.projectId}`,
                category: ideogram.category,
                subcategory: ideogram.subcategory,
                tags: ideogram.tags,
                price: ideogram.price
            };
            
            console.log(`\n📝 Updating Ideogram with:`, updateData);
            
            const updateUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents/${ideogram.$id}`;
            
            const updateResponse = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'X-Appwrite-Project': config.projectId,
                    'X-Appwrite-Key': config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            if (updateResponse.ok) {
                console.log(`   ✅ Ideogram updated!`);
            } else {
                const errorText = await updateResponse.text();
                console.log(`   ❌ Failed to update Ideogram: ${updateResponse.status} - ${errorText}`);
            }
        }
        
        console.log('\n🎯 Check and update completed!');
        
    } catch (error) {
        console.error('Error in check and update:', error);
    }
}

checkAndUpdate();