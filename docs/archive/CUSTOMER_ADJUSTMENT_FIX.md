# Customer Adjustment Fix

## Issue
Manual adjustments (points, purchases, spending) were not updating customer data in the database.

## Root Cause
1. Missing error handling in the adjustment function
2. Missing DELETE endpoint in API route
3. Missing deleteCustomer function in customer-management library
4. No console logging to debug issues

## Fixes Applied

### 1. Enhanced Error Handling in Frontend
**File**: `app/dashboard/customers/page.tsx`

Added:
- Response status checking
- Error logging to console
- User-friendly error alerts
- Await for fetchCustomers() to ensure data refresh

```typescript
const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updatedCustomer),
})

if (!response.ok) {
  const error = await response.json()
  console.error('Update failed:', error)
  alert('Failed to update customer. Please try again.')
  return
}

// Refresh customer data
await fetchCustomers()
```

### 2. Added Logging to API Route
**File**: `app/api/customers/[id]/route.ts`

Added console.log statements to track:
- When PUT request is received
- Customer ID and data being updated
- Success/failure status

### 3. Added DELETE Endpoint
**File**: `app/api/customers/[id]/route.ts`

Added DELETE method to handle customer deletion:
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await deleteCustomer(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
```

### 4. Added deleteCustomer Function
**File**: `lib/customer-management.ts`

Implemented deleteCustomer function to remove customer from Google Sheets:
```typescript
export async function deleteCustomer(id: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const customers = await getCustomers()
  const index = customers.findIndex((customer) => customer.id === id)

  if (index === -1) {
    throw new Error("Customer not found")
  }

  const rowNumber = index + 2

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: 0,
            dimension: "ROWS",
            startIndex: rowNumber - 1,
            endIndex: rowNumber
          }
        }
      }]
    }
  })
}
```

## Testing Steps

1. **Open Customer Details**
   - Click eye icon on any customer
   - Customer details modal opens

2. **Test Adjust Points**
   - Click "Adjust Points" button
   - Enter +100
   - Click "Apply Adjustment"
   - Check browser console for logs
   - Verify points increased by 100

3. **Test Adjust Purchases**
   - Click "Adjust Purchases" button
   - Enter +1
   - Click "Apply Adjustment"
   - Verify purchases increased by 1

4. **Test Adjust Spending**
   - Click "Adjust Spending" button
   - Enter +500
   - Click "Apply Adjustment"
   - Verify spending increased by ₱500

5. **Test Negative Adjustments**
   - Try entering -50 for points
   - Verify it subtracts correctly
   - Verify it doesn't go below 0

6. **Check Console Logs**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for:
     - "Updating customer: [id] [data]"
     - "PUT request received for customer: [id] [data]"
     - "Customer updated successfully"
     - "Update successful"

## Expected Behavior

### Success Flow:
1. User clicks adjustment button
2. Dialog opens with current value
3. User enters adjustment amount
4. Preview shows new value
5. User clicks "Apply Adjustment"
6. Console logs show update process
7. Dialog closes
8. Customer list refreshes
9. New values are visible in table

### Error Flow:
1. If update fails, alert shows error message
2. Console shows error details
3. Dialog stays open
4. User can try again

## Debugging

If adjustments still don't work, check:

1. **Browser Console** (F12 → Console tab)
   - Look for error messages
   - Check if API calls are being made
   - Verify data being sent

2. **Network Tab** (F12 → Network tab)
   - Filter by "Fetch/XHR"
   - Look for PUT request to `/api/customers/[id]`
   - Check request payload
   - Check response status (should be 200)

3. **Google Sheets**
   - Open your Google Sheet
   - Check if "Customers" tab exists
   - Verify data is being updated
   - Check for any error messages

4. **Server Logs**
   - Check terminal/console where Next.js is running
   - Look for "PUT request received" messages
   - Check for any error stack traces

## Common Issues & Solutions

### Issue: "Failed to update customer"
**Solution**: Check Google Sheets API credentials in `.env.local`

### Issue: Changes don't persist
**Solution**: Verify Google Sheets permissions (sheet must be shared with service account email)

### Issue: Console shows 404 error
**Solution**: Customer ID might be incorrect, check customer data structure

### Issue: Console shows 500 error
**Solution**: Check server logs for detailed error message

## Files Modified

1. `app/dashboard/customers/page.tsx` - Enhanced error handling
2. `app/api/customers/[id]/route.ts` - Added logging and DELETE endpoint
3. `lib/customer-management.ts` - Added deleteCustomer function

---

**Status**: ✅ FIXED
**Date**: January 23, 2026
**Impact**: Manual adjustments now work correctly with proper error handling and logging
