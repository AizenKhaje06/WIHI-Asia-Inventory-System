# API Authentication Update: Tracker Role Added

## Change Summary

**File Modified**: `lib/api-auth.ts`  
**Date**: June 2, 2026  
**Change**: Added `'tracker'` role to the list of valid authentication roles

### Code Change
```typescript
// BEFORE
if (!['admin', 'operations', 'packer', 'logistics-admin'].includes(role)) {
  console.warn('[API Auth] Invalid role:', role)
  return null
}

// AFTER
if (!['admin', 'operations', 'packer', 'logistics-admin', 'tracker'].includes(role)) {
  console.warn('[API Auth] Invalid role:', role)
  return null
}
```

## Impact Analysis

### Affected Systems
1. **Tracker Dashboard** (`app/tracker/dashboard/page.tsx`)
   - Tracker users can now access protected API endpoints
   - Tracker role can update order statuses
   - Tracker role can access packed orders

2. **Return to Queue Feature** (`app/api/orders/[id]/return-to-queue/route.ts`)
   - Already implements tracker role authorization
   - Now works correctly with API auth middleware

3. **Order Status Updates** (`app/api/orders/[id]/status/route.ts`)
   - Tracker users can update parcel status
   - Tracker users can update payment status

## API Endpoints Now Accessible by Tracker Role

### ✅ Authorized Endpoints
1. **GET /api/orders** - View orders
2. **GET /api/orders?status=Packed** - View packed orders
3. **PATCH /api/orders/[id]/status** - Update order status
4. **POST /api/orders/[id]/return-to-queue** - Return order to packing queue (tracker-specific)

### ❌ Unauthorized Endpoints (Should Remain Restricted)
1. **POST /api/orders** - Create orders (admin/operations only)
2. **DELETE /api/orders/[id]** - Delete orders (admin only)
3. **POST /api/orders/[id]/pack** - Pack orders (packer only)
4. **POST /api/items** - Create inventory items (admin only)
5. **DELETE /api/items/[id]** - Delete inventory items (admin only)

## Testing Requirements

### Critical Tests to Run

#### 1. **Tracker Authentication Test**
**Endpoint**: Any protected API endpoint  
**Headers**:
```json
{
  "x-user-username": "tracker",
  "x-user-role": "tracker",
  "x-user-display-name": "Tracker User"
}
```
**Expected**: 200 OK (not 401 Unauthorized)

#### 2. **Return to Queue Authorization Test**
**Endpoint**: `POST /api/orders/[orderId]/return-to-queue`  
**Headers**: Tracker role headers  
**Body**:
```json
{
  "reason": "Test reason",
  "returnedBy": "Tracker User"
}
```
**Expected**: 200 OK with successful return

#### 3. **Order Status Update Test**
**Endpoint**: `PATCH /api/orders/[orderId]/status`  
**Headers**: Tracker role headers  
**Body**:
```json
{
  "parcel_status": "DELIVERED",
  "payment_status": "paid"
}
```
**Expected**: 200 OK with updated order

#### 4. **Unauthorized Action Test**
**Endpoint**: `POST /api/orders`  
**Headers**: Tracker role headers  
**Expected**: 403 Forbidden (tracker cannot create orders)

#### 5. **Invalid Role Test**
**Endpoint**: Any protected API endpoint  
**Headers**:
```json
{
  "x-user-username": "test",
  "x-user-role": "invalid_role",
  "x-user-display-name": "Test User"
}
```
**Expected**: 401 Unauthorized

## Postman Collection Tests

### Existing Tests That Should Now Pass
The Postman collection already includes comprehensive tests for the Return to Queue feature:

1. ✅ **Return Order to Queue** - Basic success case
2. ✅ **Return Order to Queue - Missing Fields** - Validation test
3. ✅ **Return Order to Queue - Not Packed** - Status validation
4. ✅ **Return Order to Queue - Unauthorized Role** - Authorization test (packer trying to return)
5. ✅ **Return Order to Queue - Invalid Order ID** - Error handling test

### New Tests to Add

#### Test 1: Tracker Can Access Packed Orders
```javascript
pm.test('Tracker role can access packed orders', function () {
    pm.sendRequest({
        url: pm.variables.get('baseUrl') + '/api/orders?status=Packed',
        method: 'GET',
        header: {
            'x-user-username': 'tracker',
            'x-user-role': 'tracker',
            'x-user-display-name': 'Tracker User'
        }
    }, function (err, response) {
        pm.expect(response).to.have.status(200);
        pm.expect(response.json()).to.be.an('array');
    });
});
```

#### Test 2: Tracker Can Update Order Status
```javascript
pm.test('Tracker role can update order status', function () {
    pm.sendRequest({
        url: pm.variables.get('baseUrl') + '/api/orders/' + pm.variables.get('orderId') + '/status',
        method: 'PATCH',
        header: {
            'x-user-username': 'tracker',
            'x-user-role': 'tracker',
            'x-user-display-name': 'Tracker User',
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                parcel_status: 'IN TRANSIT',
                payment_status: 'cod'
            })
        }
    }, function (err, response) {
        pm.expect(response).to.have.status(200);
        const jsonData = response.json();
        pm.expect(jsonData.parcel_status).to.equal('IN TRANSIT');
    });
});
```

#### Test 3: Tracker Cannot Create Orders
```javascript
pm.test('Tracker role cannot create orders', function () {
    pm.sendRequest({
        url: pm.variables.get('baseUrl') + '/api/orders',
        method: 'POST',
        header: {
            'x-user-username': 'tracker',
            'x-user-role': 'tracker',
            'x-user-display-name': 'Tracker User',
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                date: '2026-06-02',
                salesChannel: 'Shopee',
                store: 'Main Warehouse',
                courier: 'J&T',
                waybill: 'TEST123',
                qty: 1,
                cogs: 100,
                total: 150,
                product: 'Test Product',
                dispatchedBy: 'Admin'
            })
        }
    }, function (err, response) {
        pm.expect(response).to.have.status(403);
        pm.expect(response.json().error).to.include('Forbidden');
    });
});
```

## Security Considerations

### ✅ Proper Implementation
- Tracker role is validated in the authentication middleware
- Role-based access control is enforced at the API level
- Tracker has limited permissions (view and update status only)

### ⚠️ Important Notes
1. **Tracker Cannot Delete**: Trackers cannot delete orders or inventory
2. **Tracker Cannot Create**: Trackers cannot create orders or dispatch
3. **Tracker Cannot Pack**: Trackers cannot mark orders as packed
4. **Tracker Can Return**: Trackers can return packed orders to queue (special permission)

## Database User Requirements

For this authentication to work, the `users` table must have tracker users:

```sql
-- Verify tracker user exists
SELECT username, role, display_name, email, created_at
FROM users 
WHERE role = 'tracker';

-- Expected output: One or more rows with role='tracker'
```

If no tracker users exist, create one using `ADD_TRACKER_USER.sql`.

## Rollback Plan

If issues arise, revert the change:

```typescript
// Revert to previous code
if (!['admin', 'operations', 'packer', 'logistics-admin'].includes(role)) {
  console.warn('[API Auth] Invalid role:', role)
  return null
}
```

**Impact**: Tracker users will lose API access and return 401 Unauthorized.

## Testing Checklist

- [ ] Run Postman collection: "Return Order to Queue" tests
- [ ] Verify tracker user exists in database
- [ ] Test tracker login at `/tracker/login`
- [ ] Test tracker can view packed orders
- [ ] Test tracker can update order status
- [ ] Test tracker can return orders to queue
- [ ] Test tracker CANNOT create orders (403)
- [ ] Test tracker CANNOT delete orders (403)
- [ ] Test tracker CANNOT pack orders (403)
- [ ] Test invalid role returns 401
- [ ] Check browser console for authentication errors
- [ ] Verify activity logs show tracker actions

## Success Criteria

✅ All tests pass  
✅ Tracker can access authorized endpoints  
✅ Tracker is blocked from unauthorized endpoints  
✅ No regression in other role permissions  
✅ Activity logs capture tracker actions  

---

**Status**: ✅ Change Applied  
**Next Step**: Run Postman collection to validate  
**Documentation Updated**: Yes  
