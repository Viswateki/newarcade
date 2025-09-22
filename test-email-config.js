// Test script to verify email service configuration
// Run with: node test-email-service.js

const checkEmailConfig = () => {
  console.log('📧 Checking email service configuration...\n');
  
  const requiredVars = [
    'EMAIL_HOST',
    'EMAIL_PORT', 
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName}: ${varName === 'EMAIL_PASSWORD' ? '[HIDDEN]' : process.env[varName]}`);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('\n❌ Missing environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\nPlease ensure these are set in your .env.local file');
  } else {
    console.log('\n✅ All email environment variables are configured');
  }
  
  return missingVars.length === 0;
};

const testEmailSending = async () => {
  try {
    console.log('\n📧 Testing email sending via API...');
    
    // Test the email sending endpoint
    const response = await fetch('http://localhost:3000/api/auth/send-email-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'tekiviswagnabramha@gmail.com', // Your email for testing
        code: '123456',
        name: 'Test User',
        type: 'registration'
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Email API test successful');
      console.log('📨 Check your email inbox for the test verification code');
    } else {
      console.log('❌ Email API test failed:', result.message);
    }
    
  } catch (error) {
    console.log('❌ Failed to test email API:', error.message);
  }
};

// Run the checks
if (checkEmailConfig()) {
  console.log('\n🧪 Running email API test...');
  testEmailSending();
} else {
  console.log('\n⚠️ Cannot test email sending due to missing configuration');
}