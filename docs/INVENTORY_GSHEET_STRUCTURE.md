# 📦 Inventory Google Sheet - Complete Structure Guide

## 📊 Current Sheet Structure

Your **Inventory** sheet has **10 columns** (A to J):

```
A: ID
B: Name
C: Category
D: Quantity
E: Total COGS
F: Cost Price
G: Selling Price
H: Reorder Level
I: Storage Room
J: Last Updated
```

---

## 📝 Column Details

### Column A: ID
- **Type:** Text/String
- **Format:** Auto-generated UUID
- **Example:** `550e8400-e29b-41d4-a716-446655440000`
- **Purpose:** Unique identifier for each product
- **Required:** Yes (auto-generated)

### Column B: Name
- **Type:** Text
- **Format:** Plain text
- **Example:** `Samsung Galaxy S24`, `Nike Air Max`
- **Purpose:** Product name
- **Required:** Yes
- **Max Length:** 255 characters

### Column C: Category
- **Type:** Text (Dropdown recommended)
- **Format:** Plain text
- **Example:** `Electronics & Gadgets`, `Fashion & Apparel`
- **Purpose:** Product category
- **Required:** Yes
- **Categories:**
  - Electronics & Gadgets
  - Fashion & Apparel
  - Health, Beauty & Personal Care
  - Home & Living
  - Sports & Outdoors
  - Baby, Kids & Toys
  - Groceries & Pets
  - Automotive & Industrial
  - Stationery & Books
  - Other / Miscellaneous

### Column D: Quantity
- **Type:** Number
- **Format:** Integer (whole number)
- **Example:** `50`, `0`, `1000`
- **Purpose:** Current stock quantity
- **Required:** Yes
- **Min Value:** 0
- **Updates:** Automatically when items are dispatched or restocked

### Column E: Total COGS
- **Type:** Number (Currency)
- **Format:** `₱0.00`
- **Example:** `₱5,000.00`
- **Purpose:** Total Cost of Goods Sold (Cost Price × Quantity)
- **Required:** Yes
- **Calculation:** Auto-calculated
- **Formula:** `=F2*D2` (Cost Price × Quantity)

### Column F: Cost Price
- **Type:** Number (Currency)
- **Format:** `₱0.00`
- **Example:** `₱100.00`
- **Purpose:** Cost per unit (how much you paid)
- **Required:** Yes
- **Min Value:** 0

### Column G: Selling Price
- **Type:** Number (Currency)
- **Format:** `₱0.00`
- **Example:** `₱150.00`
- **Purpose:** Selling price per unit
- **Required:** Yes
- **Min Value:** 0
- **Note:** Should be higher than Cost Price for profit

### Column H: Reorder Level
- **Type:** Number
- **Format:** Integer
- **Example:** `10`, `20`, `5`
- **Purpose:** Minimum quantity before low stock alert
- **Required:** Yes
- **Min Value:** 0
- **Recommendation:** Set to 10-20% of average monthly sales

### Column I: Storage Room
- **Type:** Text (Dropdown recommended)
- **Format:** Single letter
- **Example:** `A`, `B`, `C`, `D`, `E`
- **Purpose:** Physical storage location
- **Required:** Yes
- **Options:** A, B, C, D, E

### Column J: Last Updated
- **Type:** Date/Time
- **Format:** `YYYY-MM-DD HH:MM:SS`
- **Example:** `2026-01-25 14:30:00`
- **Purpose:** Track when item was last modified
- **Required:** Yes (auto-generated)
- **Updates:** Automatically on any change

---

## 📋 Sample Data

```
| ID      | Name          | Category    | Qty | Total COGS | Cost  | Price | Reorder | Room | Last Updated        |
|---------|---------------|-------------|-----|------------|-------|-------|---------|------|---------------------|
| abc123  | Product A     | Electronics | 50  | ₱5,000.00  | ₱100  | ₱150  | 10      | A    | 2026-01-25 14:30:00 |
| def456  | Product B     | Fashion     | 0   | ₱0.00      | ₱200  | ₱300  | 5       | B    | 2026-01-25 14:25:00 |
| ghi789  | Product C     | Home        | 100 | ₱15,000.00 | ₱150  | ₱250  | 20      | C    | 2026-01-25 14:20:00 |
```

---

## 🎯 How Data Flows

### 1. Adding New Product
```
User Action: Add product in UI
↓
System: Generates unique ID
↓
System: Calculates Total COGS
↓
System: Sets Last Updated timestamp
↓
Google Sheets: New row added
```

### 2. Dispatching Items (Warehouse Dispatch)
```
User Action: Dispatch 10 units of Product A
↓
System: Reads current quantity (50)
↓
System: Deducts quantity (50 - 10 = 40)
↓
System: Recalculates Total COGS (₱100 × 40 = ₱4,000)
↓
System: Updates Last Updated timestamp
↓
Google Sheets: Row updated
```

### 3. Restocking Items
```
User Action: Restock 20 units of Product A
↓
System: Reads current quantity (40)
↓
System: Adds quantity (40 + 20 = 60)
↓
System: Recalculates Total COGS (₱100 × 60 = ₱6,000)
↓
System: Updates Last Updated timestamp
↓
Google Sheets: Row updated
```

---

## ⚠️ Important Rules

### Data Validation
1. **ID:** Must be unique (system enforced)
2. **Name:** Cannot be empty
3. **Category:** Must be from predefined list
4. **Quantity:** Cannot be negative
5. **Prices:** Must be positive numbers
6. **Reorder Level:** Should be less than typical stock
7. **Storage Room:** Must be A, B, C, D, or E

### Automatic Calculations
- **Total COGS** = Cost Price × Quantity
- **Profit Margin** = ((Selling Price - Cost Price) / Selling Price) × 100%
- **Stock Value** = Selling Price × Quantity

### Stock Status Logic
```
If Quantity = 0:
  Status = "Out of Stock" (Red)
Else If Quantity ≤ Reorder Level:
  Status = "Low Stock" (Yellow)
Else:
  Status = "In Stock" (Green)
```

---

## 🔧 Manual Sheet Setup (If Starting Fresh)

### Step 1: Create Sheet
1. Open your Google Sheet
2. Create a new sheet named **"Inventory"**
3. Add headers in Row 1

### Step 2: Add Headers
Copy and paste this into Row 1:
```
ID | Name | Category | Quantity | Total COGS | Cost Price | Selling Price | Reorder Level | Storage Room | Last Updated
```

### Step 3: Format Columns

**Column A (ID):**
- Format: Plain text
- Width: 150px

**Column B (Name):**
- Format: Plain text
- Width: 200px

**Column C (Category):**
- Format: Plain text
- Width: 180px
- Add Data Validation (dropdown):
  - Electronics & Gadgets
  - Fashion & Apparel
  - Health, Beauty & Personal Care
  - Home & Living
  - Sports & Outdoors
  - Baby, Kids & Toys
  - Groceries & Pets
  - Automotive & Industrial
  - Stationery & Books
  - Other / Miscellaneous

**Column D (Quantity):**
- Format: Number (0 decimals)
- Width: 100px

**Column E (Total COGS):**
- Format: Currency (₱)
- Width: 120px
- Formula: `=F2*D2` (in row 2, copy down)

**Column F (Cost Price):**
- Format: Currency (₱)
- Width: 120px

**Column G (Selling Price):**
- Format: Currency (₱)
- Width: 120px

**Column H (Reorder Level):**
- Format: Number (0 decimals)
- Width: 120px

**Column I (Storage Room):**
- Format: Plain text
- Width: 120px
- Add Data Validation (dropdown): A, B, C, D, E

**Column J (Last Updated):**
- Format: Date time (YYYY-MM-DD HH:MM:SS)
- Width: 180px

### Step 4: Add Conditional Formatting (Optional)

**Low Stock Alert (Column D):**
```
Condition: Custom formula
Formula: =D2<=H2
Format: Yellow background
Range: D2:D1000
```

**Out of Stock Alert (Column D):**
```
Condition: Custom formula
Formula: =D2=0
Format: Red background
Range: D2:D1000
```

---

## 📊 Useful Formulas

### In Your Sheet (Optional Columns)

**Column K: Stock Status**
```
=IF(D2=0,"Out of Stock",IF(D2<=H2,"Low Stock","In Stock"))
```

**Column L: Stock Value**
```
=G2*D2
```

**Column M: Profit Margin %**
```
=IF(G2>0,((G2-F2)/G2)*100,0)
```

**Column N: Profit Per Unit**
```
=G2-F2
```

**Column O: Total Potential Profit**
```
=(G2-F2)*D2
```

---

## 🔍 Common Issues & Solutions

### Issue 1: Total COGS Not Updating
**Problem:** Column E shows old value  
**Solution:** Ensure formula is `=F2*D2` and copy down to all rows

### Issue 2: Quantity Goes Negative
**Problem:** System allows negative stock  
**Solution:** This is prevented in code, but you can add validation:
- Data > Data validation
- Criteria: Number > Greater than or equal to > 0

### Issue 3: Duplicate IDs
**Problem:** Two products have same ID  
**Solution:** System prevents this, but manually check:
- Use formula: `=COUNTIF(A:A,A2)>1`
- If result is TRUE, there's a duplicate

### Issue 4: Wrong Category
**Problem:** Category not in predefined list  
**Solution:** Add data validation dropdown (see Step 3 above)

---

## 📈 Analytics & Reports

### Summary Formulas (Add to a separate "Summary" sheet)

**Total Products:**
```
=COUNTA(Inventory!A2:A)-COUNTBLANK(Inventory!A2:A)
```

**Total Stock Value:**
```
=SUMPRODUCT(Inventory!G2:G,Inventory!D2:D)
```

**Total COGS:**
```
=SUM(Inventory!E2:E)
```

**Low Stock Items:**
```
=COUNTIF(Inventory!D2:D,"<="&Inventory!H2:H)
```

**Out of Stock Items:**
```
=COUNTIF(Inventory!D2:D,0)
```

**Average Profit Margin:**
```
=AVERAGE((Inventory!G2:G-Inventory!F2:F)/Inventory!G2:G)*100
```

---

## 🎯 Best Practices

### 1. Regular Backups
- Make a copy of your sheet weekly
- Name it: `Inventory_Backup_YYYY-MM-DD`

### 2. Data Entry
- Always use the system UI (don't manually edit sheet)
- Manual edits can cause sync issues

### 3. Monitoring
- Check low stock alerts daily
- Review out of stock items
- Update reorder levels based on sales patterns

### 4. Maintenance
- Archive old data quarterly
- Clean up duplicate entries
- Verify stock counts monthly

### 5. Security
- Limit edit access to authorized users
- Use view-only access for reports
- Enable version history

---

## 📝 Summary

### Your Inventory Sheet Has:
✅ **10 Columns** - Complete product information  
✅ **Auto-calculations** - Total COGS computed  
✅ **Stock tracking** - Real-time quantity updates  
✅ **Timestamps** - Last updated tracking  
✅ **Categories** - Organized product groups  
✅ **Storage locations** - Physical warehouse tracking  
✅ **Reorder alerts** - Low stock warnings  

### No Changes Needed! ✅
Your current structure is **perfect** for:
- Product management
- Stock tracking
- Warehouse dispatch
- Inventory reports
- Analytics

---

## 🔗 Related Sheets

Your system also has these sheets:

1. **Inventory** (This sheet) - Product master data
2. **Transactions** - Sales/dispatch history
3. **Customers** - Customer database
4. **Logs** - System activity logs
5. **Restocks** - Restock history

All sheets work together to provide complete inventory management!

---

**Prepared by:** Kiro AI Assistant  
**Date:** January 25, 2026  
**Status:** ✅ Current Structure is Perfect - No Changes Needed!
