# RLS Policy Fix for Orders Table

## Error
```
Error: new row violates row-level security policy for table 'orders'
```

## Root Cause
The `orders` table has Row Level Security (RLS) enabled but **no policies were created** to allow insert operations. When RLS is enabled without policies, all operations are blocked by default.

## Solution

### Created Migration File
**File**: `supabase/migrations/017_add_orders_rls_policies.sql`

This migration:
1. ✅ Enables RLS on `orders` table
2. ✅ Enables RLS on `order_items` table
3. ✅ Creates policy to allow ALL operations on `orders`
4. ✅ Creates policy to allow ALL operations on `order_items`

### Policy Details
```sql
CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

This policy allows:
- INSERT (create new orders)
- SELECT (read orders)
- UPDATE (modify orders)
- DELETE (remove orders)

## How to Apply the Fix

### Method 1: Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run the Migration**
   - Copy the contents of `supabase/migrations/017_add_orders_rls_policies.sql`
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify**
   - You should see "Success. No rows returned"
   - The policies are now active

### Method 2: Command Line

If you have Supabase CLI installed:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Push migrations to Supabase
supabase db push
```

### Method 3: Manual SQL (Alternative)

Run this SQL directly in Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on order_items" ON order_items
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## Verification

After applying the migration, test by:

1. Go to POS page
2. Add products to cart
3. Click "Dispatch Order"
4. Fill in all required fields:
   - Sales Channel
   - Store
   - Courier
   - Waybill/Tracking Number
5. Click "Submit Order"

**Expected Result**: ✅ Order should be created successfully without RLS errors

## Security Considerations

### Current Policy (Permissive)
The current policy allows **all operations** without authentication checks:
```sql
USING (true) WITH CHECK (true)
```

This is suitable for:
- Internal applications
- Trusted environments
- When you handle auth at the application level

### More Restrictive Alternative (Optional)

If you want to restrict based on Supabase authentication, you can modify the policies:

```sql
-- Only allow authenticated users
CREATE POLICY "Authenticated users can manage orders" ON orders
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

Or even more restrictive:

```sql
-- Only allow specific roles
CREATE POLICY "Admin and operations can manage orders" ON orders
  FOR ALL
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'operations')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'operations')
  );
```

## Troubleshooting

### Still Getting RLS Error?

1. **Check if migration ran successfully**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM pg_policies WHERE tablename = 'orders';
   ```
   Should return at least one policy

2. **Check if RLS is enabled**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'orders';
   ```
   `rowsecurity` should be `true`

3. **Verify policy exists**
   ```sql
   SELECT policyname, cmd, qual, with_check
   FROM pg_policies
   WHERE tablename = 'orders';
   ```

4. **Test with simple insert**
   ```sql
   INSERT INTO orders (
     id, date, sales_channel, store, 
     courier, waybill, qty, cogs, total, 
     product, dispatched_by
   ) VALUES (
     'TEST-001', CURRENT_DATE, 'Test Channel', 'Test Store',
     'Test Courier', 'TEST123', 1, 100, 200,
     'Test Product', 'Test User'
   );
   ```

### Other Common Issues

**Issue**: "permission denied for table orders"
**Solution**: Check that your Supabase service role key is set correctly in environment variables

**Issue**: "relation 'orders' does not exist"
**Solution**: Run migration `014_create_orders_tracking_system.sql` first

**Issue**: "duplicate key value violates unique constraint"
**Solution**: The order ID already exists, this is a different issue

## Files Created/Modified

1. ✅ `supabase/migrations/017_add_orders_rls_policies.sql` - New migration file
2. ✅ `RLS_POLICY_FIX_ORDERS.md` - This documentation

## Next Steps

1. **Apply the migration** using one of the methods above
2. **Test order creation** in the POS page
3. **Verify** orders appear in Transaction History
4. **Optional**: Adjust policies if you need more restrictive access control

---

**Status**: ⏳ MIGRATION READY - Needs to be applied to database
**Priority**: HIGH - Blocks order creation
**Impact**: Critical - Required for POS functionality
