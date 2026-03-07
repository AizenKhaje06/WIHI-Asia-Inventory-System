# Bundle Creation Error - Debug Guide

## Error Seen
```
Error: Request failed
```

## Possible Causes

### 1. Dev Server Not Restarted ⚠️
The API route changes require a server restart.

**Solution**:
```cmd
RESTART-DEV.cmd
```

### 2. Missing Bundle Name
From the screenshot, the Bundle Name field appears empty.

**Check**:
- Is there text in the "Bundle Name" field?
- The field is required (marked with *)

### 3. API Endpoint Issue
The POST /api/bundles endpoint might be returning an error.

**Debug Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try creating bundle again
4. Click on the "bundles" request
5. Check the Response tab for actual error message

### 4. Database Connection
The bundles table might not exist or have permission issues.

**Check**:
- Has migration 020_create_bundles_table.sql been run?
- Are RLS policies set up correctly?

## Quick Fix Steps

### Step 1: Restart Dev Server
```cmd
# Stop current server (Ctrl+C)
# Then run:
RESTART-DEV.cmd
```

### Step 2: Check Bundle Name
- Make sure Bundle Name field has text
- Example: "Berry Soap 3-Pack"

### Step 3: Check Browser Console
1. Press F12
2. Go to Console tab
3. Look for detailed error messages
4. Should see logs like:
   ```
   Creating bundle with data: {...}
   Error creating bundle: ...
   Error details: {...}
   ```

### Step 4: Check Network Tab
1. Press F12
2. Go to Network tab
3. Click "Create Bundle"
4. Find the POST request to /api/bundles
5. Click on it
6. Check Response tab for actual error

## Expected Request Data

The bundle creation should send:
```json
{
  "name": "Berry Soap 3-Pack",
  "description": "",
  "category": "Health, Beauty & Personal Care",
  "store": "CosmBeauti Main",
  "salesChannel": null,
  "bundlePrice": 598,
  "items": [
    { "itemId": "...", "quantity": 1 },
    { "itemId": "...", "quantity": 1 },
    { "itemId": "...", "quantity": 1 }
  ],
  "sku": null,
  "badge": "BEST VALUE"
}
```

## Common Errors

### "Missing required fields"
- Bundle name is empty
- Category not selected
- Store not selected
- No items added

### "No valid items found in inventory"
- Item IDs don't exist in database
- Items were deleted

### "Bundle price cannot be below cost"
- Bundle price (598) is less than total cost
- Check pricing summary

### "Failed to create bundle"
- Database error
- Permission error
- Migration not run

## Debugging with Enhanced Logging

I've added detailed logging to the component. After restarting, you should see:

### In Console (Before Request)
```
Creating bundle with data: {
  name: "...",
  category: "...",
  store: "...",
  bundlePrice: 598,
  items: [...]
}
```

### In Console (On Success)
```
Bundle created successfully: { id: "BUNDLE-...", ... }
```

### In Console (On Error)
```
Error creating bundle: Error: ...
Error details: {
  message: "...",
  stack: "...",
  bundleItems: [...],
  formData: {...}
}
```

## Next Steps

1. **Restart dev server** - This is most likely the issue
2. **Fill in bundle name** - Make sure it's not empty
3. **Check console** - Look for detailed error messages
4. **Check network tab** - See actual API response
5. **Report back** - Share the actual error message from console/network

## Test Data

Try creating a simple bundle:
- **Name**: "Test Bundle"
- **Category**: Any category
- **Store**: Any store
- **Items**: 2-3 products
- **Price**: Above the bundle cost shown

---

**Most Likely Fix**: Restart the dev server with `RESTART-DEV.cmd`
