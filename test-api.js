// Test script to verify dashboard API fields
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/dashboard?period=ID',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing dashboard API...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✓ API Response received\n');
      console.log('=== CRITICAL FIELDS ===');
      console.log('yesterdaySales:', json.yesterdaySales);
      console.log('lastWeekSales:', json.lastWeekSales);
      console.log('lastMonthSales:', json.lastMonthSales);
      console.log('salesVelocity:', json.salesVelocity);
      console.log('\n=== TODAY DATA ===');
      console.log('revenueToday:', json.revenueToday);
      console.log('itemsSoldToday:', json.itemsSoldToday);
      console.log('\n=== VERIFICATION ===');
      
      if (json.yesterdaySales !== undefined) {
        console.log('✓ yesterdaySales field EXISTS');
      } else {
        console.log('✗ yesterdaySales field MISSING');
      }
      
      if (json.lastWeekSales !== undefined) {
        console.log('✓ lastWeekSales field EXISTS');
      } else {
        console.log('✗ lastWeekSales field MISSING');
      }
      
      if (json.lastMonthSales !== undefined) {
        console.log('✓ lastMonthSales field EXISTS');
      } else {
        console.log('✗ lastMonthSales field MISSING');
      }
      
      console.log('\n=== FULL RESPONSE KEYS ===');
      console.log('Total fields:', Object.keys(json).length);
      console.log('Last 5 fields:', Object.keys(json).slice(-5));
      
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.end();
