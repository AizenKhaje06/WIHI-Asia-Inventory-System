# 🔧 Cancel Transaction Feature - Setup Guide

## Summary
Added proper database structure and API endpoint for cancelling transactions with automatic inventory restoration.

---

## 🗄️ Step 1: Run Database Migration

Copy and paste this sa Supabase SQL Editor:

```sql
-- Migration: Add quantity column to logs for accurate inventory restoration
-- Purpose: Store quantity separately for easy cancellation and inventory restoration
-- Date: 2026-02-22

-- Add quantity column to logs table
ALTER TABLE logs 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN logs.quantity IS 'Quantity of items in this transaction (for inventory restoration on cancellation)';

-- Backfill existing data from details field
-- This extracts "Qty: 5" from details and converts to integer
UPDATE logs 
SET quantity = CAST(
  SUBSTRING(details FROM 'Qty: ([0-9]+)') AS INTEGER
)
WHERE details LIKE '%Qty:%' AND quantity = 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_logs_quantity ON logs(quantity) WHERE quantity > 0;

-- Verify the migration
SELECT 
  COUNT(*) as total_logs,
  COUNT(CASE WHEN quantity > 0 THEN 1 END) as logs_with_quantity,
  SUM(quantity) as total_quantity
FROM logs;
```

### Verify Migration Success

Run this to check:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'logs' 
AND column_name = 'quantity';
```

Expected result:
```
column_name | data_type | column_default
quantity    | integer   | 0
```

---

## 📡 Step 2: API Endpoint Created

### POST /api/logs (Cancel Transaction)

**Request:**
```typescript
POST /api/logs
{
  "logId": "LOG-xxx",
  "reason": "customer_request",
  "notes": "Customer changed mind",
  "staffName": "Admin"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Transaction cancelled successfully",
  "restoredQuantity": 5
}
```

**Response (Error):**
```json
{
  "error": "Transaction not found"
}
```

### Cancellation Reasons
- `customer_request` - Customer requested cancellation
- `out_of_stock` - Item out of stock
- `payment_failed` - Payment failed
- `duplicate_order` - Duplicate order
- `pricing_error` - Pricing error
- `quality_issue` - Quality issue
- `delivery_issue` - Delivery issue
- `other` - Other reason

---

## 🔄 What Happens When You Cancel

### 1. Update Transaction Status
```sql
UPDATE logs 
SET 
  status = 'cancelled',
  cancellation_reason = 'customer_request',
  cancelled_by = 'Admin',
  cancelled_at = NOW()
WHERE id = 'LOG-xxx';
```

### 2. Restore Inventory
```sql
UPDATE items 
SET quantity = quantity + 5  -- restored quantity
WHERE id = 'ITEM-xxx';
```

### 3. Invalidate Caches
- Logs cache
- Transactions cache
- Inventory items cache
- Dashboard stats cache

---

## 🎯 Next Step: Add Cancel Button to UI

Ilalagay natin yung Cancel button sa Reports page. Here's the plan:

### 1. Add Cancel Button Column
```tsx
<th>Actions</th>
```

### 2. Show Button for Completed Transactions
```tsx
{transaction.status === 'completed' && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => openCancelDialog(transaction)}
  >
    <XCircle className="h-4 w-4 mr-1" />
    Cancel
  </Button>
)}
```

### 3. Cancellation Dialog
```tsx
<Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Cancel Transaction</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <Label>Cancellation Reason</Label>
        <Select value={cancelReason} onValueChange={setCancelReason}>
          <SelectItem value="customer_request">Customer Request</SelectItem>
          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          <SelectItem value="payment_failed">Payment Failed</SelectItem>
          {/* ... more options */}
        </Select>
      </div>
      
      <div>
        <Label>Additional Notes (Optional)</Label>
        <Textarea 
          value={cancelNotes} 
          onChange={(e) => setCancelNotes(e.target.value)}
          placeholder="Provide more details..."
        />
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This will restore {selectedTransaction?.quantity || 0} items to inventory.
        </AlertDescription>
      </Alert>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
        Keep Transaction
      </Button>
      <Button 
        variant="destructive" 
        onClick={handleCancelTransaction}
        disabled={!cancelReason}
      >
        Confirm Cancellation
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4. Handle Cancellation
```typescript
async function handleCancelTransaction() {
  try {
    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logId: selectedTransaction.id,
        reason: cancelReason,
        notes: cancelNotes,
        staffName: currentUser.displayName
      })
    })
    
    if (response.ok) {
      toast.success('Transaction cancelled successfully')
      setShowCancelDialog(false)
      loadReportData() // Refresh data
    } else {
      const error = await response.json()
      toast.error(error.error || 'Failed to cancel transaction')
    }
  } catch (error) {
    toast.error('An error occurred')
  }
}
```

---

## ✅ Files Modified

### Database
- `supabase/migrations/009_add_quantity_to_logs.sql` - New migration

### Backend
- `lib/types.ts` - Added `quantity` to Log interface
- `lib/supabase-db.ts` - Updated addLog to include quantity
- `app/api/sales/route.ts` - Added quantity when creating logs
- `app/api/logs/route.ts` - Added POST endpoint for cancellation

### Frontend (Next Step)
- `app/dashboard/reports/page.tsx` - Will add Cancel button and dialog

---

## 🧪 Testing Checklist

### After Migration
- [ ] Run migration in Supabase
- [ ] Verify quantity column exists
- [ ] Check that existing logs have quantity backfilled
- [ ] Verify index created

### API Testing
- [ ] Test cancelling a completed transaction
- [ ] Verify inventory is restored
- [ ] Test cancelling already cancelled transaction (should fail)
- [ ] Test cancelling non-sale transaction (should fail)
- [ ] Test with missing logId (should fail)
- [ ] Test with missing reason (should fail)

### UI Testing (After Implementation)
- [ ] Cancel button shows only for completed transactions
- [ ] Dialog opens correctly
- [ ] Reason dropdown works
- [ ] Notes textarea works
- [ ] Confirm button disabled without reason
- [ ] Success toast shows
- [ ] Data refreshes after cancellation
- [ ] Inventory updated correctly

---

## 🔒 Security & Validation

### API Validations
✅ Checks if transaction exists
✅ Checks if already cancelled
✅ Checks if it's a sale transaction
✅ Validates required fields (logId, reason)
✅ Uses authenticated user info

### Data Integrity
✅ Atomic operations (transaction + inventory)
✅ Cache invalidation
✅ Audit trail (who, when, why)
✅ Inventory restoration

---

## 📊 Data Flow

```
User clicks Cancel
    ↓
Dialog opens
    ↓
User selects reason + notes
    ↓
POST /api/logs
    ↓
Validate transaction
    ↓
Update logs table (status = cancelled)
    ↓
Restore inventory (quantity + restored_qty)
    ↓
Invalidate caches
    ↓
Return success
    ↓
UI refreshes
    ↓
Toast notification
```

---

## 🎯 Ready to Proceed?

**Current Status:**
- ✅ Database migration ready
- ✅ API endpoint complete
- ✅ TypeScript types updated
- ⏳ UI implementation pending

**Next Action:**
Run the migration sa Supabase, then we can add the Cancel button sa UI! 🚀

Gusto mo ba i-proceed with the UI implementation? 👍
