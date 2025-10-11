# Restock Feature Implementation for Inventory

## Current Progress
- [x] Plan approved by user

## Steps to Complete

1. **Update lib/types.ts**
   - Add `restockAmount?: number` and `restockDate?: string` to the InventoryItem interface.

2. **Update lib/google-sheets.ts**
   - Modify getInventoryItems to parse A2:L (add row[10] for restockAmount: Number.parseFloat(row[10] || "0"), row[11] for restockDate: row[11] || "").
   - Update addInventoryItem to append A:L (add empty restockAmount=0, restockDate="" after lastUpdated).
   - Update updateInventoryItem to handle A:L (extend values array to 12 elements, include restock fields if provided).

3. **Create app/api/items/[id]/restock/route.ts**
   - New POST endpoint: Accept { amount: number } in body.
   - Validate amount > 0.
   - Fetch item by id using getInventoryItems.
   - If not found, return 404 error.
   - Compute newQuantity = current.quantity + amount.
   - Call updateInventoryItem(id, { quantity: newQuantity, restockAmount: amount, restockDate: new Date().toISOString(), lastUpdated: new Date().toISOString() }).
   - Return success with updated item.

4. **Update app/inventory/page.tsx**
   - Import Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger from "@/components/ui/dialog".
   - Import Button, Input, Label.
   - Add state for selectedItemId and restockAmount (number).
   - For each item row, add Restock button (variant="outline") that sets selectedItemId and opens dialog.
   - Create RestockDialog: Input for amount (min=1, type=number), on submit call fetch(`/api/items/${selectedItemId}/restock`, { method: 'POST', body: JSON.stringify({ amount }) }), close dialog, refresh items.
   - Handle errors (e.g., alert on failure).

## Followup Steps After Edits
- [ ] Manually update Google Sheets Inventory header: Add "Restock Amount" in K1 and "Restock Date" in L1.
- [ ] Test: Run `npm install --legacy-peer-deps` if needed, then `npm run dev`.
- [ ] Verify: Navigate to /inventory, click Restock on an item, enter amount >0, submit, check quantity increased, K/L populated in Sheets, no impact on sales/POS.
- [ ] Ensure existing add/edit/delete inventory still works without breaking new columns.
- [ ] Commit changes and create PR.

## Notes
- RestockAmount records the last added amount; if multiple restocks, it overwrites (for simplicity; could extend to log history if needed).
- Validation: Amount must be positive integer; quantity won't go below 0.
- No new dependencies; use existing shadcn/ui Dialog and components.
- Quantity (E) auto-computes as current + restock amount on each restock.
