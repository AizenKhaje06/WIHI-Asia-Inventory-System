# Department Data Isolation Implementation

**Date**: May 12, 2026  
**Feature**: Department-based data filtering for operations users

---

## Overview

All agents in the same department share the same filtered view of data. Each department only sees their own data based on `assigned_channel`.

**Example:**
- Carlo (Lazada) and Lisa (Lazada) → See only Lazada data
- Juan (Facebook) and Maria (Facebook) → See only Facebook data
- Admin → Sees ALL data (no filtering)

---

## Implementation Checklist

### ✅ Step 1: Authentication & User Session
- [x] Update login to store `assignedChannel` in localStorage
- [x] Update `User` interface to include `assignedChannel`
- [x] Add `getUserDepartment()` helper function in `lib/auth.ts`

### ✅ Step 2: Inventory API
- [x] `/api/items` - Filter by `salesChannel = assignedChannel`

### ✅ Step 3: Orders API
- [x] `/api/orders` - Filter by `sales_channel = assignedChannel`
- [x] `/api/orders/[id]` - Verify order belongs to department

### ✅ Step 4: Transactions API  
- [x] `/api/sales` - Filter transactions by department (validation on POST)
- [x] `/api/internal-usage` - Filter by department

### ✅ Step 5: Dashboard API
- [x] `/api/dashboard` - Calculate stats only from department data
- [x] `/api/financial-metrics` - Filter by department

### ✅ Step 6: Reports API
- [x] `/api/reports/**` - Filter all reports by department

### ✅ Step 7: Stores API
- [x] `/api/stores` - Filter stores by `sales_channel = assignedChannel`

### ✅ Step 8: Products API
- [x] `/api/products` - Filter by department

### ✅ Step 9: Bundles API
- [x] `/api/bundles` - Filter bundles by department

### ✅ Step 10: Customers/Business Contacts
- [x] No filtering needed (customers are not department-specific)

---

## API Filtering Pattern

```typescript
// In API route with withAuth middleware
export const GET = withAuth(async (request, { user }) => {
  let data = await fetchAllData()
  
  // DEPARTMENT FILTERING
  if (user.role === 'operations' && user.assignedChannel) {
    data = data.filter(item => item.salesChannel === user.assignedChannel)
  }
  // Admin sees all data
  
  return NextResponse.json(data)
})
```

---

## Database Fields Used for Filtering

| Table | Filter Column | Value |
|-------|--------------|-------|
| inventory | sales_channel | assignedChannel |
| orders | sales_channel | assignedChannel |
| transactions | department (contains channel) | assignedChannel |
| stores | sales_channel | assignedChannel |
| bundles | (via items) | assignedChannel |

---

## Testing Checklist

### Test as Lazada Agent (Carlo)
- [ ] Login as Carlo (Lazada-Carlo, password: carlo123)
- [ ] Verify navbar shows "Carlo (Lazada)"
- [ ] Check Inventory page - should only show Lazada items
- [ ] Check Orders page - should only show Lazada orders
- [ ] Check Dashboard - stats should be Lazada-only
- [ ] Check Reports - should be Lazada-only

### Test as Facebook Agent (Juan)
- [ ] Login as Juan (Facebook-Juan, password: juan123)
- [ ] Verify navbar shows "Juan (Facebook)"
- [ ] Check Inventory page - should only show Facebook items
- [ ] Check Orders page - should only show Facebook orders
- [ ] Verify Juan CANNOT see Lazada data

### Test as Admin
- [ ] Login as Admin
- [ ] Verify admin sees ALL data from all departments
- [ ] No filtering applied

---

## Files Modified

1. ✅ `app/page.tsx` - Store assignedChannel in localStorage
2. ✅ `lib/auth.ts` - Add assignedChannel to User interface, add getUserDepartment()
3. ✅ `lib/api-auth.ts` - Include assignedChannel in auth headers
4. ✅ `lib/api-helpers.ts` - Pass assignedChannel to handlers
5. ✅ `lib/api-client.ts` - **CRITICAL FIX**: Add assignedChannel to getAuthHeaders()
6. ✅ `app/api/items/route.ts` - Filter inventory by department
7. ✅ `app/api/orders/route.ts` - Filter orders by department
8. ✅ `app/api/dashboard/route.ts` - Filter dashboard stats by department
9. ✅ `app/api/financial-metrics/route.ts` - Filter financial data by department
10. ✅ `app/api/sales/route.ts` - Validate department on POST (operations can only create sales for their department)
11. ✅ `app/api/internal-usage/route.ts` - Filter internal usage transactions by department
12. ✅ `app/api/stores/route.ts` - Filter stores by department
13. ✅ `app/api/products/route.ts` - Filter products by department
14. ✅ `app/api/bundles/route.ts` - Filter bundles by department
15. ✅ `app/api/reports/route.ts` - Filter reports by department
16. ✅ `app/api/logs/route.ts` - Filter activity logs by department items

---

## ✅ IMPLEMENTATION COMPLETE

**Date Completed**: May 12, 2026

All APIs have been updated with department data isolation. Operations users now only see data for their assigned department/channel, while Admin users continue to see all data.

### Summary of Changes

**Total APIs Updated**: 14

**Filtering Pattern Applied**:
- Operations users: Data filtered by `assignedChannel`
- Admin users: No filtering (see all data)
- Packer users: See all data (no department restrictions)

**Key Features**:
1. All agents in same department share same filtered view
2. Filtering happens at API level for security
3. Admin bypasses all filtering
4. Operations users validated on POST operations (can only create data for their department)

### Testing Required

Before deploying to production, test the following scenarios:

1. **Lazada Agent Login**
   - Login as Carlo (Lazada-Carlo)
   - Verify only Lazada data visible across all pages
   - Try creating order/sale - should only allow Lazada

2. **Facebook Agent Login**
   - Login as Juan (Facebook-Juan)
   - Verify only Facebook data visible
   - Confirm cannot see Lazada data

3. **Admin Login**
   - Login as Admin
   - Verify sees ALL data from all departments
   - No restrictions applied

---

## Notes

- Admin role bypasses all filtering (sees everything)
- Packer role may need special handling (TBD)
- All agents in same department share same filtered view
- Filtering happens at API level for security
- Frontend receives only department-specific data

