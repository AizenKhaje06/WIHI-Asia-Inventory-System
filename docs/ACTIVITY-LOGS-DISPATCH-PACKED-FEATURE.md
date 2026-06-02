# Activity Logs - To Be Packed & Sale Feature

## Summary
Updated activity logging to properly track order lifecycle from dispatch to sale completion.

## Changes Made

### 1. Activity Logs Page (`app/dashboard/log/page.tsx`)
- ✅ Replaced **"Dispatch"** with **"To Be Packed"** operation type (sky blue, Package icon)
- ✅ Removed **"Packed"** operation type (no longer used)
- ✅ Kept **"Sale"** operation type for completed sales
- ✅ Updated filter dropdown to reflect new operations

### 2. Orders API (`app/api/orders/route.ts`)
- ✅ Changed logging from "dispatch" to **"to-be-packed"** (POST endpoint)
- ✅ Log includes: product name, sales channel, dispatcher, waybill, quantity, total, and "Awaiting packing" status
- ✅ Example log: `"Order dispatched to Shopee by John Doe. Waybill: WB123, Qty: 5, Total: ₱1,500. Awaiting packing."`

### 3. Packer API (`app/api/packer/pack/[id]/route.ts`)
- ✅ Changed to log **"sale"** only (removed "packed" log)
- ✅ Log includes: sales channel, packer name, waybill, quantity, and total
- ✅ Example log: `"Sale completed via Shopee. Packed by Jane Smith. Waybill: WB123, Qty: 5, Total: ₱1,500"`

### 4. Admin Pack API (`app/api/orders/[id]/pack/route.ts`)
- ✅ Changed to log **"sale"** only (removed "packed" log)
- ✅ Same logging format as packer API

## Order Lifecycle & Logging

### Stage 1: Dispatch (Warehouse Dispatch → Packing Queue)
- **Action**: User creates order in Warehouse Dispatch
- **Log Created**: **"To Be Packed"**
- **Details**: Shows who dispatched, channel, waybill, qty, total
- **Order Status**: `Pending` (in Packing Queue)
- **Meaning**: Order is waiting to be packed

### Stage 2: Pack & Complete Sale (Packing Queue → Track Orders)
- **Action**: Packer marks order as packed
- **Log Created**: **"Sale"** (single log)
- **Details**: Shows sale completion, who packed, channel, waybill, qty, total
- **Order Status**: `Packed` (moved to Track Orders)
- **Inventory**: Deducted at this point
- **Meaning**: Sale is now complete

## Visual Design

### To Be Packed Badge
- **Color**: Sky blue (`bg-sky-100 text-sky-700`)
- **Icon**: Package 📦
- **Label**: "To Be Packed"

### Sale Badge
- **Color**: Orange (`bg-orange-100 text-orange-700`)
- **Icon**: ShoppingCart 🛒
- **Label**: "Sale"

## Features

### For Admin Accounts
- Can see **all** "To Be Packed" and "Sale" logs across all departments
- Can filter by:
  - Operation type (To Be Packed / Sale / etc.)
  - Sales channel (Shopee, Lazada, Facebook, etc.)
  - Date range
  - Search by product name, waybill, or dispatcher/packer name

### For Department Accounts
- Can see **only their department's** "To Be Packed" and "Sale" logs
- Automatically filtered by assigned sales channel
- Can filter by:
  - Operation type (To Be Packed / Sale / etc.)
  - Date range
  - Search by product name, waybill, or dispatcher/packer name

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│ 1. WAREHOUSE DISPATCH                                       │
│    User creates order                                       │
│    ↓                                                        │
│    Log: "To Be Packed" 📦                                  │
│    Status: Pending                                          │
│    Location: Packing Queue                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PACKING QUEUE                                            │
│    Packer marks as packed                                   │
│    ↓                                                        │
│    Log: "Sale" 🛒                                          │
│    Status: Packed                                           │
│    Location: Track Orders                                   │
│    Inventory: DEDUCTED                                      │
└─────────────────────────────────────────────────────────────┘
```

## Testing

### Test "To Be Packed" Logging:
1. Go to Warehouse Dispatch (`/dashboard/pos`)
2. Create a new order
3. Check Activity Logs
4. Should see: **"To Be Packed"** entry (sky blue badge)

### Test "Sale" Logging:
1. Go to Packing Queue (`/dashboard/packing-queue`) or Packer Dashboard (`/packer/dashboard`)
2. Mark an order as packed
3. Check Activity Logs
4. Should see: **"Sale"** entry (orange badge)
5. Should NOT see: "Packed" entry

### Test Filtering:
1. Go to Activity Logs (`/dashboard/log`)
2. Use Operation filter dropdown
3. Select "To Be Packed" - shows only orders waiting to be packed
4. Select "Sale" - shows only completed sales

### Test Department Filtering:
1. Login as department account (e.g., Shopee)
2. Go to Activity Logs
3. Verify only Shopee-related logs are shown

## Notes

- **No more "Packed" operation** - replaced with "Sale" to indicate completed transaction
- **"To Be Packed"** indicates order is in queue, not yet a sale
- **"Sale"** indicates completed transaction with inventory deducted
- Logs are created asynchronously and won't fail the main operation if logging fails
- Activity Logs page auto-refreshes every 5 seconds
- Both admin and department accounts can see these operation types
- Department filtering is automatic based on assigned sales channel
