const { Client, Databases } = require('node-appwrite');

// Read environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY || 'standard_c05c5fb7fdbdea8b36b16ad3ecdcd5adacb4c04c6c7c0b0b8f3bcd5c46b9a7a4b8067f2b33e2f7c2c2b7e1b6c2f8d9e6c5a3b2f8c7d1e5b8c3f6a1d2e7b9c4f5a8d3c9f6a7b1e4c8f2d5b7a9c3f8e6b2d1a4c7f8');

const databases = new Databases(client);

async function debugToolData() {
  try {
    console.log('Fetching recent tools to check fallback data...');
    
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID,
      [],
      10
    );
    
    console.log(`Found ${response.documents.length} tools:`);
    console.log('=====================================');
    
    response.documents.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   ID: ${tool.$id}`);
      console.log(`   logoBackgroundColor: ${tool.logoBackgroundColor || 'NOT SET'}`);
      console.log(`   fallbackIcon: ${tool.fallbackIcon || 'NOT SET'}`);
      console.log(`   logo: ${tool.logo || 'NOT SET'}`);
      console.log(`   imageurl: ${tool.imageurl || 'NOT SET'}`);
      console.log(`   toolImage: ${tool.toolImage || 'NOT SET'}`);
      console.log(`   computedImageUrl: ${tool.computedImageUrl || 'NOT SET'}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('Error fetching tools:', error);
  }
}

debugToolData();