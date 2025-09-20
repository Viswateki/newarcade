// Test script to check if the updated tools are loading correctly

const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function testUpdatedTools() {
    try {
        console.log('🔍 Testing updated tools...');
        
        const dbUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents`;
        
        const response = await fetch(dbUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });

        if (!response.ok) {
            console.log('❌ Failed to fetch tools');
            return;
        }

        const data = await response.json();
        
        console.log('\n📋 CHECKING TOOLS FOR UPDATED imageUrl FIELDS:');
        
        data.documents.forEach((tool, index) => {
            console.log(`\n${index + 1}. ${tool.name}:`);
            console.log(`   imageUrl: ${tool.imageUrl ? 'UPDATED! ✅' : 'EMPTY ❌'}`);
            if (tool.imageUrl) {
                console.log(`   URL: ${tool.imageUrl}`);
                // Test if it's one of our Appwrite storage URLs
                if (tool.imageUrl.includes('68cbde6800235bbba199')) {
                    console.log(`   Status: Appwrite storage URL detected! 🎉`);
                } else {
                    console.log(`   Status: Non-storage URL (${tool.imageUrl.substring(0, 50)}...)`);
                }
            }
            console.log(`   icon: ${tool.icon || 'EMPTY'}`);
            console.log(`   link: ${tool.link || 'EMPTY'}`);
        });

        // Check if any tools have been updated
        const updatedTools = data.documents.filter(tool => 
            tool.imageUrl && tool.imageUrl.includes('68cbde6800235bbba199')
        );
        
        console.log(`\n🎯 SUMMARY:`);
        console.log(`Total tools: ${data.documents.length}`);
        console.log(`Tools with updated logos: ${updatedTools.length}`);
        
        if (updatedTools.length > 0) {
            console.log(`\n✅ SUCCESSFULLY UPDATED TOOLS:`);
            updatedTools.forEach(tool => {
                console.log(`- ${tool.name}`);
            });
            console.log(`\n🔄 These should now show actual logos instead of placeholders!`);
        } else {
            console.log(`\n❌ No tools found with Appwrite storage URLs. Please update them manually.`);
        }

    } catch (error) {
        console.error('❌ Error testing tools:', error.message);
    }
}

testUpdatedTools();