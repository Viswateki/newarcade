// Test registration and email sending
const testEmail = 'test@example.com';
const testUsername = 'testuser123';
const testPassword = 'password123';

async function testRegistration() {
    try {
        console.log('🧪 Testing registration flow...');
        
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
                username: testUsername,
                linkedinProfile: '',
                githubProfile: '',
            }),
        });

        console.log('📊 Response status:', response.status);
        
        const data = await response.json();
        console.log('📊 Response data:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('✅ Registration successful');
            if (data.requiresVerification) {
                console.log('📧 Should require verification and send email');
            }
        } else {
            console.log('❌ Registration failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testRegistration();