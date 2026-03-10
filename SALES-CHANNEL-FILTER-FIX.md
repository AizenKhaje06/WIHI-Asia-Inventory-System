# Sales Channel Filter Fix - All Pages

## Problem
Ang mga pages na ito ay hindi nag-filter ng data based sa sales channel:
1. Low Stocks (`/dashboard/inventory/low-stock`)
2. Out of Stocks (`/dashboard/inventory/out-of-stock`)
3. Sales Channels (`/dashboard/sales-channels`)
4. Sales Analytics (`/dashboard/analytics`)
5. Business Insights (`/dashboard/insights`)
6. Customers (`/dashboard/customers`)
7. Activity Logs (`/dashboard/log`)

Lahat ng data from all sales channels ay lumalabas kahit may filter.

## Root Cause
- Walang `salesChannelFilter` state variable
- Walang sales channel dropdown sa filters
- Hindi naka-apply ang sales channel filter sa `useEffect` filtering logic
- API calls ay hindi nag-pass ng sales channel parameter

## Solution

### 1. Add Sales Channel Filter State
```typescript
const [salesChannelFilter, setSalesChannelFilter] = useState("all")
```

### 2. Add Sales Channel Dropdown to Filters
```typescript
<Select value={salesChannelFilter} onValueChange={setSalesChannelFilter}>
  <SelectTrigger className="h-11 text-sm rounded-xl">
    <SelectValue placeholder="Sales Channel" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Channels</SelectItem>
    <SelectItem value="Shopee">Shopee</SelectItem>
    <SelectItem value="Lazada">Lazada</SelectItem>
    <SelectItem value="Facebook">Facebook</SelectItem>
    <SelectItem value="TikTok">TikTok</SelectItem>
    <SelectItem value="Physical Store">Physical Store</SelectItem>
  </SelectContent>
</Select>
```

### 3. Apply Filter in useEffect
```typescript
useEffect(() => {
  let filtered = items
  
  // ... existing filters ...
  
  // Add sales channel filter
  if (salesChannelFilter && salesChannelFilter !== "all") {
    filtered = filtered.filter((item) => item.salesChannel === salesChannelFilter)
  }
  
  setFilteredItems(filtered)
}, [search, categoryFilter, salesChannelFilter, sortBy, items])
```

### 4. Update Active Filters Count
```typescript
const activeFiltersCount = [
  categoryFilter !== "all",
  priceFilter !== "all",
  salesChannelFilter !== "all", // Add this
  search !== ""
].filter(Boolean).length
```

### 5. Update Clear All Filters
```typescript
function clearAllFilters() {
  setSearch("")
  setCategoryFilter("all")
  setSalesChannelFilter("all") // Add this
  setSortBy("name-asc")
}
```

## Files to Update
1. ✅ `app/dashboard/inventory/low-stock/page.tsx` - DONE
2. ✅ `app/dashboard/inventory/out-of-stock/page.tsx` - DONE
3. ✅ `app/dashboard/sales-channels/page.tsx` - NOT NEEDED (this IS the sales channels page)
4. ✅ `app/dashboard/analytics/page.tsx` - DONE
5. ⏳ `app/dashboard/insights/page.tsx` - NEEDS FIX (Complex - has multiple tabs)
6. ✅ `app/dashboard/customers/page.tsx` - NOT NEEDED (customers not tied to channels)
7. ✅ `app/dashboard/log/page.tsx` - DONE

## Status: ALMOST COMPLETE

### Completed Pages (5/7):
1. ✅ **Low Stocks** - Added sales channel filter dropdown
2. ✅ **Out of Stocks** - Added sales channel filter dropdown
3. ✅ **Analytics** - Added sales channel filter, passes to API
4. ✅ **Activity Logs** - Added sales channel filter, filters by details content
5. ✅ **Sales Channels** - No changes needed (this is the channels overview page)
6. ✅ **Customers** - No changes needed (customers not channel-specific)

### Remaining (1/7):
7. ⏳ **Insights** - Complex page with multiple tabs (ABC Analysis, Turnover, Forecasts, etc.)
   - Each tab needs sales channel filtering
   - API calls need to be updated
   - This is the most complex page

## What Was Fixed

### Low Stocks Page
- Added `salesChannelFilter` state
- Added Sales Channel dropdown (6 columns grid)
- Applied filter in useEffect
- Updated activeFiltersCount and clearAllFilters

### Out of Stocks Page  
- Added `salesChannelFilter` state
- Added Sales Channel dropdown (5 columns grid)
- Applied filter in useEffect
- Updated activeFiltersCount and clearAllFilters

### Analytics Page
- Added `salesChannelFilter` state
- Added Sales Channel dropdown in controls section (3 columns grid)
- Passes salesChannel parameter to `/api/reports` API
- Updates when filter changes

### Activity Logs Page
- Added `salesChannelFilter` state
- Added Sales Channel dropdown in filters section
- Filters logs by checking if details contains channel name
- Updated hasActiveFilters check
- Updated clearFilters function

## Testing Checklist
- [ ] Low Stocks - Select channel, verify only that channel's low stock items show
- [ ] Out of Stocks - Select channel, verify only that channel's out of stock items show
- [ ] Analytics - Select channel, verify charts and metrics update
- [ ] Activity Logs - Select channel, verify only logs mentioning that channel show
- [ ] Insights - (Pending implementation)

## What Was Fixed

### Low Stocks Page (`/dashboard/inventory/low-stock`)
- ✅ Added `salesChannelFilter` state
- ✅ Added Sales Channel dropdown filter (Shopee, Lazada, Facebook, TikTok, Physical Store)
- ✅ Applied sales channel filter in useEffect
- ✅ Updated activeFiltersCount to include sales channel
- ✅ Updated clearAllFilters to reset sales channel
- ✅ Changed grid from 5 to 6 columns to accommodate new filter

### Out of Stocks Page (`/dashboard/inventory/out-of-stock`)
- ✅ Added `salesChannelFilter` state
- ✅ Added Sales Channel dropdown filter (Shopee, Lazada, Facebook, TikTok, Physical Store)
- ✅ Applied sales channel filter in useEffect
- ✅ Updated activeFiltersCount to include sales channel
- ✅ Updated clearAllFilters to reset sales channel
- ✅ Changed grid from 4 to 5 columns to accommodate new filter

## Testing
After implementing, test by:
1. Login as admin
2. Go to each page
3. Select a specific sales channel from dropdown
4. Verify only data from that channel is shown
5. Check all tabs inside each page
6. Verify "Clear all" button resets the filter

## Status
🔄 IN PROGRESS - Fixing low-stock and out-of-stock pages first
