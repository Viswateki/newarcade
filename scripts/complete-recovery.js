// Final recovery script to complete missing categories and imageUrls
require('dotenv').config({ path: '.env.local' });
const { Client, Databases, Storage, Query } = require('appwrite');

// Initialize Appwrite
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const storage = new Storage(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const TOOLS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID;
const TOOLS_STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_TOOLS_STORAGE_COLLECTION_ID;

// Complete tool data with categories
const COMPLETE_TOOL_DATA = {
    'Leonardo': {
        category: 'Image Generation',
        link: 'https://leonardo.ai',
        user_id: 'system'
    },
    'ElevenLabs': {
        category: 'Audio/Voice',
        link: 'https://elevenlabs.io',
        user_id: 'system'
    },
    'Looka': {
        category: 'Design',
        link: 'https://looka.com',
        user_id: 'system'
    },
    'Jasper Ai': {
        category: 'Content Writing',
        link: 'https://jasper.ai',
        user_id: 'system'
    },
    'Deep Ai': {
        category: 'Image Generation',
        link: 'https://deepai.org',
        user_id: 'system'
    },
    'Getimg Ai': {
        category: 'Image Generation',
        link: 'https://getimg.ai',
        user_id: 'system'
    },
    'Kits Ai': {
        category: 'Audio/Voice',
        link: 'https://kits.ai',
        user_id: 'system'
    },
    'FlowiseAI': {
        category: 'AI Automation',
        link: 'https://flowiseai.com',
        user_id: 'system'
    },
    'Be My Eyes': {
        category: 'Accessibility',
        link: 'https://bemyeyes.com',
        user_id: 'system'
    },
    'AutoGen': {
        category: 'Development',
        link: 'https://github.com/microsoft/autogen',
        user_id: 'system'
    },
    'Invideo': {
        category: 'Video Creation',
        link: 'https://invideo.io',
        user_id: 'system'
    },
    'Krea.ai': {
        category: 'Image Generation',
        link: 'https://krea.ai',
        user_id: 'system'
    },
    'Designs.AI': {
        category: 'Design',
        link: 'https://designs.ai',
        user_id: 'system'
    },
    'Landbot': {
        category: 'Chatbots',
        link: 'https://landbot.io',
        user_id: 'system'
    },
    'Flow XO': {
        category: 'Chatbots',
        link: 'https://flowxo.com',
        user_id: 'system'
    }
};

async function findMatchingLogo(toolName, storageFiles) {
    const normalizedName = toolName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const exactMatch = storageFiles.find(file => {
        const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
        const normalizedFileName = fileName.replace(/[^a-z0-9]/g, '');
        return normalizedFileName === normalizedName;
    });
    
    if (exactMatch) return exactMatch;
    
    const partialMatch = storageFiles.find(file => {
        const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
        const normalizedFileName = fileName.replace(/[^a-z0-9]/g, '');
        return normalizedFileName.includes(normalizedName) || normalizedName.includes(normalizedFileName);
    });
    
    return partialMatch;
}

function generateImageUrl(fileId) {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${TOOLS_STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
}

async function completeRecovery(dryRun = true) {
    console.log('🔄 Starting final recovery to complete missing data...\n');
    
    try {
        // Get storage files
        const files = await storage.listFiles(TOOLS_STORAGE_BUCKET_ID);
        const storageFiles = files.files;
        
        // Get all tools that need completion
        const toolsResponse = await databases.listDocuments(
            DATABASE_ID,
            TOOLS_COLLECTION_ID,
            [Query.limit(100)]
        );
        
        const updates = [];
        
        for (const tool of toolsResponse.documents) {
            const toolName = tool.name;
            const updates_for_tool = {};
            
            // Check if this tool needs completion
            const completeData = COMPLETE_TOOL_DATA[toolName];
            if (completeData) {
                // Add missing required fields
                Object.keys(completeData).forEach(key => {
                    if (tool.hasOwnProperty(key) && (!tool[key] || tool[key].trim() === '')) {
                        updates_for_tool[key] = completeData[key];
                    }
                });
                
                // Try to find matching logo
                if (tool.hasOwnProperty('imageUrl') && (!tool.imageUrl || tool.imageUrl.trim() === '')) {
                    const matchingLogo = await findMatchingLogo(toolName, storageFiles);
                    if (matchingLogo) {
                        updates_for_tool.imageUrl = generateImageUrl(matchingLogo.$id);
                        console.log(`🎯 Found logo for "${toolName}": ${matchingLogo.name}`);
                    }
                }
                
                if (Object.keys(updates_for_tool).length > 0) {
                    updates.push({
                        id: tool.$id,
                        name: toolName,
                        updates: updates_for_tool
                    });
                }
            }
        }
        
        console.log(`\n📊 Final Recovery Summary:`);
        console.log(`Tools needing completion: ${updates.length}`);
        
        if (updates.length > 0) {
            console.log('\n📝 Final planned updates:');
            updates.forEach((update, index) => {
                console.log(`\n${index + 1}. ${update.name}:`);
                Object.entries(update.updates).forEach(([key, value]) => {
                    console.log(`   ${key}: ${value.length > 60 ? value.substring(0, 60) + '...' : value}`);
                });
            });
        }
        
        if (!dryRun && updates.length > 0) {
            console.log('\n🔄 Applying final updates...');
            let successCount = 0;
            let errorCount = 0;
            
            for (const update of updates) {
                try {
                    await databases.updateDocument(
                        DATABASE_ID,
                        TOOLS_COLLECTION_ID,
                        update.id,
                        update.updates
                    );
                    console.log(`✅ Completed ${update.name}`);
                    successCount++;
                } catch (error) {
                    console.error(`❌ Failed to complete ${update.name}:`, error.message);
                    errorCount++;
                }
            }
            
            console.log(`\n📈 Final Results:`);
            console.log(`✅ Successfully completed: ${successCount}`);
            console.log(`❌ Failed: ${errorCount}`);
        } else if (dryRun) {
            console.log('\n⚠️  This was a DRY RUN. No changes were made.');
            console.log('To apply changes, run: node scripts/complete-recovery.js --apply');
        }
        
    } catch (error) {
        console.error('❌ Final recovery failed:', error);
    }
}

// Check command line arguments
const args = process.argv.slice(2);
const applyChanges = args.includes('--apply');

completeRecovery(!applyChanges).then(() => {
    console.log('\n✅ Final recovery complete!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Final recovery failed:', error);
    process.exit(1);
});