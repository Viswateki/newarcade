// Test email service
const testEmail = 'tekiviswagnabramha@gmail.com'; // Use your actual email for testing
const testCode = '123456';
const testName = 'Test User';

async function testEmailService() {
    try {
        console.log('🧪 Testing email service...');
        
        const response = await fetch('http://localhost:3000/api/auth/send-email-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                code: testCode,
                name: testName,
                type: 'registration'
            }),
        });

        console.log('📊 Email service response status:', response.status);
        
        const data = await response.json();
        console.log('📊 Email service response data:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('✅ Email service working correctly!');
            console.log('📧 Check your email:', testEmail);
        } else {
            console.log('❌ Email service failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Email test failed:', error);
    }
}

testEmailService();