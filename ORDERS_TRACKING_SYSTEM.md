# Orders Tracking System - Complete Implementation

## Database Structure

### Main Tables:

#### 1. `orders` table
Complete order tracking from dispatch to delivery.

**Columns:**
- `id` (TEXT, PK) - Order ID (e.g., ORD-1234567890)
- `date` (DATE) - Order date
- `sales_channel` (TEXT) - Shopee, Lazada, Facebook, TikTok, Physical Store
- `store` (TEXT) - Specific store name
- `courier` (TEXT) - Courier service (J&T, Flash, etc.)
- `waybill` (TEXT) - Tracking number
- `qty` (INTEGER) - Total quantity
- `cogs` (DECIMAL) - Total cost of goods sold
- `total` (DECIMAL) - Total selling price
- `product` (TEXT) - Product list (e.g., "Product A (3), Product B (2)")
- `status` (TEXT) - Pending, Packed, Shipped, Delivered
- `parcel_status` (TEXT) - Pending, In Transit, Delivered
- `dispatched_by` (TEXT) - Who created the order
- `packed_by` (TEXT) - Who packed the order
- `packed_at` (TIMESTAMP) - When it was packed
- `created_at` (TIMESTAMP) - When order was created
- `updated_at` (TIMESTAMP) - Last update
- `deleted_at` (TIMESTAMP) - Soft delete

#### 2. `order_items` table
Detailed breakdown of items in each order.

**Columns:**
- `id` (TEXT, PK)
- `order_id` (TEXT, FK) - References orders(id)
- `item_id` (TEXT) - Product ID from inventory
- `item_name` (TEXT) - Product name
- `quantity` (INTEGER) - Quantity ordered
- `cost_price` (DECIMAL) - Cost per unit
- `selling_price` (DECIMAL) - Selling price per unit
- `total_cost` (DECIMAL) - quantity × cost_price
- `total_revenue` (DECIMAL) - quantity × selling_price
- `created_at` (TIMESTAMP)

---

## Views for Easy Querying:

### 1. `transaction_history` view
Shows **unpacked orders** (status = 'Pending')

```sql
SELECT * FROM transaction_history;
```

**Use Case:** Transaction History page - shows orders waiting to be packed

### 2. `track_orders` view
Shows **packed/shipped orders** (status = 'Packed', 'Shipped', 'Delivered')

```sql
SELECT * FROM track_orders;
```

**Use Case:** Track Orders page - shows orders ready for shipping/tracking

---

## Order Status Flow:

```
Warehouse Dispatch (Submit)
         ↓
    Status: Pending
    (Shows in Transaction History)
         ↓
Click "Mark as Packed"
         ↓
    Status: Packed
    packed_by: "Aizen06"
    packed_at: NOW()
    (Moves to Track Orders)
         ↓
    Status: Shipped
    (Courier picked up)
         ↓
    Status: Delivered
    (Customer received)
```

---

## API Endpoints Needed:

### 1. POST `/api/orders` - Create new order
**Request:**
```json
{
  "salesChannel": "Shopee",
  "store": "Shopee Mall Store",
  "courier": "J&T",
  "waybill": "JT123456789",
  "items": [
    {
      "itemId": "ITEM-001",
      "itemName": "Product A",
      "quantity": 3,
      "costPrice": 100,
      "sellingPrice": 200
    }
  ],
  "dispatchedBy": "Aizen06"
}
```

### 2. POST `/api/orders/[id]/pack` - Mark as packed
**Request:**
```json
{
  "packedBy": "Aizen06"
}
```

**SQL:**
```sql
UPDATE orders 
SET 
  status = 'Packed',
  packed_by = $1,
  packed_at = NOW()
WHERE id = $2
```

### 3. GET `/api/orders?status=Pending` - Get unpacked orders
**Response:** List of orders with status = 'Pending'

### 4. GET `/api/orders?status=Packed` - Get packed orders
**Response:** List of orders with status = 'Packed'

---

## Frontend Pages:

### 1. Transaction History Page
**URL:** `/dashboard/reports` (or create new `/dashboard/transaction-history`)

**Shows:** Orders with `status = 'Pending'`

**Table Columns:**
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
- **Packed By** (Button or Badge)

**Button Logic:**
```tsx
{order.status === 'Pending' ? (
  <Button onClick={() => handleMarkAsPacked(order.id)}>
    Mark as Packed
  </Button>
) : (
  <Badge variant="success">
    Packed by: {order.packed_by}
  </Badge>
)}
```

### 2. Track Orders Page
**URL:** `/dashboard/track-orders`

**Shows:** Orders with `status IN ('Packed', 'Shipped', 'Delivered')`

**Table Columns:** Same as Transaction History

**Additional Features:**
- Update parcel status
- View order details
- Print shipping label

---

## Data Accuracy:

### When order is created (Warehouse Dispatch):
1. Insert into `orders` table with `status = 'Pending'`
2. Insert items into `order_items` table
3. Update `inventory` table (reduce quantity)
4. Create `transactions` record (for accounting)

### When order is packed:
1. Update `orders.status = 'Packed'`
2. Set `orders.packed_by` and `orders.packed_at`
3. Order now appears in Track Orders page
4. Order disappears from Transaction History page

### Data Integrity:
- Use transactions (BEGIN/COMMIT) for atomic operations
- Foreign key constraints ensure data consistency
- Soft delete (deleted_at) preserves history
- Indexes for fast queries

---

## Migration Steps:

1. ✅ Run migration: `014_create_orders_tracking_system.sql`
2. ⏳ Create API endpoints
3. ⏳ Update Warehouse Dispatch to save to `orders` table
4. ⏳ Create/Update Transaction History page
5. ⏳ Update Track Orders page to read from `track_orders` view
6. ⏳ Test complete flow

---

## Benefits:

✅ **Accurate Data** - Single source of truth in `orders` table
✅ **Easy Queries** - Use views for different pages
✅ **Status Tracking** - Clear order lifecycle
✅ **Audit Trail** - Know who packed and when
✅ **Scalable** - Can add more statuses (Cancelled, Returned, etc.)
✅ **Performance** - Indexed columns for fast queries

---

**Status:** Database structure ready, awaiting API and UI implementation
