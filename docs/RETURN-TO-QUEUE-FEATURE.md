# Return to Packing Queue Feature

## Overview
This feature allows Tracker and Admin users to return packed orders back to the packing queue when issues are discovered (wrong item, damaged product, customer request, etc.).

## Implementation Date
June 1, 2026

## Access Control
- **Tracker Role**: ✅ Can return orders to queue
- **Admin Role**: ✅ Can return orders to queue
- **Packer Role**: ❌ Cannot return orders
- **Operations Role**: ❌ Cannot return orders

## Feature Details

### What It Does
When an order is returned to the packing queue:

1. **Order Status Changes**
   - Status: `Packed` → `Pending`
   - `packed_by`: Cleared (set to null)
   - `packed_at`: Cleared (set to null)
   - `parcel_status`: Reset to `PENDING`

2. **Inventory Restoration**
   - Automatically restores the order quantity back to inventory
   - Updates `last_updated` timestamp on inventory item
   - Logs the restoration for audit trail

3. **Sales Data Correction**
   - Removes the sale activity log entry
   - Ensures sales calculations are accurate
   - Updates all dashboard metrics automatically

4. **Activity Logging**
   - Creates new activity log with operation: `return-to-queue`
   - Records the reason for return
   - Tracks who performed the action
   - Includes order ID and product details

### User Interface

#### Tracker Dashboard
1. Open any packed order details
2. Click "Return to Packing Queue" button (amber/orange color)
3. Warning dialog appears with:
   - List of actions that will be performed
   - Required reason field
   - Confirmation buttons

#### Warning Dialog Content
- **Title**: "Return to Packing Queue?"
- **Actions Listed**:
  - Change order status from Packed to Pending
  - Restore inventory quantity
  - Remove from sales calculations
  - Clear packing information
  - Update all dashboard metrics
- **Reason Field**: Required text area for accountability
- **Buttons**: Cancel | Confirm Return

### API Endpoint

**Endpoint**: `POST /api/orders/[id]/return-to-queue`

**Request Body**:
```json
{
  "reason": "Wrong item packed - customer ordered Bundle A but received Bundle B",
  "returnedBy": "Tracker"
}
```

**Response Success**:
```json
{
  "success": true,
  "message": "Order returned to packing queue successfully",
  "order": {
    "id": "order-uuid",
    "status": "Pending",
    "inventoryRestored": true
  }
}
```

**Response Error**:
```json
{
  "error": "Order must be in Packed status to return to queue",
  "currentStatus": "Delivered"
}
```

### Validation Rules

1. **Order Status Check**
   - Only orders with status `Packed` can be returned
   - Orders already `Pending`, `Delivered`, etc. cannot be returned

2. **Required Fields**
   - `reason`: Must not be empty
   - `returnedBy`: Must be provided

3. **Authorization**
   - Only `tracker` and `admin` roles can access this endpoint
   - Returns 403 Forbidden for other roles

### Data Flow

```
User clicks "Return to Queue"
    ↓
Warning dialog shows
    ↓
User enters reason and confirms
    ↓
API validates order status
    ↓
Update order (Packed → Pending)
    ↓
Restore inventory quantity
    ↓
Delete sale activity log
    ↓
Create return-to-queue activity log
    ↓
Return success response
    ↓
UI refreshes order list
    ↓
Toast notifications shown
```

### Impact on System

#### ✅ Positive Impacts
- **Data Accuracy**: Ensures sales and inventory data remain accurate
- **Flexibility**: Allows correction of packing errors
- **Audit Trail**: Full logging of all return actions
- **User Experience**: Clear warnings and confirmations

#### ⚠️ Important Notes
- **Irreversible**: Once returned, the order must be re-packed
- **Metrics Update**: All dashboards will reflect the change immediately
- **Inventory**: Stock is automatically restored
- **Sales Reports**: The sale is removed from calculations

### Testing Checklist

- [ ] Tracker can return packed orders
- [ ] Admin can return packed orders
- [ ] Packer cannot access return endpoint
- [ ] Operations cannot access return endpoint
- [ ] Reason field is required
- [ ] Only Packed orders can be returned
- [ ] Inventory is restored correctly
- [ ] Sale activity log is removed
- [ ] Return activity log is created
- [ ] Order status changes to Pending
- [ ] packed_by and packed_at are cleared
- [ ] Dashboard metrics update correctly
- [ ] Toast notifications appear
- [ ] Order disappears from tracker list
- [ ] Order appears in packing queue

### Files Modified

1. **API Endpoint**
   - `app/api/orders/[id]/return-to-queue/route.ts` (NEW)

2. **Frontend**
   - `app/tracker/dashboard/page.tsx` (MODIFIED)
     - Added state: `showReturnConfirm`, `returnReason`, `returning`
     - Added function: `handleReturnToQueue()`
     - Added UI: Return button + confirmation dialog

3. **Documentation**
   - `RETURN-TO-QUEUE-FEATURE.md` (NEW)

### Future Enhancements

1. **Email Notifications**: Notify relevant parties when order is returned
2. **Reason Categories**: Predefined dropdown of common reasons
3. **Bulk Return**: Return multiple orders at once
4. **Return History**: View all returned orders in a dedicated page
5. **Approval Workflow**: Require admin approval for returns
6. **Photo Upload**: Attach photos showing the issue

### Support

For questions or issues with this feature, contact the development team.

---

**Last Updated**: June 1, 2026
**Version**: 1.0.0
**Status**: ✅ Implemented and Ready for Testing
