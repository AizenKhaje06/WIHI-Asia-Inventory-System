# Enhanced Order Cancellation Feature

## Overview
Complete implementation of enhanced order cancellation system with reason tracking, uncancellation capability, activity logging, and filtering.

## Features Implemented

### 1. Cancellation Reason (Dropdown)
**Location**: Packing Queue Page - Cancel Order Dialog

**Predefined Reasons**:
- Customer changed mind
- Ordered by mistake
- Duplicate order
- No longer needed
- Payment not completed
- Payment declined
- COD not confirmed
- Out of stock
- Item damaged before packing
- Unable to ship to location
- Invalid / incomplete address
- Shipping delay issue
- Pricing or listing error
- Suspected fraudulent order
- Internal processing issue
- Other (please specify) - Shows text input for custom reason

**Validation**:
- Reason selection is required
- If "Other" is selected, custom text input is required
- Submit button disabled until valid reason is provided

### 2. Database Schema
**Migration**: `046_add_cancellation_reason.sql`

**New Columns in `orders` table**:
- `cancellation_reason` (TEXT) - Stores the reason for cancellation
- `cancelled_by` (TEXT) - Username of person who cancelled
- `cancelled_at` (TIMESTAMPTZ) - Timestamp of cancellation

### 3. Cancellation Flow
**Department Accounts (Operations Role)**:
1. Open order details modal in Packing Queue
2. Click "CANCEL" button (orange)
3. Select cancellation reason from dropdown
4. If "Other" selected, provide custom reason
5. Confirm cancellation
6. Order marked as cancelled (red highlight in table)
7. Order remains in queue with CANCELLED badge
8. Activity log entry created: "CANCEL" operation

**Display**:
- Cancelled orders highlighted in RED
- CANCELLED badge next to waybill number
- Cancellation details shown in modal:
  - Reason for cancellation
  - Cancelled by (username)
  - Cancellation timestamp

### 4. Uncancellation (Restore Order)
**Department Accounts (Operations Role)**:
1. Open cancelled order details modal
2. Click "RESTORE ORDER" button (green)
3. Order restored to normal state
4. Red highlight removed
5. Order available for packing again
6. Activity log entry created: "UNCANCEL" operation

**Restrictions**:
- Cannot uncancel orders that are already packed
- Only operations role can uncancel

### 5. Activity Logs Integration
**Operations Logged**:
- **CANCEL**: When order is cancelled
  - Item name, quantity, user, cancellation reason
- **UNCANCEL**: When order is restored
  - Item name, quantity, user, restoration note

**Activity Logs Page Filter**:
- New "Cancelled" filter dropdown added next to search bar
- Filter options:
  - All Operations (default)
  - Cancelled Only - Shows only CANCEL operations
  - Uncancelled Only - Shows only UNCANCEL operations

### 6. API Endpoints
**PATCH `/api/orders/[id]/cancel`** - Cancel Order
- Request body: `{ reason: string, cancelledBy: string }`
- Validates reason is provided
- Checks order is not already packed or cancelled
- Updates order with cancellation details
- Creates activity log entry
- Returns success message

**POST `/api/orders/[id]/cancel`** - Uncancel Order
- Request body: `{ restoredBy: string }`
- Validates order is cancelled
- Checks order is not already packed
- Clears cancellation fields
- Creates activity log entry
- Returns success message

## User Interface

### Packing Queue Page
**Cancel Order Dialog**:
- Professional orange-themed design
- Dropdown for cancellation reason
- Conditional text input for "Other" option
- Validation feedback
- Disabled state during processing

**Order Details Modal - Cancelled Order**:
- Red alert box showing:
  - "⚠️ Order Cancelled" header
  - Cancellation reason
  - Cancelled by username
  - Cancellation timestamp
- "RESTORE ORDER" button (operations only)
- "DELETE" button still available

**Order Details Modal - Active Order**:
- "MARK AS PACKED" button
- "CANCEL" button (operations only)
- "DELETE" button

### Activity Logs Page
**New Filter**:
- Positioned between search bar and operation filter
- Dropdown with 3 options
- Filters logs to show only cancel/uncancel operations
- Works with other filters (search, date, channel, etc.)

## Technical Details

### State Management
```typescript
const [cancellationReason, setCancellationReason] = useState('')
const [cancellationReasonOther, setCancellationReasonOther] = useState('')
const [uncancelling, setUncancelling] = useState(false)
```

### Order Interface
```typescript
interface Order {
  // ... existing fields
  is_cancelled?: boolean
  cancellation_reason?: string
  cancelled_by?: string
  cancelled_at?: string
}
```

### Validation Logic
- Reason required: `cancellationReason !== ''`
- Custom reason required if "Other": `cancellationReason === 'Other' && cancellationReasonOther.trim() !== ''`
- Submit disabled until validation passes

## Files Modified

### Frontend
1. `app/dashboard/packing-queue/page.tsx`
   - Added cancellation reason dropdown
   - Added uncancel functionality
   - Updated modal to show cancellation details
   - Added state management for reasons

2. `app/dashboard/log/page.tsx`
   - Added cancelled filter dropdown
   - Updated filter logic to handle cancel/uncancel operations
   - Added filter state management

### Backend
3. `app/api/orders/[id]/cancel/route.ts`
   - Updated PATCH to accept reason and cancelledBy
   - Added POST endpoint for uncancellation
   - Added activity log entries for both operations

### Database
4. `supabase/migrations/046_add_cancellation_reason.sql`
   - Added cancellation_reason column
   - Added cancelled_by column
   - Added cancelled_at column

## Testing Checklist

### Cancellation
- [ ] Select each predefined reason and cancel order
- [ ] Select "Other" and provide custom reason
- [ ] Try to submit without selecting reason (should be blocked)
- [ ] Try to submit "Other" without custom text (should be blocked)
- [ ] Verify order appears with red highlight after cancellation
- [ ] Verify CANCELLED badge appears
- [ ] Verify cancellation details shown in modal
- [ ] Verify activity log entry created

### Uncancellation
- [ ] Open cancelled order modal
- [ ] Click "RESTORE ORDER" button
- [ ] Verify red highlight removed
- [ ] Verify CANCELLED badge removed
- [ ] Verify order can be packed again
- [ ] Verify activity log entry created

### Activity Logs Filter
- [ ] Select "Cancelled Only" - should show only CANCEL operations
- [ ] Select "Uncancelled Only" - should show only UNCANCEL operations
- [ ] Select "All Operations" - should show all logs
- [ ] Verify filter works with other filters (search, date, etc.)

### Permissions
- [ ] Verify only operations role sees CANCEL button
- [ ] Verify only operations role sees RESTORE ORDER button
- [ ] Verify admin cannot cancel/uncancel (operations only)

## User Accounts for Testing

**Department Accounts (Operations Role)**:
- Facebook-Juan / juan123
- Lazada-Carlo / carlo123
- Physical Store-Ben / ben123
- Shopee-Nina / nina123
- TikTok-Ana / ana123

**Admin Accounts**:
- Aizen06, Azarjhake06, Azar03

## Notes
- Cancelled orders remain in Packing Queue (not deleted)
- Cancelled orders cannot be packed by scanner
- Cancellation reason is permanently stored in database
- Uncancellation clears all cancellation fields
- Activity logs track both cancel and uncancel operations
- Filter dropdown uses focus:outline-none focus:ring-0 for clean UI
