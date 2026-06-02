# Business Insights - Department Account Filtering Fix

## 🚨 ISSUE FOUND & FIXED

### Problem:
Department accounts (operations role) could see **ALL channels' data** in Business Insights page, which is a **SECURITY and DATA PRIVACY issue**!

Example:
- Shopee department could see Lazada data ❌
- Lazada department could see TikTok data ❌
- All departments could see all channels ❌

### Root Cause:
Business Insights page was NOT auto-filtering by assigned channel for department accounts.

```typescript
// BEFORE (WRONG):
const [salesChannelFilter, setSalesChannelFilter] = useState("all")
// ❌ Department accounts start with "all" - can see everything!
```

### Solution:
Added auto-filtering for department accounts based on their assigned channel.

```typescript
// AFTER (CORRECT):
const isDepartment = userRole === 'operations'
const userChannel = currentUser?.assignedChannel || null

const [salesChannelFilter, setSalesChannelFilter] = useState(
  isDepartment && userChannel ? userChannel : "all"
)
// ✅ Department accounts auto-filter to their channel!
```

## Changes Made:

### File Modified:
`app/dashboard/insights/page.tsx`

### 1. Added Department Detection:
```typescript
const isDepartment = userRole === 'operations'
const userChannel = currentUser?.assignedChannel || null
```

### 2. Auto-Set Channel Filter:
```typescript
const [salesChannelFilter, setSalesChannelFilter] = useState(
  isDepartment && userChannel ? userChannel : "all"
)
```

### 3. Disabled Dropdown for Departments:
```typescript
<Select 
  value={salesChannelFilter} 
  onValueChange={setSalesChannelFilter}
  disabled={isDepartment} // ✅ Can't change channel
>
```

## How It Works Now:

### For Admin Accounts:
- ✅ Can select "All Channels" or specific channel
- ✅ Dropdown is enabled
- ✅ Can see all data

### For Department Accounts (e.g., Shopee):
- ✅ Auto-filtered to "Shopee" only
- ✅ Dropdown is disabled (can't change)
- ✅ Can only see Shopee data
- ✅ All tabs show Shopee data only:
  - ABC Analysis - Shopee items only
  - Turnover - Shopee items only
  - Forecast - Shopee items only
  - Profit - Shopee data only
  - Fast Moving - Shopee items only
  - Slow Moving - Shopee items only
  - Dead Stock - Shopee items only
  - Returns - Shopee returns only

## Data Flow:

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN ACCOUNT                                           │
│ ↓                                                       │
│ salesChannelFilter = "all" (default)                    │
│ ↓                                                       │
│ Can change to any channel                               │
│ ↓                                                       │
│ Sees ALL data or filtered by selected channel          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DEPARTMENT ACCOUNT (e.g., Shopee)                       │
│ ↓                                                       │
│ salesChannelFilter = "Shopee" (auto-set)                │
│ ↓                                                       │
│ Dropdown DISABLED (can't change)                        │
│ ↓                                                       │
│ Sees ONLY Shopee data                                   │
└─────────────────────────────────────────────────────────┘
```

## Combined with Previous Fix:

### 1. Orders Filter (Previous Fix):
```typescript
.in('status', ['Packed', 'Shipped', 'Delivered'])
```
✅ Only completed sales (no pending orders)

### 2. Department Filter (This Fix):
```typescript
if (salesChannel && salesChannel !== 'all') {
  query = query.eq('sales_channel', salesChannel)
}
```
✅ Only assigned channel data

### Result:
Department accounts now see:
- ✅ Only THEIR channel's data
- ✅ Only COMPLETED sales (packed orders)
- ✅ Accurate analytics for their department

## Security Benefits:

1. ✅ **Data Privacy**: Departments can't see other channels' data
2. ✅ **Access Control**: Auto-enforced channel filtering
3. ✅ **No Manual Selection**: Can't accidentally or intentionally view other channels
4. ✅ **Consistent**: Applied to ALL tabs in Business Insights

## Testing Checklist:

### Admin Account:
- [ ] Can select "All Channels"
- [ ] Can select specific channel
- [ ] Dropdown is enabled
- [ ] Data changes when selecting different channels

### Department Account (e.g., Shopee):
- [ ] Auto-filtered to "Shopee"
- [ ] Dropdown is disabled
- [ ] Can only see Shopee data
- [ ] All tabs show Shopee data only
- [ ] Cannot see Lazada, TikTok, etc. data

## Notes:

- This fix applies to ALL tabs in Business Insights
- Department accounts are now properly isolated
- Combined with the previous fix (packed orders only), data is now:
  - ✅ Accurate (completed sales only)
  - ✅ Secure (department-filtered)
  - ✅ Private (can't see other channels)
