# Packing Status Feature - Implementation Guide

## Overview
After submitting orders in Warehouse Dispatch, they appear in Transaction History with a "Ready to Pack" button. Staff can click to mark orders as packed.

---

## Database Changes

### New Columns in `transactions` table:
1. **packing_status** (TEXT, default: 'Pending')
   - Values: "Pending" or "Packed"
   - Tracks if order is ready or already packed

2. **packed_by** (TEXT, nullable)
   - Stores name of person who packed the order
   - Auto-filled from logged-in user account

3. **packed_at** (TIMESTAMP, nullable)
   - Records when the order was packed
   - Auto-filled when status changes to "Packed"

### Migration File:
- `supabase/migrations/013_add_packing_status.sql`

---

## UI Changes - Transaction History Page

### Current Table Columns:
- Date
- Sales Channel
- Store
- Courier
- Waybill
- Status
- QTY
- COGS
- Total
- Parcel Status
- Product
- Dispatched By

### New Column to Add:
- **Packed By** - Shows who packed the order

### Button Behavior:

**When packing_status = "Pending":**
```
Button Text: "Ready to Pack" (or better term: "Mark as Packed")
Button Color: Blue/Primary
Action: Click to mark as packed
```

**When packing_status = "Packed":**
```
Button Text: Shows account name (e.g., "Packed by: Aizen06")
Button Color: Green/Success
Action: Disabled (already packed)
```

---

## API Endpoint Needed

### POST `/api/transactions/[id]/pack`

**Request Body:**
```json
{
  "packedBy": "Aizen06"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "TXN-123",
    "packing_status": "Packed",
    "packed_by": "Aizen06",
    "packed_at": "2026-03-01T10:30:00"
  }
}
```

**SQL Update:**
```sql
UPDATE transactions 
SET 
  packing_status = 'Packed',
  packed_by = $1,
  packed_at = NOW()
WHERE id = $2
```

---

## Frontend Implementation

### Transaction History Page Updates:

1. **Add Packed By Column**
   ```tsx
   <th>Packed By</th>
   ```

2. **Add Button in Row**
   ```tsx
   {transaction.packing_status === 'Pending' ? (
     <Button onClick={() => handleMarkAsPacked(transaction.id)}>
       Mark as Packed
     </Button>
   ) : (
     <Badge variant="success">
       Packed by: {transaction.packed_by}
     </Badge>
   )}
   ```

3. **Handle Click Function**
   ```tsx
   async function handleMarkAsPacked(transactionId: string) {
     const currentUser = getCurrentUser()
     await apiPost(`/api/transactions/${transactionId}/pack`, {
       packedBy: currentUser.displayName
     })
     // Refresh transaction list
     fetchTransactions()
   }
   ```

---

## Status Flow

```
Warehouse Dispatch (Submit Order)
         ↓
Transaction Created
packing_status: "Pending"
         ↓
Staff clicks "Mark as Packed"
         ↓
packing_status: "Packed"
packed_by: "Aizen06"
packed_at: "2026-03-01 10:30:00"
```

---

## Better Button Terms

Instead of "For Packing", consider:
- ✅ **"Mark as Packed"** (Clear action)
- ✅ **"Confirm Packing"** (Professional)
- ✅ **"Pack Order"** (Simple)
- ✅ **"Ready for Shipment"** (Descriptive)

Recommended: **"Mark as Packed"**

---

## Implementation Steps

1. ✅ Run migration: `013_add_packing_status.sql`
2. ⏳ Create API endpoint: `/api/transactions/[id]/pack`
3. ⏳ Update Transaction History page UI
4. ⏳ Add "Packed By" column to table
5. ⏳ Add button with conditional rendering
6. ⏳ Test the flow

---

## Notes

- Only users with proper permissions should be able to mark as packed
- Once marked as "Packed", it cannot be unmarked (one-way action)
- The packed_by field stores the display name, not user ID
- Timestamp uses Manila timezone (Asia/Manila)

---

**Status:** Database migration ready, awaiting API and UI implementation
