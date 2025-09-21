// Script to add missing fields to the tools collection
const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    toolsCollectionId: '68cab773001d9f5d442c',
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function addMissingFields() {
    try {
        console.log('📝 Adding missing fields to tools collection...\n');

        // Fields to add
        const fieldsToAdd = [
            {
                key: 'logoBackgroundColor',
                type: 'string',
                size: 20,
                required: false,
                default: '#3B82F6',
                description: 'Background color for tool logo/fallback icon'
            },
            {
                key: 'fallbackIcon',
                type: 'string', 
                size: 50,
                required: false,
                default: 'Tool',
                description: 'Fallback icon name when no logo is uploaded'
            },
            {
                key: 'privacy',
                type: 'string',
                size: 20,
                required: false,
                default: 'public',
                description: 'Tool visibility: public or private'
            },
            {
                key: 'categories',
                type: 'string',
                size: 500,
                required: false,
                default: '[]',
                description: 'JSON array of tool categories'
            }
        ];

        for (const field of fieldsToAdd) {
            console.log(`➕ Adding field: ${field.key} (${field.type})`);
            
            const addFieldUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}/attributes/string`;
            
            const requestBody = {
                key: field.key,
                size: field.size,
                required: field.required,
                default: field.default
            };

            try {
                const response = await fetch(addFieldUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Appwrite-Project': config.projectId,
                        'X-Appwrite-Key': config.apiKey
                    },
                    body: JSON.stringify(requestBody)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log(`   ✅ Successfully added: ${field.key}`);
                } else {
                    const error = await response.text();
                    if (error.includes('already exists') || error.includes('duplicate')) {
                        console.log(`   ⚠️  Field already exists: ${field.key}`);
                    } else {
                        console.log(`   ❌ Failed to add ${field.key}:`, error);
                    }
                }
            } catch (error) {
                console.log(`   ❌ Network error adding ${field.key}:`, error.message);
            }

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n🔍 Checking updated schema...');
        await checkUpdatedSchema();

    } catch (error) {
        console.error('❌ Error adding fields:', error);
    }
}

async function checkUpdatedSchema() {
    try {
        const collectionUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.toolsCollectionId}`;
        
        const response = await fetch(collectionUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });

        if (response.ok) {
            const collectionData = await response.json();
            console.log('\n📋 UPDATED FIELDS IN TOOLS COLLECTION:');
            
            const relevantFields = collectionData.attributes.filter(attr => 
                ['logoBackgroundColor', 'fallbackIcon', 'privacy', 'categories'].includes(attr.key) ||
                attr.key.toLowerCase().includes('image') ||
                attr.key.toLowerCase().includes('logo') ||
                attr.key.toLowerCase().includes('category')
            );
            
            relevantFields.forEach((attr, index) => {
                console.log(`${index + 1}. ${attr.key} (${attr.type}) - ${attr.required ? 'Required' : 'Optional'} - Default: "${attr.default || 'none'}"`);
            });
            
            console.log(`\n📊 Total fields in collection: ${collectionData.attributes.length}`);
            
        } else {
            console.log('❌ Failed to check updated schema');
        }
    } catch (error) {
        console.error('❌ Error checking schema:', error);
    }
}

console.log('🚀 Starting database schema update...\n');
addMissingFields();