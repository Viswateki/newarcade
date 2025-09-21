// Enhanced recovery script that handles required fields properly
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

// Enhanced tool data with required fields
const KNOWN_TOOL_DATA = {
    'ChatGPT': {
        category: 'AI Assistant',
        link: 'https://chat.openai.com',
        pricing: 'freemium',
        user_id: 'system'
    },
    'Gemini': {
        category: 'AI Assistant', 
        link: 'https://gemini.google.com',
        pricing: 'freemium',
        user_id: 'system'
    },
    'Copilot': {
        category: 'AI Assistant',
        link: 'https://github.com/features/copilot',
        pricing: 'paid',
        user_id: 'system'
    },
    'Preplexity': {
        category: 'AI Assistant',
        link: 'https://perplexity.ai',
        pricing: 'freemium',
        user_id: 'system'
    },
    'Midjourney': {
        category: 'Image Generation',
        link: 'https://midjourney.com',
        pricing: 'paid',
        user_id: 'system'
    },
    'Leonardo': {
        link: 'https://leonardo.ai',
        user_id: 'system'
    },
    'ElevenLabs': {
        link: 'https://elevenlabs.io',
        user_id: 'system'
    },
    'Looka': {
        link: 'https://looka.com',
        user_id: 'system'
    },
    'Jasper Ai': {
        link: 'https://jasper.ai',
        user_id: 'system'
    },
    'Deep Ai': {
        link: 'https://deepai.org',
        user_id: 'system'
    },
    'Getimg Ai': {
        link: 'https://getimg.ai',
        user_id: 'system'
    },
    'Kits Ai': {
        link: 'https://kits.ai',
        user_id: 'system'
    },
    'FlowiseAI': {
        link: 'https://flowiseai.com',
        user_id: 'system'
    },
    'Be My Eyes': {
        link: 'https://bemyeyes.com',
        user_id: 'system'
    },
    'AutoGen': {
        link: 'https://github.com/microsoft/autogen',
        user_id: 'system'
    },
    'Invideo': {
        link: 'https://invideo.io',
        user_id: 'system'
    },
    'Krea.ai': {
        link: 'https://krea.ai',
        user_id: 'system'
    },
    'Designs.AI': {
        link: 'https://designs.ai',
        user_id: 'system'
    },
    'Landbot': {
        link: 'https://landbot.io',
        user_id: 'system'
    },
    'Flow XO': {
        link: 'https://flowxo.com',
        user_id: 'system'
    }
};

async function listStorageBucketFiles() {
    console.log('📁 Checking tools storage bucket for logos...\n');
    try {
        const files = await storage.listFiles(TOOLS_STORAGE_BUCKET_ID);
        console.log(`Found ${files.files.length} files in tools storage bucket:`);
        
        files.files.forEach((file, index) => {
            console.log(`  ${index + 1}. ${file.name} (ID: ${file.$id})`);
        });
        
        return files.files;
    } catch (error) {
        console.error('❌ Error listing storage files:', error.message);
        return [];
    }
}

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

async function getRequiredFields() {
    console.log('🔍 Analyzing existing tools to understand required fields...\n');
    
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            TOOLS_COLLECTION_ID,
            [Query.limit(1)]
        );
        
        if (response.documents.length === 0) {
            console.log('No tools found in database.');
            return [];
        }
        
        const tool = response.documents[0];
        console.log('Sample tool structure:');
        Object.keys(tool).forEach(key => {
            const value = tool[key];
            console.log(`  ${key}: ${value !== null && value !== undefined ? (typeof value === 'string' && value.length > 30 ? value.substring(0, 30) + '...' : value) : 'null/empty'}`);
        });
        
        return Object.keys(tool);
    } catch (error) {
        console.error('❌ Error analyzing tools:', error);
        return [];
    }
}

async function recoverToolDataSafely(dryRun = true) {
    console.log('🔄 Starting safe tool data recovery...\n');
    
    try {
        // First, understand the structure
        await getRequiredFields();
        
        // Get all tools
        const toolsResponse = await databases.listDocuments(
            DATABASE_ID,
            TOOLS_COLLECTION_ID,
            [Query.limit(100)]
        );
        
        // Get storage files
        const storageFiles = await listStorageBucketFiles();
        console.log('\n');
        
        const updates = [];
        
        for (const tool of toolsResponse.documents) {
            const toolName = tool.name;
            const updates_for_tool = {};
            
            // Only update fields that exist and are empty/null
            const knownData = KNOWN_TOOL_DATA[toolName];
            if (knownData) {
                // Only add fields that exist in the original tool and are empty
                Object.keys(knownData).forEach(key => {
                    if (tool.hasOwnProperty(key) && (!tool[key] || tool[key].trim() === '')) {
                        updates_for_tool[key] = knownData[key];
                    }
                });
            }
            
            // Try to find matching logo in storage
            if (tool.hasOwnProperty('imageUrl') && (!tool.imageUrl || tool.imageUrl.trim() === '') && storageFiles.length > 0) {
                const matchingLogo = await findMatchingLogo(toolName, storageFiles);
                if (matchingLogo) {
                    updates_for_tool.imageUrl = generateImageUrl(matchingLogo.$id);
                    console.log(`🎯 Found logo match for "${toolName}": ${matchingLogo.name}`);
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
        
        console.log(`\n📊 Recovery Summary:`);
        console.log(`Total tools: ${toolsResponse.documents.length}`);
        console.log(`Tools needing updates: ${updates.length}`);
        
        if (updates.length > 0) {
            console.log('\n📝 Planned updates:');
            updates.forEach((update, index) => {
                console.log(`\n${index + 1}. ${update.name}:`);
                Object.entries(update.updates).forEach(([key, value]) => {
                    console.log(`   ${key}: ${value}`);
                });
            });
        }
        
        if (!dryRun && updates.length > 0) {
            console.log('\n🔄 Applying updates...');
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
                    console.log(`✅ Updated ${update.name}`);
                    successCount++;
                } catch (error) {
                    console.error(`❌ Failed to update ${update.name}:`, error.message);
                    errorCount++;
                }
            }
            
            console.log(`\n📈 Update Results:`);
            console.log(`✅ Successful updates: ${successCount}`);
            console.log(`❌ Failed updates: ${errorCount}`);
        } else if (dryRun) {
            console.log('\n⚠️  This was a DRY RUN. No changes were made.');
            console.log('To apply changes, run: node scripts/recover-tool-data-safe.js --apply');
        }
        
    } catch (error) {
        console.error('❌ Recovery failed:', error);
    }
}

// Check command line arguments
const args = process.argv.slice(2);
const applyChanges = args.includes('--apply');

recoverToolDataSafely(!applyChanges).then(() => {
    console.log('\n✅ Recovery process complete!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Recovery process failed:', error);
    process.exit(1);
});