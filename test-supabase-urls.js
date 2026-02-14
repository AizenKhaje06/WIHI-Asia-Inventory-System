/**
 * Test which Supabase URL is correct
 */

const https = require('https');

const urls = [
  'rsvzbmhuckwndvqfhzml.supabase.co',  // From .env.local
  'rsyzbmhuckwndvafhzml.supabase.co',  // From context transfer
];

console.log('🔍 Testing Supabase URLs...\n');

async function testUrl(hostname) {
  return new Promise((resolve) => {
    console.log(`Testing: https://${hostname}`);
    
    const options = {
      hostname: hostname,
      path: '/rest/v1/',
      method: 'GET',
      timeout: 5000,
      headers: {
        'apikey': 'test'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`  ✅ Status: ${res.statusCode} - URL is VALID\n`);
      resolve({ hostname, valid: true, status: res.statusCode });
    });

    req.on('error', (error) => {
      console.log(`  ❌ Error: ${error.message} - URL is INVALID\n`);
      resolve({ hostname, valid: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`  ❌ Timeout - URL is INVALID\n`);
      resolve({ hostname, valid: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function testAll() {
  const results = [];
  
  for (const url of urls) {
    const result = await testUrl(url);
    results.push(result);
  }
  
  console.log('📋 Summary:');
  const validUrl = results.find(r => r.valid);
  
  if (validUrl) {
    console.log(`\n✅ CORRECT URL: https://${validUrl.hostname}`);
    console.log('\n🔧 Action Required:');
    console.log(`   Update .env.local with: NEXT_PUBLIC_SUPABASE_URL=https://${validUrl.hostname}`);
  } else {
    console.log('\n❌ No valid URL found. Please check your Supabase project settings.');
  }
}

testAll();
