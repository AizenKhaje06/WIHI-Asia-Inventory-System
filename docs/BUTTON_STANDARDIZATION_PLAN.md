# Button Standardization Plan

## Reference Image Analysis
Based on the provided DELETE button image, the standard button specifications are:

### Primary Action Buttons (Like DELETE button in image)
- **Height**: `h-12` (48px)
- **Padding**: `px-8` (horizontal)
- **Border Radius**: `rounded-xl` (12px)
- **Font**: `font-bold uppercase text-sm tracking-wide`
- **Icon**: Left-aligned with `mr-3` spacing
- **Icon Size**: `h-5 w-5`
- **Full Width**: Optional based on context

### Button Size Standards

1. **Large Primary Buttons** (Main actions like Save, Delete, Submit)
   - Class: `h-12 px-8 rounded-xl font-bold text-sm`
   - Icon: `h-5 w-5 mr-3`
   - Use for: Form submissions, critical actions, modal primary buttons

2. **Medium Secondary Buttons** (Supporting actions)
   - Class: `h-10 px-6 rounded-lg font-semibold text-sm`
   - Icon: `h-4 w-4 mr-2`
   - Use for: Cancel, secondary actions, filters

3. **Small Utility Buttons** (Refresh, minor actions)
   - Class: `h-8 px-4 rounded-md font-medium text-xs`
   - Icon: `h-3.5 w-3.5 mr-1.5`
   - Use for: Refresh, quick actions, inline buttons

4. **Icon-Only Buttons** (Edit, Delete in tables)
   - Class: `h-8 w-8 rounded-lg` (or `h-6 w-6 rounded` for very compact)
   - Icon: `h-4 w-4` (or `h-3 w-3` for compact)
   - Use for: Table row actions, compact toolbars

## Pages to Update (22 total)

### Priority 1 - High Traffic Pages
- [ ] `/dashboard/page.tsx` - Main dashboard
- [ ] `/dashboard/settings/page.tsx` - Settings (many buttons)
- [ ] `/dashboard/inventory/page.tsx` - Inventory management
- [ ] `/dashboard/pos/page.tsx` - Point of Sale
- [ ] `/dashboard/packing-queue/page.tsx` - Packing queue

### Priority 2 - Moderate Traffic
- [ ] `/dashboard/track-orders/page.tsx` - Order tracking
- [ ] `/dashboard/customers/page.tsx` - Customer management
- [ ] `/dashboard/dispatch/page.tsx` - Dispatch
- [ ] `/dashboard/analytics/page.tsx` - Analytics
- [ ] `/dashboard/inventory/create/page.tsx` - Create inventory

### Priority 3 - Lower Traffic
- [ ] `/dashboard/business-contacts/page.tsx`
- [ ] `/dashboard/insights/page.tsx`
- [ ] `/dashboard/internal-usage/page.tsx`
- [ ] `/dashboard/inventory/low-stock/page.tsx`
- [ ] `/dashboard/inventory/out-of-stock/page.tsx`
- [ ] `/dashboard/log/page.tsx`
- [ ] `/dashboard/operations/page.tsx`
- [ ] `/dashboard/operations/transaction-history/page.tsx`
- [ ] `/dashboard/sales/page.tsx`
- [ ] `/dashboard/sales-channels/page.tsx`
- [ ] `/dashboard/sales-channels/[id]/page.tsx`
- [ ] `/dashboard/packing-queue-new/page.tsx`

## Components to Check
- [ ] Modals (Dialog components)
- [ ] Forms
- [ ] Tables (action buttons)
- [ ] Cards (action buttons)
- [ ] Filters and search bars

## Implementation Notes
- Maintain existing functionality
- Keep existing colors and variants
- Only standardize size, padding, border-radius, and font weight
- Test each page after changes
- Ensure responsive behavior is maintained
