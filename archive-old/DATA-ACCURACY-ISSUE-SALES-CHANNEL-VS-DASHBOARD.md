# Data Accuracy Issue: Sales Channel vs Dashboard

## PROBLEM IDENTIFIED

The Sales Channel page and Dashboard page show DIFFERENT data because they use DIFFERENT data sources:

### Dashboard Page
**Data Source**: `orders` table (Track Orders data)
- API: `/api/dashboard`
- Filters: Only `status = 'Packed'` orders
- Excludes: CANCELLED and RETURNED orders (using `parcel_status`)
- Calculation: Based on actual order records with COGS from orders table

**Metrics Shown:**
- Total Revenue: ₱14,178.00
- Net Profit: ₱10,778.00  
- Transactions: 33
- Items Sold: 39

### Sales Channel Page
**Data Source**: `transactions` table (POS/Sales transactions)
- API: `/api/departments`
- Filters: Only `status = 'completed'` transactions
- Excludes: Demo/Display, Internal Use, Warehouse Transfer
- Calculation: Based on transaction records (different from orders)

**Metrics Shown:**
- Different values from Dashboard

## ROOT CAUSE

**TWO SEPARATE DATA SOURCES:**

1. **Orders Table** (used by Dashboard)
   - Contains: Customer orders from Track Orders page
   - Fields: `id`, `product`, `qty`, `total`, `cogs`, `parcel_status`, `payment_status`, `sales_channel`, `date`
   - Purpose: Track customer orders and deliveries

2. **Transactions Table** (used by Sales Channel)
   - Contains: POS sales, internal usage, demos, transfers
   - Fields: `id`, `itemName`, `quantity`, `totalRevenue`, `totalCost`, `profit`, `department`, `timestamp`
   - Purpose: Track all inventory movements

## WHY THEY'RE DIFFERENT

The Dashboard shows **customer orders** (e-commerce, marketplace orders)
The Sales Channel page shows **POS transactions** (physical store sales, internal movements)

These are COMPLETELY DIFFERENT datasets!

## SOLUTION OPTIONS

### Option 1: Unify Data Source (RECOMMENDED)
Make both pages use the SAME data source - the `orders` table

**Changes needed:**
1. Update `/api/departments` to query `orders` table instead of `transactions`
2. Map `sales_channel` field from orders to departments
3. Filter by `status = 'Packed'` and exclude CANCELLED/RETURNED
4. Calculate metrics from order data

**Benefits:**
- Consistent data across all pages
- Single source of truth
- Accurate financial reporting

### Option 2: Merge Both Sources
Combine data from both `orders` and `transactions` tables

**Changes needed:**
1. Query both tables
2. Merge results
3. Remove duplicates
4. Calculate combined metrics

**Drawbacks:**
- More complex
- Risk of double-counting
- Harder to maintain

### Option 3: Separate Clearly
Keep them separate but label clearly

**Changes needed:**
1. Dashboard: "Customer Orders Overview"
2. Sales Channel: "POS Transactions Overview"
3. Add tooltips explaining the difference

**Drawbacks:**
- Confusing for users
- Two different "revenue" numbers
- Not ideal for business reporting

## RECOMMENDED FIX

**Use Option 1: Unify to Orders Table**

The `orders` table is the primary source of truth for revenue because:
- It contains actual customer orders
- Has accurate COGS data
- Tracks parcel status (delivery confirmation)
- Used by Track Orders page (main revenue tracking)
- Excludes cancelled/returned orders properly

The Sales Channel page should show revenue BY sales channel from the orders table, not from POS transactions.

## IMPLEMENTATION

Update `/api/departments/route.ts` to:
1. Query `orders` table instead of `transactions`
2. Group by `sales_channel` field
3. Filter `status = 'Packed'` and exclude CANCELLED/RETURNED
4. Calculate revenue, cost, profit from order data

This will make Sales Channel page data match Dashboard page data.

## FILES TO UPDATE

- `app/api/departments/route.ts` - Change data source from transactions to orders
- Verify calculations match `/api/dashboard/route.ts` logic

## VERIFICATION

After fix, both pages should show:
- Same Total Revenue
- Same Net Profit  
- Same number of Transactions
- Same Items Sold

The only difference should be that Sales Channel page breaks it down BY channel.
