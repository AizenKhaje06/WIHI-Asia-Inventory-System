# Quick Guide: Editable Amount & Notes Feature

## What's New? 🎉

You can now:
1. **Edit the Total Amount** when creating orders
2. **Add Notes** to orders for special instructions
3. **Edit both fields** later in Track Orders page

---

## How to Use

### Creating an Order

1. Go to **Warehouse Dispatch** page
2. Add items to cart
3. Click **Dispatch** button
4. Fill in the form:
   - Sales Channel ✅
   - Store ✅
   - Courier ✅
   - Waybill ✅
   - Customer Info ✅
   - **Total Amount** - You can edit this! 💰
   - **Notes** - Add special instructions (optional) 📝

### Editing an Order

1. Go to **Track Orders** page
2. Click on any order
3. Click **Edit Order** button
4. You can now edit:
   - Customer details
   - Courier & tracking
   - **Total Amount** 💰
   - **Dispatch Notes** 📝
5. Click **Save Changes**

---

## Before You Start

### ⚠️ Important: Run Database Migration

You need to apply the database migration first:

```sql
-- Run this in your Supabase SQL Editor:
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS dispatch_notes TEXT;
```

Or run the migration file:
```bash
supabase/migrations/019_add_notes_to_orders.sql
```

---

## Examples

### Example 1: Custom Pricing
```
Total Amount: ₱1,500.00 → Edit to ₱1,350.00
Notes: "10% discount for bulk order"
```

### Example 2: Special Delivery
```
Notes: "Deliver before 5 PM. Call customer 30 mins before arrival."
```

### Example 3: Fragile Items
```
Notes: "FRAGILE - Handle with care. Contains glassware."
```

---

## Tips

✅ **Notes are optional** - Leave blank if not needed
✅ **Total Amount is editable** - Adjust for discounts or custom pricing
✅ **Edit anytime** - Both fields can be edited in Track Orders
✅ **Multi-line notes** - Press Enter for new lines

---

## That's It!

Simple and powerful. Your orders now have more flexibility! 🚀
