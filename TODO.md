# Restock Feature Implementation TODO

## Current Work
Implementing restock history by removing restock columns from Inventory sheet/type, recording restocks as transactions (type="restock"), adding sidebar nav and dedicated /restock page for viewing history.

## Key Technical Concepts
- Google Sheets API: Adjust ranges for Inventory (A:J), reuse Transactions sheet for restock records.
- Next.js App Router: New server page /restock with dynamic fetch.
- TypeScript: Update InventoryItem interface.
- UI: shadcn/ui Table, date-fns for formatting, lucide-react PackagePlus icon.

## Relevant Files and Code
- lib/types.ts: Remove `restockAmount?: number` and `restockDate?: string` from InventoryItem.
- lib/google-sheets.ts:
  - getInventoryItems: Change range "Inventory!A2:J"; remove row[10]/row[11] parsing.
  - addInventoryItem: Append 10 values (up to lastUpdated); range "Inventory!A:J".
  - updateInventoryItem: Remove fieldToColumn for restockAmount (10), restockDate (11).
- app/api/items/[id]/restock/route.ts: After updateInventoryItem, call addTransaction({ type: "restock", quantity: amount, totalCost: item.costPrice * amount, totalRevenue: 0, profit: 0, ... }); keep addLog.
- components/sidebar.tsx: Add to navigation: { name: "Restock", href: "/restock", icon: PackagePlus } (import PackagePlus).
- app/restock/page.tsx (new): Fetch getTransactions(), filter type==="restock", table with Date (formatted), Item Name, Quantity Added, Cost Price, Total Cost; dynamic export; empty state.
- app/inventory/page.tsx: No changes (table doesn't use restock fields).

## Problem Solving
- Sheet Structure: Existing data in K:L (restock) will be ignored after range change; manual cleanup if needed.
- Transaction Reuse: Set paymentMethod/referenceNumber to null/empty for restocks; profit=0.
- No Separate Sheet: Reusing Transactions avoids redundancy; filter on client/server.

## Pending Tasks and Next Steps
1. [x] Update lib/types.ts (remove restock fields from InventoryItem).
2. [x] Update lib/google-sheets.ts (adjust Inventory ranges/parsing in getInventoryItems/addInventoryItem/updateInventoryItem).
3. [x] Update app/api/items/[id]/restock/route.ts (add addTransaction call for restock record).
4. [x] Update components/sidebar.tsx (add Restock nav item with PackagePlus icon).
5. [x] Create app/restock/page.tsx (new page: fetch/filter transactions, display table).
6. [ ] Test: Run `npm run dev`; restock an item via API/UI (if integrated), verify transaction in sheet, /restock page shows entry, no errors in inventory fetches.
7. [ ] Verify sheet: Inventory appends to A:J; Transactions has restock entry.
8. [ ] Edge cases: Restock amount=0 (error), non-existent item (404), multiple restocks.
9. [ ] Update this TODO.md with [x] as steps complete.

"User confirmed plan: Proceed with reusing Transactions sheet (filter type='restock'). No additional columns specified (use Date, Item Name, Quantity Added, Cost Price, Total Cost)."
