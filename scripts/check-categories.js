// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { Client, Databases } = require('node-appwrite');

// Appwrite config
const client = new Client();

console.log('🔧 Environment variables:');
console.log(`Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ? 'Set' : 'Missing'}`);
console.log(`Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? 'Set' : 'Missing'}`);

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const TOOLS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID;

async function checkToolsCategories() {
    try {
        console.log('🔍 Checking tools with categories field...');
        
        // Get all tools
        const response = await databases.listDocuments(DATABASE_ID, TOOLS_COLLECTION_ID);
        const tools = response.documents;
        
        console.log(`📊 Total tools: ${tools.length}`);
        
        // Check for tools with categories vs category
        const toolsWithCategories = tools.filter(tool => tool.categories && tool.categories !== null);
        const toolsWithCategory = tools.filter(tool => tool.category && tool.category !== null);
        const toolsWithBoth = tools.filter(tool => tool.categories && tool.category && tool.categories !== null && tool.category !== null);
        
        console.log(`📋 Tools with 'categories' field: ${toolsWithCategories.length}`);
        console.log(`📋 Tools with 'category' field: ${toolsWithCategory.length}`);
        console.log(`📋 Tools with both fields: ${toolsWithBoth.length}`);
        
        // Show a few sample tools and their fields
        console.log('\n🔍 Sample tool data:');
        tools.slice(0, 3).forEach(tool => {
            console.log(`\n📝 ${tool.name}:`);
            console.log(`  - description: "${tool.description.substring(0, 100)}..."`);
            console.log(`  - category: ${tool.category}`);
            console.log(`  - categories: ${tool.categories}`);
            console.log(`  - tags: ${tool.tags}`);
            console.log(`  - featured: ${tool.featured}`);
        });
        
        // Show samples
        if (toolsWithCategories.length > 0) {
            console.log('\n✅ Sample tools with categories:');
            toolsWithCategories.slice(0, 3).forEach(tool => {
                console.log(`- ${tool.name}: categories = ${tool.categories}, category = ${tool.category}`);
            });
        }
        
        if (toolsWithCategory.length > 0) {
            console.log('\n📝 Sample tools with category only:');
            toolsWithCategory.slice(0, 3).forEach(tool => {
                console.log(`- ${tool.name}: category = ${tool.category}, categories = ${tool.categories}`);
            });
        }
        
        // Test JSON parsing
        if (toolsWithCategories.length > 0) {
            console.log('\n🧪 Testing JSON parsing of categories...');
            toolsWithCategories.slice(0, 2).forEach(tool => {
                try {
                    const parsed = JSON.parse(tool.categories);
                    console.log(`✅ ${tool.name}: parsed categories = ${JSON.stringify(parsed)}`);
                } catch (e) {
                    console.log(`❌ ${tool.name}: failed to parse categories = ${tool.categories}`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking tools categories:', error);
    }
}

checkToolsCategories();