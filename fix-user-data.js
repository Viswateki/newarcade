const { Client, Databases, Query } = require('node-appwrite');

// This script helps identify and update user data in the database
// Run this with: node fix-user-data.js

console.log('🔍 User Data Repair Script');
console.log('This script will help identify and fix hardcoded user data.\n');

async function main() {
  try {
    // Initialize the client (you'll need to set these environment variables)
    const client = new Client()
      .setEndpoint('https://fra.cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
      .setProject('677dacd3000baea5cd0a') // Replace with your project ID
      .setKey('YOUR_API_KEY'); // You'll need to set this with your API key

    const databases = new Databases(client);
    
    const databaseId = '677dacd4003ec8e76c6a'; // Replace with your database ID
    const userCollectionId = '677daf080039b66667b7'; // Replace with your user collection ID

    console.log('📡 Connecting to Appwrite...');
    console.log('Database ID:', databaseId);
    console.log('Collection ID:', userCollectionId);

    // List all users
    const response = await databases.listDocuments(databaseId, userCollectionId);
    console.log(`\n👥 Found ${response.documents.length} users:`);

    // Look for users that might have old/hardcoded data
    for (const [index, user] of response.documents.entries()) {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  Document ID: ${user.$id}`);
      console.log(`  User ID: ${user.userId}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Created: ${user.$createdAt}`);
      console.log(`  Updated: ${user.$updatedAt}`);

      // Check if this looks like your account
      const isYourAccount = user.email && user.email.toLowerCase().includes('tekiviswagnabramha') ||
                           user.name && user.name.toLowerCase().includes('viswagna') ||
                           user.username && user.username.toLowerCase().includes('viswagna');

      if (isYourAccount) {
        console.log('  ⚠️  This appears to be your account!');
        
        // Show what we'd update (but don't actually update without confirmation)
        console.log('\n  🔄 Suggested updates:');
        if (user.name === 'ViswagnaBramha23' || user.name.includes('Viswagna')) {
          console.log(`    - Name: "${user.name}" → [Please confirm the correct name]`);
        }
        if (user.username === 'ViswagnaBramha23' || user.username.includes('viswagna')) {
          console.log(`    - Username: "${user.username}" → [Please confirm the correct username]`);
        }
      }
    }

    console.log('\n✅ Analysis complete!');
    console.log('\nTo fix the data:');
    console.log('1. Update your profile through the settings page');
    console.log('2. Use the "Refresh Data" button on the dashboard');
    console.log('3. Clear browser cache and localStorage');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n🔑 You need to set up an API key in Appwrite:');
      console.log('1. Go to your Appwrite console');
      console.log('2. Navigate to Settings > API Keys');
      console.log('3. Create a new API key with Database read/write permissions');
      console.log('4. Replace YOUR_API_KEY in this script with the actual key');
    }
  }
}

main().catch(console.error);