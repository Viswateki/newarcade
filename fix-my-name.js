// Run this script to fix your database record
// Usage: node fix-my-name.js

const updateUserData = async () => {
  try {
    console.log('🔄 Updating your user data...');
    
    const response = await fetch('http://localhost:3000/api/update-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '68d0524d00265a724487', // Your actual user ID from the database
        newName: 'Viswagna', // Change this to whatever you want your display name to be
        // newUsername: 'viswagna' // Uncomment and change if you want to update username too
      })
    });
    
    const result = await response.json();
    console.log('📡 Update result:', result);
    
    if (result.success) {
      console.log('✅ Successfully updated your name in the database!');
      console.log('Old name:', result.oldData.name);
      console.log('New name:', result.newData.name);
      console.log('\n🔄 Now refresh your dashboard to see the changes.');
    } else {
      console.log('❌ Failed to update:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error updating user data:', error);
  }
};

// Make sure your Next.js server is running (npm run dev) before running this script
updateUserData();