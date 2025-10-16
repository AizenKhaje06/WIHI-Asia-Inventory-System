# Restock Reason Dropdown Implementation

## Tasks
- [x] Update lib/types.ts: Add reason: string to Restock interface
- [x] Update lib/google-sheets.ts:
  - [x] initializeRestockSheet: Add "Reason" header to H1
  - [x] addRestock: Include reason in appended values, update range to A:H
  - [x] getRestocks: Read reason from row[7]
- [x] Update app/api/items/[id]/restock/route.ts: Accept reason in request body, pass to addRestock
- [ ] Update restock dialogs in:
  - [ ] app/dashboard/inventory/page.tsx: Add Select component for reason
  - [ ] app/dashboard/inventory/out-of-stock/page.tsx: Add Select component for reason
  - [ ] app/dashboard/inventory/low-stock/page.tsx: Add Select component for reason
  - [ ] app/admin/product-edit/page.tsx: Add Select component for reason
