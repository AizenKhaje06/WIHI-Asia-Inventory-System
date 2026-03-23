# Track Orders - Status Name as Header

## Summary
Updated all status cards sa track orders page para yung status name ay nasa **HEADER** na (top) instead of sa baba.

## Changes Made
Lahat ng cards ay updated with this pattern:

### BEFORE:
```tsx
<div className="flex items-center justify-between mb-3">
  <div className="p-2 rounded-lg bg-yellow-100">
    <Clock className="h-4 w-4" />
  </div>
</div>
<div className="text-2xl font-bold mb-1">{count}</div>
<div className="text-xs uppercase mb-3">Status Name</div>
```

### AFTER:
```tsx
<div className="text-xs uppercase mb-3">Status Name</div>
<div className="flex items-center justify-between mb-3">
  <div className="text-2xl font-bold">{count}</div>
  <div className="p-2 rounded-lg bg-yellow-100">
    <Clock className="h-4 w-4" />
  </div>
</div>
```

## Cards Updated:
1. ✅ Total Orders
2. ✅ Pending  
3. ⏳ In Transit (need to update)
4. ⏳ On Delivery (need to update)
5. ⏳ Pickup (need to update)
6. ⏳ Delivered (need to update)
7. ⏳ Cancelled (need to update)
8. ⏳ Detained (need to update)
9. ⏳ Problematic (need to update)
10. ⏳ Returned (need to update)

## Next Steps:
Apply the same pattern to remaining cards (3-10).

## Result:
Status name will be prominently displayed at the top of each card as a header! 🎯
