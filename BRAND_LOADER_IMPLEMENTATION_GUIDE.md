# Brand Loader Implementation Guide

## Overview
The BrandLoader component with brand colors (orange-red gradient) is now available for all pages.

## Component Location
`components/ui/brand-loader.tsx`

## How to Implement

### Step 1: Import the BrandLoader
```tsx
import { BrandLoader } from '@/components/ui/brand-loader'
```

### Step 2: Replace Loading State
Replace existing loading states with:

```tsx
if (loading) {
  return (
    <div className="flex h-full items-center justify-center min-h-[600px]">
      <div className="text-center">
        <BrandLoader size="lg" />
        <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
          Loading...
        </p>
      </div>
    </div>
  )
}
```

## Pages to Update

### ✅ Already Implemented
- `app/dashboard/track-orders/page.tsx`

### 📋 To Implement

1. **Dashboard** - `app/dashboard/page.tsx`
   - Current: `<PremiumDashboardLoading />`
   - Update to: BrandLoader

2. **Settings** - `app/dashboard/settings/page.tsx`
   - Current: Simple loading div
   - Update to: BrandLoader

3. **Sales Channels** - `app/dashboard/sales-channels/page.tsx`
   - Current: Simple loading div
   - Update to: BrandLoader

4. **Sales** - `app/dashboard/sales/page.tsx`
   - Current: Simple loading div
   - Update to: BrandLoader

5. **Transaction History** - `app/dashboard/operations/transaction-history/page.tsx`
   - Current: Simple loading div
   - Update to: BrandLoader

6. **Log** - `app/dashboard/log/page.tsx`
   - Current: Custom loading
   - Update to: BrandLoader

7. **Inventory** - `app/dashboard/inventory/page.tsx`
   - Current: `<PremiumTableLoading />`
   - Update to: BrandLoader

8. **Out of Stock** - `app/dashboard/inventory/out-of-stock/page.tsx`
   - Current: Simple loading div
   - Update to: BrandLoader

9. **Low Stock** - `app/dashboard/inventory/low-stock/page.tsx`
   - Current: Simple loading div
   - Update to: BrandLoader

10. **Customers** - `app/dashboard/customers/page.tsx`
    - Current: `<PremiumTableLoading />`
    - Update to: BrandLoader

11. **Insights** - `app/dashboard/insights/page.tsx`
    - Current: Simple loading div
    - Update to: BrandLoader

12. **Cancelled Orders** - `app/dashboard/cancelled-orders/page.tsx`
    - Current: Simple loading div
    - Update to: BrandLoader

13. **Analytics** - `app/dashboard/analytics/page.tsx`
    - Current: Simple loading div
    - Update to: BrandLoader

## Loader Sizes

```tsx
<BrandLoader size="sm" />  // 16x16 (64px) - For inline/small areas
<BrandLoader size="md" />  // 24x24 (96px) - Default, for cards
<BrandLoader size="lg" />  // 32x32 (128px) - For full page loading
```

## Example Implementation

### Before:
```tsx
if (loading) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )
}
```

### After:
```tsx
import { BrandLoader } from '@/components/ui/brand-loader'

if (loading) {
  return (
    <div className="flex h-full items-center justify-center min-h-[600px]">
      <div className="text-center">
        <BrandLoader size="lg" />
        <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
          Loading data...
        </p>
      </div>
    </div>
  )
}
```

## Custom Loading Messages

You can customize the loading message per page:

```tsx
// Dashboard
<p>Loading dashboard...</p>

// Inventory
<p>Loading inventory...</p>

// Sales
<p>Loading sales data...</p>

// Customers
<p>Loading customers...</p>
```

## Benefits

1. ✅ Consistent branding across all pages
2. ✅ Professional animated loader
3. ✅ Matches brand colors (orange-red gradient)
4. ✅ Better user experience
5. ✅ Reusable component

## Notes

- The loader uses brand colors: #ec540e, #d6361f, #ff9465, #af1905
- Animation is smooth and professional
- Works in both light and dark modes
- No external dependencies required
