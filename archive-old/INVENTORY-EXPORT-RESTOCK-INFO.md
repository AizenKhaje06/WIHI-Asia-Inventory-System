ers to show only recently restocked items
- Display restock frequency metrics
sting

To test the new feature:
1. Navigate to Inventory page
2. Click "Export Report" button (admin only)
3. Select either "Export as PDF" or "Export as Excel"
4. Verify the 3 new restock columns appear in the report
5. Check that products with restocks show proper dates/amounts/reasons
6. Verify products without restocks show "N/A"

## Future Enhancements (Optional)

- Add a separate "Restock History Report" showing all restocks (not just latest)
- Include restock cost information in the summary
- Add filt
3. **Audit Trail**: Track restock reasons (regular restock vs returns)
4. **Comprehensive Reports**: All inventory data in one export

## Notes

- Bundle items are still excluded from the report (as per previous requirements)
- Restock information is optional - products without restocks show "N/A"
- The report shows only the MOST RECENT restock per product group
- Both Excel and PDF formats include the same restock information
- All existing report features (filters, grouping, totals) remain unchanged

## Te### Excel Report Columns
```
Product Name | Quantity | Cost Price | Selling Price | Profit Margin | Total Value | Total COGS | Status | Last Restock Date | Last Restock Amount | Restock Reason
```

### PDF Report Columns
```
Product | Quantity | Cost Price | Selling Price | Profit Margin | Total Value | Status | Last Restock | Restock Qty | Reason
```

## Benefits

1. **Inventory Tracking**: See when products were last restocked
2. **Reorder Planning**: Identify products that haven't been restocked recentlyrds
2. **Grouping Logic**: Items are grouped by Product Name + Cost Price + Selling Price
3. **Restock Matching**: For each group, the system finds all restocks for items in that group
4. **Latest Selection**: The most recent restock (by timestamp) is selected
5. **Formatting**: 
   - Dates are formatted as "Month Day, Year" (e.g., "Mar 15, 2026")
   - Reasons are converted from kebab-case to Title Case (e.g., "damaged-return" → "Damaged Return")
   - If no restock exists, displays "N/A"

## Example Output

  - **Reason**: Formatted reason column

## Restock Data Structure

The `restocks` table contains:
```sql
- id: Unique identifier
- item_id: Reference to inventory item
- item_name: Product name
- quantity: Amount restocked
- cost_price: Cost per unit
- total_cost: Total cost of restock
- timestamp: When the restock occurred
- reason: Reason (restock, damaged-return, supplier-return)
- notes: Optional notes
```

## How It Works

1. **Data Fetching**: When export is triggered, the system fetches all restock recoe generating the report
- Groups items and matches them with their most recent restock
- Added 3 new columns:
  - **Last Restock Date**: Formatted date of the most recent restock
  - **Last Restock Amount**: Quantity added in the last restock
  - **Restock Reason**: Reason for restock (Restock, Damaged Return, Supplier Return)

#### PDF Export (`exportToPDF`)
- Same restock data fetching and grouping logic
- Added 3 new columns to the PDF table:
  - **Last Restock**: Date column
  - **Restock Qty**: Amount column
o the inventory export reports (both Excel and PDF formats). The reports now include the last restock date, amount, and reason for each product.

## Changes Made

### 1. New API Endpoint
**File**: `app/api/restocks/route.ts`
- Created GET endpoint to fetch all restock records from the database
- Returns complete restock history with timestamps, quantities, and reasons

### 2. Updated Export Functions
**File**: `app/dashboard/inventory/page.tsx`

#### Excel Export (`exportToExcel`)
- Now fetches restock data befor# Inventory Export Report - Restock Information Added

## Summary
Added restock history information t