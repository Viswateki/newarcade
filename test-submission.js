// Simple test script to verify database connectivity and schema
const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');
        
        const documentsUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents?limit=1`;
        
        const response = await fetch(documentsUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });
        
        if (response.ok) {
            console.log('✅ Database connection successful');
            const data = await response.json();
            console.log(`📊 Found ${data.total} total tools in database`);
            return true;
        } else {
            console.log('❌ Database connection failed:', response.status, response.statusText);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Network error:', error.message);
        if (error.message.includes('Failed to fetch')) {
            console.log('💡 This indicates a network connectivity issue.');
            console.log('💡 Check your internet connection and try again.');
        }
        return false;
    }
}

async function testStorageBucket() {
    try {
        console.log('🔍 Testing storage bucket access...');
        
        const storageUrl = `${config.endpoint}/storage/buckets/68cbde6800235bbba199/files?limit=1`;
        
        const response = await fetch(storageUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });
        
        if (response.ok) {
            console.log('✅ Storage bucket connection successful');
            return true;
        } else {
            console.log('❌ Storage bucket connection failed:', response.status, response.statusText);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Storage network error:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting connectivity tests...\n');
    
    const dbTest = await testDatabaseConnection();
    console.log('');
    const storageTest = await testStorageBucket();
    
    console.log('\n📋 TEST RESULTS:');
    console.log(`Database: ${dbTest ? '✅ Working' : '❌ Failed'}`);
    console.log(`Storage: ${storageTest ? '✅ Working' : '❌ Failed'}`);
    
    if (dbTest && storageTest) {
        console.log('\n🎉 All services are working! You can submit tools.');
    } else {
        console.log('\n⚠️ Some services are down. Tool submission may fail.');
        console.log('💡 Check your internet connection and try again later.');
    }
}

runTests();