// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { Client, Databases, ID } = require('node-appwrite');

// Appwrite config
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const TOOLS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID;

async function testNewCategoriesSystem() {
    try {
        console.log('🧪 Testing new categories system...');
        
        // Create a test tool with new categories format
        const testTool = {
            name: 'Test Multi-Category Tool',
            description: 'A test tool for image generation and writing assistance that helps with productivity',
            link: 'https://example.com',
            user_id: 'test-user',
            status: 'pending',
            privacy: 'public',
            categories: JSON.stringify(['Image generation bots', 'Writing bots', 'Productivity bots']),
            logoBackgroundColor: '#FF6B6B',
            fallbackIcon: 'Tools',
            pricing: 'freemium',
            tags: JSON.stringify(['ai', 'image', 'writing', 'productivity'])
        };
        
        console.log('📝 Creating test tool...');
        const response = await databases.createDocument(
            DATABASE_ID,
            TOOLS_COLLECTION_ID,
            ID.unique(),
            testTool
        );
        
        console.log(`✅ Test tool created with ID: ${response.$id}`);
        console.log('🔍 Tool data:');
        console.log(`  - Name: ${response.name}`);
        console.log(`  - Categories: ${response.categories}`);
        console.log(`  - Logo BG Color: ${response.logoBackgroundColor}`);
        console.log(`  - Fallback Icon: ${response.fallbackIcon}`);
        console.log(`  - Privacy: ${response.privacy}`);
        console.log(`  - Tags: ${response.tags}`);
        
        // Parse and verify categories
        const categories = JSON.parse(response.categories);
        console.log(`✅ Parsed categories: ${categories.join(', ')}`);
        
        // Clean up - delete the test tool
        console.log('🧹 Cleaning up test tool...');
        await databases.deleteDocument(DATABASE_ID, TOOLS_COLLECTION_ID, response.$id);
        console.log('✅ Test tool deleted successfully');
        
        console.log('\n🎉 New categories system test completed successfully!');
        console.log('✅ All new fields are working:');
        console.log('  - ✅ categories (JSON array)');
        console.log('  - ✅ logoBackgroundColor');
        console.log('  - ✅ fallbackIcon');
        console.log('  - ✅ privacy');
        console.log('  - ✅ tags (JSON array)');
        
    } catch (error) {
        console.error('❌ Error testing new categories system:', error);
    }
}

testNewCategoriesSystem();