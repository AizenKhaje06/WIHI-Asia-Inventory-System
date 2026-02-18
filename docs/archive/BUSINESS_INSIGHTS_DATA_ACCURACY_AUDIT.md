# 🔍 Business Insights Data Accuracy Audit

## 📋 Issue Summary

User reported: **"Turnover Tab shows 6 dead stocks, but Dead Stock Tab shows 'No Dead Stock Found'"**

---

## 🎯 Root Cause Analysis

There are **TWO DIFFERENT** dead stock calculations:

### 1. Turnover Tab - Dead Stock Count
**Source**: `calculateInventoryTurnover()` function
**Logic**: 
```typescript
if (daysToSell >= 180) status = 'dead-stock'
```
**Criteria**: Items that take **180+ days to sell** based on turnover ratio

### 2. Dead Stock Tab - Dead Stock List
**Source**: `identifyDeadStock()` function
**Logic**:
```typescript
return items.filter(item => {
  const lastSale = transactions.filter(t => t.itemId === item.id && t.type === 'sale')
  return lastSaleDate < cutoffDate (90 days ago) OR never sold
})
```
**Criteria**: Items with **no sales in last 90 days** OR never sold

---

## ❌ THE PROBLEM

**Turnover Tab** counts items as "dead-stock" if they take **180+ days to sell**
**Dead Stock Tab** shows items with **no sales in 90 days**

**Result**: Mismatch! An item can have:
- Slow sales (1 sale every 150 days) = Shows in Turnover as "dead-stock" (6 items)
- But had a sale 80 days ago = NOT shown in Dead Stock tab (0 items)

---

## 📊 Data Accuracy Check - All 5 Tabs

### ✅ Tab 1: ABC Analysis
**Status**: ACCURATE
**Data Source**: `performABCAnalysis()`
**Logic**:
- Calculates revenue contribution per item
- Sorts by revenue (high to low)
- Assigns categories:
  - A: Top items contributing to 80% of revenue
  - B: Next items contributing to 15% of revenue
  - C: Remaining items contributing to 5% of revenue

**Verification**: ✅ Correct

---

### ⚠️ Tab 2: Inventory Turnover
**Status**: PARTIALLY ACCURATE
**Data Source**: `calculateInventoryTurnover()`
**Logic**:
```typescript
turnoverRatio = totalCOGS / avgInventoryValue
daysToSell = 90 days / turnoverRatio

Status:
- fast-moving: < 30 days
- normal: 30-90 days
- slow-moving: 90-180 days
- dead-stock: 180+ days
```

**Issues**:
1. ✅ Turnover ratio calculation: CORRECT
2. ✅ Days to sell calculation: CORRECT
3. ⚠️ **Dead stock count**: Shows items with 180+ days to sell
   - This is CORRECT for turnover analysis
   - But INCONSISTENT with Dead Stock tab

**Recommendation**: Keep as is, but add clarification

---

### ✅ Tab 3: Sales Forecast
**Status**: ACCURATE
**Data Source**: `calculateSalesForecast()`
**Logic**:
- Uses linear regression on historical sales
- Predicts demand for next 30 days
- Calculates trend (increasing/decreasing/stable)
- Confidence based on data consistency

**Requirements**: Minimum 3 sales transactions per item

**Verification**: ✅ Correct

---

### ✅ Tab 4: Profit Margin
**Status**: ACCURATE
**Data Source**: `calculateProfitMarginByCategory()`
**Logic**:
```typescript
margin = (profit / revenue) × 100
```
- Groups transactions by category
- Calculates total revenue and profit per category
- Computes profit margin percentage

**Verification**: ✅ Correct

---

### ❌ Tab 5: Dead Stock
**Status**: INCONSISTENT WITH TURNOVER TAB
**Data Source**: `identifyDeadStock()`
**Logic**:
```typescript
return items with:
- No sales in last 90 days OR
- Never sold
```

**Issue**: Uses **90-day cutoff** while Turnover tab uses **180-day threshold**

**Result**: 
- Turnover shows: 6 items (180+ days to sell)
- Dead Stock shows: 0 items (all had sales within 90 days)

---

## 🔧 RECOMMENDED FIXES

### Option 1: Align Both to Same Definition (RECOMMENDED)
**Change Dead Stock tab to match Turnover logic:**

```typescript
// In lib/analytics.ts - identifyDeadStock()
export function identifyDeadStock(
  items: InventoryItem[],
  transactions: Transaction[],
  daysSinceLastSale: number = 180  // ← Change from 90 to 180
): InventoryItem[] {
  // ... rest of code
}
```

**Result**: Both tabs will show same 6 items

---

### Option 2: Show Both Metrics (ALTERNATIVE)
Keep both calculations but clarify:

**Turnover Tab**:
- "Slow Turnover (180+ days)" instead of "Dead Stock"

**Dead Stock Tab**:
- "No Sales in 90 Days" (current)
- Add filter to switch between 90/180 days

---

### Option 3: Use Turnover Data for Dead Stock Tab (BEST)
**Change Dead Stock tab to use turnover data:**

```typescript
// In app/dashboard/insights/page.tsx
const deadStockFromTurnover = turnover.filter(t => t.status === 'dead-stock')
```

**Benefits**:
- Single source of truth
- Consistent across tabs
- Shows same 6 items

---

## 📊 Current Data Flow

```
Google Sheets (Transactions + Items)
           ↓
    Analytics API
           ↓
    ┌──────────────────┐
    │  Turnover Tab    │ → calculateInventoryTurnover()
    │  Dead Stock: 6   │    (180+ days to sell)
    └──────────────────┘
           
    ┌──────────────────┐
    │  Dead Stock Tab  │ → identifyDeadStock()
    │  Dead Stock: 0   │    (no sales in 90 days)
    └──────────────────┘
```

---

## ✅ VERIFICATION CHECKLIST

### ABC Analysis Tab:
- [x] Revenue calculation correct
- [x] Category assignment (A/B/C) correct
- [x] Cumulative percentage correct
- [x] Recommendations appropriate

### Turnover Tab:
- [x] Turnover ratio calculation correct
- [x] Days to sell calculation correct
- [x] Status classification correct
- [x] Chart data matches table data
- [x] Key metrics accurate

### Forecast Tab:
- [x] Linear regression logic correct
- [x] Trend detection accurate
- [x] Confidence calculation reasonable
- [x] Recommended reorder quantity sensible

### Profit Tab:
- [x] Revenue calculation correct
- [x] Profit calculation correct
- [x] Margin percentage correct
- [x] Category grouping correct

### Dead Stock Tab:
- [ ] **INCONSISTENT** with Turnover tab
- [ ] Uses different criteria (90 vs 180 days)
- [ ] Needs alignment

---

## 🎯 RECOMMENDED ACTION

**Implement Option 3**: Use turnover data for Dead Stock tab

**Why**:
1. Single source of truth
2. Consistent across all tabs
3. No API changes needed
4. Quick fix (frontend only)

**Code Change**:
```typescript
// In app/dashboard/insights/page.tsx
// Replace:
setDeadStock(analyticsData.deadStock || [])

// With:
const deadStockItems = (analyticsData.turnover || [])
  .filter(t => t.status === 'dead-stock')
  .map(t => {
    const item = items.find(i => i.id === t.itemId)
    return item ? { ...item, daysToSell: t.daysToSell } : null
  })
  .filter(Boolean)
setDeadStock(deadStockItems)
```

---

## 📝 Summary

| Tab | Status | Issue | Fix Needed |
|-----|--------|-------|------------|
| ABC Analysis | ✅ Accurate | None | No |
| Turnover | ✅ Accurate | None | No |
| Forecast | ✅ Accurate | None | No |
| Profit | ✅ Accurate | None | No |
| Dead Stock | ❌ Inconsistent | Different criteria than Turnover | Yes |

**Main Issue**: Dead Stock tab uses 90-day cutoff, Turnover tab uses 180-day threshold

**Solution**: Align Dead Stock tab to use turnover data (180-day threshold)

---

**Status**: Audit Complete - Fix Required
**Date**: January 27, 2025
**Priority**: High - Data consistency issue
