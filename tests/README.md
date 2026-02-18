# 🧪 Load & Stress Testing

Performance testing tools for WIHI Asia Inventory System.

## 📋 Available Tests

### 1. Load Test (`load-test.js`)
Tests system performance under **normal load conditions**.

**What it does:**
- Simulates multiple concurrent users
- Tests all major API endpoints
- Measures response times and success rates
- Identifies performance bottlenecks

**Configuration:**
- Concurrent Users: 10
- Requests per User: 20
- Total Requests: 200
- Delay: 100ms between requests

### 2. Stress Test (`stress-test.js`)
Tests system **limits and breaking points**.

**What it does:**
- Gradually increases load in stages
- Finds performance degradation point
- Identifies maximum throughput
- Tests system stability under extreme load

**Stages:**
1. Warm-up: 5 users (10s)
2. Normal Load: 20 users (20s)
3. High Load: 50 users (30s)
4. Stress Load: 100 users (20s)
5. Breaking Point: 200 users (10s)

## 🚀 How to Run

### Prerequisites
1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Server should be accessible at `http://localhost:3000`

### Run Load Test
```bash
node tests/load-test.js
```

**Expected Output:**
```
🚀 Starting Load Test...

Configuration:
  • Base URL: http://localhost:3000
  • Concurrent Users: 10
  • Requests per User: 20
  • Total Requests: 200

👤 User 1 started...
👤 User 2 started...
...

📊 LOAD TEST RESULTS
⏱️  Duration: 25.43s
📈 Requests:
  • Total: 200
  • Success: 198 (99.0%)
  • Failed: 2 (1.0%)
  • Throughput: 7.87 req/s

⚡ Response Times (ms):
  • Average: 127.45ms
  • Min: 45ms
  • Max: 892ms
  • P50 (Median): 98ms
  • P95: 345ms
  • P99: 678ms

🎯 Performance Assessment:
  ✅ GOOD - Average response time under 500ms
  ✅ LOW FAILURE RATE - Less than 1% failed
```

### Run Stress Test
```bash
node tests/stress-test.js
```

**Expected Output:**
```
💪 STRESS TEST - Finding System Limits

Configuration:
  • Base URL: http://localhost:3000
  • Stages: 5
  • Max Users: 200

🔥 Stage: Warm-up
   Users: 5 | Duration: 10s
⏳ Requests: 89 | Success: 100.0% | Avg: 56ms

📊 Stage Results:
  • Total Requests: 89
  • Success: 89 (100.0%)
  • Throughput: 8.90 req/s
  • Avg Response: 56.23ms
  • P95: 89ms

...

🏁 STRESS TEST SUMMARY
📈 Performance by Stage:

Stage               Users     Req/s       Avg(ms)     Success%
------------------------------------------------------------
Warm-up             5         8.90        56          100.0%
Normal Load         20        35.20       142         99.5%
High Load           50        78.50       387         97.2%
Stress Load         100       125.30      892         89.3%
Breaking Point      200       156.70      1456        72.1%

🎯 Analysis:
  ⚠️  Performance degradation at: Stress Load (100 users)
     Average response time: 892ms
     Failure rate: 10.7%
  🚀 Peak throughput: 156.70 req/s at Breaking Point
  📊 Overall success rate: 91.64%
```

## 📊 Understanding Results

### Response Time Benchmarks
- **< 100ms**: Excellent ✅
- **100-500ms**: Good ✅
- **500-1000ms**: Acceptable ⚠️
- **> 1000ms**: Poor ❌

### Success Rate Benchmarks
- **> 99%**: Excellent ✅
- **95-99%**: Good ✅
- **90-95%**: Acceptable ⚠️
- **< 90%**: Poor ❌

### Throughput
- Requests per second the system can handle
- Higher is better
- Compare across different load levels

### Percentiles (P50, P95, P99)
- **P50 (Median)**: 50% of requests faster than this
- **P95**: 95% of requests faster than this
- **P99**: 99% of requests faster than this
- P95 and P99 show worst-case scenarios

## 🔧 Customization

### Modify Load Test
Edit `tests/load-test.js`:

```javascript
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  concurrentUsers: 20,        // Increase users
  requestsPerUser: 50,        // More requests
  delayBetweenRequests: 50,   // Faster requests
};
```

### Modify Stress Test
Edit `tests/stress-test.js`:

```javascript
const CONFIG = {
  stages: [
    { users: 10, duration: 15, name: 'Light' },
    { users: 50, duration: 30, name: 'Medium' },
    { users: 150, duration: 20, name: 'Heavy' },
    // Add more stages
  ],
};
```

### Add More Endpoints
Add to `ENDPOINTS` array in either test:

```javascript
const ENDPOINTS = [
  { method: 'GET', path: '/api/items', name: 'Inventory' },
  { method: 'GET', path: '/api/your-endpoint', name: 'Your Test' },
  // Add POST requests:
  { 
    method: 'POST', 
    path: '/api/sales', 
    name: 'Create Sale',
    body: { /* your data */ }
  },
];
```

## 🎯 Best Practices

1. **Run during development** - Catch performance issues early
2. **Test before deployment** - Ensure production readiness
3. **Monitor trends** - Track performance over time
4. **Test realistic scenarios** - Use actual user patterns
5. **Don't test production** - Only test dev/staging environments

## ⚠️ Important Notes

- Tests generate real API calls - don't run against production!
- High load may slow down your development machine
- Close other applications during stress testing
- Results vary based on hardware and network
- Supabase free tier has rate limits

## 🐛 Troubleshooting

### "Connection Refused"
- Make sure dev server is running: `npm run dev`
- Check server is on port 3000

### "Too Many Requests"
- Reduce concurrent users
- Increase delay between requests
- Check Supabase rate limits

### High Failure Rate
- Check server logs for errors
- Verify database connection
- Check API authentication

### Slow Response Times
- Check database query performance
- Review API caching strategy
- Optimize slow endpoints

## 📈 Performance Optimization Tips

If tests show poor performance:

1. **Add caching** - Cache frequently accessed data
2. **Optimize queries** - Add database indexes
3. **Reduce payload size** - Return only needed data
4. **Enable compression** - Gzip responses
5. **Use CDN** - For static assets
6. **Database connection pooling** - Reuse connections
7. **Implement pagination** - Limit result sets

## 🎓 Next Steps

After running tests:
1. Document baseline performance
2. Set performance budgets
3. Monitor in production
4. Run tests regularly
5. Optimize bottlenecks

---

**Happy Testing!** 🚀
