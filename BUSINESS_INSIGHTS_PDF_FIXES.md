# Business Insights PDF Export Fixes

## Summary
Fixed all percentage fields and data field mismatches in Business Insights PDF exports to ensure accurate display of all metrics.

## Issues Fixed

### 1. Edit Product Dialog - Category Fetching ✅
**Issue**: Edit Product dialog showed hardcoded categories instead of fetching from Supabase database
**Fix**: 
- Added `categories` state and `loadingCategories` state
- Added `fetchCategories()` function to fetch from `/api/categories`
- Updated category Select to dynamically populate from database
- Now matches Add Product dialog functionality

**File**: `components/edit-item-dialog.tsx`

---

### 2. Returns Tab - Return Rate Field ✅
**Issue**: PDF export looked for field `rate` but actual data has `returnRate`
**Fix**: Changed dataKey from `rate` to `returnRate`

**File**: `lib/pdf-export.ts` - Line 382

---

### 3. Forecast Tab - Recommended Reorder Field ✅
**Issue**: PDF export looked for field `recommendedReorder` but actual data has `recommendedReorderQty`
**Fix**: Changed dataKey from `recommendedReorder` to `recommendedReorderQty`

**File**: `lib/pdf-export.ts` - Line 343

---

### 4. Dead Stock Tab - Multiple Field Mismatches ✅
**Issues**:
- PDF looked for `itemName` but data has `name`
- PDF looked for `daysStagnant` but data has `daysToSell`
- PDF looked for direct `value` field but needs to be calculated as `quantity * costPrice`

**Fixes**:
- Changed `itemName` to `name`
- Changed `daysStagnant` to `daysToSell`
- Added calculation to create `value` field before export: `quantity * costPrice`
- Updated summary calculation to use correct formula

**File**: `lib/pdf-export.ts` - Lines 365-380

---

### 5. Percentage Formatting ✅
**Issue**: Only `revenueContribution` and `margin` were formatted as percentages
**Fix**: Added `returnRate` and `confidence` to percentage formatting logic

**File**: `lib/pdf-export.ts` - Line 107

**Percentage fields now properly formatted**:
- `revenueContribution` - ABC Analysis revenue %
- `margin` - Profit margin %
- `returnRate` - Returns analysis rate %
- `confidence` - Forecast confidence %

---

## Testing Checklist

### ABC Analysis Tab ✅
- [x] Revenue % displays with 2 decimals and % sign
- [x] All product names show correctly
- [x] Category classification (A/B/C) displays
- [x] Recommendations show

### Turnover Tab ✅
- [x] Turnover ratio displays correctly
- [x] Days to sell shows
- [x] Status displays

### Forecast Tab ✅
- [x] Predicted demand shows
- [x] Recommended reorder quantity displays (was broken, now fixed)
- [x] Confidence % displays with 2 decimals and % sign (was broken, now fixed)
- [x] Trend shows

### Profit Tab ✅
- [x] Revenue displays
- [x] Profit displays
- [x] Margin % displays with 2 decimals and % sign

### Dead Stock Tab ✅
- [x] Product name displays (was broken, now fixed)
- [x] Category shows
- [x] Quantity displays
- [x] Days to sell shows (was broken, now fixed)
- [x] Value calculates correctly (was broken, now fixed)

### Returns Tab ✅
- [x] Product name displays
- [x] Quantity returned shows
- [x] Return value displays
- [x] Return rate % displays with 2 decimals and % sign (was broken, now fixed)

---

## Technical Details

### Percentage Formatting Logic
```typescript
if ((col.dataKey === 'revenueContribution' || 
     col.dataKey === 'margin' || 
     col.dataKey === 'returnRate' || 
     col.dataKey === 'confidence') && 
    typeof value === 'number') {
  return `${value.toFixed(2)}%`
}
```

### Dead Stock Value Calculation
```typescript
const deadstockWithValue = data.map(item => ({
  ...item,
  value: item.quantity * item.costPrice
}))
```

---

## Files Modified
1. `components/edit-item-dialog.tsx` - Added dynamic category fetching
2. `lib/pdf-export.ts` - Fixed all field mismatches and percentage formatting

---

## Result
All Business Insights tabs now export accurate PDF reports with:
- ✅ Correct field names matching actual data structure
- ✅ All percentages formatted with 2 decimals and % sign
- ✅ Calculated fields (like dead stock value) computed correctly
- ✅ Consistent data display between UI and PDF exports
