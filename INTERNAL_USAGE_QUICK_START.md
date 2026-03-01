# Internal Usage - Quick Start Guide ⚡

## 🚀 Get Started in 3 Steps

### Step 1: Open the Page
```
Sidebar → Internal Usage
OR
Ctrl+K → Type "Internal Usage"
```

### Step 2: Fill the Form
```
1. Select Purpose
2. Select Sales Channel (if needed)
3. Add products to cart
4. Click Dispatch
```

### Step 3: Verify Success
```
✓ Success modal appears
✓ Dispatch ID generated
✓ Inventory updated
```

---

## 📋 Purpose Options

### 🖥️ Demo/Display
**When to use**: Items for product showcases, displays, or demonstrations

**Requires**: Sales Channel selection

**Example**: "Demo/Display / Shopee"

---

### 👥 Internal Use
**When to use**: Items for company internal consumption

**Requires**: Sales Channel selection

**Example**: "Internal Use / Physical Store"

---

### 📦 Warehouse Transfer
**When to use**: Moving items between locations

**Requires**: Nothing (no sales channel needed)

**Example**: "Warehouse Transfer"

---

## 🛒 Cart Operations

### Add to Cart
```
Click on product card → Item added
```

### Increase Quantity
```
Click same product again → Quantity +1
OR
Type in quantity input field
```

### Remove from Cart
```
Click trash icon 🗑️ → Item removed
```

### Update Quantity
```
Type in input field → Quantity updates
```

---

## 🔍 Search & Filter

### Search by Name
```
Type product name → Results filter
```

### Search by Category
```
Type category → Results filter
```

### Clear Search
```
Clear search box → All products shown
```

---

## ✅ Validation Rules

### Required Fields
- ✅ Purpose (always required)
- ✅ Sales Channel (required for Demo/Display and Internal Use)
- ✅ Cart (must have at least 1 item)
- ✅ Dispatched By (auto-filled)

### Optional Fields
- Notes

---

## 💾 What Gets Saved

### Transactions Table
```sql
transaction_type: 'demo' or 'internal'
department: 'Demo/Display / Shopee'
total_revenue: 0
profit: 0
staff_name: 'John Doe'
notes: 'Optional notes'
```

### Inventory Table
```sql
quantity: reduced by dispatched amount
```

### Logs Table
```sql
operation: 'demo-display' or 'internal-usage'
details: Full dispatch information
```

---

## 🎨 UI Elements

### Stock Badges
- **[50]** - Normal stock (green)
- **[LOW]** - Low stock (amber)
- **[OUT]** - Out of stock (red)

### Price Display
- **₱99.00** - Cost price (not selling price)
- **[COST PRICE]** - Badge indicator

### Status Indicators
- **● Currently logged in** - Active user
- **[Verified]** - Auto-verified staff

---

## ⌨️ Keyboard Shortcuts

### Navigation
```
Tab - Next field
Shift+Tab - Previous field
Enter - Submit/Select
Escape - Close modal
```

### Search
```
Ctrl+K - Open command palette
Type "Internal" - Quick access
```

---

## 📱 Responsive Breakpoints

### Desktop (1920px)
- 2-column layout
- 4-column product grid

### Tablet (768px)
- 2-column layout
- 3-column product grid

### Mobile (375px)
- 1-column layout
- 1-column product grid

---

## 🌙 Dark Mode

Toggle dark mode from navbar → All colors adapt automatically

---

## ⚠️ Common Issues

### "Please select a sales channel"
**Solution**: Select a sales channel when using Demo/Display or Internal Use

### "Maximum stock reached"
**Solution**: Cannot add more than available stock

### "Please add items and select a purpose"
**Solution**: Add at least 1 item to cart and select a purpose

---

## 📊 Where to Find Records

### View Transactions
```
Dashboard → Recent Activity
OR
Reports → Transaction Report
```

### View Logs
```
Logs Page → Filter by:
- demo-display
- internal-usage
```

### Check Inventory
```
Inventory Page → See updated quantities
```

---

## 🔄 Workflow Examples

### Example 1: Demo for Shopee
```
1. Purpose: Demo/Display
2. Sales Channel: Shopee
3. Add products: [Product A] × 5
4. Notes: "Product showcase for live stream"
5. Dispatch
6. Result: "Demo/Display / Shopee" saved
```

### Example 2: Internal Office Use
```
1. Purpose: Internal Use
2. Sales Channel: Physical Store
3. Add products: [Office Supplies] × 10
4. Notes: "Office supplies for Q1"
5. Dispatch
6. Result: "Internal Use / Physical Store" saved
```

### Example 3: Warehouse Transfer
```
1. Purpose: Warehouse Transfer
2. Sales Channel: (not shown)
3. Add products: [Product B] × 20
4. Notes: "Transfer to Branch 2"
5. Dispatch
6. Result: "Warehouse Transfer" saved
```

---

## 🎯 Best Practices

### 1. Always Add Notes
- Helps with tracking and auditing
- Provides context for future reference

### 2. Verify Cart Before Dispatch
- Check quantities
- Verify products
- Review total

### 3. Use Correct Purpose
- Demo/Display: For showcases
- Internal Use: For company consumption
- Warehouse Transfer: For location moves

### 4. Select Appropriate Sales Channel
- Choose where the items will be used
- Helps with channel-specific tracking

---

## 📈 Success Metrics

### After Dispatch
- ✅ Dispatch ID generated
- ✅ Inventory reduced
- ✅ Transaction logged
- ✅ Log entry created
- ✅ Success modal shown

### Verification
```sql
-- Check transaction
SELECT * FROM transactions 
WHERE transaction_type IN ('demo', 'internal')
ORDER BY created_at DESC LIMIT 1;

-- Check inventory
SELECT name, quantity FROM inventory 
WHERE id = 'item-id';

-- Check logs
SELECT * FROM logs 
WHERE operation IN ('demo-display', 'internal-usage')
ORDER BY created_at DESC LIMIT 1;
```

---

## 🆘 Need Help?

### Documentation
- `INTERNAL_USAGE_ENTERPRISE_COMPLETE.md` - Full docs
- `INTERNAL_USAGE_VISUAL_GUIDE.md` - Visual reference
- `INTERNAL_USAGE_TESTING_GUIDE.md` - Testing guide
- `INTERNAL_USAGE_BEFORE_AFTER.md` - Comparison

### Support
- Check console for errors
- Verify database connection
- Review logs page
- Check network tab

---

## ✨ Pro Tips

### Tip 1: Use Search
Type product name or category to quickly find items

### Tip 2: Batch Dispatch
Add multiple products to cart before dispatching

### Tip 3: Check Stock
Look at stock badges before adding to cart

### Tip 4: Add Notes
Always add notes for better tracking

### Tip 5: Verify Success
Always check success modal for Dispatch ID

---

## 🎉 You're Ready!

Start using Internal Usage to track:
- 🖥️ Demo displays
- 👥 Internal consumption
- 📦 Warehouse transfers

**Happy Dispatching!** 🚀
