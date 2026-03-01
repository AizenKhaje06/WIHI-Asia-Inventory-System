# Internal Usage - Table with Dispatch Modal ✅

## Overview
Redesigned Internal Usage page to show historical data in a table with a "Dispatch Items" button that opens a modal for new dispatches.

## New Design

### Page Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  Internal Usage                          [Dispatch Items Button]│
│  Track items for demo displays, internal use, and warehouse...  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  [Search...] [Filter by type ▼]                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Internal Usage History (24)                                     │
├─────────────────────────────────────────────────────────────────┤
│  Date  │ Item │ Type │ Department │ Qty │ Cost │ Staff │ Notes │
├─────────────────────────────────────────────────────────────────┤
│  ...   │ ...  │ ...  │ ...        │ ... │ ...  │ ...   │ ...   │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### 1. Main Table
- **Displays**: All internal usage transactions (demo, internal, transfer)
- **Columns**:
  - Date (with time)
  - Item Name
  - Type (Demo/Display, Internal Use, Warehouse Transfer)
  - Department (Purpose / Sales Channel)
  - Quantity (badge style)
  - Cost (total cost)
  - Staff (with avatar)
  - Notes
- **Filters**:
  - Search by item, department, or staff
  - Filter by type (All, Demo, Internal, Transfer)
- **Sorting**: Newest first

### 2. Dispatch Button
- **Location**: Top-right corner
- **Style**: Purple-to-blue gradient with Plus icon
- **Action**: Opens dispatch modal

### 3. Dispatch Modal
- **Layout**: 2-column (Dispatch Form | Products)
- **Left Side**:
  - Purpose dropdown
  - Sales Channel dropdown (conditional)
  - Notes input
  - Dispatched By (auto-filled)
  - Cart summary
- **Right Side**:
  - Product search
  - Product grid (2 columns)
  - Click to add to cart
- **Footer**:
  - Cancel button
  - Dispatch button

### 4. Success Modal
- Same as before
- Shows Dispatch ID
- Shows dispatched items
- Confirmation messages

## API Endpoint

### GET /api/internal-usage
**Purpose**: Fetch all internal usage transactions

**Response**:
```json
[
  {
    "id": "trans-123",
    "itemId": "item-456",
    "itemName": "Product Name",
    "quantity": 5,
    "costPrice": 99.00,
    "totalCost": 495.00,
    "timestamp": "2026-03-01T10:30:00Z",
    "transactionType": "demo",
    "department": "Demo/Display / Shopee",
    "staffName": "John Doe",
    "notes": "For product showcase"
  }
]
```

**Filters**:
- Only returns transactions where `transactionType` is 'demo', 'internal', or 'transfer'
- Sorted by timestamp descending (newest first)

## Type Badges

### Demo/Display
- **Color**: Amber
- **Icon**: Monitor
- **Badge**: `[Demo]`

### Internal Use
- **Color**: Blue
- **Icon**: Users
- **Badge**: `[Internal]`

### Warehouse Transfer
- **Color**: Indigo
- **Icon**: Package
- **Badge**: `[Transfer]`

## Table Features

### Search
- Searches across:
  - Item name
  - Department
  - Staff name
- Real-time filtering

### Type Filter
- **All Types**: Shows all transactions
- **Demo/Display**: Shows only demo transactions
- **Internal Use**: Shows only internal transactions
- **Warehouse Transfer**: Shows only transfer transactions

### Empty State
- Shows when no transactions found
- Package icon
- Message: "No internal usage records found"
- Hint: "Click 'Dispatch Items' to create a new record"

### Row Hover
- Blue background on hover
- Smooth transition

## Modal Features

### Compact Design
- Max width: 6xl (1152px)
- Max height: 90vh
- Scrollable content
- 2-column layout on desktop
- Stacked on mobile

### Product Grid
- 2 columns in modal
- Compact cards
- Stock badge
- Cost price display
- Click to add to cart

### Cart
- Compact display
- Max height with scroll
- Quantity input
- Remove button
- Real-time total

## Workflow

### View History
1. Open Internal Usage page
2. See table of all internal usage transactions
3. Search or filter as needed
4. View details in table

### Create New Dispatch
1. Click "Dispatch Items" button
2. Modal opens
3. Select purpose
4. Select sales channel (if needed)
5. Add products to cart
6. Adjust quantities
7. Add notes (optional)
8. Click "Dispatch"
9. Success modal shows
10. Table refreshes with new record

## Advantages

### ✅ Data Visibility
- All historical data visible at once
- Easy to search and filter
- Quick overview of internal usage

### ✅ Clean Interface
- Main page shows data, not form
- Form only appears when needed
- Less clutter

### ✅ Better UX
- Separate concerns (view vs create)
- Modal focuses attention on dispatch
- Table shows history clearly

### ✅ Familiar Pattern
- Similar to other pages (Track Orders, Packing Queue)
- Consistent with app design
- Users know what to expect

## Files Modified

### Created
- ✅ `app/api/internal-usage/route.ts` - API endpoint for fetching transactions

### Modified
- ✅ `app/dashboard/internal-usage/page.tsx` - Complete redesign with table + modal

## Database

**No changes needed!**
- Uses existing `transactions` table
- Filters by `transactionType`
- All data already available

## Testing

### Test Table Display
1. Open Internal Usage page
2. Verify table shows transactions
3. Test search functionality
4. Test type filter
5. Check empty state

### Test Dispatch Modal
1. Click "Dispatch Items" button
2. Modal opens
3. Fill form
4. Add products
5. Dispatch
6. Verify success modal
7. Check table refreshes

### Test Data Flow
1. Create dispatch
2. Check transaction in table
3. Verify in database
4. Check logs page
5. Verify inventory deduction

## Summary

The Internal Usage page now shows a **table of historical data** with a **"Dispatch Items" button** that opens a **modal for creating new dispatches**. This design:

- ✅ Preserves historical data visibility
- ✅ Provides clean, focused dispatch interface
- ✅ Follows consistent app patterns
- ✅ Improves user experience
- ✅ No database changes needed

**Status**: ✅ COMPLETE AND READY FOR TESTING
