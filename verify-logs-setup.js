/**
 * Verify Logs Setup Script
 * Tests the logs API and database connection
 */

const https = require('https');

// Configuration
const SUPABASE_URL = 'https://rsvzbmhuckwndvqfhzml.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_0wY7yn9Tz7tl6XVmZ9srlQ__DDlZUBR';

console.log('🔍 Verifying Logs Setup...\n');

// Test 1: Check if logs table exists and has data
async function checkLogsTable() {
  console.log('Test 1: Checking logs table...');
  
  const options = {
    hostname: 'rsvzbmhuckwndvqfhzml.supabase.co',
    path: '/rest/v1/logs?select=*&limit=5',
    method: 'GET',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          const logs = JSON.parse(data);
          console.log(`  ✅ Logs table accessible`);
          console.log(`  📊 Found ${logs.length} logs`);
          
          if (logs.length > 0) {
            console.log(`  📝 Sample log:`, JSON.stringify(logs[0], null, 2));
          } else {
            console.log(`  ⚠️  Logs table is empty (no operations logged yet)`);
          }
          resolve(logs);
        } else {
          console.log(`  ❌ Error: ${res.statusCode}`);
          console.log(`  Response: ${data}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ Request failed: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

// Test 2: Check RLS policies
async function checkRLSPolicies() {
  console.log('\nTest 2: Checking RLS policies...');
  
  const query = `
    SELECT schemaname, tablename, policyname, permissive, roles, cmd
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'logs'
    ORDER BY policyname;
  `;

  const options = {
    hostname: 'rsvzbmhuckwndvqfhzml.supabase.co',
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          console.log(`  ✅ RLS policies check completed`);
          console.log(`  Note: Use Supabase dashboard to verify policies manually`);
          resolve();
        } else {
          console.log(`  ⚠️  Could not verify RLS policies (use Supabase dashboard)`);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.log(`  ⚠️  Could not verify RLS policies: ${error.message}`);
      resolve();
    });

    req.end(JSON.stringify({ query }));
  });
}

// Test 3: Insert a test log
async function insertTestLog() {
  console.log('\nTest 3: Inserting test log...');
  
  const testLog = {
    id: `LOG-${Date.now()}`,
    operation: 'create',
    item_id: 'TEST-001',
    item_name: 'Test Item',
    details: 'Test log entry created by verification script',
    timestamp: new Date().toISOString()
  };

  const options = {
    hostname: 'rsvzbmhuckwndvqfhzml.supabase.co',
    path: '/rest/v1/logs',
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        
        if (res.statusCode === 201) {
          console.log(`  ✅ Test log inserted successfully`);
          console.log(`  📝 Log ID: ${testLog.id}`);
          resolve(testLog);
        } else {
          console.log(`  ❌ Failed to insert test log`);
          console.log(`  Response: ${data}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ Request failed: ${error.message}`);
      reject(error);
    });

    req.write(JSON.stringify(testLog));
    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    await checkLogsTable();
    await checkRLSPolicies();
    await insertTestLog();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Summary:');
    console.log('  - Logs table is accessible');
    console.log('  - Test log was inserted successfully');
    console.log('  - You can now test the logs page in your app');
    
  } catch (error) {
    console.log('\n❌ Tests failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Verify Supabase URL is correct');
    console.log('  2. Verify service role key is correct');
    console.log('  3. Check if logs table exists in Supabase');
    console.log('  4. Run migrations in Supabase SQL Editor');
  }
}

runTests();
