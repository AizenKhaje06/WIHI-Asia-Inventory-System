# Bundles API - Type Changes Test Guide

## Date: March 6, 2026
## Change Type: Database Column Name Updates (camelCase → snake_case)

---

## Overview

The `Bundle` type in `lib/types.ts` was updated to match the database schema's snake_case column naming convention. This ensures consistency between TypeScript types and Supabase database columns.

## Changes Made

### Type Definition Updates

| Old (camelCase) | New (snake_case) | Type |
|----------------|------------------|------|
| `salesChannel` | `sales_channel` | string? |
| `bundlePrice` | `bundle_price` | number |
| `bundleCost` | `bundle_cost` | number |
| `regularPrice` | `regular_price` | number |
| `savingsPercentage` | `savings_percentage` | number? |
| `reorderLevel` | `reorder_level` | number |
| `isActive` | `is_active` | boolean |
| `createdAt` | `created_at` | string |
| `updatedAt` | `updated_at` | string |
| `imageUrl` | `image_url` | string? |

## API Endpoint: `/api/bundles`

### GET /api/bundles

**Purpose**: Retrieve all bundles with optional filtering

**Query Parameters**:
- `store` (optional) - Filter by store name
- `activeOnly` (optional, default: true) - Only return active bundles

**Response Format**:
```json
[
  {
    "id": "BUNDLE-1234567890",
    "name": "Starter Pack",
    "description": "Perfect for beginners",
    "category": "Electronics",
    "store": "Main Store",
    "sales_channel": "Shopee",
    "bundle_price": 1500.00,
    "bundle_cost": 900.00,
    "regular_price": 2000.00,
    "savings": 500.00,
    "savings_percentage": 25.00,
    "quantity": 10,
    "reorder_level": 5,
    "sku": "BUNDLE-001",
    "is_active": true,
    "created_at": "2026-03-06T10:00:00Z",
    "updated_at": "2026-03-06T10:00:00Z",
    "image_url": null,
    "badge": "Best Seller"
  }
]
```

### POST /api/bundles

**Purpose**: Create a new bundle

**Request Body**:
```json
{
  "name": "Starter Pack",
  "description": "Perfect for beginners",
  "category": "Electronics",
  "store": "Main Store",
  "salesChannel": "Shopee",
  "bundlePrice": 1500.00,
  "items": [
    { "itemId": "ITEM-001", "quantity": 2 },
    { "itemId": "ITEM-002", "quantity": 1 }
  ],
  "sku": "BUNDLE-001",
  "badge": "Best Seller"
}
```

**Note**: The API still accepts camelCase in the request body for backward compatibility, but stores data in snake_case format.

**Response**: Returns the created bundle with snake_case field names

---

## Manual Testing Guide

### Prerequisites
1. Development server running: `npm run dev`
2. Supabase database accessible
3. Valid inventory items in database
4. PowerShell or curl available

### Test 1: GET All Bundles

**PowerShell**:
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/bundles" -Method GET
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Result**:
- Status: 200
- Returns array of bundles
- All field names in snake_case
- `is_active`, `bundle_price`, `sales_channel` fields present

**Validation**:
- [ ] Response is valid JSON
- [ ] All bundles have snake_case field names
- [ ] `bundle_price` is a number
- [ ] `is_active` is a boolean
- [ ] `created_at` is ISO date string

### Test 2: GET Bundles by Store

**PowerShell**:
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/bundles?store=Main%20Store" -Method GET
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Result**:
- Status: 200
- Only bundles from "Main Store"
- All field names in snake_case

### Test 3: GET Including Inactive Bundles

**PowerShell**:
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/bundles?activeOnly=false" -Method GET
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Result**:
- Status: 200
- Includes bundles where `is_active` is false

### Test 4: POST Create Bundle (Success)

**PowerShell**:
```powershell
$body = @{
    name = "Test Bundle"
    description = "Test bundle for API validation"
    category = "Electronics"
    store = "Main Store"
    salesChannel = "Shopee"
    bundlePrice = 1500
    items = @(
        @{ itemId = "ITEM-001"; quantity = 2 },
        @{ itemId = "ITEM-002"; quantity = 1 }
    )
    sku = "TEST-BUNDLE-001"
    badge = "New"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/bundles" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Result**:
- Status: 201
- Returns created bundle
- All fields in snake_case
- `bundle_cost` calculated correctly
- `regular_price` calculated correctly
- `savings` = regular_price - bundle_price
- `is_active` = true

**Validation**:
- [ ] Bundle created successfully
- [ ] `bundle_price` matches input
- [ ] `bundle_cost` calculated from item costs
- [ ] `regular_price` calculated from item prices
- [ ] `savings` = regular_price - bundle_price
- [ ] `sales_channel` stored correctly
- [ ] `is_active` = true
- [ ] `created_at` is current timestamp

### Test 5: POST Missing Required Fields

**PowerShell**:
```powershell
$body = @{
    name = "Incomplete Bundle"
    category = "Electronics"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/bundles" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -SkipHttpErrorCheck

$response.StatusCode
$response.Content | ConvertFrom-Json
```

**Expected Result**:
- Status: 400
- Error message lists missing fields: store, bundlePrice, items

### Test 6: POST Price Below Cost

**PowerShell**:
```powershell
$body = @{
    name = "Low Price Bundle"
    category = "Electronics"
    store = "Main Store"
    bundlePrice = 10
    items = @(
        @{ itemId = "ITEM-001"; quantity = 5 }
    )
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/bundles" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -SkipHttpErrorCheck

$response.StatusCode
$response.Content | ConvertFrom-Json
```

**Expected Result**:
- Status: 400
- Error: "Bundle price cannot be below cost"

### Test 7: POST Invalid Item IDs

**PowerShell**:
```powershell
$body = @{
    name = "Invalid Items Bundle"
    category = "Electronics"
    store = "Main Store"
    bundlePrice = 1000
    items = @(
        @{ itemId = "INVALID-ID"; quantity = 1 }
    )
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/bundles" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -SkipHttpErrorCheck

$response.StatusCode
$response.Content | ConvertFrom-Json
```

**Expected Result**:
- Status: 400
- Error: "No valid items found in inventory"

---

## Database Verification

### Check Bundle Created Correctly

```sql
-- View created bundle
SELECT * FROM bundles 
WHERE id = 'BUNDLE-1234567890'
ORDER BY created_at DESC 
LIMIT 1;

-- Verify snake_case columns exist
SELECT 
  id,
  name,
  sales_channel,
  bundle_price,
  bundle_cost,
  regular_price,
  is_active,
  created_at
FROM bundles
LIMIT 5;

-- Check bundle items
SELECT * FROM bundle_items
WHERE bundle_id = 'BUNDLE-1234567890';
```

### Verify Column Names

```sql
-- List all columns in bundles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bundles'
ORDER BY ordinal_position;
```

**Expected Columns**:
- `id` (text)
- `name` (text)
- `description` (text)
- `category` (text)
- `store` (text)
- `sales_channel` (text)
- `bundle_price` (numeric)
- `bundle_cost` (numeric)
- `regular_price` (numeric)
- `savings` (numeric)
- `quantity` (integer)
- `reorder_level` (integer)
- `sku` (text)
- `is_active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `image_url` (text)
- `badge` (text)

---

## Frontend Integration Testing

### Settings Page - Bundles Tab

1. Navigate to `/dashboard/settings`
2. Click "Bundles" tab
3. Click "Create Bundle" button
4. Fill in form and submit
5. Verify bundle appears in list
6. Check that all fields display correctly

**Validation**:
- [ ] Bundle price displays correctly
- [ ] Savings calculation is accurate
- [ ] Sales channel displays if set
- [ ] Active/Inactive status shows correctly

---

## TypeScript Compilation Check

```powershell
# Check for TypeScript errors
npx tsc --noEmit
```

**Expected Result**:
- No compilation errors
- All type references updated correctly

---

## Automated Testing (When Postman Configured)

### Postman Collection Structure

**Collection Name**: "Bundles API Tests"

**Requests**:
1. GET All Bundles
2. GET Bundles by Store
3. GET Including Inactive
4. POST Create Bundle (Valid)
5. POST Create Bundle (Missing Fields)
6. POST Create Bundle (Price Below Cost)
7. POST Create Bundle (Invalid Items)

**Environment Variables**:
- `base_url`: http://localhost:3000
- `test_store`: Main Store
- `test_item_id_1`: ITEM-001
- `test_item_id_2`: ITEM-002

### Test Scripts

**GET All Bundles**:
```javascript
pm.test("Status is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response is array", () => {
    pm.expect(pm.response.json()).to.be.an('array');
});

pm.test("Bundles have snake_case fields", () => {
    const bundles = pm.response.json();
    if (bundles.length > 0) {
        pm.expect(bundles[0]).to.have.property('bundle_price');
        pm.expect(bundles[0]).to.have.property('is_active');
        pm.expect(bundles[0]).to.have.property('sales_channel');
    }
});
```

**POST Create Bundle**:
```javascript
pm.test("Status is 201", () => {
    pm.response.to.have.status(201);
});

pm.test("Bundle created with correct fields", () => {
    const bundle = pm.response.json();
    pm.expect(bundle).to.have.property('id');
    pm.expect(bundle).to.have.property('bundle_price');
    pm.expect(bundle).to.have.property('bundle_cost');
    pm.expect(bundle).to.have.property('regular_price');
    pm.expect(bundle).to.have.property('savings');
    pm.expect(bundle.is_active).to.be.true;
});

pm.test("Savings calculated correctly", () => {
    const bundle = pm.response.json();
    const expectedSavings = bundle.regular_price - bundle.bundle_price;
    pm.expect(bundle.savings).to.equal(expectedSavings);
});
```

---

## Common Issues & Solutions

### Issue 1: TypeScript Errors

**Symptom**: `Property 'bundlePrice' does not exist on type 'Bundle'`

**Solution**: Update all references to use snake_case:
```typescript
// OLD
bundle.bundlePrice

// NEW
bundle.bundle_price
```

### Issue 2: Database Column Not Found

**Symptom**: `column "bundlePrice" does not exist`

**Solution**: Verify migration ran correctly:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bundles';
```

### Issue 3: Frontend Display Issues

**Symptom**: Bundle data not displaying correctly

**Solution**: Update component to use snake_case:
```typescript
// OLD
<div>{bundle.bundlePrice}</div>

// NEW
<div>{bundle.bundle_price}</div>
```

---

## Testing Checklist

### API Tests
- [ ] GET /api/bundles returns 200
- [ ] GET /api/bundles returns array
- [ ] All bundles have snake_case fields
- [ ] GET with store filter works
- [ ] GET with activeOnly=false works
- [ ] POST creates bundle successfully
- [ ] POST validates required fields
- [ ] POST validates price vs cost
- [ ] POST validates item IDs
- [ ] POST calculates costs correctly
- [ ] POST calculates savings correctly

### Database Tests
- [ ] Bundles table has snake_case columns
- [ ] Bundle created in database
- [ ] Bundle_items created correctly
- [ ] Foreign keys work correctly
- [ ] Timestamps auto-populate

### Frontend Tests
- [ ] Settings page loads bundles
- [ ] Create bundle form works
- [ ] Bundle list displays correctly
- [ ] All fields show proper values
- [ ] Edit/delete functions work

### TypeScript Tests
- [ ] No compilation errors
- [ ] All type references updated
- [ ] IDE autocomplete works
- [ ] No type mismatches

---

## Next Steps

1. **Configure Postman** (see POSTMAN_SETUP_GUIDE.md)
2. **Run manual tests** using PowerShell commands above
3. **Verify database** using SQL queries
4. **Test frontend** in Settings page
5. **Create Postman collection** for automated testing

---

## Status

- ✅ Type definitions updated
- ✅ API code reviewed (already uses snake_case)
- ⏳ Manual testing needed
- ⏳ Postman configuration needed
- ⏳ Automated tests needed

**Priority**: HIGH - Type changes affect data integrity
**Impact**: Medium - API already uses correct format
**Risk**: Low - Backward compatible

---

**Date**: March 6, 2026
**Change**: Type definition alignment with database schema
**Files Modified**: `lib/types.ts`
**Files Reviewed**: `app/api/bundles/route.ts`
