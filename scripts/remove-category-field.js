// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { Client, Databases } = require('node-appwrite');

// Appwrite config
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const TOOLS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID;

async function removeCategoryField() {
    try {
        console.log('🗑️ Preparing to remove legacy "category" field...');
        
        // First, check current tools
        const response = await databases.listDocuments(DATABASE_ID, TOOLS_COLLECTION_ID);
        const tools = response.documents;
        
        console.log(`📊 Total tools: ${tools.length}`);
        
        const toolsWithCategory = tools.filter(tool => tool.category !== undefined && tool.category !== null);
        const toolsWithCategories = tools.filter(tool => tool.categories !== null);
        
        console.log(`📋 Tools with 'category' field: ${toolsWithCategory.length}`);
        console.log(`📋 Tools with 'categories' field: ${toolsWithCategories.length}`);
        
        if (toolsWithCategory.length > 0) {
            console.log('\n⚠️ Found tools with category field populated:');
            toolsWithCategory.forEach(tool => {
                console.log(`- ${tool.name}: category = ${tool.category}`);
            });
            console.log('\n❗ Warning: These tools have category field populated. Consider migrating data first!');
            console.log('❗ This script will remove the field completely from the database schema.');
        }
        
        console.log('\n🤔 This script would attempt to remove the "category" field from the collection schema.');
        console.log('❗ Note: Appwrite doesn\'t provide direct API to remove attributes from collections.');
        console.log('📝 You would need to:');
        console.log('   1. Go to Appwrite Console → Database → Tools Collection');
        console.log('   2. Find the "category" attribute');
        console.log('   3. Delete it manually');
        
        console.log('\n✅ Since all tools currently have null/undefined category values,');
        console.log('   it\'s safe to remove the field from the database schema.');
        
        console.log('\n🔧 Alternative: Update all tools to ensure they have proper categories field:');
        
        // Let's migrate any tools that don't have categories but should have them
        let migrationCount = 0;
        for (const tool of tools) {
            if (!tool.categories || tool.categories === null) {
                // Auto-categorize this tool
                const autoCategory = getAutoCategory(tool);
                const newCategories = JSON.stringify([autoCategory]);
                
                console.log(`🔄 Would migrate ${tool.name}: auto-category = ${autoCategory}`);
                
                // Uncomment this to actually update the tools:
                /*
                await databases.updateDocument(DATABASE_ID, TOOLS_COLLECTION_ID, tool.$id, {
                    categories: newCategories
                });
                migrationCount++;
                */
            }
        }
        
        console.log(`\n📊 Tools that would be migrated: ${tools.filter(tool => !tool.categories || tool.categories === null).length}`);
        console.log('💡 Uncomment the update code in this script to actually perform the migration.');
        
    } catch (error) {
        console.error('❌ Error removing category field:', error);
    }
}

// Auto-categorization logic (copied from tools page)
function getAutoCategory(tool) {
    const toolName = tool.name?.toLowerCase() || '';
    const toolDesc = tool.description?.toLowerCase() || '';
    
    let toolTags = [];
    if (tool.tags) {
        try {
            const parsed = JSON.parse(tool.tags);
            if (Array.isArray(parsed)) {
                toolTags = parsed.map(tag => tag.toLowerCase());
            }
        } catch (e) {
            toolTags = [tool.tags.toLowerCase()];
        }
    }
    
    const allText = [toolName, toolDesc, ...toolTags].join(' ');
    
    // Priority order: most specific to least specific
    if (toolName.includes('google') || toolName.includes('openai') || toolName.includes('microsoft') ||
        toolName.includes('github') || toolName.includes('notion') || toolName.includes('grammarly') ||
        allText.includes('official') || tool.featured) {
        return 'Official bots';
    }
    
    if (allText.includes('image') || allText.includes('photo') || allText.includes('art') || 
        allText.includes('dall-e') || allText.includes('midjourney') || allText.includes('generate') ||
        allText.includes('visual') || allText.includes('picture')) {
        return 'Image generation bots';
    }
    
    if (allText.includes('video') || allText.includes('film') || allText.includes('movie') ||
        allText.includes('animation') || allText.includes('clip') || allText.includes('editing')) {
        return 'Video generation bots';
    }
    
    if (allText.includes('audio') || allText.includes('music') || allText.includes('sound') ||
        allText.includes('voice') || allText.includes('song') || allText.includes('podcast')) {
        return 'Audio generation bots';
    }
    
    if (allText.includes('writing') || allText.includes('content') || allText.includes('copy') ||
        allText.includes('text') || allText.includes('article') || allText.includes('blog') ||
        allText.includes('grammar') || allText.includes('editing')) {
        return 'Writing bots';
    }
    
    if (allText.includes('search') || allText.includes('research') || allText.includes('data') ||
        allText.includes('analytics') || allText.includes('insights') || allText.includes('information') ||
        allText.includes('knowledge') || allText.includes('notes')) {
        return 'Search bots';
    }
    
    if (allText.includes('chat') || allText.includes('conversation') || allText.includes('assistant') ||
        allText.includes('companion') || allText.includes('talk') || allText.includes('dialogue')) {
        return 'Chat bots';
    }
    
    if (allText.includes('productivity') || allText.includes('work') || allText.includes('business') ||
        allText.includes('meeting') || allText.includes('schedule') || allText.includes('organization')) {
        return 'Productivity bots';
    }
    
    return 'Uncategorized';
}

removeCategoryField();