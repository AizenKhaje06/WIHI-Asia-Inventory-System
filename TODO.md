# Revised Restock Feature Implementation TODO (Dedicated Sheet Version)

## Current Work
Reverting UI changes (remove Restock nav and page), keeping Inventory sheet clean (A:J), creating dedicated "Restock" Google Sheet tab for historical records (appended via API on restock). Restocks recorded with ID, Item ID, Item Name, Quantity Added, Cost Price, Total Cost, Timestamp. Transactions remain for sales only.

## Key Technical Concepts
- Google Sheets API: New "Restock" sheet (A:G), auto-init with headers; append records.
- Next.js App Router: No new page; API-only.
- TypeScript: Add Restock interface.
- Backend: Update restock route to use addRestock instead of addTransaction; keep addLog.

## Relevant Files and Code
- lib/types.ts: Add interface Restock { id: string; itemId: string; itemName: string; quantity: number; costPrice: number; totalCost: number; timestamp: string; }.
- lib/google-sheets.ts:
  - Add initializeRestockSheet(): Create "Restock" sheet if missing, headers ["ID", "Item ID", "Item Name", "Quantity Added", "Cost Price", "Total Cost", "Timestamp"] (A:G).
  - Add addRestock(restock: Omit<Restock, "id" | "timestamp">): Promise<Restock> – Generate id/timestamp, append to "Restock!A:G".
  - Add getRestocks(): Promise<Restock[]> – Fetch "Restock!A2:G", parse, sort descending by timestamp (optional, for future).
- app/api/items/[id]/restock/route.ts: After updateInventoryItem(quantity), call addRestock({ itemId, itemName, quantity: amount, costPrice, totalCost: costPrice * amount }); remove addTransaction; keep addLog.
- components/sidebar.tsx: Revert – Remove PackagePlus import and { name: "Restock", href: "/restock", icon: PackagePlus } from navigation.
- Delete: app/restock/page.tsx (no UI needed).
- lib/google-sheets.ts: Existing Inventory changes (A:J) remain.

## Problem Solving
- Sheet Init: Auto-create on first addRestock, like Logs.
- Data: Total Cost = costPrice * quantity; no payment/profit for restocks.
- Revert: Clean up UI code; no impact on other nav/pages.
- Existing Data: Inventory K:L ignored; suggest manual delete if needed.

## Pending Tasks and Next Steps
1. [x] Add Restock interface to lib/types.ts.
2. [x] Update lib/google-sheets.ts (add initializeRestockSheet, addRestock, getRestocks).
3. [x] Update app/api/items/[id]/restock/route.ts (use addRestock, remove addTransaction).
4. [x] Revert components/sidebar.tsx (remove Restock nav and PackagePlus).
5. [x] Delete app/restock/page.tsx.
6. [x] Test: Run `npm run dev`; POST to /api/items/[id]/restock {amount: 10}; verify quantity update, new row in Restock sheet (A:G), log entry, no transaction, errors handled.
7. [x] Verify sheets: Inventory A:J only; Restock created/appended correctly.
8. [x] Edge cases: amount <=0 (400), invalid ID (404), first restock (sheet init).
9. [x] Update this TODO.md with [x] as steps complete.

"User confirmed revised plan: Proceed with dedicated Restock sheet (columns: ID, Item ID, Item Name, Quantity Added, Cost Price, Total Cost, Timestamp). No additional columns specified."
