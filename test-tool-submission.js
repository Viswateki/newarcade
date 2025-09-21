// Test script to simulate a tool submission with all new fields
const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function testToolSubmission() {
    try {
        console.log('🧪 Testing tool submission with all new fields...\n');

        // Test tool data with all the new fields
        const testToolData = {
            name: `Test Tool ${Date.now()}`,
            description: 'This is a test tool to verify that all form fields are being stored correctly in the database.',
            category: 'AI Assistant',
            categories: JSON.stringify(['AI Assistant', 'Productivity', 'Writing']),
            link: 'https://example.com',
            imageUrl: '', // No image for this test
            logoBackgroundColor: '#FF6B6B',
            fallbackIcon: 'Brain',
            privacy: 'public',
            user_id: 'test-user',
            status: 'pending',
            views: 0,
            rating: 0,
            featured: false,
            pricing: 'freemium'
        };

        console.log('📝 Test data being submitted:');
        Object.entries(testToolData).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });

        // Submit test tool
        const createUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents`;
        
        const response = await fetch(createUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            },
            body: JSON.stringify({
                documentId: 'unique()',
                data: testToolData
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('\n✅ Tool submission successful!');
            console.log(`📄 Document ID: ${result.$id}`);
            
            // Verify the stored data
            console.log('\n🔍 Verifying stored data:');
            Object.entries(testToolData).forEach(([key, value]) => {
                const storedValue = result[key];
                const match = storedValue === value ? '✅' : '❌';
                console.log(`   ${match} ${key}: "${storedValue}" ${storedValue !== value ? `(expected: "${value}")` : ''}`);
            });

            // Clean up - delete the test tool
            console.log('\n🧹 Cleaning up test data...');
            const deleteUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents/${result.$id}`;
            
            const deleteResponse = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'X-Appwrite-Project': config.projectId,
                    'X-Appwrite-Key': config.apiKey
                }
            });

            if (deleteResponse.ok) {
                console.log('✅ Test data cleaned up successfully');
            } else {
                console.log('⚠️  Could not clean up test data - manual cleanup may be needed');
            }

        } else {
            const error = await response.text();
            console.log('❌ Tool submission failed:', error);
            
            // Check if it's a field validation error
            if (error.includes('attribute') || error.includes('validation')) {
                console.log('\n💡 This suggests a field validation issue. Check:');
                console.log('   - Field names match database schema');
                console.log('   - Data types are correct');
                console.log('   - Required fields are provided');
            }
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

console.log('🚀 Starting tool submission test...\n');
testToolSubmission();