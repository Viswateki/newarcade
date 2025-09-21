// Test fallback icon rendering
import { FallbackIcon } from '../src/components/FallbackIconSystem';

console.log('Testing fallback icons...');

// Test data similar to database
const testTools = [
  {
    name: 'aimeta',
    fallbackIcon: 'Zap',
    logoBackgroundColor: '#F97316',
    logo: null
  },
  {
    name: 'kattapa',  
    fallbackIcon: 'BarChart',
    logoBackgroundColor: '#F59E0B',
    logo: null
  }
];

testTools.forEach(tool => {
  console.log(`Testing ${tool.name}:`);
  console.log(`- Fallback Icon: ${tool.fallbackIcon}`);
  console.log(`- Background Color: ${tool.logoBackgroundColor}`);
  console.log(`- Has logo: ${!!tool.logo}`);
  console.log(`- Should show fallback: ${!tool.logo}`);
});