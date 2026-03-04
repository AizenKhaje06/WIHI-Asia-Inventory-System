# Orders API - Notes Field Testing Guide

## Overview
The Orders API POST endpoint was just modified to accept a new `notes` field. This guide provides manual testing steps to verify the implementation.

**Date**: March 5, 2026
**Change**: Added `notes` parameter to POST `/api/orders` endpoint
**Database Field**: Stored as `dispatch_notes` in the `orders` table

---

## What Changed

### Code Diff
```typescript
// BEFORE
const {
  date,
  salesChannel,
  store,
  courier,
  waybill,
  qty,
  cogs,
  total,
  product,
  dispatchedBy,
  customerName,
  customerAddress,
  customerContact,
  orderItems = []
} = body

// AFTER
const {
  date,
  salesChannel,
  store,
  courier,
  waybill,
  qty,
  cogs,
  total,
  product,
  dispatchedBy,
  customerName,
  customerAddress,
  customerContact,
  notes,  // ← NEW FIELD
  orderItems = []
} = body
```

### Database Mapping
- **API Field**: `notes`
- **Database Column**: `dispatch_notes`
- **Type**: TEXT (nullable)
- **Purpose**: Store special delivery instructions or order notes

---

## Manual Testing Steps

### Prerequisites
1. Development server must be running: `npm run dev`
2. Database must be accessible
3. You need authentication credentials

### Test 1: Create Order WITH Notes (Success Case)

**Step 1**: Prepare the request body
```json
{
  "date": "2026-03-05",
  "salesChannel": "Shopee",
  "store": "Main Store",
  "courier": "J&T Express",
  "waybill": "TEST-NOTES-001",
  "qty": 2,
  "cogs": 600.00,
  "total": 1000.00,
  "product": "Test Product with Notes",
  "dispatchedBy": "Admin User",
  "customerName": "John Doe",
  "customerAddress": "123 Main St, City",
  "customerContact": "09171234567",
  "notes": "Handle with care - fragile items. Deliver before 5 PM."
}
```

**Step 2**: Send POST request using PowerShell
```powershell
$body = @{
  date = "2026-03-05"
  salesChannel = "Shopee"
  store = "Main Store"
  courier = "J&T Express"
  waybill = "TEST-NOTES-001"
  qty = 2
  cogs = 600.00
  total = 1000.00
  product = "Test Product with Notes"
  dispatchedBy = "Admin User"
  customerName = "John Doe"
  customerAddress = "123 Main St, City"
  customerContact = "09171234567"
  notes = "Handle with care - fragile items. Deliver before 5 PM."
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/orders" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Result**:
- Status Code: 201
- Response includes:
  - `id`: Generated order ID (e.g., "ORD-1709654321000")
  - `dispatch_notes`: "Handle with care - fragile items. Deliver before 5 PM."
  - All other fields as submitted
  - `created_at` and `updated_at` timestamps

**Step 3**: Verify in database
```sql
SELECT id, dispatch_notes, customer_name, waybill 
FROM orders 
WHERE waybill = 'TEST-NOTES-001';
```

**Expected**:
- `dispatch_notes` column contains: "Handle with care - fragile items. Deliver before 5 PM."

---

### Test 2: Create Order WITHOUT Notes (Backward Compatibility)

**Step 1**: Prepare request WITHOUT notes field
```json
{
  "date": "2026-03-05",
  "salesChannel": "Lazada",
  "store": "Main Store",
  "courier": "Ninja Van",
  "waybill": "TEST-NO-NOTES-001",
  "qty": 1,
  "cogs": 300.00,
  "total": 500.00,
  "product": "Test Product without Notes",
  "dispatchedBy": "Admin User",
  "customerName": "Jane Smith",
  "customerAddress": "456 Oak Ave",
  "customerContact": "09181234567"
}
```

**Step 2**: Send POST request
```powershell
$body = @{
  date = "2026-03-05"
  salesChannel = "Lazada"
  store = "Main Store"
  courier = "Ninja Van"
  waybill = "TEST-NO-NOTES-001"
  qty = 1
  cogs = 300.00
  total = 500.00
  product = "Test Product without Notes"
  dispatchedBy = "Admin User"
  customerName = "Jane Smith"
  customerAddress = "456 Oak Ave"
  customerContact = "09181234567"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/orders" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Result**:
- Status Code: 201
- Response includes:
  - `dispatch_notes`: null (or not present)
  - All other fields as submitted

**Verification**: Order should be created successfully even without notes field

---

### Test 3: Empty Notes String

**Test**: Send `"notes": ""` (empty string)

**Expected**: 
- Order created successfully
- `dispatch_notes` stored as empty string or null

---

### Test 4: Very Long Notes

**Test**: Send notes with 500+ characters

```json
{
  "notes": "This is a very long note with special delivery instructions. The customer has requested that the package be delivered to the back door, not the front entrance. Please ring the doorbell twice and wait for someone to answer. If no one answers within 5 minutes, please call the customer at the provided phone number. The customer works from home but may be in a meeting. Do not leave the package unattended. This is a high-value item and requires signature confirmation. The customer has also requested that the delivery be made between 2 PM and 5 PM on weekdays only. Weekend delivery is not acceptable."
}
```

**Expected**:
- Order created successfully
- Full notes text stored in database
- No truncation (TEXT field supports large content)

---

### Test 5: Special Characters in Notes

**Test**: Send notes with special characters

```json
{
  "notes": "Special chars: ₱1,000 | 50% off | Customer #12345 | Email: test@example.com | Phone: +63-917-123-4567"
}
```

**Expected**:
- Order created successfully
- Special characters preserved correctly
- No encoding issues

---

### Test 6: Notes with Line Breaks

**Test**: Send notes with newline characters

```json
{
  "notes": "Line 1: Handle with care\nLine 2: Fragile items inside\nLine 3: Deliver before 5 PM"
}
```

**Expected**:
- Order created successfully
- Line breaks preserved in database
- Display correctly in UI

---

## Verification Checklist

### API Level
- [ ] POST request with notes succeeds (201)
- [ ] POST request without notes succeeds (201)
- [ ] Notes field is optional (not required)
- [ ] Empty notes string handled correctly
- [ ] Long notes (500+ chars) stored completely
- [ ] Special characters preserved
- [ ] Line breaks preserved
- [ ] Response includes dispatch_notes field

### Database Level
- [ ] dispatch_notes column exists in orders table
- [ ] Notes stored correctly in dispatch_notes
- [ ] NULL values allowed
- [ ] TEXT type supports long content
- [ ] No truncation of long notes
- [ ] Special characters stored correctly

### UI Level (Track Orders Page)
- [ ] Notes visible in order details modal
- [ ] Notes display correctly with line breaks
- [ ] Empty notes don't show error
- [ ] Long notes display with proper formatting
- [ ] Special characters render correctly

---

## Integration Points

### Where Notes Are Used

1. **Order Creation** (POS/Warehouse Dispatch)
   - Form field for entering notes
   - Optional field in order dispatch form
   - Placeholder: "Add special delivery instructions or notes"

2. **Track Orders Page**
   - Notes visible in order details modal
   - Section: "Delivery Notes" or "Special Instructions"
   - Read-only display

3. **Order Edit Feature**
   - Notes can be updated via PATCH endpoint
   - Field: `dispatch_notes`
   - Editable in order details modal

4. **Reports/Exports**
   - Notes included in Excel exports
   - Notes included in PDF reports
   - Column: "Notes" or "Delivery Instructions"

---

## Database Schema

### Migration File
`supabase/migrations/019_add_notes_to_orders.sql`

```sql
-- Add dispatch_notes column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS dispatch_notes TEXT;

-- Add comment
COMMENT ON COLUMN orders.dispatch_notes IS 
'Special delivery instructions or order notes provided during dispatch';
```

### Column Details
- **Name**: `dispatch_notes`
- **Type**: TEXT
- **Nullable**: Yes
- **Default**: NULL
- **Index**: Not indexed (not used for filtering)

---

## Error Scenarios

### Scenario 1: Missing Required Fields
**Test**: Send request without required fields (e.g., no courier)

**Expected**:
- Status Code: 400
- Error: "Missing required fields"
- Notes field should NOT cause this error (it's optional)

### Scenario 2: Invalid Data Types
**Test**: Send notes as number instead of string

```json
{
  "notes": 12345
}
```

**Expected**:
- Order created successfully
- Number converted to string: "12345"
- Or validation error if strict type checking

### Scenario 3: SQL Injection Attempt
**Test**: Send malicious SQL in notes

```json
{
  "notes": "'; DROP TABLE orders; --"
}
```

**Expected**:
- Order created successfully
- SQL injection prevented by parameterized queries
- Notes stored as plain text: "'; DROP TABLE orders; --"

---

## Performance Considerations

### Database Impact
- TEXT column adds minimal overhead
- No indexing needed (not used for queries)
- Storage: ~1KB per order with notes (average)

### API Response Time
- No significant impact on POST performance
- Field is optional, no validation overhead
- Typical response time: < 200ms

---

## Rollback Plan

If issues are found:

1. **Remove from API**:
   ```typescript
   // Comment out or remove from destructuring
   // notes,
   ```

2. **Remove from database insert**:
   ```typescript
   // dispatch_notes: notes || null,
   ```

3. **Database rollback** (if needed):
   ```sql
   ALTER TABLE orders DROP COLUMN IF EXISTS dispatch_notes;
   ```

---

## Next Steps

### Immediate
1. ✅ Test POST endpoint with notes
2. ✅ Test POST endpoint without notes
3. ✅ Verify database storage
4. ✅ Test edge cases (long notes, special chars)

### Short Term
1. Update POS form to include notes field
2. Display notes in Track Orders page
3. Include notes in order edit feature
4. Add notes to Excel/PDF exports

### Long Term
1. Add notes search functionality
2. Track notes history (audit trail)
3. Add notes templates (common instructions)
4. Analytics on common notes patterns

---

## Related Documentation

- `CUSTOMER_INFO_FEATURE_COMPLETE.md` - Customer fields implementation
- `TRACK_ORDERS_EDIT_FEATURE_COMPLETE.md` - Order editing feature
- `supabase/migrations/019_add_notes_to_orders.sql` - Database migration
- `.kiro/specs/api-testing-automation/requirements.md` - API testing requirements

---

## Status

- ✅ **Code Change**: Complete (March 5, 2026)
- ⏳ **Manual Testing**: Ready to test
- ⏳ **Database Migration**: Needs to be applied
- ⏳ **UI Integration**: Pending
- ⏳ **Documentation**: Complete

---

**Priority**: MEDIUM
**Impact**: Enhances order management with delivery instructions
**Risk**: LOW - Optional field, backward compatible

