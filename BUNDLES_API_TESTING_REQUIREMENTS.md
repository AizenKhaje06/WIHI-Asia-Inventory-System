# Bundles API - Testing Requirements Summary

## Date: March 5, 2026
## Status: ⏳ Ready for Testing (Postman Not Configured)

---

## Overview

New Bundle Product types have been added to the system (`lib/types.ts`), enabling the creation and management of product bundles - packages of multiple items sold together at a discounted price.

## What Was Added

### 1. TypeScript Types (lib/types.ts)
- `Bundle` - Main bundle interface with pricing, inventory, and metadata
- `BundleItemDetail` - Component items within a bundle
- `CreateBundleRequest` - Request payload for creating bundles

### 2. API Endpoint (app/api/bundles/route.ts)
- `GET /api/bundles` - List bundles with optional filters
- `POST /api/bundles` - Create new bundle with automatic calculations

### 3. Database Tables (migration 020)
- `bundles` - Main bundle records
- `bundle_items` - Junction table for bundle components

---

## Key Features

### Automatic Calculations
The system automatically calculates:
1. **Bundle Cost** = Sum of (item.cost_price × quantity) for all items
2. **Regular Price** = Sum of (item.selling_price × quantity) for all items
3. **Savings** = Regular Price - Bundle Price
4. **Savings Percentage** = (Savings / Regular Price) × 100

### Example
```
Bundle: "Starter Pack"
Items:
  - Product A (cost: ₱100, price: ₱150) × 2 = ₱200 cost, ₱300 regular
  - Product B (cost: ₱200, price: ₱300) × 1 = ₱200 cost, ₱300 regular

Calculations:
  Bundle Cost: ₱400
  Regular Price: ₱600
  Bundle Price: ₱500 (set by user)
  Savings: ₱100
  Savings %: 16.67%
```

---

## API Testing Requirements

### Critical Test Cases

#### 1. List Bundles
```http
GET /api/bundles
GET /api/bundles?store=Main Store
GET /api/bundles?activeOnly=true
```
**Validations:**
- Returns array of bundles
- Filters work correctly
- Ordered by created_at descending

#### 2. Create Bundle (Most Important)
```http
POST /api/bundles
Content-Type: application/json

{
  "name": "Starter Pack",
  "description": "Perfect for beginners",
  "category": "Bundles",
  "store": "Main Store",
  "salesChannel": "Shopee",
  "bundlePrice": 1500.00,
  "items": [
    { "itemId": "ITEM-001", "quantity": 2 },
    { "itemId": "ITEM-002", "quantity": 1 }
  ],
  "reorderLevel": 10,
  "sku": "BUNDLE-STARTER-001",
  "badge": "Best Value"
}
```

**Validations:**
- ✅ Bundle ID generated (BUNDLE-{timestamp})
- ✅ Bundle cost calculated from item costs
- ✅ Regular price calculated from item selling prices
- ✅ Savings = regularPrice - bundlePrice
- ✅ All component items exist in database
- ✅ Bundle items created in bundle_items table
- ✅ is_active defaults to true
- ✅ Timestamps set correctly

#### 3. Validation Tests
```http
POST /api/bundles (missing name)
POST /api/bundles (missing items)
POST /api/bundles (invalid item IDs)
POST /api/bundles (zero or negative price)
```

**Expected:**
- 400 status for missing required fields
- 500 or validation error for invalid items
- Proper error messages

---

## Known Issues

### 1. Deprecated Method
**File:** `app/api/bundles/route.ts`
**Issue:** Uses `substr()` which is deprecated
**Line:** `Math.random().toString(36).substr(2, 9)`
**Fix:** Replace with `substring(2, 11)`

### 2. Missing Validations
- No check for negative or zero bundle prices
- No check for bundle price > regular price (invalid discount)
- No minimum savings percentage requirement
- No validation for duplicate SKUs

### 3. Edge Cases Not Handled
- What happens if an item is deleted after bundle creation?
- What happens if item prices change?
- Should bundles have their own inventory or track component availability?

---

## Postman Configuration Status

### Current State: ⚠️ NOT CONFIGURED

The `.postman.json` file exists but is empty:
```json
{
  "workspaceId": "",
  "workspaceName": "WIHI Asia Inventory System",
  "collections": [],
  "environments": []
}
```

### What's Needed:
1. **Postman API Key** - Set `POSTMAN_API_KEY` environment variable
2. **Create Workspace** - Generate workspace ID
3. **Create Collection** - Add all API endpoints including Bundles
4. **Create Environment** - Configure base_url and auth headers
5. **Update .postman.json** - Save IDs for automation

### Setup Guide:
See `POSTMAN_SETUP_GUIDE.md` for detailed instructions.

---

## Testing Priority

### Phase 1: Manual Testing (Immediate)
Use PowerShell or cURL to test the Bundles API:

```powershell
# List bundles
Invoke-WebRequest -Uri "http://localhost:3000/api/bundles" -Method GET

# Create bundle (requires valid item IDs)
$body = @{
  name = "Test Bundle"
  category = "Bundles"
  store = "Main Store"
  bundlePrice = 1000
  items = @(
    @{ itemId = "ITEM-001"; quantity = 2 }
  )
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/bundles" -Method POST -Body $body -ContentType "application/json"
```

### Phase 2: Postman Setup (Next)
1. Configure Postman API key
2. Create collection with Bundles endpoints
3. Add test scripts for validations
4. Run collection and verify results

### Phase 3: Automation (Future)
1. Hook triggers on API file changes
2. Tests run automatically
3. Results displayed in IDE

---

## Requirements Document Updated

The API testing requirements document has been updated with:
- ✅ Bundles API added to High Priority endpoints
- ✅ 12 comprehensive test cases for Bundles API
- ✅ Validation scenarios for edge cases
- ✅ Business logic verification tests
- ✅ Notes about known issues and improvements

**File:** `.kiro/specs/api-testing-automation/requirements.md`

---

## Next Steps

### For Testing:
1. **Start dev server**: `npm run dev`
2. **Get valid item IDs** from database or `/api/items`
3. **Test GET endpoint** to verify it returns empty array
4. **Test POST endpoint** with valid data
5. **Verify calculations** are correct
6. **Test edge cases** (invalid items, missing fields)

### For Postman:
1. **Set API key**: Follow `POSTMAN_SETUP_GUIDE.md`
2. **Restart Kiro** to load Postman power
3. **Create collection** with Bundles endpoints
4. **Add test scripts** for validations
5. **Run tests** and fix any failures

### For Code Quality:
1. **Fix deprecated substr()** in bundles API
2. **Add price validations** (positive, less than regular)
3. **Add SKU uniqueness check**
4. **Consider soft delete** instead of hard delete
5. **Add inventory tracking** for bundles

---

## Summary

The Bundles API has been successfully added to the system with automatic cost and savings calculations. The requirements document has been updated with comprehensive test cases. However, Postman is not yet configured, so automated testing cannot proceed until the API key is set up.

**Immediate Action Required:**
- Configure Postman API key to enable automated testing
- OR manually test the Bundles API using PowerShell/cURL

**Status**: ✅ Requirements Updated, ⏳ Awaiting Postman Configuration

---

**Date**: March 5, 2026
**Priority**: HIGH - New Feature
**Impact**: Core Business Logic (Pricing Calculations)
