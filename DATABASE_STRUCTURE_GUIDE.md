# Database Structure Guide 📊

## Overview
This document explains the purpose and structure of each table in your Supabase database.

---

## 🔐 Core Tables (With RLS - Row Level Security)

### 1. **inventory** 
**Purpose**: Main product inventory management
**Key Fields**:
- `id` - Unique identifier
- `name` - Product name
- `category` - Product category
- `store` - Store location (changed from storage_room)
- `sales_channel` - Sales channel (Shopee, Lazada, Facebook, TikTok, Physical Store)
- `quantity` - Current stock level
- `cost_price` - Cost per unit
- `selling_price` - Selling price per unit
- `reorder_level` - Minimum stock threshold

**Used By**: Inventory page, POS, Low Stock, Out of Stock pages

---

### 2. **stores** (formerly storage_rooms)
**Purpose**: Store/warehouse locations with sales channels
**Key Fields**:
- `id` - Unique identifier (text)
- `store_name` - Name of store (changed from name)
- `sales_channel` - Associated sales channel
- `created_at` - Creation timestamp

**Used By**: Inventory management, Store dropdown filters

---

### 3. **categories**
**Purpose**: Product categories for organization
**Key Fields**:
- `id` - Unique identifier
- `name` - Category name
- `created_at` - Creation timestamp

**Used By**: Product categorization, filters

---

### 4. **transactions**
**Purpose**: All sales and internal usage transactions
**Key Fields**:
- `id` - Unique identifier
- `item_id` - Reference to inventory item
- `item_name` - Product name
- `quantity` - Quantity sold/used
- `cost_price` - Cost per unit
- `selling_price` - Selling price per unit
- `total_cost` - Total cost
- `total_revenue` - Total revenue (0 for internal use)
- `profit` - Profit amount
- `type` - "sale" or "restock"
- `transaction_type` - "sale", "demo", "internal", "transfer"
- `department` - Department/channel (e.g., "Demo/Display / Shopee")
- `staff_name` - Staff who processed
- `notes` - Additional notes
- `status` - "completed", "cancelled", "returned", "pending"

**Used By**: Sales tracking, Internal Usage, Reports, Analytics

---

### 5. **customers**
**Purpose**: Customer information and loyalty tracking
**Key Fields**:
- `id` - Unique identifier
- `name` - Customer name
- `email` - Email address
- `phone` - Phone number
- `address` - Delivery address
- `loyalty_points` - Loyalty points balance
- `total_purchases` - Number of purchases
- `total_spent` - Total amount spent
- `tier` - Customer tier (bronze, silver, gold, platinum)

**Used By**: Customer management, Loyalty program

---

### 6. **restocks**
**Purpose**: Inventory restock history
**Key Fields**:
- `id` - Unique identifier
- `item_id` - Reference to inventory item
- `item_name` - Product name
- `quantity` - Quantity restocked
- `cost_price` - Cost per unit
- `total_cost` - Total restock cost
- `timestamp` - When restocked
- `reason` - Reason for restock

**Used By**: Restock tracking, Inventory reports

---

### 7. **logs**
**Purpose**: System activity logs and audit trail
**Key Fields**:
- `id` - Unique identifier
- `operation` - Type of operation (sale, restock, demo-display, internal-usage, warehouse)
- `item_id` - Reference to inventory item
- `item_name` - Product name
- `details` - Detailed description
- `timestamp` - When operation occurred
- `staff_name` - Staff who performed operation
- `quantity` - Quantity involved
- `status` - Operation status

**Used By**: Logs page, Audit trail, Activity tracking

---

### 8. **users**
**Purpose**: User accounts and authentication
**Key Fields**:
- `id` - Unique identifier
- `username` - Login username
- `password` - Hashed password
- `role` - User role (admin, operations, staff)
- `display_name` - Display name
- `created_at` - Account creation date

**Used By**: Authentication, User management, Role-based access

---

## 🔓 Unrestricted Tables (No RLS - Public Access)

### 9. **orders** ⚠️ UNRESTRICTED
**Purpose**: Order tracking from dispatch to delivery
**Key Fields**:
- `id` - Unique identifier
- `date` - Order date
- `sales_channel` - Sales channel
- `store` - Store location
- `courier` - Courier service
- `waybill` - Tracking number
- `status` - "Pending" or "Packed"
- `parcel_status` - Delivery status (PENDING, DELIVERED, IN TRANSIT, etc.)
- `qty` - Quantity
- `cogs` - Cost of goods sold
- `total` - Total amount
- `product` - Product name
- `dispatched_by` - Staff who dispatched
- `packed_by` - Staff who packed
- `packed_at` - When packed
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Used By**: 
- Packing Queue (status = "Pending")
- Track Orders (status = "Packed")

**Why Unrestricted**: Needs to be accessible across different user roles for order processing

---

### 10. **order_items** ⚠️ UNRESTRICTED
**Purpose**: Detailed line items for each order
**Key Fields**:
- `id` - Unique identifier
- `order_id` - Reference to orders table
- `product_name` - Product name
- `quantity` - Quantity ordered
- `unit_price` - Price per unit
- `total_price` - Line total

**Used By**: Order details, Multi-item orders

**Why Unrestricted**: Related to orders table, needs same access level

---

### 11. **track_orders** ⚠️ UNRESTRICTED (VIEW)
**Purpose**: View of packed orders ready for tracking
**Type**: Database VIEW (not a real table)
**Query**: `SELECT * FROM orders WHERE status = 'Packed'`

**Used By**: Track Orders page

**Why Unrestricted**: View based on orders table

---

### 12. **transaction_history** ⚠️ UNRESTRICTED (VIEW)
**Purpose**: View of pending orders waiting to be packed
**Type**: Database VIEW (not a real table)
**Query**: `SELECT * FROM orders WHERE status = 'Pending'`

**Used By**: Packing Queue page

**Why Unrestricted**: View based on orders table

---

## 📋 Table Relationships

```
inventory
  ├─→ transactions (item_id)
  ├─→ restocks (item_id)
  ├─→ logs (item_id)
  └─→ stores (store)

orders
  ├─→ order_items (order_id)
  └─→ stores (store)

customers
  └─→ transactions (customer_id)

users
  ├─→ transactions (staff_name)
  ├─→ orders (dispatched_by, packed_by)
  └─→ logs (staff_name)
```

---

## 🎯 Table Usage by Page

### Dashboard
- `inventory` - Stock levels
- `transactions` - Sales data
- `orders` - Order statistics

### Inventory
- `inventory` - Main data
- `stores` - Store management
- `categories` - Category management

### POS (Warehouse Dispatch)
- `inventory` - Product selection
- `orders` - Create new orders
- `stores` - Store selection

### Packing Queue
- `orders` (status = "Pending") - Orders to pack
- `transaction_history` VIEW

### Track Orders
- `orders` (status = "Packed") - Packed orders
- `track_orders` VIEW

### Internal Usage
- `inventory` - Product selection
- `transactions` (transaction_type = demo/internal/transfer) - Usage tracking

### Sales
- `transactions` (type = "sale") - Sales records

### Customers
- `customers` - Customer data
- `transactions` - Purchase history

### Reports
- `transactions` - Transaction data
- `inventory` - Stock data
- `orders` - Order data

### Logs
- `logs` - Activity logs

---

## 🔧 Recommended Actions

### 1. Enable RLS on Unrestricted Tables
```sql
-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to view orders"
ON orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orders"
ON orders FOR UPDATE
TO authenticated
USING (true);

-- Repeat for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view order_items"
ON order_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert order_items"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (true);
```

### 2. Add Table Comments
```sql
-- Add comments to tables for documentation
COMMENT ON TABLE inventory IS 'Main product inventory with stock levels and pricing';
COMMENT ON TABLE stores IS 'Store locations with associated sales channels';
COMMENT ON TABLE orders IS 'Order tracking from dispatch to delivery';
COMMENT ON TABLE transactions IS 'All sales and internal usage transactions';
COMMENT ON TABLE customers IS 'Customer information and loyalty tracking';
COMMENT ON TABLE logs IS 'System activity logs and audit trail';
```

### 3. Add Indexes for Performance
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_parcel_status ON orders(parcel_status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(timestamp);
CREATE INDEX idx_inventory_store ON inventory(store);
CREATE INDEX idx_inventory_sales_channel ON inventory(sales_channel);
```

---

## 📝 Naming Conventions

### Current Issues
- ❌ `storage_rooms` → Should be `stores` (FIXED)
- ❌ `transaction_history` → Confusing name (it's a VIEW, not history)
- ❌ `track_orders` → Confusing name (it's a VIEW)

### Recommendations
- ✅ Use singular names for tables (e.g., `order` not `orders`)
- ✅ Use snake_case for table and column names
- ✅ Prefix views with `v_` (e.g., `v_pending_orders`, `v_packed_orders`)
- ✅ Use descriptive names that indicate purpose

---

## 🚀 Future Improvements

### 1. Separate Order Items
Currently orders table has single product. Consider:
- Using `order_items` table for multi-product orders
- Keeping `orders` table for order header info only

### 2. Add Audit Tables
- `audit_log` - Track all data changes
- `user_sessions` - Track user login/logout

### 3. Add Configuration Tables
- `settings` - System settings
- `couriers` - Courier list
- `sales_channels` - Sales channel configuration

### 4. Add Analytics Tables
- `daily_sales_summary` - Pre-calculated daily totals
- `inventory_snapshots` - Historical inventory levels

---

## 📊 Summary

**Total Tables**: 12
- **Core Tables with RLS**: 8 (inventory, stores, categories, transactions, customers, restocks, logs, users)
- **Unrestricted Tables**: 2 (orders, order_items)
- **Views**: 2 (track_orders, transaction_history)

**Recommendation**: Enable RLS on orders and order_items tables to improve security and follow best practices.
