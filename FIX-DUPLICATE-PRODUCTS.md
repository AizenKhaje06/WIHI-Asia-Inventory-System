# Fix Duplicate Products - BERRY SOAP Issue

## Problem
You have duplicate products with:
- Same name: "BERRY SOAP"
- Same store: "GLOWMANCE"
- Same sales channel: "Lazada"
- Different stock: 0 units and 985 units

This creates inventory confusion and should not be allowed.

## Quick Fix (3 Steps)

### Step 1: Find All Duplicates
Run `FIND-ALL-DUPLICATES.sql` in Supabase SQL Editor to see all duplicates.

### Step 2: Delete Zero-Stock Duplicates
Run `DELETE-ZERO-STOCK-DUPLICATES.sql`:
1. First run Step 1 (preview) to see what will be deleted
2. If it looks good, uncomment Step 2 and run it
3. This safely deletes duplicates with 0 stock when a duplicate with stock exists

### Step 3: Apply Database Constraint
After duplicates are cleaned, run migration `037_add_unique_constraint_inventory.sql` to prevent future duplicates.

## Solution Applied

### 1. API Validation (Already Active ✅)
Added duplicate check in `/api/items` POST endpoint:
- Checks if product with same name, store, and sales channel already exists
- Returns 409 Conflict error with helpful message
- Shows existing product details
- **Prevents new duplicates from being created NOW**

### 2. Database Constraint (Pending ⏳)
Migration `037_add_unique_constraint_inventory.sql`:
- Adds UNIQUE constraint on (name, store, sales_channel)
- Prevents duplicates at database level
- **Must fix existing duplicates before running this migration**

## Files Created

1. **FIND-ALL-DUPLICATES.sql** - Shows all duplicate products
2. **DELETE-ZERO-STOCK-DUPLICATES.sql** - Safely removes duplicates with 0 stock
3. **DELETE-DUPLICATE-BERRY-SOAP.sql** - Manual fix for BERRY SOAP specifically

## Error Message Users Will See

When trying to create a duplicate:
```
Product "BERRY SOAP" already exists in GLOWMANCE (Lazada). 
Please update the existing product instead of creating a duplicate.

Existing Product:
- ID: ITEM-xxx
- Name: BERRY SOAP
- Store: GLOWMANCE
- Sales Channel: Lazada
- Current Stock: 985 units
```

## What's Now Blocked (API Level):
✅ Creating "BERRY SOAP" in GLOWMANCE/Lazada again (already exists)
✅ Creating any product with same name/store/channel combination
✅ User-friendly error message with existing product details

## What Will Be Blocked (After Migration):
✅ Database-level prevention (even if API is bypassed)
✅ Permanent protection against duplicates

## Recommended Action

1. **Now**: Run `FIND-ALL-DUPLICATES.sql` to see all duplicates
2. **Then**: Run `DELETE-ZERO-STOCK-DUPLICATES.sql` to clean them up
3. **Finally**: Run migration `037_add_unique_constraint_inventory.sql`
4. **Result**: No more duplicate products possible!

---

**Status**: 
- ✅ API validation added (prevents new duplicates)
- ✅ Cleanup scripts created
- ⏳ Database constraint ready (needs duplicate cleanup first)
- ⏳ Existing duplicates need manual cleanup (run the SQL scripts)
