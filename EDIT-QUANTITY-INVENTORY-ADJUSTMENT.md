# EDIT QUANTITY INVENTORY ADJUSTMENT ✅

## PROBLEM
When editing the quantity of a packed order in Track Orders page:
- Original quantity: 5 (already deducted from inventory)
- Edit to: 10
- Inventory before: 965
- **Expected**: 960 (965 - 5 additional)
- **Actual**: 965 (no change) ❌

The order quantity was updated but inventory was not adjusted.

## ROOT CAUSE
The PATCH endpoint (`/api/orders/[id]`) only updated the order details but did not adjust inventory when quantity changed.

## SOLUTION
Added inventory adjustment logic to the PATCH endpoint:

### Logic Flow:
1. **Fetch current order** to get original quantity and status
2. **Update order details** (customer info, courier, quantity, etc.)
3. **Check if inventory adjustment needed**:
   - Order must be status='Packed' (if Pending, no inventory was deducted yet)
   - Quantity must have changed
   - Product name must exist
4. **Calculate difference**: `newQty - oldQty`
5. **Adjust inventory**: `currentInventoryQty - difference`

### Examples:

#### Example 1: Increase Quantity
```
Order quantity: 5 → 10 (difference: +5)
Inventory: 965 → 960 (deduct 5 more)
```

#### Example 2: Decrease Quantity
```
Order quantity: 10 → 5 (difference: -5)
Inventory: 960 → 965 (restore 5)
```

#### Example 3: No Change
```
Order quantity: 5 → 5 (difference: 0)
Inventory: 965 → 965 (no adjustment)
```

## CODE CHANGES

### File: `app/api/orders/[id]/route.ts`

**Added:**
1. Import `supabaseAdmin` for inventory updates
2. Fetch current order before updating
3. Calculate quantity difference
4. Adjust inventory based on difference
5. Case-insensitive product name matching
6. Detailed logging

**Key Logic:**
```typescript
// Calculate difference
const qtyDifference = newQty - oldQty

// Adjust inventory (subtract difference)
const newInventoryQty = currentInventoryQty - qtyDifference

// Examples:
// If qty increased from 5 to 10: difference = +5, inventory -= 5
// If qty decreased from 10 to 5: difference = -5, inventory -= (-5) = inventory += 5
```

## TESTING

### Test 1: Increase Quantity (Packed Order)
1. Go to **Track Orders**
2. Find a packed order (e.g., Berry Soap, qty=5)
3. Note current inventory (e.g., 965)
4. Edit order, change quantity to 10
5. Save changes
6. **Check inventory** - should be 960 (965 - 5) ✅

### Test 2: Decrease Quantity (Packed Order)
1. Go to **Track Orders**
2. Find a packed order (e.g., Berry Soap, qty=10)
3. Note current inventory (e.g., 960)
4. Edit order, change quantity to 5
5. Save changes
6. **Check inventory** - should be 965 (960 + 5) ✅

### Test 3: Edit Pending Order
1. Go to **Packing Queue**
2. Find a pending order
3. Edit quantity
4. **Check inventory** - should NOT change (no adjustment for pending orders) ✅

### Test 4: Edit Other Fields Only
1. Go to **Track Orders**
2. Edit customer name, address, etc. (don't change quantity)
3. **Check inventory** - should NOT change ✅

## CONSOLE LOGS

### When Quantity Changes (Packed Order):
```
[API PATCH] Current order: {
  id: "ORD-123",
  currentQty: 5,
  newQty: 10,
  status: "Packed",
  product: "Berry Soap"
}
[API PATCH] Quantity changed, adjusting inventory: {
  oldQty: 5,
  newQty: 10,
  difference: 5
}
[API PATCH] Adjusting inventory: {
  product: "Berry Soap",
  currentInventoryQty: 965,
  qtyDifference: 5,
  newInventoryQty: 960
}
[API PATCH] ✅ Inventory adjusted: Berry Soap -5 (New: 960)
```

### When No Adjustment Needed:
```
[API PATCH] No inventory adjustment needed: {
  isPacked: false,
  qtyChanged: true,
  hasProduct: true
}
```

## EDGE CASES HANDLED

### 1. Pending Orders
- **Scenario**: Edit quantity of pending order
- **Behavior**: No inventory adjustment (inventory not deducted yet)
- **Reason**: Inventory only deducted when marked as packed

### 2. Product Not Found
- **Scenario**: Product name doesn't match inventory
- **Behavior**: Order updated, inventory adjustment skipped
- **Reason**: Graceful degradation, don't fail order update

### 3. Case-Insensitive Matching
- **Scenario**: Product name has different case
- **Behavior**: Tries case-insensitive match as fallback
- **Example**: "berry soap" matches "Berry Soap"

### 4. No Quantity Change
- **Scenario**: Edit other fields but not quantity
- **Behavior**: No inventory adjustment
- **Reason**: No need to adjust if quantity unchanged

## RELATED FEATURES

### Complete Inventory Flow:
```
1. DISPATCH (POS)
   └─ Create order (Pending) - NO inventory deduction

2. MARK AS PACKED
   └─ Change to Packed - DEDUCT inventory

3. EDIT QUANTITY (Track Orders)
   └─ If Packed - ADJUST inventory based on difference

4. DELETE ORDER
   └─ If Packed - RESTORE inventory
   └─ If Pending - NO restoration
```

## BUSINESS LOGIC

### Why Adjust Inventory on Edit?
When you edit a packed order's quantity:
- The original quantity was already deducted from inventory
- If you increase quantity, you need to deduct more
- If you decrease quantity, you need to restore some
- This keeps inventory accurate with actual orders

### Example Scenario:
```
1. Customer orders 5 Berry Soaps
2. Order marked as packed → Inventory: 1000 - 5 = 995
3. Customer calls: "Can I change to 10 soaps?"
4. Edit order quantity to 10 → Inventory: 995 - 5 = 990
5. Now inventory reflects the actual 10 soaps that will be shipped
```

## FILES MODIFIED
1. `app/api/orders/[id]/route.ts` - Added inventory adjustment logic to PATCH endpoint

## COMPLETION STATUS
✅ **FIXED AND READY FOR TESTING**

Date: May 21, 2026
Issue: Editing quantity in Track Orders doesn't adjust inventory
Solution: Added inventory adjustment logic based on quantity difference
Result: Inventory now adjusts correctly when editing packed order quantities

### Related Documents:
- `INVENTORY-DEDUCTION-FIX-COMPLETE.md` - Main inventory flow fix
- `INVENTORY-COLUMN-NAME-FIX.md` - Column name fix for mark as packed
- `TEST-INVENTORY-FLOW.md` - Complete testing guide
