/**
 * Stress Testing Script for WIHI Asia Inventory System
 * Tests system limits and breaking points
 * 
 * Usage: node tests/stress-test.js
 */

const http = require('http');

// Configuration - Gradually increase load
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  stages: [
    { users: 5, duration: 10, name: 'Warm-up' },
    { users: 20, duration: 20, name: 'Normal Load' },
    { users: 50, duration: 30, name: 'High Load' },
    { users: 100, duration: 20, name: 'Stress Load' },
    { users: 200, duration: 10, name: 'Breaking Point' },
  ],
  requestDelay: 50, // ms between requests
};

// Test endpoints - Public endpoints only (no authentication required)
const ENDPOINTS = [
  { method: 'GET', path: '/api/health', name: 'Health Check' },
  { method: 'GET', path: '/api/test-supabase', name: 'Test Supabase' },
  { method: 'GET', path: '/api/dashboard', name: 'Dashboard Stats' },
];

// Results per stage
let stageResults = [];
let currentStageData = {
  total: 0,
  success: 0,
  failed: 0,
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
      timeout: 30000, // 30s timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        currentStageData.total++;
        currentStageData.responseTimes.push(responseTime);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          currentStageData.success++;
        } else {
          currentStageData.failed++;
          currentStageData.errors.push({
            endpoint: endpoint.name,
            status: res.statusCode,
          });
        }
        
        resolve({ success: true, time: responseTime });
      });
    });
    
    req.on('error', (error) => {
      currentStageData.total++;
      currentStageData.failed++;
      currentStageData.errors.push({
        endpoint: endpoint.name,
        error: error.message,
      });
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      currentStageData.total++;
      currentStageData.failed++;
      currentStageData.errors.push({
        endpoint: endpoint.name,
        error: 'Timeout',
      });
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

// Simulate user making requests
async function simulateUser(stopSignal) {
  while (!stopSignal.stop) {
    const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
    await makeRequest(endpoint);
    await new Promise(resolve => setTimeout(resolve, CONFIG.requestDelay));
  }
}

// Run single stage
async function runStage(stage) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔥 Stage: ${stage.name}`);
  console.log(`   Users: ${stage.users} | Duration: ${stage.duration}s`);
  console.log('='.repeat(60));
  
  // Reset stage data
  currentStageData = {
    total: 0,
    success: 0,
    failed: 0,
    responseTimes: [],
    errors: [],
  };
  
  const stopSignal = { stop: false };
  const users = [];
  
  // Start users
  for (let i = 0; i < stage.users; i++) {
    users.push(simulateUser(stopSignal));
  }
  
  // Progress indicator
  const progressInterval = setInterval(() => {
    const successRate = currentStageData.total > 0 
      ? ((currentStageData.success / currentStageData.total) * 100).toFixed(1)
      : 0;
    const avgTime = currentStageData.responseTimes.length > 0
      ? (currentStageData.responseTimes.reduce((a, b) => a + b, 0) / currentStageData.responseTimes.length).toFixed(0)
      : 0;
    
    process.stdout.write(`\r⏳ Requests: ${currentStageData.total} | Success: ${successRate}% | Avg: ${avgTime}ms`);
  }, 1000);
  
  // Wait for duration
  await new Promise(resolve => setTimeout(resolve, stage.duration * 1000));
  
  // Stop users
  stopSignal.stop = true;
  clearInterval(progressInterval);
  await Promise.all(users);
  
  // Calculate stats
  const sorted = currentStageData.responseTimes.sort((a, b) => a - b);
  const stats = {
    avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
  };
  
  // Store results
  stageResults.push({
    stage: stage.name,
    users: stage.users,
    ...currentStageData,
    stats,
    throughput: currentStageData.total / stage.duration,
  });
  
  // Print stage results
  console.log(`\n\n📊 Stage Results:`);
  console.log(`  • Total Requests: ${currentStageData.total}`);
  console.log(`  • Success: ${currentStageData.success} (${((currentStageData.success/currentStageData.total)*100).toFixed(1)}%)`);
  console.log(`  • Failed: ${currentStageData.failed} (${((currentStageData.failed/currentStageData.total)*100).toFixed(1)}%)`);
  console.log(`  • Throughput: ${(currentStageData.total / stage.duration).toFixed(2)} req/s`);
  console.log(`  • Avg Response: ${stats.avg.toFixed(2)}ms`);
  console.log(`  • P95: ${stats.p95}ms`);
  console.log(`  • P99: ${stats.p99}ms`);
  
  if (currentStageData.failed > 0) {
    console.log(`  ⚠️  ${currentStageData.failed} requests failed`);
  }
}

// Main stress test
async function runStressTest() {
  console.log('💪 STRESS TEST - Finding System Limits\n');
  console.log(`Configuration:`);
  console.log(`  • Base URL: ${CONFIG.baseUrl}`);
  console.log(`  • Stages: ${CONFIG.stages.length}`);
  console.log(`  • Max Users: ${Math.max(...CONFIG.stages.map(s => s.users))}`);
  
  const startTime = Date.now();
  
  // Run all stages
  for (const stage of CONFIG.stages) {
    await runStage(stage);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Cool down
  }
  
  const totalDuration = (Date.now() - startTime) / 1000;
  
  // Final summary
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('🏁 STRESS TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n⏱️  Total Duration: ${totalDuration.toFixed(2)}s\n`);
  
  // Stage comparison
  console.log('📈 Performance by Stage:\n');
  console.log('Stage'.padEnd(20) + 'Users'.padEnd(10) + 'Req/s'.padEnd(12) + 'Avg(ms)'.padEnd(12) + 'Success%');
  console.log('-'.repeat(60));
  
  stageResults.forEach(result => {
    const successRate = ((result.success / result.total) * 100).toFixed(1);
    console.log(
      result.stage.padEnd(20) +
      result.users.toString().padEnd(10) +
      result.throughput.toFixed(2).padEnd(12) +
      result.stats.avg.toFixed(0).padEnd(12) +
      successRate + '%'
    );
  });
  
  // Find breaking point
  console.log(`\n🎯 Analysis:`);
  
  const degradationPoint = stageResults.find((result, i) => {
    if (i === 0) return false;
    const prev = stageResults[i - 1];
    return result.stats.avg > prev.stats.avg * 2 || 
           (result.failed / result.total) > 0.05;
  });
  
  if (degradationPoint) {
    console.log(`  ⚠️  Performance degradation at: ${degradationPoint.stage} (${degradationPoint.users} users)`);
    console.log(`     Average response time: ${degradationPoint.stats.avg.toFixed(0)}ms`);
    console.log(`     Failure rate: ${((degradationPoint.failed/degradationPoint.total)*100).toFixed(1)}%`);
  } else {
    console.log(`  ✅ System handled all load stages successfully!`);
  }
  
  const maxThroughput = Math.max(...stageResults.map(r => r.throughput));
  const maxStage = stageResults.find(r => r.throughput === maxThroughput);
  console.log(`  🚀 Peak throughput: ${maxThroughput.toFixed(2)} req/s at ${maxStage.stage}`);
  
  const totalErrors = stageResults.reduce((sum, r) => sum + r.failed, 0);
  const totalRequests = stageResults.reduce((sum, r) => sum + r.total, 0);
  console.log(`  📊 Overall success rate: ${((1 - totalErrors/totalRequests) * 100).toFixed(2)}%`);
  
  console.log('\n' + '='.repeat(60));
}

// Run the test
runStressTest().catch(console.error);
