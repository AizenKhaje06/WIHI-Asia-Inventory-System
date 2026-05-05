# Business Insights Migration Plan
## From `transactions` table to `orders` table

---

## 📊 Data Structure Comparison

### `transactions` Table (Current - Legacy)
```typescript
{
  id: string
  itemId: string
  itemName: string
  quantity: number
  costPrice: number
  sellingPrice: number
  totalCost: number
  totalRevenue: number
  profit: number
  timestamp: string
  type: "sale" | "restock"
  transactionType?: "sale" | "demo" | "internal" | "transfer"
  department?: string  // Sales channel
  status?: "completed" | "cancelled" | "returned" | "pending"
}
```

### `orders` Table (Target - New)
```sql
{
  id: TEXT
  date: DATE
  sales_channel: TEXT  // Maps to department
  store: TEXT
  courier: TEXT
  waybill: TEXT
  qty: INTEGER  // Maps to quantity
  cogs: DECIMAL  // Maps to totalCost
  total: DECIMAL  // Maps to totalRevenue
  product: TEXT  // Comma-separated products
  status: TEXT  // Pending, Packed, Shipped, Delivered
  parcel_status: TEXT  // Pending, In Transit, Delivered, CANCELLED, RETURNED
  dispatched_by: TEXT
  packed_by: TEXT
  packed_at: TIMESTAMP
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  deleted_at: TIMESTAMP
}
```

### `order_items` Table (Detailed Breakdown)
```sql
{
  id: TEXT
  order_id: TEXT
  item_id: TEXT
  item_name: TEXT
  quantity: INTEGER
  cost_price: DECIMAL
  selling_price: DECIMAL
  total_cost: DECIMAL
  total_revenue: DECIMAL
  created_at: TIMESTAMP
}
```

---

## 🔄 Field Mapping

| transactions | orders | order_items | Notes |
|-------------|---------|-------------|-------|
| id | id | order_id | Primary key |
| itemId | - | item_id | Moved to order_items |
| itemName | product | item_name | Comma-separated in orders |
| quantity | qty | quantity | Renamed |
| costPrice | - | cost_price | Per item in order_items |
| sellingPrice | - | selling_price | Per item in order_items |
| totalCost | cogs | total_cost | Aggregate in orders |
| totalRevenue | total | total_revenue | Aggregate in orders |
| profit | (calculated) | (calculated) | total - cogs |
| timestamp | date, created_at | created_at | Split into date + timestamp |
| department | sales_channel | - | Renamed |
| status | parcel_status | - | Maps to CANCELLED, RETURNED |

---

## ⚠️ Key Differences

### 1. **Granularity**
- **transactions**: One row per item sold
- **orders**: One row per order (can contain multiple items)
- **order_items**: Detailed breakdown of items in each order

### 2. **Status Handling**
- **transactions**: `status` = "completed" | "cancelled" | "returned"
- **orders**: `parcel_status` = "PENDING" | "DELIVERED" | "CANCELLED" | "RETURNED"

### 3. **Sales Channel**
- **transactions**: `department` field
- **orders**: `sales_channel` field

### 4. **Date/Time**
- **transactions**: Single `timestamp` field
- **orders**: Separate `date` (DATE) and `created_at` (TIMESTAMP)

---

## 🎯 Migration Strategy

### Phase 1: Create New Data Fetching Functions ✅
Create new functions in `lib/supabase-db.ts`:
- `getOrders()` - Fetch all orders
- `getOrderItems()` - Fetch order items
- `getOrdersWithItems()` - Fetch orders with joined items

### Phase 2: Create Data Transformation Layer ✅
Create `lib/orders-to-transactions.ts`:
- Transform orders data to match transaction structure
- Handle aggregation (orders → transactions)
- Handle status mapping

### Phase 3: Update Analytics API ✅
Update `app/api/analytics/route.ts`:
- Add sales channel filter support
- Fetch from orders table
- Transform data before passing to analytics functions
- Keep analytics functions unchanged (backward compatible)

### Phase 4: Test All Analytics ✅
Test each analytics type:
- ABC Analysis
- Turnover Analysis
- Forecasts
- Profit Margins
- Fast/Slow Moving
- Dead Stock
- Returns

### Phase 5: Update Business Insights Page ✅
Update `app/dashboard/insights/page.tsx`:
- Ensure sales channel filter works
- Verify all tabs display correctly
- Test team leader filtering

---

## 🚀 Implementation Steps

### Step 1: Add getOrders() function
```typescript
// lib/supabase-db.ts
export async function getOrders(salesChannel?: string): Promise<Order[]> {
  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .is('deleted_at', null)
    .order('date', { ascending: false })
  
  if (salesChannel && salesChannel !== 'all') {
    query = query.eq('sales_channel', salesChannel)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}
```

### Step 2: Create transformation function
```typescript
// lib/orders-to-transactions.ts
export function transformOrdersToTransactions(orders: Order[]): Transaction[] {
  return orders
    .filter(order => {
      // Exclude cancelled and returned orders
      return !['CANCELLED', 'RETURNED'].includes(order.parcel_status)
    })
    .map(order => ({
      id: order.id,
      itemId: order.id, // Use order ID as item ID
      itemName: order.product,
      quantity: order.qty,
      costPrice: order.cogs / order.qty, // Average cost per item
      sellingPrice: order.total / order.qty, // Average price per item
      totalCost: order.cogs,
      totalRevenue: order.total,
      profit: order.total - order.cogs,
      timestamp: order.date,
      type: 'sale',
      transactionType: 'sale',
      department: order.sales_channel,
      status: 'completed'
    }))
}
```

### Step 3: Update Analytics API
```typescript
// app/api/analytics/route.ts
const salesChannel = searchParams.get('salesChannel')

// Fetch orders instead of transactions
const orders = await getCachedData(
  `orders-${salesChannel || 'all'}`,
  () => getOrders(salesChannel),
  2 * 60 * 1000
)

// Transform to transaction format
const transactions = transformOrdersToTransactions(orders)

// Rest of the code remains the same
```

---

## ✅ Benefits

1. **Consistency**: All pages use same data source (`orders` table)
2. **Accuracy**: Real-time data from order tracking system
3. **Performance**: Better indexing on orders table
4. **Maintainability**: Single source of truth
5. **Team Leader Filtering**: Automatic filtering by sales channel

---

## ⚠️ Risks & Mitigation

### Risk 1: Breaking Analytics
**Mitigation**: Keep analytics functions unchanged, only transform input data

### Risk 2: Data Loss
**Mitigation**: Keep transactions table intact, only change data source

### Risk 3: Performance Issues
**Mitigation**: Use caching, add proper indexes

### Risk 4: Status Mapping Errors
**Mitigation**: Careful mapping of status fields, thorough testing

---

## 🧪 Testing Checklist

- [ ] ABC Analysis shows correct categories
- [ ] Turnover Analysis calculates correctly
- [ ] Forecasts predict accurately
- [ ] Profit Margins match expected values
- [ ] Fast Moving items identified correctly
- [ ] Slow Moving items identified correctly
- [ ] Dead Stock detected properly
- [ ] Returns analytics work (if applicable)
- [ ] Sales channel filter works
- [ ] Team leader sees only their channel
- [ ] Admin sees all channels
- [ ] Date ranges filter correctly
- [ ] Charts display properly
- [ ] No console errors
- [ ] Performance is acceptable

---

## 📝 Rollback Plan

If migration fails:
1. Revert `app/api/analytics/route.ts` to use `getTransactions()`
2. Remove transformation layer
3. Keep orders table intact
4. Document issues for future attempt

---

## 🎯 Success Criteria

- ✅ All analytics display correctly
- ✅ No errors in console
- ✅ Team leader filtering works
- ✅ Performance is same or better
- ✅ Data accuracy verified
- ✅ All tests pass

---

## Status: READY TO IMPLEMENT

All planning complete. Ready to proceed with implementation.
