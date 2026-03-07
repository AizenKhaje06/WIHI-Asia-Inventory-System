# API Testing Automation - Implementation Guide

## Phase 1: Setup Postman API Key

### Step 1: Get Your Postman API Key

1. Go to https://postman.com and log in
2. Click your profile icon → Settings
3. Navigate to "API Keys" section
4. Click "Generate API Key"
5. Give it a name: "WIHI Asia Inventory System"
6. Copy the generated key (you'll only see it once!)

### Step 2: Configure the API Key

**Option A: Environment Variable (Recommended)**
```bash
# Windows (PowerShell)
$env:POSTMAN_API_KEY="your-api-key-here"

# Windows (CMD)
set POSTMAN_API_KEY=your-api-key-here

# Add to system environment variables for persistence:
# 1. Search "Environment Variables" in Windows
# 2. Click "Environment Variables"
# 3. Under "User variables", click "New"
# 4. Variable name: POSTMAN_API_KEY
# 5. Variable value: your-api-key-here
# 6. Click OK
# 7. Restart your IDE
```

**Option B: Hardcode in MCP Config (Less Secure)**
Edit `.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "postman": {
      "url": "https://mcp.postman.com/minimal",
      "headers": {
        "Authorization": "Bearer pmk_your_actual_api_key_here"
      }
    }
  }
}
```

### Step 3: Restart Kiro IDE

After setting the API key, restart Kiro IDE to load the new configuration.

### Step 4: Verify Connection

Once restarted, I'll be able to connect to Postman and create:
- Workspace
- Collection with all API endpoints
- Environment with local server URL
- Automated tests

---

## Phase 2: What Will Be Created

### Workspace Structure
```
WIHI Asia Inventory System (Workspace)
├── Collections
│   └── Inventory API Tests
│       ├── 📁 Departments
│       │   ├── GET List Departments
│       │   └── GET Department Detail
│       ├── 📁 Stores
│       │   ├── GET List Stores
│       │   ├── POST Create Store
│       │   ├── PUT Update Store
│       │   └── DELETE Delete Store
│       ├── 📁 Orders
│       │   ├── GET List Orders
│       │   ├── POST Create Order
│       │   ├── PATCH Update Order
│       │   └── DELETE Delete Order
│       ├── 📁 Bundles (NEW)
│       │   ├── GET List Bundles
│       │   ├── POST Create Bundle
│       │   ├── GET Bundle Details
│       │   ├── PATCH Update Bundle
│       │   └── DELETE Delete Bundle
│       ├── 📁 Items
│       │   └── GET List Items
│       ├── 📁 Dashboard
│       │   └── GET Dashboard Stats
│       ├── 📁 Reports
│       │   └── GET Sales Reports
│       ├── 📁 Analytics
│       │   └── GET Analytics Data
│       ├── 📁 Customers
│       │   └── GET List Customers
│       ├── 📁 Sales
│       │   └── POST Create Sale
│       └── 📁 Logs
│           └── GET Activity Logs
└── Environments
    ├── Local Development
    │   ├── base_url: http://localhost:3000
    │   ├── username: admin
    │   ├── role: admin
    │   └── display_name: Admin User
    ├── Staging (Future)
    └── Production (Future)
```

### Test Scripts Included

Each request will have automated tests:

**Status Code Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

**Response Schema Tests:**
```javascript
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('name');
});
```

**Business Logic Tests:**
```javascript
pm.test("Bundle savings calculation is correct", function () {
    const bundle = pm.response.json();
    const expectedSavings = bundle.regular_price - bundle.bundle_price;
    pm.expect(bundle.savings).to.equal(expectedSavings);
});
```

**Data Type Tests:**
```javascript
pm.test("Price fields are numbers", function () {
    const bundle = pm.response.json();
    pm.expect(bundle.bundle_price).to.be.a('number');
    pm.expect(bundle.regular_price).to.be.a('number');
});
```

---

## Phase 3: Automation Hook

The hook will be created at `.kiro/hooks/api-postman-testing.kiro.hook`:

```json
{
  "enabled": true,
  "name": "API Postman Testing",
  "description": "Automatically runs Postman tests when API files are modified",
  "version": "1",
  "when": {
    "type": "fileEdited",
    "patterns": [
      "app/api/**/*.ts",
      "app/api/**/*.js",
      "lib/types.ts",
      "lib/supabase.ts",
      "lib/api-*.ts"
    ]
  },
  "then": {
    "type": "askAgent",
    "prompt": "API source code has been modified. Please run the Postman collection tests and show me the results. If any tests fail, analyze the failures and propose fixes."
  }
}
```

**How it works:**
1. You edit any API file (e.g., `app/api/bundles/route.ts`)
2. Hook triggers automatically
3. I run the Postman collection
4. Results are displayed with pass/fail status
5. If failures occur, I analyze and suggest fixes

---

## Phase 4: Running Tests Manually

You can also ask me to run tests anytime:

**Commands:**
- "Run Postman tests"
- "Test the bundles API"
- "Run all API tests"
- "Check if the orders API is working"

**What I'll do:**
1. Execute the collection
2. Show you results:
   ```
   ✅ GET /api/bundles - All tests passed (5/5)
   ✅ POST /api/bundles - All tests passed (8/8)
   ❌ DELETE /api/bundles/[id] - 2 tests failed
      - Expected status 200, got 404
      - Response missing 'success' field
   ```
3. Propose fixes for failures

---

## Benefits

### 1. Catch Bugs Early
- Tests run automatically after code changes
- Immediate feedback on breaking changes
- Prevents bugs from reaching production

### 2. Confidence in Refactoring
- Make changes knowing tests will catch issues
- Safe to optimize or restructure code
- Regression testing built-in

### 3. Documentation
- Collection serves as API documentation
- Examples show how to use each endpoint
- Test scripts document expected behavior

### 4. Team Collaboration
- Share collection with team members
- Everyone uses same test suite
- Consistent API validation

### 5. CI/CD Integration (Future)
- Run tests in GitHub Actions
- Block deployments if tests fail
- Automated quality gates

---

## Next Steps After Setup

Once you've configured your API key and restarted Kiro:

1. **I'll create the workspace** - "WIHI Asia Inventory System"
2. **I'll create the collection** - With all 40+ API endpoints
3. **I'll create the environment** - Local development settings
4. **I'll save IDs to .postman.json** - For future reference
5. **I'll create the automation hook** - For automatic testing
6. **I'll run the first test** - To verify everything works

Then you'll have:
- ✅ Automated API testing
- ✅ Comprehensive test coverage
- ✅ Immediate feedback on changes
- ✅ Professional API documentation
- ✅ Foundation for CI/CD

---

## Troubleshooting

### "MCP server not connected"
- Verify API key is set correctly
- Restart Kiro IDE
- Check `.kiro/settings/mcp.json` syntax

### "Collection not found"
- Check `.postman.json` has correct IDs
- Verify workspace exists in Postman
- Re-run setup if needed

### "Tests failing"
- Ensure dev server is running (http://localhost:3000)
- Check Supabase connection
- Verify authentication headers

### "API key invalid"
- Generate new key at postman.com
- Update environment variable
- Restart IDE

---

## Ready to Proceed?

Once you've set up your Postman API key, just say:
- "I've set up the API key, proceed"
- "Continue with Postman setup"
- "Ready to create the collection"

And I'll handle everything automatically! 🚀
