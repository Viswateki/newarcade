const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

async function checkUserData() {
  try {
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID;

    console.log('🔍 Checking user data in database...');
    console.log('Database ID:', databaseId);
    console.log('Collection ID:', userCollectionId);

    // Get all users to find the one with the problematic data
    const response = await databases.listDocuments(
      databaseId,
      userCollectionId
    );

    console.log(`\n📊 Found ${response.documents.length} users in the database:`);
    
    response.documents.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log('  ID:', user.userId);
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  Username:', user.username);
      console.log('  Type:', user.type);
      console.log('  Arcade Coins:', user.arcadeCoins);
      console.log('  Image:', user.image || 'None');
      console.log('  Email Verified:', user.isEmailVerified);
      console.log('  Created At:', user.$createdAt);
      console.log('  Updated At:', user.$updatedAt);

      // Check if this user has the hardcoded data
      if (user.name && user.name.toLowerCase().includes('viswagna')) {
        console.log('  ⚠️  This appears to be your user account');
      }
    });

    // Also specifically look for users with "ViswagnaBramha23" pattern
    const suspiciousUsers = response.documents.filter(user => 
      user.name && (
        user.name.toLowerCase().includes('viswagna') || 
        user.username && user.username.toLowerCase().includes('viswagna')
      )
    );

    if (suspiciousUsers.length > 0) {
      console.log('\n🔍 Found users with "Viswagna" pattern:');
      suspiciousUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.username}) - ${user.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking user data:', error);
  }
}

// Check if .env file is loaded
if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  console.log('⚠️  Environment variables not loaded. Please ensure .env file is present.');
  console.log('Current working directory:', process.cwd());
} else {
  checkUserData();
}