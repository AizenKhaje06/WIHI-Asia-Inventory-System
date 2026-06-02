# TEST GUIDE: Inventory Deduction Flow

## QUICK TEST STEPS

### Setup
1. Open your browser to `http://localhost:3000`
2. Login as admin
3. Note down current inventory quantity for a test product

### Test 1: Dispatch Order (Should NOT Deduct Inventory)
1. Go to **POS / Warehouse Dispatch** page
2. Add a product to cart (e.g., quantity = 2)
3. Click "Dispatch" button
4. Fill in the order form:
   - Sales Channel: (select any)
   - Store: (select any)
   - Courier: (select any)
   - Waybill: TEST-12345
   - Customer Name: Test Customer
   - Customer Contact: 09123456789
   - Customer Address: Test Address
5. Click "Submit Order"
6. **CHECK INVENTORY PAGE** - Quantity should be UNCHANGED ✅
7. **CHECK PACKING QUEUE** - Order should appear with status='Pending' ✅

### Test 2: Mark as Packed (Should DEDUCT Inventory)
1. Go to **Packing Queue** page
2. Find the order you just created
3. Click "Mark as Packed"
4. **CHECK INVENTORY PAGE** - Quantity should NOW be deducted (original - 2) ✅
5. **CHECK TRACK ORDERS** - Order should appear with status='Packed' ✅

### Test 3: Delete Packed Order (Should RESTORE Inventory)
1. Go to **Track Orders** page
2. Find the packed order
3. Click delete button
4. Confirm deletion
5. **CHECK INVENTORY PAGE** - Quantity should be restored to original ✅

### Test 4: Delete Pending Order (Should NOT Restore)
1. Go to **POS / Warehouse Dispatch** page
2. Create another order (same product, quantity = 2)
3. **CHECK INVENTORY** - Should be unchanged ✅
4. Go to **Packing Queue**
5. Delete the pending order
6. **CHECK INVENTORY** - Should still be unchanged (no restoration) ✅

## EXPECTED RESULTS

### Inventory Changes Timeline
```
Initial Inventory: 100 units

1. Dispatch Order (qty=2)
   → Inventory: 100 units (NO CHANGE) ✅

2. Mark as Packed
   → Inventory: 98 units (DEDUCTED) ✅

3. Delete Packed Order
   → Inventory: 100 units (RESTORED) ✅

4. Dispatch Order (qty=2)
   → Inventory: 100 units (NO CHANGE) ✅

5. Delete Pending Order
   → Inventory: 100 units (NO CHANGE) ✅
```

## WHAT TO LOOK FOR

### Success Indicators ✅
- [ ] Dispatch creates order without deducting inventory
- [ ] Packing Queue shows status='Pending'
- [ ] Mark as Packed deducts inventory
- [ ] Track Orders shows status='Packed'
- [ ] Deleting packed order restores inventory
- [ ] Deleting pending order does NOT restore inventory
- [ ] Success modal shows correct message: "Order created in Packing Queue"
- [ ] Toast shows: "Go to Packing Queue to mark as packed"

### Failure Indicators ❌
- [ ] Inventory deducted during dispatch (WRONG!)
- [ ] Inventory not deducted when marking as packed
- [ ] Inventory not restored when deleting packed order
- [ ] Inventory restored when deleting pending order (WRONG!)

## CONSOLE LOGS TO CHECK

### During Mark as Packed
Look for:
```
[API] ✅ Inventory deducted: [Product Name] -[Qty] (New: [NewQty])
```

### During Delete Packed Order
Look for:
```
[API DELETE] ✅ Inventory restored: [Product Name] +[Qty] (New: [NewQty])
```

### During Delete Pending Order
Look for:
```
[API DELETE] Skipping inventory restoration: { status: 'Pending', ... }
```

## TROUBLESHOOTING

### If inventory is deducted during dispatch:
- Check if `/api/sales` call was removed from `handleSubmitOrder`
- Clear browser cache and restart dev server

### If inventory is not deducted when marking as packed:
- Check `/api/orders/[id]/pack/route.ts` endpoint
- Verify product name matching logic

### If inventory is not restored when deleting packed order:
- Check `/api/orders/[id]/route.ts` DELETE endpoint
- Verify status check logic

## QUICK VERIFICATION COMMAND

Run this in browser console on Inventory page:
```javascript
// Get current inventory for a product
const productName = "YOUR_PRODUCT_NAME";
const row = Array.from(document.querySelectorAll('tr')).find(r => r.textContent.includes(productName));
const qty = row?.querySelector('td:nth-child(4)')?.textContent;
console.log(`Current quantity for ${productName}: ${qty}`);
```

## FILES TO MONITOR
1. `app/dashboard/pos/page.tsx` - Dispatch flow
2. `app/api/orders/route.ts` - Order creation
3. `app/api/orders/[id]/pack/route.ts` - Mark as packed
4. `app/api/orders/[id]/route.ts` - Delete order
5. `app/dashboard/inventory/page.tsx` - Inventory display

## COMPLETION CHECKLIST
- [ ] Test 1: Dispatch (no deduction) - PASSED
- [ ] Test 2: Mark as Packed (deduction) - PASSED
- [ ] Test 3: Delete Packed (restoration) - PASSED
- [ ] Test 4: Delete Pending (no restoration) - PASSED
- [ ] All console logs correct - PASSED
- [ ] No errors in browser console - PASSED
- [ ] No errors in terminal - PASSED

---

**Date:** May 21, 2026
**Issue:** Inventory deducted too early
**Fix:** Removed `/api/sales` call from dispatch flow
**Status:** READY FOR TESTING
