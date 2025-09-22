// Test script to check user collection schema
const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USER_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID;

async function checkUserCollection() {
    try {
        console.log('🔍 Checking user collection schema...');
        console.log('📍 Database ID:', DATABASE_ID);
        console.log('📍 Collection ID:', USER_COLLECTION_ID);
        
        // Get collection details
        const collection = await databases.getCollection(DATABASE_ID, USER_COLLECTION_ID);
        
        console.log('✅ Collection found:', {
            name: collection.name,
            enabled: collection.enabled,
            documentSecurity: collection.documentSecurity,
            attributesCount: collection.attributes.length
        });
        
        console.log('\n📋 Attributes:');
        collection.attributes.forEach(attr => {
            console.log(`  - ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ' (optional)'}`);
            if (attr.key === 'image') {
                console.log('    ✅ IMAGE ATTRIBUTE FOUND!');
            }
        });
        
        // Check if image attribute exists
        const hasImageAttr = collection.attributes.some(attr => attr.key === 'image');
        if (!hasImageAttr) {
            console.log('\n❌ IMAGE ATTRIBUTE IS MISSING!');
            console.log('You need to add an "image" attribute to your user collection:');
            console.log('- Type: String');
            console.log('- Required: No');
            console.log('- Array: No');
        } else {
            console.log('\n✅ Image attribute exists in collection');
        }
        
    } catch (error) {
        console.error('❌ Failed to check collection:', error.message);
        console.error('Error code:', error.code);
        console.error('Error type:', error.type);
    }
}

checkUserCollection();