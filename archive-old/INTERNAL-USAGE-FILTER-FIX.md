# Internal Usage Page - Sales Channel Filter Fix

## Problem
Ang Internal Usage page ay may data from different sales channels na kasama. Walang sales channel filter kaya lumalabas lahat ng transactions from all channels.

## Solution Implemented

### Changes Made to `app/dashboard/internal-usage/page.tsx`:

1. **Added Sales Channel Filter State**
   ```typescript
   const [filterSalesChannel, setFilterSalesChannel] = useState<string>("all")
   ```

2. **Updated Filtering Logic**
   - Added sales channel filter to `filteredTransactions`
   - Extracts channel from `department` field (format: "Demo / Display / Shopee")
   - Filters transactions to show only selected channel

   ```typescript
   // Filter by sales channel
   if (filterSalesChannel !== "all") {
     const parts = transaction.department?.split(' / ') || []
     const channel = parts.length > 1 ? parts[parts.length - 1] : ''
     if (channel !== filterSalesChannel) return false
   }
   ```

3. **Added Sales Channel Dropdown**
   - Added dropdown next to "Filter by type" dropdown
   - Options: All Channels, Shopee, Lazada, Facebook, TikTok, Physical Store
   - Width: 200px on desktop, full width on mobile

4. **Updated Analytics Calculations**
   - Changed from using `transactions` to `filteredTransactions`
   - Now all stats (Total Cost, Demo Cost, Internal Cost, Transfer Cost) respect the sales channel filter
   - Sales channel breakdown also uses filtered data

## How It Works

### Department Field Format
The `department` field in transactions contains the full path:
- Format: `"Type / Purpose / Channel"`
- Examples:
  - `"Demo / Display / Shopee"`
  - `"Internal Use / Office Supplies / Lazada"`
  - `"Warehouse Transfer / Stock Rebalancing / Physical Store"`

### Filter Extraction
The filter extracts the last part (channel name) from the department field:
```typescript
const parts = transaction.department?.split(' / ') || []
const channel = parts.length > 1 ? parts[parts.length - 1] : ''
```

## Testing

1. Go to `/dashboard/internal-usage`
2. Check the "Transaction History" tab
3. Select "Shopee" from Sales Channel dropdown
4. Verify:
   - Only transactions with "Shopee" in department are shown
   - Total Cost updates to show only Shopee transactions
   - Demo/Internal/Transfer costs update accordingly
   - Sales channel breakdown updates
5. Try other channels (Lazada, Facebook, TikTok, Physical Store)
6. Select "All Channels" to see all data again

## Result

✅ Internal Usage page now properly filters transactions by sales channel
✅ All analytics and stats respect the sales channel filter
✅ Consistent with other pages (Low Stocks, Out of Stocks, Analytics, Logs, Insights)
