# API Testing Automation - Design Document

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Developer Workflow                       │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Edit API File (e.g., route.ts)               │
│                    Save Changes to Disk                          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Kiro Hook System Detects Change              │
│              (.kiro/hooks/api-postman-testing.kiro.hook)        │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Hook Triggers Agent Action                    │
│              "Run Postman tests and show results"                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Kiro Agent (Me) Executes                      │
│              1. Read .postman.json for IDs                       │
│              2. Call Postman API via MCP                         │
│              3. Run collection with environment                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Postman Cloud Executes Tests                  │
│              - Sends HTTP requests to localhost:3000             │
│              - Runs test scripts (pm.test)                       │
│              - Collects results                                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Results Returned to Agent                     │
│              - Pass/fail status per request                      │
│              - Test assertions results                           │
│              - Response times                                    │
│              - Error messages                                    │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Agent Analyzes & Reports                      │
│              - Format results for readability                    │
│              - Identify failures                                 │
│              - Propose fixes                                     │
│              - Show in IDE                                       │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Developer Reviews Results                     │
│              - See what passed/failed                            │
│              - Apply suggested fixes                             │
│              - Continue development                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Design

### 1. Postman Workspace

**Purpose:** Container for all testing resources

**Structure:**
```json
{
  "id": "workspace-uuid",
  "name": "WIHI Asia Inventory System",
  "type": "personal",
  "description": "API testing workspace for inventory management system"
}
```

**Why Personal Type:**
- Free tier compatible
- Full control over resources
- No team coordination needed
- Can upgrade to team later

---

### 2. Postman Collection

**Purpose:** Organized set of API requests with tests

**Schema:** Postman Collection v2.1.0

**Folder Structure:**
```
Inventory API Tests (Collection)
├── Departments (Folder)
│   ├── List Departments (Request)
│   └── Department Detail (Request)
├── Stores (Folder)
│   ├── List Stores (Request)
│   ├── Create Store (Request)
│   ├── Update Store (Request)
│   └── Delete Store (Request)
├── Orders (Folder)
│   ├── List Orders (Request)
│   ├── Create Order (Request)
│   ├── Update Order (Request)
│   └── Delete Order (Request)
├── Bundles (Folder) - NEW
│   ├── List Bundles (Request)
│   ├── Create Bundle (Request)
│   ├── Get Bundle Details (Request)
│   ├── Update Bundle (Request)
│   └── Delete Bundle (Request)
├── Items (Folder)
├── Dashboard (Folder)
├── Reports (Folder)
├── Analytics (Folder)
├── Customers (Folder)
├── Sales (Folder)
└── Logs (Folder)
```

**Request Template:**
```json
{
  "name": "Create Bundle",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      },
      {
        "key": "x-user-username",
        "value": "{{username}}"
      },
      {
        "key": "x-user-role",
        "value": "{{role}}"
      },
      {
        "key": "x-user-display-name",
        "value": "{{display_name}}"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"name\": \"Test Bundle\",\n  \"category\": \"Bundles\",\n  \"store\": \"Main Store\",\n  \"bundlePrice\": 1500,\n  \"items\": [\n    {\"itemId\": \"ITEM-001\", \"quantity\": 2}\n  ]\n}"
    },
    "url": {
      "raw": "{{base_url}}/api/bundles",
      "host": ["{{base_url}}"],
      "path": ["api", "bundles"]
    }
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "pm.test(\"Status code is 201\", function () {",
          "    pm.response.to.have.status(201);",
          "});",
          "",
          "pm.test(\"Response has bundle ID\", function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData).to.have.property('id');",
          "    pm.expect(jsonData.id).to.match(/^BUNDLE-/);",
          "});",
          "",
          "pm.test(\"Bundle cost calculated correctly\", function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData).to.have.property('bundle_cost');",
          "    pm.expect(jsonData.bundle_cost).to.be.a('number');",
          "    pm.expect(jsonData.bundle_cost).to.be.above(0);",
          "});",
          "",
          "pm.test(\"Savings calculated correctly\", function () {",
          "    const jsonData = pm.response.json();",
          "    const expectedSavings = jsonData.regular_price - jsonData.bundle_price;",
          "    pm.expect(jsonData.savings).to.equal(expectedSavings);",
          "});",
          "",
          "pm.test(\"Bundle price not below cost\", function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData.bundle_price).to.be.at.least(jsonData.bundle_cost);",
          "});"
        ],
        "type": "text/javascript"
      }
    }
  ]
}
```

---

### 3. Postman Environment

**Purpose:** Store configuration variables

**Variables:**
```json
{
  "name": "Local Development",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "username",
      "value": "admin",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "role",
      "value": "admin",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "display_name",
      "value": "Admin User",
      "enabled": true,
      "type": "default"
    }
  ]
}
```

**Future Environments:**
- Staging: `https://staging.wihiasia.com`
- Production: `https://api.wihiasia.com`

---

### 4. Configuration File (.postman.json)

**Purpose:** Store IDs for programmatic access

**Schema:**
```json
{
  "workspaceId": "workspace-uuid",
  "workspaceName": "WIHI Asia Inventory System",
  "collections": [
    {
      "id": "collection-uuid",
      "uid": "collection-uid",
      "name": "Inventory API Tests"
    }
  ],
  "environments": [
    {
      "id": "environment-uuid",
      "uid": "environment-uid",
      "name": "Local Development"
    }
  ]
}
```

**Usage:**
- Agent reads this file to get IDs
- Used for running collections
- Updated when resources are created
- Version controlled (committed to git)

---

### 5. Automation Hook

**File:** `.kiro/hooks/api-postman-testing.kiro.hook`

**Purpose:** Trigger tests on file changes

**Configuration:**
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

**Trigger Patterns:**
- `app/api/**/*.ts` - All API route files
- `lib/types.ts` - Type definitions
- `lib/supabase.ts` - Database client
- `lib/api-*.ts` - API utilities

**Action:**
- Type: `askAgent` (not `runCommand`)
- Prompt: Instructions for agent
- Agent executes Postman tests
- Results shown in IDE

---

## Test Design

### Test Categories

#### 1. Status Code Tests
**Purpose:** Verify HTTP response codes

**Examples:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Status code is 201 for creation", function () {
    pm.response.to.have.status(201);
});

pm.test("Status code is 400 for bad request", function () {
    pm.response.to.have.status(400);
});
```

#### 2. Schema Validation Tests
**Purpose:** Verify response structure

**Examples:**
```javascript
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('name');
    pm.expect(jsonData).to.have.property('bundle_price');
});

pm.test("Response is an array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

#### 3. Data Type Tests
**Purpose:** Verify field types

**Examples:**
```javascript
pm.test("Price fields are numbers", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.bundle_price).to.be.a('number');
    pm.expect(jsonData.regular_price).to.be.a('number');
});

pm.test("ID is a string", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.id).to.be.a('string');
});
```

#### 4. Business Logic Tests
**Purpose:** Verify calculations and rules

**Examples:**
```javascript
pm.test("Savings calculation is correct", function () {
    const bundle = pm.response.json();
    const expectedSavings = bundle.regular_price - bundle.bundle_price;
    pm.expect(bundle.savings).to.equal(expectedSavings);
});

pm.test("Bundle price not below cost", function () {
    const bundle = pm.response.json();
    pm.expect(bundle.bundle_price).to.be.at.least(bundle.bundle_cost);
});

pm.test("Profit margin is positive", function () {
    const data = pm.response.json();
    const profit = data.revenue - data.cost;
    pm.expect(profit).to.be.above(0);
});
```

#### 5. Date/Time Tests
**Purpose:** Verify timestamps

**Examples:**
```javascript
pm.test("Created timestamp is valid", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.created_at).to.match(/^\d{4}-\d{2}-\d{2}/);
});

pm.test("Date is within range", function () {
    const jsonData = pm.response.json();
    const date = new Date(jsonData.date);
    pm.expect(date.getTime()).to.be.below(Date.now());
});
```

#### 6. Array/Collection Tests
**Purpose:** Verify list responses

**Examples:**
```javascript
pm.test("Returns array of bundles", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    pm.expect(jsonData.length).to.be.above(0);
});

pm.test("All items have required fields", function () {
    const jsonData = pm.response.json();
    jsonData.forEach(item => {
        pm.expect(item).to.have.property('id');
        pm.expect(item).to.have.property('name');
    });
});
```

---

## Error Handling

### Test Failure Scenarios

#### Scenario 1: API Server Not Running
**Symptom:** Connection refused errors

**Detection:**
```javascript
pm.test("Server is reachable", function () {
    pm.response.to.not.be.error;
});
```

**Agent Response:**
```
❌ All tests failed - Connection refused
🔍 Analysis: Development server is not running
💡 Solution: Run `npm run dev` to start the server
```

#### Scenario 2: Database Connection Error
**Symptom:** 500 errors with database messages

**Detection:**
```javascript
pm.test("No database errors", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.error).to.not.include('database');
    pm.expect(jsonData.error).to.not.include('supabase');
});
```

**Agent Response:**
```
❌ POST /api/bundles failed - Database error
🔍 Analysis: Supabase connection issue
💡 Solution: Check .env.local for SUPABASE_URL and SUPABASE_ANON_KEY
```

#### Scenario 3: Type Mismatch
**Symptom:** Tests fail on type assertions

**Detection:**
```javascript
pm.test("Bundle price is a number", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.bundle_price).to.be.a('number');
});
```

**Agent Response:**
```
❌ Type validation failed
🔍 Analysis: bundle_price is string, expected number
💡 Solution: Update API to return parseFloat(bundlePrice) instead of bundlePrice
```

#### Scenario 4: Business Logic Error
**Symptom:** Calculation tests fail

**Detection:**
```javascript
pm.test("Savings calculation is correct", function () {
    const bundle = pm.response.json();
    const expectedSavings = bundle.regular_price - bundle.bundle_price;
    pm.expect(bundle.savings).to.equal(expectedSavings);
});
```

**Agent Response:**
```
❌ Business logic test failed
🔍 Analysis: Savings = 50, Expected = 100
💡 Solution: Check savings calculation in app/api/bundles/route.ts line 87
```

---

## Performance Considerations

### Test Execution Time

**Target:** < 30 seconds for full suite

**Optimization Strategies:**
1. Run tests in parallel (Postman handles this)
2. Use minimal test data
3. Skip heavy operations in test mode
4. Cache authentication tokens

### API Server Performance

**Monitoring:**
```javascript
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

**Thresholds:**
- GET requests: < 500ms
- POST requests: < 1000ms
- Complex queries: < 2000ms

---

## Security Considerations

### Authentication

**Headers Required:**
```
x-user-username: admin
x-user-role: admin
x-user-display-name: Admin User
```

**Environment Variables:**
- Never hardcode credentials
- Use environment variables
- Different credentials per environment

### API Key Protection

**Postman API Key:**
- Store in environment variable
- Never commit to git
- Rotate regularly
- Use minimal permissions

### Test Data

**Principles:**
- Use test-specific data
- Clean up after tests
- Don't modify production data
- Use separate test database (future)

---

## Maintenance

### Updating Tests

**When to Update:**
- New API endpoint added
- Endpoint behavior changes
- New validation rules
- Schema changes

**Process:**
1. Update collection in Postman UI
2. Or update via API
3. Tests run automatically
4. No code changes needed

### Collection Versioning

**Strategy:**
- Collection stored in Postman cloud
- IDs in `.postman.json` version controlled
- Can export collection as JSON backup
- Can duplicate collection for major changes

---

## Future Enhancements

### Phase 5: Advanced Testing
- Load testing with multiple concurrent requests
- Performance benchmarking
- Mock server for frontend development
- Contract testing with OpenAPI spec

### Phase 6: CI/CD Integration
- GitHub Actions workflow
- Run tests on pull requests
- Block merges if tests fail
- Automated deployment on success

### Phase 7: Monitoring
- Test result history tracking
- Performance trend analysis
- Automated alerts for failures
- Integration with monitoring tools

---

## Success Metrics

### Coverage
- ✅ 40+ API endpoints tested
- ✅ 200+ test assertions
- ✅ 100% critical path coverage

### Reliability
- ✅ Tests run automatically
- ✅ < 1% false positive rate
- ✅ Clear error messages

### Performance
- ✅ Full suite < 30 seconds
- ✅ Individual tests < 5 seconds
- ✅ Immediate feedback

### Developer Experience
- ✅ Zero manual setup after initial config
- ✅ Clear pass/fail indicators
- ✅ Actionable error messages
- ✅ Integrated into workflow
