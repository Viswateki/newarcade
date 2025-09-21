const { Client, Databases } = require('node-appwrite');

// Read environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

async function checkToolFallbackData() {
  try {
    console.log('Fetching tools to check fallback data...');
    
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID,
      [],
      20  // Get 20 tools
    );
    
    console.log(`\nFound ${response.documents.length} tools in database:`);
    console.log('======================================================');
    
    response.documents.forEach((tool, index) => {
      console.log(`\n${index + 1}. ${tool.name}`);
      console.log(`   Created: ${tool.$createdAt}`);
      console.log(`   Logo: ${tool.logo || 'NOT SET'}`);
      console.log(`   ImageUrl: ${tool.imageUrl || 'NOT SET'}`);
      console.log(`   ImageURL (legacy): ${tool.imageurl || 'NOT SET'}`);
      console.log(`   ToolImage: ${tool.toolImage || 'NOT SET'}`);
      console.log(`   LogoBackgroundColor: ${tool.logoBackgroundColor || 'NOT SET'}`);
      console.log(`   FallbackIcon: ${tool.fallbackIcon || 'NOT SET'}`);
      console.log(`   Categories: ${tool.categories || 'NOT SET'}`);
      console.log(`   ---`);
    });
    
    // Summary
    const toolsWithLogos = response.documents.filter(tool => 
      tool.logo || tool.imageUrl || tool.imageurl || tool.toolImage
    ).length;
    
    const toolsWithFallbackIcons = response.documents.filter(tool => 
      tool.fallbackIcon && tool.fallbackIcon !== ''
    ).length;
    
    const toolsWithBackgroundColors = response.documents.filter(tool => 
      tool.logoBackgroundColor && tool.logoBackgroundColor !== ''
    ).length;
    
    console.log('\n======================================================');
    console.log('SUMMARY:');
    console.log(`Total tools: ${response.documents.length}`);
    console.log(`Tools with logos: ${toolsWithLogos}`);
    console.log(`Tools with fallback icons: ${toolsWithFallbackIcons}`);
    console.log(`Tools with background colors: ${toolsWithBackgroundColors}`);
    console.log(`Tools without any image data: ${response.documents.length - toolsWithLogos}`);
    
  } catch (error) {
    console.error('Error fetching tools:', error.message);
  }
}

checkToolFallbackData();