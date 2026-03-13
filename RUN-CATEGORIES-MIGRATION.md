# Fix: Categories Table Missing - Run Migration 034

## Problem
The products/inventory page is showing an error:
```
[API Client] GET /api/categories failed: 500
Error: Failed to fetch categories
```

## Root Cause
The `categories` table doesn't exist in the database!

## Solution
Run migration 034 to create the categories table.

---

## Step 1: Run the Migration

### Option A: Using Supabase CLI (Recommended)
```cmd
supabase db push
```

### Option B: Manual SQL Execution
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of `supabase/migrations/034_create_categories_table.sql`
5. Click "Run"

---

## Step 2: Verify the Table

Run this query in Supabase SQL Editor:

```sql
SELECT * FROM categories;
```

You should see 10 default categories:
- Electronics
- Clothing
- Food & Beverages
- Home & Garden
- Sports & Outdoors
- Books & Media
- Toys & Games
- Health & Beauty
- Automotive
- Office Supplies

---

## Step 3: Test the Products Page

1. Restart your dev server:
   ```cmd
   npm run dev
   ```

2. Go to: http://localhost:3000/dashboard/inventory

3. The page should load without errors!

---

## What the Migration Does

1. ✅ Creates `categories` table with:
   - `id` (TEXT, Primary Key)
   - `name` (TEXT, Unique)
   - `created_at` (TIMESTAMP)

2. ✅ Creates index on `name` for faster lookups

3. ✅ Inserts 10 default categories

4. ✅ Enables Row Level Security (RLS)

5. ✅ Creates RLS policies for authenticated users

---

## Migration File
`supabase/migrations/034_create_categories_table.sql`

---

## Status
- ✅ Migration file created
- ⏳ Waiting for you to run it
- ⏳ Then test the products page

---

**Next:** Run the migration and test!
