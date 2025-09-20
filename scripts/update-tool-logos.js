// Script to automatically match and update tool logos
// This will match your uploaded images with tool names and update the database

console.log('🔄 Auto-updating tool logos...');

const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    toolsStorageBucketId: '68cbde6800235bbba199',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

// Manual mapping of tool names to image file IDs based on your uploads
const toolImageMap = {
    'AutoGen': '68ce833700266c117fff', // autogen.png
    'Cluad': '68ce833800375bce7df0', // claude_logo.png (assuming Cluad = Claude)
    'Design Ai': '68ce833a001a3f238f20', // designs_ai_logo.png
    'ElevenLabs': '68ce833a003a4e2ba832', // elevenlabsio_logo.png
    'Fresh-chat': '68ce833e002d0667cd51', // freshworks_inc_logo.png
    'Jasper Ai': '68ce83400003bc0965b8', // heyjasperai_logo.png
    'Invideo': '68ce83410004d875b060', // invideoio_logo.png
    'Landbot': '68ce83420032f23199e1', // landbot_io_logo.png
    'Leonardo': '68ce834300148afc8d3e', // leonardo_ai_logo.png
    'Ideogram': '68ce834000234175f8e8', // ideagram.png
    'Brandmark': '68ce8343003b0440c412', // looka_logo.png (assuming Brandmark = Looka)
    // Add more mappings as needed
};

async function updateToolLogos() {
    try {
        // Get all tools first
        const dbUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents`;
        
        const response = await fetch(dbUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log('❌ Failed to fetch tools:', response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log(`📋 Found ${data.documents.length} tools to update`);

        let updatedCount = 0;

        // Update each tool that has a mapping
        for (const tool of data.documents) {
            if (toolImageMap[tool.name]) {
                const imageId = toolImageMap[tool.name];
                
                console.log(`🔄 Updating ${tool.name} with image ID: ${imageId}`);
                
                // Update the tool document
                const updateUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents/${tool.$id}`;
                
                const updateResponse = await fetch(updateUrl, {
                    method: 'PATCH',
                    headers: {
                        'X-Appwrite-Project': config.projectId,
                        'X-Appwrite-Key': config.apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        logo: imageId
                    })
                });

                if (updateResponse.ok) {
                    console.log(`✅ Successfully updated ${tool.name}`);
                    updatedCount++;
                } else {
                    console.log(`❌ Failed to update ${tool.name}:`, updateResponse.status, updateResponse.statusText);
                }
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                console.log(`⏭️ No mapping found for ${tool.name}`);
            }
        }

        console.log(`\n🎉 Update complete! Updated ${updatedCount} tools with logos.`);
        console.log('\n🔍 To see the changes, refresh your tools page in the browser.');

    } catch (error) {
        console.error('❌ Error updating tool logos:', error.message);
    }
}

// Run the update
updateToolLogos();