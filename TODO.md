# Payment Method Implementation for POS

## Current Progress
- [x] Plan approved by user

## Steps to Complete

1. **Update lib/types.ts**
   - [x] Add `paymentMethod: 'cash' | 'gcash' | 'paymaya'` and `referenceNumber?: string` to the Transaction interface.

2. **Update lib/google-sheets.ts**
   - [x] Modify addTransaction to accept new fields in the parameter type (Omit<Transaction, "id" | "timestamp">).
   - [x] Extend the values array in addTransaction to include paymentMethod and referenceNumber (positions 12 and 13, for columns L and M).
   - [x] Update getTransactions to parse the new columns: row[11] for paymentMethod, row[12] for referenceNumber (adjust indices accordingly).

3. **Update app/api/sales/route.ts**
   - [x] Destructure paymentMethod and referenceNumber from the request body.
   - [x] Validate that paymentMethod is provided and referenceNumber is required if not 'cash'.
   - [x] Pass paymentMethod and referenceNumber to addTransaction for each transaction.

4. **Update app/pos/page.tsx**
   - Add state: paymentMethod ('cash' | 'ewallet'), eWalletType ('gcash' | 'paymaya'), referenceNumber (string).
   - Import RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label from "@/components/ui/*".
   - In the cart section, after total, add payment selection UI:
     - RadioGroup for Cash / E-Wallet.
     - If E-Wallet selected, show Select for Gcash / Paymaya and Input for Reference Number.
   - In handleCheckout, compute full paymentMethod ('cash' | 'gcash' | 'paymaya'), include in body: { items: saleItems, paymentMethod, referenceNumber }.

## Followup Steps After Edits
- [ ] Manually update Google Sheets Transactions header: Add "Payment Method" in L1 and "Reference Number" in M1.
- [ ] Test: Run `npm install --legacy-peer-deps` if needed, then `npm run dev`.
- [ ] Verify POS: Add item to cart, select payment (Cash: no ref; E-Wallet: select type, enter ref), complete sale, check Sheets for new columns, stock update, no errors.
- [ ] Update reports if needed (e.g., filter by payment method in future).
- [ ] Commit changes and create PR.

## Notes
- Ensure UI is responsive and accessible.
- For E-Wallet, referenceNumber is required; validate in API.
- No new dependencies; use existing shadcn/ui components.
