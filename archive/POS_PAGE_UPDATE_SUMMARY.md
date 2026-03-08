# POS Page - Order Form Modal Implementation

## Changes Required:

### 1. Remove Destination Section
- Remove all destination/department dropdowns
- Remove sales channel selection
- Remove store selection
- Remove warehouse transfer logic

### 2. Add Order Form Modal
When "Dispatch" button is clicked:
- Open modal with order form
- Auto-fill data from cart items

### 3. Modal Fields (Auto-filled):
- **Date**: Current date
- **Sales Channel**: From first cart item's salesChannel
- **Store**: From first cart item's store  
- **Product**: List of all cart items with quantities
- **QTY**: Total quantity from all cart items
- **COGS**: Total cost (sum of costPrice × quantity)
- **Total**: Total price (sum of sellingPrice × quantity)
- **Dispatched By**: Current logged-in user
- **Status**: "Pending" (default)
- **Parcel Status**: "Pending" (default)

### 4. Modal Fields (User Input Required):
- **Courier**: Dropdown with options:
  - Flash
  - J&T
  - Ninja Van
  - Lalamove
  - Grab
  - LBC
  - Others:
    - 2GO
    - JRS Express
    - Entrego
    - ABest Express
    - Gogo Xpress
    - XDE Logistics
    - AP Cargo
    - Gryffon Courier Services
    - Delivery Parcel Express
    - Bluebee Express
    - GrabExpress
    - Borzo
    - Transportify
    - DHL Express
    - UPS
    - FedEx

- **Waybill**: Text input for tracking number

### 5. Submit Action:
- Save to track-orders table
- Process as sale/dispatch
- Update inventory
- Show success modal
- Clear cart

### 6. Courier Options Array:
```typescript
const COURIER_OPTIONS = [
  'Flash',
  'J&T',
  'Ninja Van',
  'Lalamove',
  'Grab',
  'LBC',
  '2GO',
  'JRS Express',
  'Entrego',
  'ABest Express',
  'Gogo Xpress',
  'XDE Logistics',
  'AP Cargo',
  'Gryffon Courier Services',
  'Delivery Parcel Express',
  'Bluebee Express',
  'GrabExpress',
  'Borzo',
  'Transportify',
  'DHL Express',
  'UPS',
  'FedEx'
]
```

## Implementation Steps:
1. Update state variables
2. Remove destination UI
3. Add Order Form Modal UI
4. Implement auto-fill logic
5. Update submit handler
6. Test flow
