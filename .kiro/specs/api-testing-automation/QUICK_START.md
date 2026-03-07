# API Testing Automation - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Postman API Key (2 minutes)

1. Go to https://postman.com and log in
2. Click your profile icon → **Settings**
3. Navigate to **API Keys** section
4. Click **Generate API Key**
5. Name it: `WIHI Asia Inventory System`
6. **Copy the key** (you'll only see it once!)

### Step 2: Set Environment Variable (1 minute)

**Windows (PowerShell) - Run as Administrator:**
```powershell
# Set for current session
$env:POSTMAN_API_KEY="your-api-key-here"

# Set permanently (System-wide)
[System.Environment]::SetEnvironmentVariable('POSTMAN_API_KEY', 'your-api-key-here', 'User')
```

**Windows (CMD) - Run as Administrator:**
```cmd
setx POSTMAN_API_KEY "your-api-key-here"
```

**Verify it's set:**
```powershell
echo $env:POSTMAN_API_KEY
```

### Step 3: Restart Kiro IDE (30 seconds)

Close and reopen Kiro IDE to load the new environment variable.

### Step 4: Tell Me You're Ready (10 seconds)

Just say:
- "I've set up the API key, proceed"
- "Ready for Postman setup"
- "Continue with API testing"

### Step 5: I'll Do Everything Else! (1 minute)

I will automatically:
1. ✅ Create Postman workspace
2. ✅ Create collection with 40+ endpoints
3. ✅ Create local environment
4. ✅ Save IDs to `.postman.json`
5. ✅ Enable automation hook
6. ✅ Run first test suite
7. ✅ Show you the results

---

## 📋 What You'll Get

### Automated Testing
- Tests run automatically when you edit API files
- Immediate feedback on breaking changes
- Clear pass/fail indicators

### Comprehensive Coverage
- 40+ API endpoints tested
- 200+ test assertions
- Business logic validation
- Schema validation
- Performance monitoring

### Professional Workflow
- No manual testing needed
- Catch bugs before deployment
- Confidence in refactoring
- API documentation included

---

## 🎯 Example Workflow

### Before (Manual Testing)
```
1. Edit app/api/bundles/route.ts
2. Save file
3. Open Postman manually
4. Find the request
5. Click Send
6. Check response
7. Verify calculations manually
8. Test edge cases manually
9. Repeat for each endpoint
⏱️ Time: 10-15 minutes per change
```

### After (Automated Testing)
```
1. Edit app/api/bundles/route.ts
2. Save file
3. ✨ Tests run automatically
4. ✨ Results appear in IDE
5. ✨ Failures highlighted with fixes
⏱️ Time: 30 seconds per change
```

---

## 📊 Sample Test Results

```
🧪 Running Postman Collection: Inventory API Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Bundles
  ✅ GET /api/bundles
     ✓ Status code is 200 (45ms)
     ✓ Response is an array (2ms)
     ✓ Each bundle has required fields (8ms)
     ✓ Bundle prices are valid numbers (3ms)
     ✓ Savings calculation is correct (5ms)
     
  ✅ POST /api/bundles
     ✓ Status code is 201 (234ms)
     ✓ Response has bundle ID (3ms)
     ✓ Bundle cost calculated correctly (4ms)
     ✓ Regular price calculated correctly (3ms)
     ✓ Savings calculated correctly (5ms)
     ✓ Bundle price not below cost (2ms)
     ✓ Bundle is active by default (2ms)
     ✓ Response time is acceptable (1ms)

📁 Orders
  ✅ GET /api/orders
     ✓ Status code is 200 (67ms)
     ✓ Response is an array (2ms)
     ✓ Each order has required fields (6ms)
     
  ✅ POST /api/orders
     ✓ Status code is 201 (189ms)
     ✓ Response has order ID (3ms)
     ✓ Notes field is stored (2ms)
     ✓ Customer info is stored (4ms)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All tests passed! (24/24)
⏱️ Total time: 2.3 seconds
```

---

## 🔧 Troubleshooting

### "MCP server not connected"
**Solution:** Restart Kiro IDE after setting the API key

### "API key invalid"
**Solution:** Generate a new key at postman.com and update the environment variable

### "Tests failing"
**Solution:** Ensure dev server is running:
```bash
npm run dev
```

### "Connection refused"
**Solution:** Check that http://localhost:3000 is accessible

---

## 🎓 Learn More

- **Full Documentation:** `.kiro/specs/api-testing-automation/requirements.md`
- **Design Details:** `.kiro/specs/api-testing-automation/design.md`
- **Implementation Guide:** `.kiro/specs/api-testing-automation/implementation-guide.md`

---

## 💡 Pro Tips

### Tip 1: Run Tests Anytime
Just ask me:
- "Run Postman tests"
- "Test the bundles API"
- "Check if orders API is working"

### Tip 2: Focus on Specific Endpoints
- "Test only the bundles endpoints"
- "Run department API tests"

### Tip 3: Get Detailed Analysis
- "Why did the bundle test fail?"
- "Show me the full test results"
- "What's wrong with the orders API?"

### Tip 4: Update Tests
- "Add a test for the new field"
- "Update the bundle price validation"
- "Add performance test for dashboard"

---

## 🚦 Ready to Start?

1. ✅ Got your Postman API key?
2. ✅ Set the environment variable?
3. ✅ Restarted Kiro IDE?

**Then just say:** "I'm ready, proceed with Postman setup!"

And I'll handle everything else automatically! 🎉
