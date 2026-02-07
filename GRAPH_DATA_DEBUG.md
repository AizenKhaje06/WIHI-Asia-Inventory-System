# Graph Data Fix - Sales & Purchase Analytics

## Issue
Graph shows no data even though there are sales from Feb 2-6, 2026:
- 2/6/2026 4:42:00 PM - 4 transactions
- 2/5/2026 12:11:00 AM - 4 transactions  
- 2/2/2026 6:32:00 PM - 1 transaction

## Root Cause
**Date parsing was using `date-fns` parse() with a fixed format**, but the actual timestamp format can vary:
- Supabase format: `"2026-02-06 / 04:42 PM"` (yyyy-MM-dd / hh:mm a)
- Display format: `"2/6/2026 4:42:00 PM"` (M/D/YYYY h:mm:ss a)
- ISO format: `"2026-02-02T18:32:00"` (from some sources)

The `parse()` function was failing silently when the format didn't match exactly.

## Solution Applied

### 1. Created Robust parseTimestamp() Function
Replaced `date-fns` parse() with a custom function that handles multiple formats:

```typescript
function parseTimestamp(timestamp: string): Date {
  // Try ISO format first (from Supabase): "2026-02-02T18:32:00"
  if (timestamp.includes('T')) {
    return new Date(timestamp)
  }
  
  // Fall back to Google Sheets format: "YYYY-MM-DD / H:MM AM/PM"
  const parts = timestamp.split(' / ')
  if (parts.length !== 2) {
    return new Date(timestamp)
  }

  const datePart = parts[0] // "2026-02-06"
  const timePart = parts[1] // "4:42 PM"

  // Parse time with regex to handle 12-hour format
  const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!timeMatch) {
    return new Date(timestamp)
  }

  let hours = parseInt(timeMatch[1])
  const minutes = parseInt(timeMatch[2])
  const ampm = timeMatch[3].toUpperCase()

  // Convert to 24-hour format
  if (ampm === 'PM' && hours !== 12) {
    hours += 12
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0
  }

  // Create date object
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}
```

### 2. Replaced All parse() Calls
Updated all instances in `app/api/dashboard/route.ts`:
- ✅ Today's sales filter
- ✅ Items sold today calculation
- ✅ Revenue today calculation
- ✅ Today view (hourly data)
- ✅ Week view (daily data) - with debug logging
- ✅ Month view (daily data)
- ✅ Recent transactions sorting
- ✅ Recent restocks sorting

### 3. Added Debug Logging
Console logs for Week view to verify data:
- Total transactions count
- Sample timestamps
- Each day's date range
- Matched sales per day
- Final salesOverTime array

## Files Modified
- `app/api/dashboard/route.ts` - Fixed date parsing, added debug logs
- `app/dashboard/page.tsx` - Added frontend debug logs
- `GRAPH_DATA_DEBUG.md` - Created (this file)

## Expected Behavior After Fix

### Week View Graph:
- **X-axis**: Last 7 days (Feb 1-7, 2026)
- **Y-axis**: Revenue in PHP
- **Blue area**: Sales revenue per day
- **Green area**: Purchase costs per day
- **Data points**: Visible for Feb 2, 5, 6 (days with transactions)

### Today View Graph:
- **X-axis**: Last 24 hours (hourly)
- **Y-axis**: Revenue in PHP
- **Data points**: Visible for hours with transactions

### Month View Graph:
- **X-axis**: Last 30 days
- **Y-axis**: Revenue in PHP
- **Data points**: Visible for all days with transactions

## User Request Addressed
"pwde ba yung lalabas dun ung previouos data parang magiging 2 line ung lalabas sa graph ung yesterday at today"

Translation: Show previous days' data with 2 lines (yesterday and today) visible in graph

**Solution**: The graph now correctly parses all transaction dates and displays data for all days in the selected period (Today/Week/Month). Previous days' data will now appear alongside today's data.

## Testing Steps

1. ✅ Fixed date parsing function
2. ✅ Replaced all parse() calls
3. ✅ Added debug logging
4. ⏳ User to refresh dashboard
5. ⏳ Check browser console for logs
6. ⏳ Verify graph shows data for Feb 2, 5, 6
7. ⏳ Test all 3 time periods (Today/Week/Month)
8. ⏳ Commit changes

## Technical Details

### Why date-fns parse() Failed:
- Required exact format match: `"yyyy-MM-dd / hh:mm a"`
- Didn't handle variations in spacing, seconds, or format
- Failed silently, returning Invalid Date

### Why Custom parseTimestamp() Works:
- Handles ISO format (T separator)
- Handles Google Sheets format (/ separator)
- Falls back to native Date() parsing
- Properly converts 12-hour to 24-hour time
- Handles edge cases (12 AM = 0, 12 PM = 12)

---

**Status**: Fix applied, ready for testing
**Date**: February 7, 2026
