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

async function testToolSubmissionWithoutCategory() {
    try {
        console.log('🧪 Testing tool submission without legacy category field...\n');
        
        // Create a test tool WITHOUT the category field
        const testTool = {
            name: 'Test Tool - No Category Field',
            description: 'A test tool to verify that submissions work without the legacy category field',
            link: 'https://example.com',
            user_id: 'test-user',
            status: 'pending',
            privacy: 'public',
            categories: JSON.stringify(['Chat bots', 'Productivity bots']), // Only the new field
            logoBackgroundColor: '#10B981',
            fallbackIcon: 'MessageCircle',
            pricing: 'free',
            imageUrl: '', // No image for this test
            views: 0,
            rating: 0,
            featured: false
        };
        
        console.log('📝 Creating test tool with data:');
        console.log('  - Name:', testTool.name);
        console.log('  - Categories:', testTool.categories);
        console.log('  - Logo BG:', testTool.logoBackgroundColor);
        console.log('  - Icon:', testTool.fallbackIcon);
        console.log('  - Privacy:', testTool.privacy);
        console.log('  - ❌ NO category field (should work now)');
        
        const response = await databases.createDocument(
            DATABASE_ID,
            TOOLS_COLLECTION_ID,
            ID.unique(),
            testTool
        );
        
        console.log(`\n✅ SUCCESS! Tool created with ID: ${response.$id}`);
        console.log('🎉 Tool submission works without legacy category field!');
        
        // Verify the data was stored correctly
        console.log('\n🔍 Stored data verification:');
        console.log(`  - Name: ${response.name}`);
        console.log(`  - Categories: ${response.categories}`);
        console.log(`  - Logo BG: ${response.logoBackgroundColor}`);
        console.log(`  - Fallback Icon: ${response.fallbackIcon}`);
        console.log(`  - Privacy: ${response.privacy}`);
        
        // Parse and display categories
        const categories = JSON.parse(response.categories);
        console.log(`  - Parsed Categories: ${categories.join(', ')}`);
        
        // Clean up - delete the test tool
        console.log('\n🧹 Cleaning up test tool...');
        await databases.deleteDocument(DATABASE_ID, TOOLS_COLLECTION_ID, response.$id);
        console.log('✅ Test tool deleted successfully');
        
        console.log('\n🎯 RESULT: Tool submission fixed!');
        console.log('✅ No more "Unknown attribute: category" error');
        console.log('✅ Database schema matches submission data');
        console.log('✅ Ready for real tool submissions');
        
    } catch (error) {
        console.error('❌ Error testing tool submission:', error);
        
        if (error.message && error.message.includes('Unknown attribute')) {
            console.log('\n💡 Still getting attribute error. Check:');
            console.log('  1. Verify which fields are being sent');
            console.log('  2. Check database schema in Appwrite Console');
            console.log('  3. Ensure no legacy fields are being included');
        }
    }
}

testToolSubmissionWithoutCategory();