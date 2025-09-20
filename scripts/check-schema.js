// Script to check the actual database schema for tools collection

const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function checkDatabaseSchema() {
    try {
        console.log('🔍 Checking database schema...');
        
        // Get collection info
        const collectionUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}`;
        
        const response = await fetch(collectionUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });

        if (response.ok) {
            const collectionData = await response.json();
            console.log('\n📋 AVAILABLE FIELDS IN TOOLS COLLECTION:');
            
            collectionData.attributes.forEach((attr, index) => {
                console.log(`${index + 1}. ${attr.key} (${attr.type}) - ${attr.required ? 'Required' : 'Optional'}`);
            });
            
            console.log('\n🔍 LOOKING FOR IMAGE-RELATED FIELDS:');
            const imageFields = collectionData.attributes.filter(attr => 
                attr.key.toLowerCase().includes('image') ||
                attr.key.toLowerCase().includes('logo') ||
                attr.key.toLowerCase().includes('icon') ||
                attr.key.toLowerCase().includes('url')
            );
            
            if (imageFields.length > 0) {
                imageFields.forEach(field => {
                    console.log(`✅ Found: ${field.key} (${field.type})`);
                });
            } else {
                console.log('❌ No image-related fields found');
            }
            
        } else {
            console.log('❌ Failed to get collection schema:', response.status, response.statusText);
        }
        
        // Also get a sample document to see actual data structure
        console.log('\n📄 SAMPLE DOCUMENT STRUCTURE:');
        const documentsUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/documents?limit=1`;
        
        const docResponse = await fetch(documentsUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });
        
        if (docResponse.ok) {
            const docData = await docResponse.json();
            if (docData.documents.length > 0) {
                const sampleDoc = docData.documents[0];
                console.log('\nSample document fields:');
                Object.keys(sampleDoc).forEach(key => {
                    if (!key.startsWith('$')) {
                        console.log(`- ${key}: ${typeof sampleDoc[key]} = "${sampleDoc[key]}"`);
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking schema:', error.message);
    }
}

checkDatabaseSchema();