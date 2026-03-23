# Internal Usage - Auto Sales Channel Filter for Team Leaders

## Problem
Nasa Shopee sales channel account (team_leader) pero may Facebook transactions pa rin na lumalabas sa Recent Transactions sa Overview tab.

## Root Cause
1. Recent Transactions sa Overview tab ay gumagamit ng `transactions` instead of `filteredTransactions`
2. Walang automatic filtering based sa user's assigned sales channel
3. Team leaders dapat makakita lang ng data from their assigned sales channel

## Solution Implemented

### 1. Auto-Set Sales Channel Filter on Load
```typescript
useEffect(() => {
  const currentUser = getCurrentUser()
  if (currentUser) {
    const name = currentUser.displayName || currentUser.username || 'Unknown User'
    setStaffName(name)
    
    // Auto-set sales channel filter for team leaders
    if (currentUser.role === 'team_leader' && currentUser.sales_channel) {
      setFilterSalesChannel(currentUser.sales_channel)
    }
  }
  // ...
}, [])
```

### 2. Updated Recent Transactions to Use Filtered Data
Changed from:
```typescript
{transactions.slice(0, 5).map((transaction) => (
```

To:
```typescript
{filteredTransactions.slice(0, 5).map((transaction) => (
```

### 3. Hide Sales Channel Dropdown for Team Leaders
```typescript
{getCurrentUser()?.role === 'admin' && (
  <Select value={filterSalesChannel} onValueChange={setFilterSalesChannel}>
    // ... dropdown options
  </Select>
)}
```

## How It Works

### For Team Leaders:
1. Login as team leader (e.g., Shopee account)
2. User object has `sales_channel: "Shopee"`
3. On page load, `filterSalesChannel` is automatically set to "Shopee"
4. All data (Overview stats, Recent Transactions, Transaction History) shows only Shopee data
5. Sales channel dropdown is hidden (no need to manually select)

### For Admins:
1. Login as admin
2. `filterSalesChannel` defaults to "all"
3. Can see all channels' data
4. Sales channel dropdown is visible
5. Can manually filter by specific channel

## What Gets Filtered

### Overview Tab:
- ✅ Total Cost stat
- ✅ Demo/Display stat
- ✅ Internal Use stat
- ✅ Warehouse Transfer stat
- ✅ Recent Transactions (last 5)

### Transaction History Tab:
- ✅ All transactions in table
- ✅ Filtered by sales channel

### Sales Channels Tab:
- ✅ Sales channel breakdown
- ✅ Shows only relevant channels

## Testing

### As Team Leader (Shopee):
1. Login as Shopee team leader
2. Go to `/dashboard/internal-usage`
3. Verify Overview tab shows only Shopee transactions
4. Verify Recent Transactions shows only Shopee items
5. Go to Transaction History tab
6. Verify only Shopee transactions are shown
7. Verify sales channel dropdown is hidden

### As Admin:
1. Login as admin
2. Go to `/dashboard/internal-usage`
3. Verify all channels' data is shown by default
4. Verify sales channel dropdown is visible
5. Select "Shopee" from dropdown
6. Verify data filters to Shopee only
7. Select "All Channels" to see all data again

## Result

✅ Team leaders now see only their assigned sales channel's data automatically
✅ Recent Transactions respects the sales channel filter
✅ All stats and analytics update based on filtered data
✅ Admins can still see all channels and manually filter
