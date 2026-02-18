# Database Backup & Restore Guide

## Complete SQL Backup File
📄 **File**: `COMPLETE_DATABASE_BACKUP.sql`

This file contains ALL SQL code needed to recreate your entire database structure from scratch.

## What's Included

### 8 Tables Created:
1. ✅ **inventory** - All products with stock levels
2. ✅ **transactions** - Sales, restocks, and movements
3. ✅ **customers** - Customer data with loyalty system
4. ✅ **logs** - Activity logs
5. ✅ **restocks** - Restock history
6. ✅ **storage_rooms** - Storage locations
7. ✅ **categories** - Product categories
8. ✅ **users** - System authentication

### Features:
- ✅ All table structures with proper data types
- ✅ Primary keys and constraints
- ✅ Indexes for fast queries
- ✅ Row Level Security (RLS) enabled
- ✅ Security policies configured
- ✅ Comments and documentation

## How to Use

### Option 1: Create Fresh Database (Supabase Dashboard)
1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. Copy entire content from `COMPLETE_DATABASE_BACKUP.sql`
5. Paste into SQL Editor
6. Click **Run** or press `Ctrl+Enter`
7. Wait for "Success" message

### Option 2: Restore to New Project
1. Create new Supabase project
2. Go to SQL Editor
3. Run `COMPLETE_DATABASE_BACKUP.sql`
4. Update `.env.local` with new credentials
5. Done!

### Option 3: Backup Current Data First
```sql
-- Export data before recreating tables
-- Run these queries and save results:

-- Backup inventory
SELECT * FROM inventory;

-- Backup transactions
SELECT * FROM transactions;

-- Backup customers
SELECT * FROM customers;

-- Backup logs
SELECT * FROM logs;

-- Backup restocks
SELECT * FROM restocks;
```

## Migration Files Included

All individual migration files are in `supabase/migrations/`:

1. `001_enable_rls.sql` - Enable Row Level Security
2. `002_create_policies_SIMPLE.sql` - Security policies
3. `003_create_customers_table.sql` - Customers table
4. `005_add_staff_name_to_logs.sql` - Add staff tracking
5. `006_backfill_total_revenue.sql` - Populate total_revenue

## Important Notes

⚠️ **Before Running:**
- Backup your current data if needed
- This will create NEW tables (won't delete existing data)
- If tables exist, use `DROP TABLE IF EXISTS` first

⚠️ **After Running:**
- Verify all tables created: Check table list
- Verify RLS enabled: Check security settings
- Test with sample data
- Update application credentials if needed

## Verification Queries

Run these after creating tables:

```sql
-- Check all tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check all policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check all indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Count records in each table
SELECT 
  'inventory' as table_name, COUNT(*) as records FROM inventory
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'logs', COUNT(*) FROM logs
UNION ALL
SELECT 'restocks', COUNT(*) FROM restocks
UNION ALL
SELECT 'storage_rooms', COUNT(*) FROM storage_rooms
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'users', COUNT(*) FROM users;
```

## Table Relationships

```
inventory
  ├─ transactions (via item_id)
  ├─ logs (via item_id)
  └─ restocks (via item_id)

customers
  └─ transactions (via customer_id)

storage_rooms
  └─ inventory (via storage_room)

categories
  └─ inventory (via category)

users
  ├─ logs (via staff_name)
  └─ transactions (via staff_name)
```

## Key Columns

### Inventory
- `id` - Unique identifier
- `name` - Product name
- `quantity` - Current stock
- `cost_price` - Purchase cost
- `selling_price` - Sale price
- `storage_room` - Location
- `category` - Product category

### Transactions
- `id` - Transaction ID
- `total_revenue` - Total sale amount ⭐ (newly added)
- `total_cost` - Total cost
- `profit` - Profit amount
- `transaction_type` - sale/demo/internal/transfer
- `department` - Sales channel
- `timestamp` - When it happened

### Customers
- `id` - Customer ID
- `tier` - bronze/silver/gold/platinum
- `loyalty_points` - Points earned
- `total_spent` - Total spending
- `total_purchases` - Number of purchases

## Support

If you encounter any issues:
1. Check Supabase logs for errors
2. Verify your Supabase credentials
3. Ensure service_role key is used (not anon key)
4. Check RLS policies are correct

## Backup Schedule Recommendation

📅 **Recommended:**
- Daily: Export transaction data
- Weekly: Full database backup
- Monthly: Archive old data
- Before updates: Always backup first!

---
**Last Updated**: February 18, 2026
**Database Version**: 1.0
**Total Tables**: 8
**Total Indexes**: 20+
**Security**: RLS Enabled ✅
