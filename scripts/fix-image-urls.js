const { Client, Databases, Storage } = require('node-appwrite');

// Configuration
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68a2fa360035825e2e75');

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = '68af079a00202900545c';
const COLLECTION_ID = '68cab773001d9f5d442c';
const BUCKET_ID = '68cbde6800235bbba199';

async function fixImageUrls() {
  try {
    // Get all tools
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    console.log(`Found ${result.documents.length} tools`);
    
    console.log('\n🔧 FIXING IMAGE URLs:');
    console.log('Looking for tools with file IDs that need full URLs...\n');
    
    let fixedCount = 0;
    
    for (const tool of result.documents) {
      const imageUrl = tool.imageUrl;
      
      // Check if it's a file ID (24 characters, alphanumeric)
      if (imageUrl && imageUrl.length === 24 && /^[a-zA-Z0-9]+$/.test(imageUrl)) {
        console.log(`📝 ${tool.name}:`);
        console.log(`   Current imageUrl: ${imageUrl}`);
        
        const properUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${imageUrl}/view?project=68a2fa360035825e2e75`;
        console.log(`   New imageUrl: ${properUrl}`);
        
        // Update the tool
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          tool.$id,
          { imageUrl: properUrl }
        );
        
        console.log(`   ✅ Updated!`);
        fixedCount++;
      }
    }
    
    console.log(`\n🎯 SUMMARY:`);
    console.log(`Fixed ${fixedCount} tool logos with proper Appwrite URLs`);
    
    if (fixedCount > 0) {
      console.log('\n✨ All tools with file IDs have been updated with full Appwrite URLs!');
      console.log('The logos should now display correctly on your website.');
    } else {
      console.log('\n💡 No file IDs found that need fixing.');
      console.log('All tools are either using data URLs or already have proper URLs.');
    }
    
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  }
}

fixImageUrls();