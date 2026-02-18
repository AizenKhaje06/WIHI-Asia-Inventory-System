# 📊 Google Sheets Update Guide - Warehouse Dispatch

## ⚠️ Do You Need to Update?

**Short Answer: YES, but it's OPTIONAL** 

The new fields (`staffName` and `notes`) are **NOT currently being saved** to Google Sheets. You have two options:

---

## Option 1: Keep Current Setup (Recommended for Now) ✅

**No changes needed!** The system will work perfectly without updating Google Sheets.

### Current Columns (10 columns):
```
A: ID
B: Item ID
C: Item Name
D: Quantity
E: Cost Price
F: Selling Price
G: Total Cost
H: Profit
I: Timestamp
J: Department
```

### What's Saved:
✅ Transaction ID  
✅ Product details  
✅ Quantities and prices  
✅ Profit calculation  
✅ Timestamp  
✅ Department/Channel  

### What's NOT Saved:
❌ Staff name  
❌ Dispatch notes  

**This is fine because:**
- All critical data is still tracked
- Inventory is updated correctly
- You can add these fields later if needed
- No immediate action required

---

## Option 2: Add New Columns (Optional Enhancement) 🔧

If you want to track staff names and notes in Google Sheets, follow these steps:

### Step 1: Update Google Sheets Manually

Open your Google Sheet and add two new columns:

**Current Header Row:**
```
A    B        C          D         E           F              G           H       I          J
ID | Item ID | Item Name | Quantity | Cost Price | Selling Price | Total Cost | Profit | Timestamp | Department
```

**New Header Row (Add K and L):**
```
A    B        C          D         E           F              G           H       I          J          K          L
ID | Item ID | Item Name | Quantity | Cost Price | Selling Price | Total Cost | Profit | Timestamp | Department | Staff Name | Notes
```

### Step 2: Update Code Files

#### A. Update `lib/types.ts`

Add new fields to Transaction type:

```typescript
export interface Transaction {
  id: string
  itemId: string
  itemName: string
  quantity: number
  costPrice: number
  sellingPrice: number
  totalCost: number
  totalRevenue: number
  profit: number
  timestamp: string
  type: "sale" | "restock"
  department?: string
  staffName?: string  // ADD THIS
  notes?: string      // ADD THIS
}
```

#### B. Update `lib/google-sheets.ts`

**Change 1: Update initializeTransactionsSheet (line 77)**

```typescript
// OLD
range: "Transactions!A1:J1"

// NEW
range: "Transactions!A1:L1"
```

**Change 2: Update column count (line 90)**

```typescript
// OLD
columnCount: 10

// NEW
columnCount: 12
```

**Change 3: Update headers (line 100)**

```typescript
// OLD
range: "Transactions!A1:J1",
valueInputOption: "RAW",
requestBody: {
  values: [["ID", "Item ID", "Item Name", "Quantity", "Cost Price", "Selling Price", "Total Cost", "Profit", "Timestamp", "Department"]]
}

// NEW
range: "Transactions!A1:L1",
valueInputOption: "RAW",
requestBody: {
  values: [["ID", "Item ID", "Item Name", "Quantity", "Cost Price", "Selling Price", "Total Cost", "Profit", "Timestamp", "Department", "Staff Name", "Notes"]]
}
```

**Change 4: Update addTransaction function (line 332-343)**

```typescript
// OLD
const values = [
  [
    id,
    transaction.itemId,
    transaction.itemName,
    transaction.quantity,
    transaction.costPrice,
    transaction.sellingPrice,
    transaction.totalCost,
    transaction.profit,
    timestamp,
    transaction.department || "",
  ],
]

// NEW
const values = [
  [
    id,
    transaction.itemId,
    transaction.itemName,
    transaction.quantity,
    transaction.costPrice,
    transaction.sellingPrice,
    transaction.totalCost,
    transaction.profit,
    timestamp,
    transaction.department || "",
    transaction.staffName || "",    // ADD THIS
    transaction.notes || "",         // ADD THIS
  ],
]
```

**Change 5: Update range (line 347)**

```typescript
// OLD
range: "Transactions!A:J",

// NEW
range: "Transactions!A:L",
```

**Change 6: Update getTransactions function (line 363)**

```typescript
// OLD
range: "Transactions!A2:J",

// NEW
range: "Transactions!A2:L",
```

**Change 7: Update getTransactions mapping (around line 370-380)**

```typescript
// OLD
return {
  id: row[0],
  itemId: row[1],
  itemName: row[2],
  quantity: Number(row[3]),
  costPrice: Number(row[4]),
  sellingPrice: Number(row[5]),
  totalCost: Number(row[6]),
  totalRevenue: Number(row[5]) * Number(row[3]),
  profit: Number(row[7]),
  timestamp: row[8],
  type: "sale",
  department: row[9] || undefined,
}

// NEW
return {
  id: row[0],
  itemId: row[1],
  itemName: row[2],
  quantity: Number(row[3]),
  costPrice: Number(row[4]),
  sellingPrice: Number(row[5]),
  totalCost: Number(row[6]),
  totalRevenue: Number(row[5]) * Number(row[3]),
  profit: Number(row[7]),
  timestamp: row[8],
  type: "sale",
  department: row[9] || undefined,
  staffName: row[10] || undefined,   // ADD THIS
  notes: row[11] || undefined,        // ADD THIS
}
```

#### C. Update `app/api/sales/route.ts`

**Change 1: Extract new fields from request (line 7)**

```typescript
// OLD
const { items, department } = body

// NEW
const { items, department, staffName, notes } = body
```

**Change 2: Pass new fields to addTransaction (line 32-42)**

```typescript
// OLD
const transaction = await addTransaction({
  itemId: inventoryItem.id,
  itemName: inventoryItem.name,
  quantity: saleItem.quantity,
  costPrice: inventoryItem.costPrice,
  sellingPrice: inventoryItem.sellingPrice,
  totalCost,
  totalRevenue,
  profit,
  type: "sale",
  department,
})

// NEW
const transaction = await addTransaction({
  itemId: inventoryItem.id,
  itemName: inventoryItem.name,
  quantity: saleItem.quantity,
  costPrice: inventoryItem.costPrice,
  sellingPrice: inventoryItem.sellingPrice,
  totalCost,
  totalRevenue,
  profit,
  type: "sale",
  department,
  staffName,    // ADD THIS
  notes,        // ADD THIS
})
```

**Change 3: Update log details (line 52)**

```typescript
// OLD
details: `Sold "${inventoryItem.name}" - Qty: ${saleItem.quantity}, Total: ₱${totalRevenue.toFixed(2)}, Department: ${department}`

// NEW
details: `Dispatched "${inventoryItem.name}" - Qty: ${saleItem.quantity}, Total: ₱${totalRevenue.toFixed(2)}, Department: ${department}, Staff: ${staffName || 'N/A'}`
```

#### D. Update `app/dashboard/pos/page.tsx`

**Change: Update handleCheckout function (around line 115)**

```typescript
// OLD
await fetch("/api/sales", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    items: saleItems,
    department,
  }),
})

// NEW
await fetch("/api/sales", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    items: saleItems,
    department,
    staffName,    // ADD THIS
    notes,        // ADD THIS
  }),
})
```

---

## 📋 Quick Reference: All Changes

### Files to Update:
1. ✅ Google Sheet (manually add columns K and L)
2. ✅ `lib/types.ts` - Add staffName and notes to Transaction interface
3. ✅ `lib/google-sheets.ts` - Update 7 locations (ranges, headers, mappings)
4. ✅ `app/api/sales/route.ts` - Extract and pass new fields
5. ✅ `app/dashboard/pos/page.tsx` - Send new fields to API

### Total Changes: 12 code updates + 1 manual sheet update

---

## 🧪 Testing After Update

### Test 1: Create New Dispatch
1. Enter staff name
2. Select products
3. Choose destination
4. Add notes
5. Complete dispatch
6. Check Google Sheet - verify columns K and L have data

### Test 2: Verify Old Data
1. Check existing rows
2. Columns K and L should be empty (that's OK)
3. New dispatches should populate these columns

### Test 3: Check Reports
1. Go to Reports page
2. Verify transactions still load
3. Check if new fields appear (if you display them)

---

## 🎯 Recommendation

### For Now: **Option 1** (No Changes) ✅

**Why:**
- System works perfectly as-is
- All critical data is tracked
- Staff name and notes are shown in UI
- Can add to sheets later if needed
- Less risk of breaking changes

### Later: **Option 2** (Add Columns) 🔧

**When to do it:**
- When you need historical staff tracking
- When you want to analyze dispatch notes
- When you have time to test thoroughly
- When you're comfortable with code changes

---

## ⚠️ Important Notes

### If You Choose Option 2:

1. **Backup First!**
   - Make a copy of your Google Sheet
   - Backup your code files
   - Test on a separate sheet first

2. **Test Thoroughly**
   - Create test dispatches
   - Verify data appears correctly
   - Check existing functionality still works

3. **Update All Instances**
   - Make sure all 12 code changes are done
   - Don't skip any steps
   - Test after each major change

4. **Old Data**
   - Existing rows will have empty K and L columns
   - That's normal and expected
   - Only new dispatches will have staff/notes

---

## 📊 Visual Comparison

### Current Sheet (10 columns):
```
| ID | Item ID | Item Name | Qty | Cost | Price | Total | Profit | Time | Dept |
|----|---------|-----------|-----|------|-------|-------|--------|------|------|
| 1  | abc123  | Product A | 10  | 50   | 100   | 500   | 500    | ... | FB   |
```

### Updated Sheet (12 columns):
```
| ID | Item ID | Item Name | Qty | Cost | Price | Total | Profit | Time | Dept | Staff | Notes |
|----|---------|-----------|-----|------|-------|-------|--------|------|------|-------|-------|
| 1  | abc123  | Product A | 10  | 50   | 100   | 500   | 500    | ... | FB   | Juan  | Live  |
```

---

## 🤔 Decision Helper

### Choose Option 1 (No Changes) if:
- ✅ You're happy with current tracking
- ✅ You don't need staff names in sheets
- ✅ You want to avoid code changes
- ✅ You're not comfortable with updates
- ✅ System is working fine

### Choose Option 2 (Add Columns) if:
- ✅ You need staff accountability in sheets
- ✅ You want to analyze dispatch notes
- ✅ You're comfortable with code changes
- ✅ You have time to test thoroughly
- ✅ You want complete data tracking

---

## 📝 Summary

**Current Status:**
- ✅ Warehouse dispatch system working
- ✅ Staff name and notes captured in UI
- ✅ All critical data saved to sheets
- ❌ Staff name and notes NOT in sheets

**Your Options:**
1. **Keep as-is** - Works perfectly, no changes needed
2. **Add columns** - Complete tracking, requires updates

**My Recommendation:**
Start with **Option 1** (no changes). Add columns later if you find you need that data in Google Sheets for reporting or analysis.

---

**Prepared by:** Kiro AI Assistant  
**Date:** January 25, 2026  
**Status:** Your choice - both options are valid!
