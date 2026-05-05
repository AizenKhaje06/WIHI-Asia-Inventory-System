# Business Insights - Team Leader Sales Channel Filter

## Problem
Pag naka-login as Team Leader (e.g., TikTok account), dapat sa Business Insights page, makikita lang nila yung data ng kanilang sales channel (TikTok only), walang data from other channels.

## Solution Implemented

### Changes Made to `app/dashboard/insights/page.tsx`

#### 1. Added Role Detection
```typescript
// Role detection
const userRole = getCurrentUserRole()
const isTeamLeader = userRole === 'team_leader'
const currentUser = getCurrentUser()
const teamLeaderChannel = isTeamLeader ? currentUser?.sales_channel : null
```

#### 2. Auto-Set Sales Channel Filter for Team Leaders
```typescript
// For team leaders, automatically set to their channel
const [salesChannelFilter, setSalesChannelFilter] = useState(
  isTeamLeader && teamLeaderChannel ? teamLeaderChannel : "all"
)
```

#### 3. Disabled Filter Dropdown for Team Leaders
```typescript
<Select 
  value={salesChannelFilter} 
  onValueChange={setSalesChannelFilter}
  disabled={isTeamLeader} // Team leaders cannot change channel
>
  <SelectTrigger>
    <SelectValue placeholder={isTeamLeader ? teamLeaderChannel : "All Channels"} />
  </SelectTrigger>
  <SelectContent>
    {!isTeamLeader && <SelectItem value="all">All Channels</SelectItem>}
    {/* Other channels... */}
  </SelectContent>
</Select>
```

## How It Works

### For Admin Users
- Can select "All Channels" or specific channel
- Dropdown is enabled
- Can switch between channels freely

### For Team Leader Users (e.g., TikTok)
- Automatically filtered to their assigned channel (TikTok)
- Dropdown is disabled (grayed out)
- Cannot see data from other channels
- All analytics show only their channel's data:
  - ABC Analysis
  - Turnover Analysis
  - Forecasts
  - Profit Margins
  - Fast/Slow Moving Items
  - Dead Stock
  - Returns

## Data Filtering

The `salesChannelFilter` is passed to all API calls:
```typescript
const params = new URLSearchParams()
if (salesChannelFilter && salesChannelFilter !== 'all') {
  params.append('salesChannel', salesChannelFilter)
}
```

This ensures:
- ✅ Team leaders only see their channel's data
- ✅ No mixing of data from other channels
- ✅ All tabs and charts respect the filter
- ✅ Automatic on page load

## Testing

### Test as Team Leader (TikTok)
1. Login as TikTok team leader
2. Go to Business Insights page
3. ✅ Sales channel dropdown shows "TikTok" and is disabled
4. ✅ All data shows only TikTok orders
5. ✅ Cannot switch to other channels

### Test as Admin
1. Login as admin
2. Go to Business Insights page
3. ✅ Sales channel dropdown is enabled
4. ✅ Can select "All Channels" or specific channel
5. ✅ Data updates when changing channels

## Related Pages

Same filter logic should be applied to:
- ✅ Business Insights (DONE)
- Sales Analytics
- Sales Channels
- Track Orders
- Packing Queue
- Warehouse Dispatch

## Files Modified
- `app/dashboard/insights/page.tsx` - Added team leader filter

## Status
✅ **COMPLETE** - Team leaders now see only their channel's data on Business Insights page
