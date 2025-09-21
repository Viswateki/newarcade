// Script to check the actual user collection schema

const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '68a2fa360035825e2e75',
    databaseId: '68af079a00202900545c',
    userCollectionId: '68cef49e001b88692192', // User collection ID from .env.local
    apiKey: 'standard_71290f5da5c01c62c6e4957c0754e76a391dc6234c91a2f074dc232b01302e64bf16bab9a7287157e922e21de714ea428d82793a8b1ab80b89d271159b7885b6bd4f8685ebe581ac34199fcb2516abe9a6f2740a16f8ae7f05d206dc9f253fa935b07cf1a48cc23072e9f44e85a2d045a3eed051713ce27e62aee1920ea20ef2'
};

async function checkUserCollectionSchema() {
    try {
        console.log('🔍 Checking USER collection schema...');
        
        // Get collection info
        const collectionUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.userCollectionId}`;
        
        const response = await fetch(collectionUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        });

        if (response.ok) {
            const collectionData = await response.json();
            console.log('\n📋 AVAILABLE FIELDS IN USER COLLECTION:');
            console.log('='.repeat(50));
            
            // Group attributes by type
            const requiredFields = [];
            const optionalFields = [];
            
            collectionData.attributes.forEach((attr) => {
                const fieldInfo = `${attr.key} (${attr.type})`;
                if (attr.required) {
                    requiredFields.push(fieldInfo);
                } else {
                    optionalFields.push(fieldInfo);
                }
            });
            
            console.log('\n✅ REQUIRED FIELDS:');
            requiredFields.forEach((field, index) => {
                console.log(`${index + 1}. ${field}`);
            });
            
            console.log('\n🔹 OPTIONAL FIELDS:');
            optionalFields.forEach((field, index) => {
                console.log(`${index + 1}. ${field}`);
            });
            
            // Check for auth-related fields specifically
            console.log('\n🔐 AUTHENTICATION-RELATED FIELDS:');
            const authFields = collectionData.attributes.filter(attr => 
                attr.key.toLowerCase().includes('password') ||
                attr.key.toLowerCase().includes('verification') ||
                attr.key.toLowerCase().includes('email') ||
                attr.key.toLowerCase().includes('failed') ||
                attr.key.toLowerCase().includes('lock') ||
                attr.key.toLowerCase().includes('hash')
            );
            
            if (authFields.length > 0) {
                authFields.forEach(field => {
                    console.log(`✅ ${field.key} (${field.type}) - ${field.required ? 'Required' : 'Optional'}`);
                });
            } else {
                console.log('❌ No auth-related fields found');
            }
            
        } else {
            console.log('❌ Failed to get collection schema:', response.status, response.statusText);
        }
        
        // Get a sample document to see actual data structure
        console.log('\n📄 SAMPLE USER DOCUMENT STRUCTURE:');
        console.log('='.repeat(50));
        const documentsUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${config.userCollectionId}/documents?limit=1`;
        
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
                console.log('\nActual document fields:');
                Object.keys(sampleDoc).forEach(key => {
                    if (!key.startsWith('$')) {
                        const value = sampleDoc[key];
                        const type = typeof value;
                        const preview = type === 'string' && value.length > 50 ? 
                            `"${value.substring(0, 50)}..."` : 
                            JSON.stringify(value);
                        console.log(`- ${key}: ${type} = ${preview}`);
                    }
                });
            } else {
                console.log('No documents found in user collection');
            }
        }
        
        console.log('\n🚀 CODE COMPARISON:');
        console.log('='.repeat(50));
        console.log('Fields used in authService.ts code:');
        const codeFields = [
            'userId', 'username', 'name', 'email', 'type', 'arcadeCoins',
            'firstName', 'lastName', 'linkedinProfile', 'githubProfile', 
            'social_links', 'image', 'isEmailVerified', 'avatar',
            'usernameLastUpdatedAt', 'passwordHash', 'failedLoginAttempts',
            'accountLockUntil', 'passwordChangedAt', 'verificationCode',
            'verificationCodeExpiry'
        ];
        
        if (response.ok) {
            const collectionData = await response.json();
            const actualFields = collectionData.attributes.map(attr => attr.key);
            
            console.log('\nMissing from database (need to add):');
            const missing = codeFields.filter(field => !actualFields.includes(field));
            missing.forEach(field => console.log(`❌ ${field}`));
            
            console.log('\nPresent in database:');
            const present = codeFields.filter(field => actualFields.includes(field));
            present.forEach(field => console.log(`✅ ${field}`));
        }
        
    } catch (error) {
        console.error('❌ Error checking user schema:', error.message);
    }
}

checkUserCollectionSchema();