// Data recovery script to populate missing imageUrl and link fields
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

// Common tool data - You can expand this based on what you know
const KNOWN_TOOL_DATA = {
    'ChatGPT': {
        category: 'AI Assistant',
        link: 'https://chat.openai.com',
        pricing: 'freemium'
    },
    'Gemini': {
        category: 'AI Assistant', 
        link: 'https://gemini.google.com',
        pricing: 'freemium'
    },
    'Copilot': {
        category: 'AI Assistant',
        link: 'https://github.com/features/copilot',
        pricing: 'paid'
    },
    'Preplexity': {
        category: 'AI Assistant',
        link: 'https://perplexity.ai',
        pricing: 'freemium'
    },
    'Midjourney': {
        category: 'Image Generation',
        link: 'https://midjourney.com',
        pricing: 'paid'
    }
    // Add more tools as needed
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
    // Normalize tool name for matching
    const normalizedName = toolName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Look for exact or partial matches
    const exactMatch = storageFiles.find(file => {
        const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, ""); // Remove extension
        const normalizedFileName = fileName.replace(/[^a-z0-9]/g, '');
        return normalizedFileName === normalizedName;
    });
    
    if (exactMatch) return exactMatch;
    
    // Look for partial matches
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

async function recoverToolData(dryRun = true) {
    console.log('🔄 Starting tool data recovery...\n');
    
    try {
        // Get all tools
        const toolsResponse = await databases.listDocuments(
            DATABASE_ID,
            TOOLS_COLLECTION_ID,
            [Query.limit(100)] // Increase if you have more than 100 tools
        );
        
        // Get storage files
        const storageFiles = await listStorageBucketFiles();
        console.log('\n');
        
        const updates = [];
        
        for (const tool of toolsResponse.documents) {
            const toolName = tool.name;
            const updates_for_tool = {};
            
            // Check if we have known data for this tool
            const knownData = KNOWN_TOOL_DATA[toolName];
            if (knownData) {
                if (!tool.category || tool.category.trim() === '') {
                    updates_for_tool.category = knownData.category;
                }
                if (!tool.link || tool.link.trim() === '') {
                    updates_for_tool.link = knownData.link;
                }
                if (!tool.pricing || tool.pricing.trim() === '') {
                    updates_for_tool.pricing = knownData.pricing;
                }
            }
            
            // Try to find matching logo in storage
            if ((!tool.imageUrl || tool.imageUrl.trim() === '') && storageFiles.length > 0) {
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
            console.log('To apply changes, run: node scripts/recover-tool-data.js --apply');
        }
        
    } catch (error) {
        console.error('❌ Recovery failed:', error);
    }
}

// Check command line arguments
const args = process.argv.slice(2);
const applyChanges = args.includes('--apply');

recoverToolData(!applyChanges).then(() => {
    console.log('\n✅ Recovery process complete!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Recovery process failed:', error);
    process.exit(1);
});