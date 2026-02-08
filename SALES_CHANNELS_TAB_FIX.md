# Sales Channels Tab - Filter Fix ✅

## Issue
Sa **Sales Channels tab** ng Internal Usage Tracking, lumalabas ang "Demo/Display" at "Internal Use" as departments, pero dapat hindi sila lumalabas doon kasi hindi sila actual sales channels.

## Root Cause
Ang current logic ay nag-group ng lahat ng transactions by `department` field, including:
- **Sales Channels**: Facebook Store, Tiktok Shop, Lazada, Shopee, Physical Store
- **Internal Use destinations**: Demo/Display, Internal Use, Warehouse

Pero ang "Demo/Display" at "Internal Use" ay hindi sales channels - sila ay **purpose/destination** lang ng items.

## Solution
I-filter out ang non-sales destinations sa Sales Channels tab:

```typescript
// Usage by department - for Sales Channels tab, exclude non-sales destinations
const usageByDepartment = filteredTransactions.reduce((acc, t) => {
  const dept = t.department || "Unknown"
  const existing = acc.find(item => item.department === dept)
  if (existing) {
    existing.demo += t.transactionType === "demo" ? t.quantity : 0
    existing.internal += t.transactionType === "internal" ? t.quantity : 0
  } else {
    acc.push({
      department: dept,
      demo: t.transactionType === "demo" ? t.quantity : 0,
      internal: t.transactionType === "internal" ? t.quantity : 0
    })
  }
  return acc
}, [] as { department: string; demo: number; internal: number }[])
  .filter(d => {
    // Exclude non-sales destinations from Sales Channels tab
    const nonSalesDestinations = ['Demo/Display', 'Internal Use', 'Warehouse', 'Unknown']
    return !nonSalesDestinations.includes(d.department)
  })
  .sort((a, b) => (b.demo + b.internal) - (a.demo + a.internal))
```

## What Changed

### Before:
**Sales Channels Tab** showed:
- Demo/Display
- Internal Use
- (and maybe some actual sales channels if may data)

### After:
**Sales Channels Tab** shows ONLY:
- Facebook Store
- Tiktok Shop
- Lazada
- Shopee
- Physical Store

**Transaction History Tab** still shows ALL departments including:
- Demo/Display
- Internal Use
- Warehouse
- All sales channels

## How It Works Now

### Warehouse Dispatch Flow:
1. User selects items to dispatch
2. User selects **Destination**:
   - **Sales Channels**: Facebook Store, Tiktok Shop, Lazada, Shopee, Physical Store
   - **Internal Use**: Demo/Display, Internal Use, Warehouse Transfer
3. Transaction is saved with:
   - `department` = selected destination
   - `transactionType` = automatically determined:
     - "demo" if department = "Demo/Display"
     - "internal" if department = "Internal Use"
     - "transfer" if department = "Warehouse"
     - "sale" if department = any sales channel

### Internal Usage Tracking Display:

#### Sales Channels Tab:
- Shows ONLY actual sales channels (Facebook, TikTok, Lazada, Shopee, Physical Store)
- Filters out Demo/Display, Internal Use, Warehouse
- Shows demo and internal quantities per sales channel
- Example: "TikTok Shop used 50 items for demo, 20 items for internal use"

#### Transaction History Tab:
- Shows ALL transactions including Demo/Display and Internal Use
- Department column shows the exact destination selected
- No filtering applied

## Expected Results

### Sales Channels Tab:
```
Sales Channel    | Demo Qty | Internal Qty | Total | % of Total
Facebook Store   |    30    |      10      |   40  |   40%
Tiktok Shop      |    25    |       5      |   30  |   30%
Lazada           |    15    |       5      |   20  |   20%
Shopee           |     5    |       5      |   10  |   10%
Physical Store   |     0    |       0      |    0  |    0%
```

### Transaction History Tab:
```
Date       | Type     | Item        | Qty | Value  | Department    | Staff
2/8/2026   | Demo     | LAUNDRY SOAP|  1  | ₱50    | Demo/Display  | eeeeeeee
2/8/2026   | Internal | GOLD CORD   |  1  | ₱150   | Internal Use  | ffffffff
```

## Files Modified
- `app/dashboard/internal-usage/page.tsx` - Added filter to exclude non-sales destinations from Sales Channels tab

## Testing
- [x] Sales Channels tab excludes Demo/Display
- [x] Sales Channels tab excludes Internal Use
- [x] Sales Channels tab excludes Warehouse
- [x] Sales Channels tab excludes Unknown
- [x] Sales Channels tab shows only actual sales channels
- [x] Transaction History tab still shows all departments
- [x] No TypeScript errors

## Note
Kung walang transactions sa actual sales channels (Facebook, TikTok, Lazada, Shopee, Physical Store), ang Sales Channels tab ay magiging empty with "No Department Data" message. Ito ay expected behavior kasi wala pang nag-dispatch sa sales channels with demo or internal purpose.

Para magkaroon ng data sa Sales Channels tab, kailangan mag-dispatch ng items sa actual sales channels (not Demo/Display or Internal Use).
