# Demo/Display Tracking - Quick Reference Guide

## What Changed?

Your Warehouse Dispatch page now has **3 new destination options** for non-sales movements:

### Sales Channels (Count as Revenue) ✅
- 📘 Facebook Store
- 🎵 Tiktok Shop  
- 🛒 Lazada
- 🛍️ Shopee
- 🏪 Physical Store

### Internal Use (NO Revenue) ❌
- 🎯 **Demo/Display** - For demonstration or display items
- 🔧 **Internal Use** - For internal company use
- 📦 **Warehouse Transfer** - Stock movement between locations

---

## How to Use

### For Actual Sales
1. Select: Facebook, Tiktok, Lazada, Shopee, or Physical Store
2. Fill form and add items
3. Click "Dispatch"
4. ✅ **Counts as revenue in analytics**

### For Demo/Display Items
1. Select: **Demo/Display**
2. Fill form (add notes like "Trade show booth")
3. Add items
4. Click "Dispatch"
5. ✅ **Inventory reduced, NO revenue counted**

### For Internal Use
1. Select: **Internal Use**
2. Fill form (add notes like "Office supplies")
3. Add items
4. Click "Dispatch"
5. ✅ **Inventory reduced, NO revenue counted**

---

## What Gets Filtered Out?

### Dashboard
- Total Revenue: Sales only
- Profit Margin: Sales only
- Sales Graph: Sales only
- Top Products: Sales only

### Business Insights
- ABC Analysis: Sales only
- Turnover: Sales only
- Forecast: Sales only
- Profit Margin: Sales only

### Reports & Analytics
- All revenue reports: Sales only
- Export data: Sales only

### Inventory (NOT Filtered)
- Stock levels: ALL movements
- Low stock alerts: ALL movements
- Restock tracking: ALL movements

---

## Google Sheets Update

**Action Required**:
1. Open your Google Sheet
2. Go to **Transactions** sheet
3. Add header **"Transaction Type"** in cell **M1**
4. Done! New transactions will auto-populate

**Column M Values**:
- `sale` - Actual sales
- `demo` - Demo/Display items
- `internal` - Internal use
- `transfer` - Warehouse transfers

---

## Benefits

✅ **Accurate Revenue** - Demo items don't inflate sales  
✅ **Better Analytics** - True profit margins and forecasts  
✅ **Clear Tracking** - Know where every item went  
✅ **Audit Trail** - Transaction type saved in Google Sheets  
✅ **Backward Compatible** - Existing data still works  

---

## Example Scenarios

### Scenario 1: Trade Show Demo
- **Destination**: Demo/Display
- **Notes**: "CES 2026 booth display"
- **Result**: Inventory reduced, no revenue, tracked separately

### Scenario 2: Office Supplies
- **Destination**: Internal Use
- **Notes**: "Office printer supplies"
- **Result**: Inventory reduced, no revenue, tracked separately

### Scenario 3: Shopee Sale
- **Destination**: Shopee
- **Notes**: "Order #12345"
- **Result**: Inventory reduced, revenue counted, appears in analytics

---

## Quick Test

1. Go to Warehouse Dispatch
2. Check destination dropdown
3. You should see 3 sections:
   - Sales Channels (5 options)
   - Internal Use header
   - Demo/Display, Internal Use, Warehouse (3 options)

---

**Need Help?** Check `DEMO_DISPLAY_TRACKING_COMPLETE.md` for full documentation.
