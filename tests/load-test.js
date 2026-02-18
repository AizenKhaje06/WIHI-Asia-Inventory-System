/**
 * Load Testing Script for WIHI Asia Inventory System
 * Tests API endpoints under normal load conditions
 * 
 * Usage: node tests/load-test.js
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  concurrentUsers: 10,
  requestsPerUser: 20,
  delayBetweenRequests: 100, // ms
};

// Test endpoints - Public endpoints only (no authentication required)
const ENDPOINTS = [
  { method: 'GET', path: '/api/health', name: 'Health Check' },
  { method: 'GET', path: '/api/test-supabase', name: 'Test Supabase' },
  { method: 'GET', path: '/api/dashboard', name: 'Dashboard Stats' },
];

// Results tracking
const results = {
  total: 0,
  success: 0,
  failed: 0,
  totalTime: 0,
  responseTimes: [],
  errors: [],
};

// Make HTTP request
function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(endpoint.path, CONFIG.baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.total++;
        results.totalTime += responseTime;
        results.responseTimes.push(responseTime);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            endpoint: endpoint.name,
            status: res.statusCode,
            time: responseTime,
          });
        }
        
        resolve({
          endpoint: endpoint.name,
          status: res.statusCode,
          time: responseTime,
        });
      });
    });
    
    req.on('error', (error) => {
      results.total++;
      results.failed++;
      results.errors.push({
        endpoint: endpoint.name,
        error: error.message,
      });
      resolve({
        endpoint: endpoint.name,
        error: error.message,
      });
    });
    
    req.end();
  });
}

// Simulate single user
async function simulateUser(userId) {
  console.log(`👤 User ${userId} started...`);
  
  for (let i = 0; i < CONFIG.requestsPerUser; i++) {
    const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
    await makeRequest(endpoint);
    
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
  }
  
  console.log(`✓ User ${userId} completed`);
}

// Calculate statistics
function calculateStats() {
  const sorted = results.responseTimes.sort((a, b) => a - b);
  const avg = results.totalTime / results.total;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  
  return { avg, min, max, p50, p95, p99 };
}

// Main load test
async function runLoadTest() {
  console.log('🚀 Starting Load Test...\n');
  console.log(`Configuration:`);
  console.log(`  • Base URL: ${CONFIG.baseUrl}`);
  console.log(`  • Concurrent Users: ${CONFIG.concurrentUsers}`);
  console.log(`  • Requests per User: ${CONFIG.requestsPerUser}`);
  console.log(`  • Total Requests: ${CONFIG.concurrentUsers * CONFIG.requestsPerUser}`);
  console.log(`  • Delay: ${CONFIG.delayBetweenRequests}ms\n`);
  
  const startTime = Date.now();
  
  // Run concurrent users
  const users = [];
  for (let i = 1; i <= CONFIG.concurrentUsers; i++) {
    users.push(simulateUser(i));
  }
  
  await Promise.all(users);
  
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  // Calculate statistics
  const stats = calculateStats();
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`\n⏱️  Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`\n📈 Requests:`);
  console.log(`  • Total: ${results.total}`);
  console.log(`  • Success: ${results.success} (${((results.success/results.total)*100).toFixed(1)}%)`);
  console.log(`  • Failed: ${results.failed} (${((results.failed/results.total)*100).toFixed(1)}%)`);
  console.log(`  • Throughput: ${(results.total / totalDuration).toFixed(2)} req/s`);
  
  console.log(`\n⚡ Response Times (ms):`);
  console.log(`  • Average: ${stats.avg.toFixed(2)}ms`);
  console.log(`  • Min: ${stats.min}ms`);
  console.log(`  • Max: ${stats.max}ms`);
  console.log(`  • P50 (Median): ${stats.p50}ms`);
  console.log(`  • P95: ${stats.p95}ms`);
  console.log(`  • P99: ${stats.p99}ms`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors (${results.errors.length}):`);
    results.errors.slice(0, 5).forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.endpoint}: ${err.error || `Status ${err.status}`}`);
    });
    if (results.errors.length > 5) {
      console.log(`  ... and ${results.errors.length - 5} more errors`);
    }
  }
  
  // Performance assessment
  console.log(`\n🎯 Performance Assessment:`);
  if (stats.avg < 100) {
    console.log(`  ✅ EXCELLENT - Average response time under 100ms`);
  } else if (stats.avg < 500) {
    console.log(`  ✅ GOOD - Average response time under 500ms`);
  } else if (stats.avg < 1000) {
    console.log(`  ⚠️  ACCEPTABLE - Average response time under 1s`);
  } else {
    console.log(`  ❌ POOR - Average response time over 1s`);
  }
  
  if (results.failed === 0) {
    console.log(`  ✅ NO FAILURES - All requests succeeded`);
  } else if (results.failed / results.total < 0.01) {
    console.log(`  ✅ LOW FAILURE RATE - Less than 1% failed`);
  } else {
    console.log(`  ❌ HIGH FAILURE RATE - ${((results.failed/results.total)*100).toFixed(1)}% failed`);
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run the test
runLoadTest().catch(console.error);
