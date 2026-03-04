# Orders DELETE Endpoint - Manual Test Guide

## Overview
A new DELETE endpoint has been added to `/api/orders/[id]` to allow deletion of orders from the system.

**Date Added**: March 4, 2026
**File**: `app/api/orders/[id]/route.ts`

## Endpoint Details

### DELETE /api/orders/[id]

**Purpose**: Delete an order from the orders table

**Method**: DELETE

**URL**: `http://localhost:3000/api/orders/[id]`

**Authentication**: Requires authentication headers (if implemented)

**Request Body**: None

**Response Format**:
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**Error Response**:
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Manual Testing Steps

### Prerequisites
1. Development server must be running: `npm run dev`
2. Database must be accessible
3. You need a valid order ID to test with

### Test 1: Delete Existing Order (Success Case)

**Step 1**: Get a test order ID
```bash
# Open Track Orders page or query database
# Example order ID: "ORD-123456"
```

**Step 2**: Send DELETE request using PowerShell
```powershell
$orderId = "ORD-123456"  # Replace with actual order ID
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/orders/$orderId" -Method DELETE -ContentType "application/json"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Result**:
- Status Code: 200
- Response Body:
  ```json
  {
    "success": true,
    "message": "Order deleted successfully"
  }
  ```

**Step 3**: Verify deletion
```powershell
# Try to fetch the deleted order
$verifyResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/orders/$orderId" -Method GET -ContentType "application/json"
# Should return 404 or empty result
```

### Test 2: Delete Non-Existent Order

**Step 1**: Send DELETE request with invalid ID
```powershell
$invalidId = "INVALID-ORDER-ID"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/orders/$invalidId" -Method DELETE -ContentType "application/json"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Result**:
- Status Code: 200 (Supabase returns success even if no rows affected)
- Response Body:
  ```json
  {
    "success": true,
    "message": "Order deleted successfully"
  }
  ```

**Note**: Consider adding validation to check if order exists before deletion and return 404 if not found.

### Test 3: Delete Order with Related Data

**Purpose**: Test cascade behavior with order_items table

**Step 1**: Create an order with items (or use existing)

**Step 2**: Delete the order
```powershell
$orderId = "ORD-WITH-ITEMS"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/orders/$orderId" -Method DELETE -ContentType "application/json"
```

**Step 3**: Check if related order_items are also deleted
```sql
-- Run in Supabase SQL Editor
SELECT * FROM order_items WHERE order_id = 'ORD-WITH-ITEMS';
-- Should return empty if cascade delete is configured
```

### Test 4: Error Handling

**Step 1**: Test with malformed request
```powershell
# Test with special characters
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/orders/'; DROP TABLE orders; --" -Method DELETE -ContentType "application/json"
```

**Expected Result**:
- Should handle SQL injection safely
- Return appropriate error message

## Using cURL (Alternative)

### Test 1: Delete Order
```bash
curl -X DELETE http://localhost:3000/api/orders/ORD-123456 \
  -H "Content-Type: application/json"
```

### Test 2: Delete with Authentication (if required)
```bash
curl -X DELETE http://localhost:3000/api/orders/ORD-123456 \
  -H "Content-Type: application/json" \
  -H "x-user-username: admin" \
  -H "x-user-role: admin" \
  -H "x-user-display-name: Admin User"
```

## Using Postman (Once Configured)

### Setup
1. Create new request in Postman
2. Set method to DELETE
3. Set URL: `{{base_url}}/api/orders/{{order_id}}`
4. Add environment variables:
   - `base_url`: http://localhost:3000
   - `order_id`: Your test order ID

### Test Script
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response has message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData.message).to.equal('Order deleted successfully');
});
```

## Database Verification

### Check Order Exists Before Delete
```sql
SELECT * FROM orders WHERE id = 'ORD-123456';
```

### Check Order Deleted After Delete
```sql
SELECT * FROM orders WHERE id = 'ORD-123456';
-- Should return empty
```

### Check Related Tables
```sql
-- Check if order_items are also deleted (cascade)
SELECT * FROM order_items WHERE order_id = 'ORD-123456';

-- Check if any logs reference the deleted order
SELECT * FROM logs WHERE item_id = 'ORD-123456';
```

## Important Considerations

### 1. Soft Delete vs Hard Delete
**Current Implementation**: Hard delete (permanently removes from database)

**Recommendation**: Consider implementing soft delete for audit trail:
```typescript
// Instead of DELETE, use UPDATE
.update({ deleted_at: new Date().toISOString() })
.eq('id', params.id)
```

**Benefits**:
- Maintains audit trail
- Can restore accidentally deleted orders
- Preserves historical data for reports
- Complies with data retention policies

### 2. Cascade Behavior
**Check Database Schema**:
```sql
-- View foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'orders';
```

### 3. Permission Checks
**Current Implementation**: No permission checks

**Recommendation**: Add role-based access control:
```typescript
// Check if user has permission to delete orders
const userRole = request.headers.get('x-user-role')
if (userRole !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

### 4. Inventory Restoration
**Important**: When deleting an order, consider:
- Should inventory be restored?
- Should related transactions be reversed?
- Should customer be notified?

**Recommendation**: Add inventory restoration logic:
```typescript
// Before deleting order, restore inventory
const order = await supabase.from('orders').select('*').eq('id', params.id).single()
// Restore inventory quantities
// Then delete order
```

## Testing Checklist

- [ ] Delete existing order returns 200 with success message
- [ ] Deleted order no longer appears in database
- [ ] Delete non-existent order handles gracefully
- [ ] Related order_items are handled correctly (cascade or manual)
- [ ] No SQL injection vulnerabilities
- [ ] Error messages are clear and helpful
- [ ] Console logs show appropriate information
- [ ] Performance is acceptable (< 500ms)
- [ ] Concurrent delete requests handled safely
- [ ] Transaction rollback works on error

## Known Issues / Improvements Needed

1. **No 404 for Non-Existent Orders**: Currently returns 200 even if order doesn't exist
   - **Fix**: Add check before delete and return 404 if not found

2. **No Permission Checks**: Anyone can delete orders
   - **Fix**: Add role-based access control

3. **Hard Delete**: Permanently removes data
   - **Fix**: Implement soft delete with deleted_at timestamp

4. **No Inventory Restoration**: Deleted orders don't restore inventory
   - **Fix**: Add logic to restore inventory quantities

5. **No Audit Trail**: No record of who deleted what and when
   - **Fix**: Add deletion log to audit table

6. **No Cascade Validation**: Unclear if related data is handled
   - **Fix**: Document cascade behavior and add tests

## Next Steps

1. **Test the endpoint** using the manual steps above
2. **Configure Postman** (see POSTMAN_SETUP_GUIDE.md)
3. **Create automated tests** in Postman collection
4. **Implement improvements** listed above
5. **Update API documentation** with DELETE endpoint details
6. **Add to requirements document** (already done)

---

**Status**: ✅ Endpoint Implemented, ⏳ Testing Needed
**Priority**: HIGH - Core functionality
**Date**: March 4, 2026
**File**: app/api/orders/[id]/route.ts
