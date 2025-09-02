// Simple Node.js script to test blog fetching
const { Client, Databases } = require('appwrite');

const client = new Client();
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68a2fa360035825e2e75');

const databases = new Databases(client);

async function testBlogFetch() {
    try {
        console.log('Testing database connection...');
        console.log('Database ID: 68af079a00202900545c');
        console.log('Blogs Collection ID: blogs');
        
        const response = await databases.listDocuments(
            '68af079a00202900545c',
            'blogs'
        );
        
        console.log('Total blogs found:', response.total);
        console.log('Blogs returned:', response.documents.length);
        
        if (response.documents.length > 0) {
            console.log('First blog:', {
                id: response.documents[0].$id,
                title: response.documents[0].title,
                status: response.documents[0].status,
                author_id: response.documents[0].author_id
            });
        }
        
    } catch (error) {
        console.error('Error fetching blogs:', error);
        console.error('Error details:', error.message);
    }
}

testBlogFetch();
