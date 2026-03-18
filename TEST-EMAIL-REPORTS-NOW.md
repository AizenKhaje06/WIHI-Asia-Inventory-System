# Test Email Reports - Quick Guide

## What Was Fixed

The test email endpoint was using WRONG database field names. Now fixed to match the actual schema.

## How to Test

### 1. Restart Development Server
```cmd
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Send Test Email
1. Go to: http://localhost:3000/dashboard/settings
2. Click "Email Reports" tab
3. Enter your email address
4. Click "Send Test Email"

### 3. Check Your Email

The email should now show:

✅ **Parcel Status Breakdown** - Actual counts (not all zeros)
- Total Orders: X
- Pending: X
- In Transit: X
- On Delivery: X
- Pickup: X
- Delivered: X
- Cancelled: X
- Detained: X
- Problematic: X
- Returned: X

✅ **Detailed Orders Table** - All columns populated correctly:
1. Waybill No. - Shows tracking numbers (not "-")
2. Date - Order dates
3. Sales Channel - Shows "Shopee", "Lazada", etc. (not "N/A")
4. Store - Store names
5. Product - Shows product names like "BERRY SOAP (1), BUILD CORD (1)" (not "N/A")
6. Qty - Quantities
7. Amount - Amounts
8. COGS - Calculated
9. Profit - Calculated
10. Margin - Calculated
11. Courier - Courier names
12. Payment Status - PENDING/PAID/COD
13. Parcel Status - DELIVERED/PICKUP/ON DELIVERY/etc. (not "Packed")

## What Changed

### Before (Wrong):
```typescript
itemName: order.product_name || order.item_name || 'N/A'  // ❌ Wrong fields
trackingNumber: order.tracking_number || '-'              // ❌ Wrong field
salesChannel: order.department || 'N/A'                   // ❌ Wrong field
parcelStatus: order.status || 'PENDING'                   // ❌ Wrong field
```

### After (Correct):
```typescript
itemName: order.product || 'N/A'                          // ✅ Correct
trackingNumber: order.waybill || '-'                      // ✅ Correct
salesChannel: order.sales_channel || 'N/A'                // ✅ Correct
parcelStatus: order.parcel_status || 'PENDING'            // ✅ Correct
```

## Database Schema Reference

```sql
orders table:
- product TEXT           -- Product names
- waybill TEXT          -- Tracking numbers
- sales_channel TEXT    -- Sales channel
- parcel_status TEXT    -- Tracking status
- status TEXT           -- Order status (Pending/Packed)
```

## If Still Not Working

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Check database** - Run CHECK-EMAIL-REPORT-DATA.sql to verify data exists
3. **Check console** - Look for errors in browser console
4. **Restart server** - Make sure changes are loaded

## Success Criteria

✅ Status breakdown shows actual numbers (not zeros)
✅ Product column shows product names (not "N/A")
✅ Sales Channel shows channel names (not "N/A")
✅ Parcel Status shows tracking status (not "Packed")
✅ Waybill shows tracking numbers

## Files Modified

- `app/api/email-test/route.ts` - Fixed field mapping
- All three endpoints now use IDENTICAL transformation:
  - Test endpoint
  - Cron job
  - Track orders page
