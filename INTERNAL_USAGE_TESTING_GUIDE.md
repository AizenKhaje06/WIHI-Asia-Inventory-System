# Internal Usage - Testing Guide 🧪

## Pre-Testing Setup

### 1. Start Development Server
```bash
npm run dev
```

### 2. Login as Admin
- Navigate to: `http://localhost:3000`
- Login with admin credentials
- Role required: `admin` or `operations`

### 3. Navigate to Internal Usage
- Click sidebar: **Internal Usage**
- Or use Command Palette: `Ctrl+K` → Type "Internal Usage"
- URL: `http://localhost:3000/dashboard/internal-usage`

---

## Test Cases

### Test 1: Demo/Display Dispatch with Sales Channel ✅

**Steps:**
1. Select Purpose: **Demo/Display**
2. Sales Channel dropdown should appear
3. Select Sales Channel: **Shopee**
4. Add products to cart (click on product cards)
5. Verify cart updates with correct cost prices
6. Click **Dispatch** button
7. Success modal should appear

**Expected Results:**
- ✅ Sales Channel dropdown appears when Demo/Display selected
- ✅ Cart shows cost prices (not selling prices)
- ✅ Dispatch ID generated (e.g., `INT-1234567890`)
- ✅ Success modal shows dispatched items
- ✅ Cart clears after dispatch
- ✅ Form resets

**Database Verification:**
```sql
-- Check transactions table
SELECT * FROM transactions 
WHERE transaction_type = 'demo' 
ORDER BY created_at DESC 
LIMIT 1;

-- Expected values:
-- transaction_type: 'demo'
-- department: 'Demo/Display / Shopee'
-- total_revenue: 0
-- profit: 0
```

**Logs Verification:**
```sql
-- Check logs table
SELECT * FROM logs 
WHERE operation = 'demo-display' 
ORDER BY created_at DESC 
LIMIT 1;

-- Expected details format:
-- "Demo/Display "Product Name" - Qty: 5, Department: Demo/Display / Shopee, Staff: John Doe"
```

---

### Test 2: Internal Use Dispatch with Sales Channel ✅

**Steps:**
1. Select Purpose: **Internal Use**
2. Sales Channel dropdown should appear
3. Select Sales Channel: **Physical Store**
4. Add notes: "Office supplies"
5. Add products to cart
6. Click **Dispatch** button

**Expected Results:**
- ✅ Sales Channel dropdown appears
- ✅ Notes saved correctly
- ✅ Transaction created with type 'internal'

**Database Verification:**
```sql
SELECT * FROM transactions 
WHERE transaction_type = 'internal' 
ORDER BY created_at DESC 
LIMIT 1;

-- Expected values:
-- transaction_type: 'internal'
-- department: 'Internal Use / Physical Store'
-- notes: 'Office supplies'
-- total_revenue: 0
```

**Logs Verification:**
```sql
SELECT * FROM logs 
WHERE operation = 'internal-usage' 
ORDER BY created_at DESC 
LIMIT 1;
```

---

### Test 3: Warehouse Transfer (No Sales Channel) ✅

**Steps:**
1. Select Purpose: **Warehouse Transfer**
2. Sales Channel dropdown should NOT appear
3. Add products to cart
4. Click **Dispatch** button

**Expected Results:**
- ✅ Sales Channel dropdown hidden
- ✅ Transaction created with type 'transfer'
- ✅ Department saved as "Warehouse Transfer" only

**Database Verification:**
```sql
SELECT * FROM transactions 
WHERE transaction_type = 'transfer' 
ORDER BY created_at DESC 
LIMIT 1;

-- Expected values:
-- transaction_type: 'transfer'
-- department: 'Warehouse Transfer'
-- total_revenue: 0
```

---

### Test 4: Form Validation ✅

**Test 4a: Empty Cart**
1. Select Purpose: **Demo/Display**
2. Select Sales Channel: **Shopee**
3. Don't add any products
4. Click **Dispatch** button

**Expected Result:**
- ✅ Alert: "Please add items and select a purpose"
- ✅ Dispatch button disabled

**Test 4b: Missing Sales Channel**
1. Select Purpose: **Demo/Display**
2. Don't select Sales Channel
3. Add products to cart
4. Click **Dispatch** button

**Expected Result:**
- ✅ Alert: "Please select a sales channel"

**Test 4c: Missing Purpose**
1. Don't select Purpose
2. Add products to cart
3. Click **Dispatch** button

**Expected Result:**
- ✅ Alert: "Please add items and select a purpose"

---

### Test 5: Cart Functionality ✅

**Test 5a: Add to Cart**
1. Click on a product card
2. Toast notification should appear
3. Product should appear in cart

**Expected Result:**
- ✅ Toast: "Product Name added to cart"
- ✅ Cart shows product with quantity 1
- ✅ Total updates

**Test 5b: Increase Quantity**
1. Click same product again
2. Quantity should increase

**Expected Result:**
- ✅ Toast: "Product Name quantity increased to 2"
- ✅ Cart quantity updates
- ✅ Total updates

**Test 5c: Maximum Stock**
1. Keep clicking product until stock limit reached
2. Should show warning

**Expected Result:**
- ✅ Toast: "Maximum stock reached for Product Name"
- ✅ Quantity doesn't exceed stock level

**Test 5d: Manual Quantity Update**
1. Type in quantity input field
2. Quantity should update

**Expected Result:**
- ✅ Quantity updates in real-time
- ✅ Total recalculates
- ✅ Cannot exceed stock level

**Test 5e: Remove from Cart**
1. Click trash icon
2. Product should be removed

**Expected Result:**
- ✅ Product removed from cart
- ✅ Total updates
- ✅ Cart shows empty state if last item

---

### Test 6: Product Search and Filter ✅

**Test 6a: Search by Name**
1. Type product name in search box
2. Products should filter

**Expected Result:**
- ✅ Only matching products shown
- ✅ Count updates: "Products (5)"

**Test 6b: Search by Category**
1. Type category name in search box
2. Products should filter

**Expected Result:**
- ✅ Products in that category shown
- ✅ Count updates

**Test 6c: No Results**
1. Type non-existent product
2. Empty state should show

**Expected Result:**
- ✅ Empty state with message
- ✅ "No products found"

---

### Test 7: Stock Status Indicators ✅

**Test 7a: Normal Stock**
- Product card shows stock badge (e.g., [50])
- Card is clickable
- Hover shows "Click to add"

**Test 7b: Low Stock**
- Product card shows [LOW] badge (amber)
- Stock badge shows remaining quantity
- Card is still clickable

**Test 7c: Out of Stock**
- Product card shows [OUT] badge (red)
- Card is grayed out
- Card is not clickable
- Cursor shows "not-allowed"

---

### Test 8: Inventory Deduction ✅

**Before Dispatch:**
```sql
-- Note the quantity
SELECT name, quantity FROM inventory WHERE id = 'item-123';
-- Example: quantity = 50
```

**After Dispatch (5 units):**
```sql
-- Check updated quantity
SELECT name, quantity FROM inventory WHERE id = 'item-123';
-- Expected: quantity = 45
```

**Expected Result:**
- ✅ Inventory quantity reduced by dispatched amount
- ✅ Product grid updates with new stock level

---

### Test 9: Staff Auto-Fill ✅

**Expected Result:**
- ✅ Dispatched By shows logged-in user name
- ✅ Avatar shows first letter of name
- ✅ "Verified" badge displayed
- ✅ "Currently logged in" status shown
- ✅ Security message displayed

---

### Test 10: Success Modal ✅

**After Successful Dispatch:**

**Expected Result:**
- ✅ Modal appears with success message
- ✅ Dispatch ID shown (e.g., `INT-1234567890`)
- ✅ Dispatched items table shows:
  - Product names
  - Cost price × quantity
  - Line totals
  - Grand total
- ✅ Confirmation messages:
  - "Inventory has been updated"
  - "Transaction logged successfully"
  - "Staff: [Name]"
- ✅ Close button works
- ✅ Modal closes and form resets

---

### Test 11: Dark Mode ✅

**Steps:**
1. Toggle dark mode
2. Check all UI elements

**Expected Result:**
- ✅ All colors adapt to dark theme
- ✅ Text remains readable
- ✅ Gradients work in dark mode
- ✅ Borders visible
- ✅ Cards have proper contrast

---

### Test 12: Responsive Design ✅

**Desktop (1920px):**
- ✅ 2-column layout (Dispatch | Cart)
- ✅ 4-column product grid

**Tablet (768px):**
- ✅ 2-column layout maintained
- ✅ 3-column product grid

**Mobile (375px):**
- ✅ Single column layout
- ✅ 1-column product grid
- ✅ All buttons accessible
- ✅ Forms usable

---

## Integration Tests

### Test 13: Logs Page Integration ✅

**Steps:**
1. Dispatch items from Internal Usage
2. Navigate to Logs page
3. Filter by operation type

**Expected Result:**
- ✅ Demo/Display shows as "demo-display"
- ✅ Internal Use shows as "internal-usage"
- ✅ Warehouse Transfer shows as "warehouse"
- ✅ Details include correct information
- ✅ Staff name displayed
- ✅ Timestamp accurate

---

### Test 14: Dashboard Integration ✅

**Steps:**
1. Dispatch items from Internal Usage
2. Navigate to Dashboard
3. Check statistics

**Expected Result:**
- ✅ Total Revenue NOT affected (internal usage = 0 revenue)
- ✅ Inventory value updated
- ✅ Transaction count increased
- ✅ Recent activity shows dispatch

---

### Test 15: Reports Integration ✅

**Steps:**
1. Dispatch items from Internal Usage
2. Navigate to Reports
3. Generate transaction report

**Expected Result:**
- ✅ Internal usage transactions included
- ✅ Marked as "Demo" or "Internal" type
- ✅ Revenue shown as ₱0.00
- ✅ Cost tracked correctly

---

## Performance Tests

### Test 16: Large Product List ✅

**Steps:**
1. Load page with 100+ products
2. Scroll through product grid
3. Search and filter

**Expected Result:**
- ✅ Page loads in < 2 seconds
- ✅ Smooth scrolling
- ✅ Search is responsive
- ✅ No lag when adding to cart

---

### Test 17: Large Cart ✅

**Steps:**
1. Add 20+ different products to cart
2. Update quantities
3. Remove items
4. Dispatch

**Expected Result:**
- ✅ Cart scrolls smoothly
- ✅ Quantity updates are instant
- ✅ Total recalculates quickly
- ✅ Dispatch completes successfully

---

## Error Handling Tests

### Test 18: API Errors ✅

**Test 18a: Network Error**
1. Disconnect internet
2. Try to dispatch
3. Should show error

**Test 18b: Insufficient Stock**
1. Manually set quantity higher than stock
2. Try to dispatch
3. Should show error

**Test 18c: Invalid Item**
1. Add item to cart
2. Delete item from database
3. Try to dispatch
4. Should show error

---

## Accessibility Tests

### Test 19: Keyboard Navigation ✅

**Steps:**
1. Use Tab key to navigate
2. Use Enter to select
3. Use Escape to close modals

**Expected Result:**
- ✅ All interactive elements focusable
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ Keyboard shortcuts work

---

### Test 20: Screen Reader ✅

**Steps:**
1. Enable screen reader
2. Navigate through page
3. Perform dispatch

**Expected Result:**
- ✅ All labels read correctly
- ✅ Form fields announced
- ✅ Buttons have proper labels
- ✅ Status messages announced

---

## Regression Tests

### Test 21: Warehouse Dispatch Still Works ✅

**Steps:**
1. Navigate to Warehouse Dispatch (POS)
2. Create order with courier and waybill
3. Submit order

**Expected Result:**
- ✅ Warehouse Dispatch unaffected
- ✅ Orders table updated
- ✅ Packing Queue shows order
- ✅ Track Orders works

---

### Test 22: Other Pages Unaffected ✅

**Steps:**
1. Check Inventory page
2. Check Sales page
3. Check Reports page
4. Check Dashboard

**Expected Result:**
- ✅ All pages load correctly
- ✅ No console errors
- ✅ Data displays properly
- ✅ Functionality intact

---

## Sign-Off Checklist

- [ ] All 22 test cases passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Database records correct
- [ ] Logs created properly
- [ ] Inventory deducted correctly
- [ ] UI matches design
- [ ] Dark mode works
- [ ] Responsive on all devices
- [ ] Accessibility compliant
- [ ] Performance acceptable
- [ ] Error handling works
- [ ] Integration tests passed
- [ ] Regression tests passed

---

## Known Issues

None at this time.

---

## Next Steps After Testing

1. **If all tests pass:**
   - Mark feature as production-ready
   - Update user documentation
   - Train staff on new feature

2. **If issues found:**
   - Document issues in detail
   - Prioritize by severity
   - Fix and re-test

3. **Production deployment:**
   - Run migration scripts
   - Deploy to staging first
   - Monitor for 24 hours
   - Deploy to production
   - Monitor logs and metrics
