# API Testing Automation - Requirements

## Overview
Implement automated API testing using Postman to ensure all inventory system endpoints work correctly after code changes. The system should automatically run tests when API files are modified and provide detailed feedback on any failures.

## User Stories

### 1. As a developer, I want automated API tests to run when I modify API code
**Acceptance Criteria:**
- 1.1 When any API route file is saved, tests automatically trigger
- 1.2 Tests run against the local development server (http://localhost:3000)
- 1.3 Test results are displayed in the IDE with pass/fail status
- 1.4 Failed tests show clear error messages and expected vs actual values

### 2. As a developer, I want a comprehensive Postman collection covering all API endpoints
**Acceptance Criteria:**
- 2.1 Collection includes all major API routes:
  - `/api/departments` (GET)
  - `/api/departments/[id]` (GET) - Recently modified
  - `/api/stores` (GET, POST)
  - `/api/stores/[id]` (PUT, DELETE)
  - `/api/items` (GET)
  - `/api/internal-usage` (GET)
  - `/api/orders` (GET)
  - `/api/reports` (GET)
  - `/api/dashboard` (GET)
  - `/api/analytics` (GET)
  - `/api/customers` (GET)
  - `/api/sales` (POST)
  - `/api/logs` (GET)
- 2.2 Each request includes proper authentication headers
- 2.3 Each request has test scripts validating response structure and data

### 3. As a developer, I want environment-specific configurations
**Acceptance Criteria:**
- 3.1 Local environment configured with `base_url: http://localhost:3000`
- 3.2 Authentication credentials stored as environment variables
- 3.3 Easy switching between local/staging/production environments

### 4. As a developer, I want test scripts that validate API responses
**Acceptance Criteria:**
- 4.1 Status code validation (200, 201, 400, 401, 404, 500)
- 4.2 Response schema validation (correct fields present)
- 4.3 Data type validation (strings, numbers, arrays, objects)
- 4.4 Business logic validation (e.g., profit = revenue - cost)
- 4.5 Date range filtering validation

### 5. As a developer, I want the Postman collection to be version controlled
**Acceptance Criteria:**
- 5.1 Collection ID stored in `.postman.json`
- 5.2 Workspace ID stored in `.postman.json`
- 5.3 Environment ID stored in `.postman.json`
- 5.4 Configuration file committed to git

## API Endpoints to Test

### High Priority (Core Business Logic)
1. **Departments API** - Sales channel analytics
   - `GET /api/departments` - List all departments with metrics
   - `GET /api/departments/[id]` - Detailed department analytics (RECENTLY MODIFIED)
   
2. **Stores API** - Store management
   - `GET /api/stores` - List all stores
   - `POST /api/stores` - Create new store
   - `PUT /api/stores/[id]` - Update store
   - `DELETE /api/stores/[id]` - Delete store

3. **Orders API** - Order management (RECENTLY MODIFIED - March 4, 2026)
   - `GET /api/orders` - List orders with filters
   - `POST /api/orders` - Create new order
   - `PATCH /api/orders/[id]` - Update order details
   - `DELETE /api/orders/[id]` - Delete order (NEW)

4. **Sales API** - Transaction creation
   - `POST /api/sales` - Create sale transaction

5. **Reports API** - Business reporting
   - `GET /api/reports` - Sales reports with filters

### Medium Priority (Data Retrieval)
5. **Items API** - Inventory items
   - `GET /api/items` - List all inventory items

6. **Orders API** - Order management
   - `GET /api/orders` - List orders with filters

7. **Dashboard API** - Dashboard metrics
   - `GET /api/dashboard` - Dashboard summary data

8. **Internal Usage API** - Internal consumption tracking
   - `GET /api/internal-usage` - Internal usage transactions

### Lower Priority (Supporting Features)
9. **Customers API** - Customer management
   - `GET /api/customers` - List customers

10. **Logs API** - Activity logs
    - `GET /api/logs` - System activity logs

11. **Analytics API** - Business analytics
    - `GET /api/analytics` - Analytics data

## Test Scenarios

### Department Detail API Tests (Priority: HIGH)
**Endpoint:** `GET /api/departments/[id]`

**Recent Changes:** Added console logging for parcel status debugging (March 4, 2026)

**Test Cases:**
1. **Valid department with date range**
   - Request: `GET /api/departments/Shopee?startDate=2026-01-01&endDate=2026-03-31`
   - Expected: 200 status, department object with metrics, cashFlow, topProducts, storeBreakdown
   - Validations:
     - `metrics.totalRevenue` is a number
     - `metrics.profitMargin` = (profit / revenue) * 100
     - `cashFlow` is an array with date, revenue, cost, profit
     - `topProducts` sorted by revenue descending
     - `storeBreakdown` contains store-level data
     - Console logs show: "Fetching parcel status for: Shopee"
     - Console logs show orders query result with count

2. **Department without date range**
   - Request: `GET /api/departments/Lazada`
   - Expected: 200 status, all-time data for Lazada

3. **Non-existent department**
   - Request: `GET /api/departments/InvalidChannel`
   - Expected: 200 status with empty/zero metrics

4. **Special characters in department name**
   - Request: `GET /api/departments/Physical%20Store`
   - Expected: 200 status, properly decoded department name

5. **Parcel status counts validation (CRITICAL - Recently Modified)**
   - Request: `GET /api/departments/Shopee`
   - Expected: `parcelStatusCounts` object with pending, inTransit, delivered, total
   - New Debug Logging:
     - Console should log: "[Department Detail API] Fetching parcel status for: Shopee"
     - Console should log: "[Department Detail API] Orders query result" with ordersCount, error, sampleOrder
     - Console should log: "[Department Detail API] Parcel status counts" with final counts
   - Validations:
     - `parcelStatusCounts.pending` is a number >= 0
     - `parcelStatusCounts.inTransit` is a number >= 0
     - `parcelStatusCounts.delivered` is a number >= 0
     - `parcelStatusCounts.total` = pending + inTransit + delivered
     - If orders table is accessible, counts should match actual data
     - If orders table is not accessible, parcelStatusCounts may be undefined (graceful degradation)

6. **Parcel status with date filtering**
   - Request: `GET /api/departments/TikTok?startDate=2026-02-01&endDate=2026-02-28`
   - Expected: Parcel status counts filtered by date range
   - Validations:
     - Only orders within date range are counted
     - Console logs show filtered query parameters

### Stores API Tests (Priority: HIGH)
**Endpoints:** Stores CRUD operations

**Test Cases:**
1. **List all stores**
   - Request: `GET /api/stores`
   - Expected: 200 status, array of stores with id, store_name, sales_channel

2. **Create new store**
   - Request: `POST /api/stores` with `{ store_name: "Test Store", sales_channel: "Shopee" }`
   - Expected: 201 status, created store object with id

3. **Update store**
   - Request: `PUT /api/stores/[id]` with updated data
   - Expected: 200 status, updated store object

4. **Delete store**
   - Request: `DELETE /api/stores/[id]`
   - Expected: 200 status, success message

### Orders API Tests (Priority: HIGH - NEW)
**Endpoints:** Orders CRUD operations

**Test Cases:**
1. **List orders with filters**
   - Request: `GET /api/orders?status=Packed`
   - Expected: 200 status, array of orders filtered by status
   - Validations:
     - All returned orders have status = 'Packed'
     - Response includes customer info, parcel status, payment status

2. **Create new order**
   - Request: `POST /api/orders` with order data
   - Expected: 201 status, created order object
   - Validations:
     - Order ID generated
     - All required fields present
     - Timestamps set correctly

3. **Update order details (PATCH)**
   - Request: `PATCH /api/orders/[id]` with:
     ```json
     {
       "customer_name": "Updated Name",
       "customer_contact": "09171234567",
       "customer_address": "Updated Address",
       "courier": "J&T Express",
       "waybill": "JT123456789"
     }
     ```
   - Expected: 200 status, updated order object
   - Validations:
     - All updated fields reflect changes
     - `updated_at` timestamp is current
     - Other fields remain unchanged

4. **Delete order (NEW - March 4, 2026)**
   - Request: `DELETE /api/orders/[id]`
   - Expected: 200 status, success response
   - Response format:
     ```json
     {
       "success": true,
       "message": "Order deleted successfully"
     }
     ```
   - Validations:
     - Order is removed from database
     - Subsequent GET returns 404 or empty
     - Related order_items are handled (cascade or manual)

5. **Delete non-existent order**
   - Request: `DELETE /api/orders/invalid-id`
   - Expected: 200 status (Supabase returns success even if no rows affected)
   - Note: Consider adding validation to return 404 if order doesn't exist

6. **Update order status**
   - Request: `PATCH /api/orders/[id]/status` with status changes
   - Expected: 200 status, updated order with new status
   - Validations:
     - Status transitions are valid
     - Parcel status updates correctly
     - Payment status updates correctly

## Authentication Requirements

All API requests must include authentication headers:
```
x-user-username: admin
x-user-role: admin
x-user-display-name: Admin User
```

## Success Criteria

### Phase 1: Setup (Complete when)
- ✅ Postman workspace created
- ✅ Collection created with folder structure
- ✅ Local environment configured
- ✅ IDs saved to `.postman.json`

### Phase 2: Core Tests (Complete when)
- ✅ Department API tests passing (all 5 test cases)
- ✅ Stores API tests passing (all 4 test cases)
- ✅ Sales API test passing
- ✅ Reports API test passing

### Phase 3: Automation (Complete when)
- ✅ Hook triggers on API file changes
- ✅ Tests run automatically
- ✅ Results displayed in IDE
- ✅ Failed tests show actionable error messages

### Phase 4: Coverage (Complete when)
- ✅ All 11 API endpoints have tests
- ✅ All tests include response validation
- ✅ Business logic validated (calculations, filtering)
- ✅ Edge cases covered (empty data, invalid input)

## Non-Functional Requirements

### Performance
- Test suite completes in < 30 seconds
- Individual requests timeout after 10 seconds

### Reliability
- Tests are idempotent (can run multiple times)
- Tests clean up after themselves (delete test data)
- Tests don't interfere with production data

### Maintainability
- Test scripts are well-commented
- Collection organized in logical folders
- Environment variables used for configuration
- Clear naming conventions

## Dependencies

### External Services
- Postman API (requires API key)
- Local development server (must be running)
- Supabase database (must be accessible)

### Configuration Files
- `.postman.json` - Stores workspace/collection/environment IDs
- `.kiro/hooks/api-postman-testing.kiro.hook` - Automation hook
- `.kiro/settings/mcp.json` - Postman MCP server config

## Constraints

- Postman API key must be configured before use
- Development server must be running on port 3000
- Tests require valid authentication credentials
- Some endpoints require specific data to exist in database

## Future Enhancements

### Phase 5: Advanced Testing
- Load testing with multiple concurrent requests
- Performance benchmarking
- Mock server for frontend development
- Contract testing with OpenAPI spec
- Automated regression testing on CI/CD

### Phase 6: Monitoring
- Test result history tracking
- Performance trend analysis
- Automated alerts for test failures
- Integration with monitoring tools

## Notes

- The Department Detail API was recently modified to add `createClient` import
- This suggests new functionality for parcel status tracking from orders table
- Tests should validate the new parcel status counts feature
- Focus on testing the recently modified endpoint first
- **March 4, 2026 Update**: Added debug console logging to Department Detail API for troubleshooting parcel status queries
  - Logs show: department name, orders query results, and final parcel status counts
  - This helps diagnose issues with orders table access or data filtering
  - Tests should verify console output matches expected behavior
- **March 4, 2026 - Orders API Enhancement**: Added DELETE endpoint to `/api/orders/[id]`
  - Allows deletion of orders from the system
  - Returns success message on completion
  - Important: Verify cascade behavior with related tables (order_items)
  - Consider adding soft delete (deleted_at timestamp) instead of hard delete for audit trail
  - Test edge cases: non-existent orders, orders with related data, permission checks
