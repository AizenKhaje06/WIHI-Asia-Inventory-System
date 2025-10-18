# Task: Implement Comma Formatting for Numbers Reaching Thousands

## Overview
Update all number displays in the application to use comma formatting when values reach thousands. Use existing `formatNumber` and `formatCurrency` functions from `lib/utils.ts`.

## Files to Update

### 1. app/dashboard/inventory/page.tsx
- [ ] Import `formatNumber` and `formatCurrency` from `@/lib/utils`
- [ ] Replace `₱{(item.totalCOGS ?? 0).toFixed(2)}` with `formatCurrency(item.totalCOGS ?? 0)`
- [ ] Replace `₱{item.costPrice.toFixed(2)}` with `formatCurrency(item.costPrice)`
- [ ] Replace `₱{item.sellingPrice.toFixed(2)}` with `formatCurrency(item.sellingPrice)`
- [ ] Replace `{item.quantity}` with `{formatNumber(item.quantity)}`

### 2. app/dashboard/reports/page.tsx
- [ ] Already imports `formatNumber`, ensure quantity uses it
- [ ] Replace `{transaction.quantity}` with `{formatNumber(transaction.quantity)}`

### 3. app/dashboard/analytics/page.tsx
- [ ] Import `formatCurrency` from `@/lib/utils`
- [ ] Replace `₱{(report?.totalRevenue || 0).toFixed(2)}` with `formatCurrency(report?.totalRevenue || 0)`
- [ ] Replace `₱{(report?.totalCost || 0).toFixed(2)}` with `formatCurrency(report?.totalCost || 0)`
- [ ] Replace `₱{(report?.totalProfit || 0).toFixed(2)}` with `formatCurrency(report?.totalProfit || 0)`
- [ ] Replace `₱${cell.revenue.toFixed(2)}` with `formatCurrency(cell.revenue)`

### 4. app/dashboard/pos/page.tsx
- [ ] Import `formatCurrency` from `@/lib/utils`
- [ ] Replace `₱{item.sellingPrice.toFixed(2)}` with `formatCurrency(item.sellingPrice)`
- [ ] Replace `₱{(cartItem.item.sellingPrice * cartItem.quantity).toFixed(2)}` with `formatCurrency(cartItem.item.sellingPrice * cartItem.quantity)`
- [ ] Replace `₱{total.toFixed(2)}` with `formatCurrency(total)`
- [ ] Replace `₱{change.toFixed(2)}` with `formatCurrency(change)`
- [ ] Replace `₱{(cartItem.item.sellingPrice * cartItem.quantity).toFixed(2)}` in order summary with `formatCurrency(cartItem.item.sellingPrice * cartItem.quantity)`
- [ ] Replace `₱{total.toFixed(2)}` in order summary with `formatCurrency(total)`
- [ ] Replace `₱{parseFloat(amountPaid).toFixed(2)}` with `formatCurrency(parseFloat(amountPaid))`
- [ ] Replace `₱{change.toFixed(2)}` in order summary with `formatCurrency(change)`

### 5. app/dashboard/page.tsx
- [ ] Already imports `formatNumber`, ensure low stock quantity uses it
- [ ] Replace `{item.quantity}` with `{formatNumber(item.quantity)}` in low stock display

## Testing
- [ ] Verify that numbers below 1000 display without commas
- [ ] Verify that numbers 1000 and above display with commas (e.g., 1,000)
- [ ] Check currency formatting includes ₱ prefix and comma formatting
- [ ] Test across all updated pages
