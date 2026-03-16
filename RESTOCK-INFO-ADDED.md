# Restock Information Added to Inventory Export

## What Was Done

Added restock history to inventory export reports (Excel & PDF). Each product now shows:
- Last Restock Date
- Last Restock Amount  
- Restock Reason

## Files Modified

1. **app/dashboard/inventory/page.tsx**
   - Updated `exportToExcel()` - now async, fetches restock data
   - Updated `exportToPDF()` - now async, fetches restock data
   - Added 3 new columns to both export formats

2. **app/api/restocks/route.ts** (NEW)
   - Created GET endpoint to fetch all restocks
   - Uses existing `getRestocks()` from supabase-db

## How It Works

1. Export button clicked
2. System fetches all restock records from database
3. Groups inventory items (by name + cost + selling price)
4. Matches each group with its most recent restock
5. Adds restock info to export (date, amount, reason)
6. Products without restocks show "N/A"

## Restock Reasons

The system tracks 3 types of restocks:
- **Restock**: Regular inventory replenishment
- **Damaged Return**: Items returned due to damage
- **Supplier Return**: Items returned from supplier

## Example

```
Product: iPhone Case
Quantity: 150
Last Restock Date: Mar 15, 2026
Last Restock Amount: 50
Restock Reason: Restock
```

## Testing

1. Go to Inventory page (admin account)
2. Click "Export Report" → "Export as Excel" or "Export as PDF"
3. Check the 3 new columns appear
4. Verify restock data shows correctly

## Notes

- Only shows MOST RECENT restock per product
- Bundle items still excluded from report
- All existing features work the same
- Both Excel and PDF have same columns
