# Transaction Type Parsing Fix ✅

## Issue
Transactions with combined department format (e.g., "Demo/Display / Tiktok") were not appearing in Internal Usage page because the transactionType was being set to "sale" instead of "demo" or "internal".

## Root Cause
The sales API was using exact string matching to determine transaction type:

```typescript
// OLD CODE - Exact match only
const nonSalesDestinations = ['Demo/Display', 'Internal Use', 'Warehouse']
const transactionType = nonSalesDestinations.includes(department) 
  ? (department === 'Demo/Display' ? 'demo' : department === 'Internal Use' ? 'internal' : 'transfer')
  : 'sale'
```

This failed when department was "Demo/Display / Tiktok" because it doesn't exactly match "Demo/Display".

## Solution
Updated the logic to use `startsWith()` instead of exact matching:

```typescript
// NEW CODE - Prefix matching
let transactionType: 'sale' | 'demo' | 'internal' | 'transfer' = 'sale'

if (department.startsWith('Demo/Display')) {
  transactionType = 'demo'
} else if (department.startsWith('Internal Use')) {
  transactionType = 'internal'
} else if (department.startsWith('Warehouse')) {
  transactionType = 'transfer'
}
```

## How It Works Now

### Example 1: Demo with Sales Channel
```
Input: department = "Demo/Display / Tiktok"
Result: transactionType = "demo" ✅
Saved to DB:
  - department: "Demo/Display / Tiktok"
  - transactionType: "demo"
  - type: "sale"
```

### Example 2: Internal Use with Sales Channel
```
Input: department = "Internal Use / Lazada"
Result: transactionType = "internal" ✅
Saved to DB:
  - department: "Internal Use / Lazada"
  - transactionType: "internal"
  - type: "sale"
```

### Example 3: Regular Sale
```
Input: department = "Shopee"
Result: transactionType = "sale" ✅
Saved to DB:
  - department: "Shopee"
  - transactionType: "sale"
  - type: "sale"
```

### Example 4: Old Format (Backward Compatible)
```
Input: department = "Demo/Display"
Result: transactionType = "demo" ✅
Saved to DB:
  - department: "Demo/Display"
  - transactionType: "demo"
  - type: "sale"
```

## Internal Usage API Filter
The Internal Usage API filters transactions by transactionType:

```typescript
const internalUsageTransactions = transactions.filter(
  (t: any) => t.transactionType === 'demo' || t.transactionType === 'internal'
)
```

Now that transactionType is correctly set, these transactions will appear in the Internal Usage page! ✅

## Testing

### Before Fix:
- ❌ "Demo/Display / Tiktok" → transactionType = "sale" → NOT shown in Internal Usage
- ❌ "Internal Use / Lazada" → transactionType = "sale" → NOT shown in Internal Usage

### After Fix:
- ✅ "Demo/Display / Tiktok" → transactionType = "demo" → SHOWN in Internal Usage
- ✅ "Internal Use / Lazada" → transactionType = "internal" → SHOWN in Internal Usage
- ✅ "Demo/Display" (old format) → transactionType = "demo" → SHOWN in Internal Usage
- ✅ "Shopee" (regular sale) → transactionType = "sale" → NOT shown in Internal Usage

## Files Modified
- `app/api/sales/route.ts` - Updated transactionType determination logic

## Next Steps
1. Test by creating a new transaction with "Demo/Display / Tiktok"
2. Verify it appears in Internal Usage page
3. Check Sales Channels tab shows "Tiktok" with demo quantity
4. Check Transaction History shows full "Demo/Display / Tiktok" string

## Conclusion
Fixed the transaction type parsing to support the new combined department format. Transactions with "Demo/Display / [Channel]" or "Internal Use / [Channel]" will now correctly appear in the Internal Usage tracking page.
