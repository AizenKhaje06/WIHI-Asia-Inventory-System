// Quick Supabase Connection Test
const https = require('https');

const url = 'http://localhost:3002/api/test-supabase';

console.log('🔍 Testing Supabase connection...\n');

https.get(url.replace('https', 'http'), (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.success) {
        console.log('✅ CONNECTION SUCCESSFUL!\n');
        console.log('📊 Database Status:');
        console.log('   Inventory items:', result.inventory?.count || 0);
        console.log('\n📋 Tables Status:');
        
        Object.entries(result.tables || {}).forEach(([table, status]) => {
          const icon = status.accessible ? '✅' : '❌';
          console.log(`   ${icon} ${table}: ${status.count} records`);
          if (status.error) {
            console.log(`      Error: ${status.error}`);
          }
        });
      } else {
        console.log('❌ CONNECTION FAILED!\n');
        console.log('Error:', result.error);
        if (result.details) {
          console.log('Details:', JSON.stringify(result.details, null, 2));
        }
      }
    } catch (e) {
      console.log('❌ Failed to parse response');
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.log('❌ Request failed:', err.message);
  console.log('\nMake sure the dev server is running on port 3002');
});
