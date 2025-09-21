// Test script to submit a tool with fallback icon data
const formData = {
  name: 'Test Fallback Tool',
  description: 'Testing the fallback icon system with custom background color',
  categories: ['AI Chatbots'],
  websiteLink: 'https://example.com',
  logoBackgroundColor: '#FF6B6B', // Custom red background
  fallbackIcon: '🚀', // Rocket emoji as fallback icon
  privacy: 'public'
};

console.log('Form data to submit:', formData);

// You can copy and paste this data into the submit form to test