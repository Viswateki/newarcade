// Database diagnosis script to check current tools schema and data
require('dotenv').config({ path: '.env.local' });
const { Client, Databases, Query } = require('appwrite');

console.log('🔧 Loading environment variables...');
console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ? 'Set ✅' : 'Missing ❌');
console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? 'Set ✅' : 'Missing ❌');
console.log('Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ? 'Set ✅' : 'Missing ❌');
console.log('Tools Collection ID:', process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID ? 'Set ✅' : 'Missing ❌');

// Initialize Appwrite
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const TOOLS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TOOLS_COLLECTION_ID;

async function diagnoseDatabaseState() {
    console.log('🔍 Diagnosing Tools Database State...\n');
    
    try {
        // Fetch a few sample tools to see what fields exist
        const response = await databases.listDocuments(
            DATABASE_ID,
            TOOLS_COLLECTION_ID,
            [
                Query.limit(5) // Get first 5 tools as samples
            ]
        );
        
        console.log(`📊 Total tools in database: ${response.total}`);
        console.log(`📝 Sample tools (first 5):\n`);
        
        response.documents.forEach((tool, index) => {
            console.log(`--- Tool ${index + 1}: ${tool.name || 'Unnamed'} ---`);
            console.log('Available fields:');
            Object.keys(tool).forEach(key => {
                const value = tool[key];
                if (key.includes('image') || key.includes('url') || key.includes('logo') || key.includes('link')) {
                    console.log(`  🖼️  ${key}: ${value ? (typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value) : 'null/empty'}`);
                } else if (key === 'name' || key === 'description' || key === 'category') {
                    console.log(`  📝  ${key}: ${value || 'null/empty'}`);
                } else if (key.startsWith('$')) {
                    // Skip system fields for clarity
                } else {
                    console.log(`  ℹ️   ${key}: ${value || 'null/empty'}`);
                }
            });
            console.log('');
        });
        
        // Check for missing critical fields
        console.log('🔍 Checking for missing fields...');
        const firstTool = response.documents[0];
        if (firstTool) {
            const criticalFields = ['imageUrl', 'link', 'websiteLink', 'logo', 'imageurl'];
            const missingFields = criticalFields.filter(field => !firstTool.hasOwnProperty(field));
            const presentFields = criticalFields.filter(field => firstTool.hasOwnProperty(field));
            
            console.log('✅ Present critical fields:', presentFields);
            console.log('❌ Missing critical fields:', missingFields);
        }
        
    } catch (error) {
        console.error('❌ Error diagnosing database:', error);
    }
}

// Run the diagnosis
diagnoseDatabaseState().then(() => {
    console.log('\n✅ Database diagnosis complete!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Diagnosis failed:', error);
    process.exit(1);
});