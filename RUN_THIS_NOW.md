# 🚨 RUN THIS NOW TO FIX BUNDLE ERROR

## ❌ CURRENT ERROR:
```
"Could not find the 'storage_room' column of 'inventory' in the schema cache"
POST /api/bundles 500
```

## ✅ SOLUTION (1 MINUTE):

### STEP 1: Open Supabase
1. Go to: https://supabase.com/dashboard
2. Click your project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New Query"**

### STEP 2: Copy This SQL
Open file: **`BUNDLE_MIGRATION_MINIMAL.sql`**
- Select ALL (Ctrl+A)
- Copy (Ctrl+C)

### STEP 3: Paste and Run
- Paste in SQL Editor (Ctrl+V)
- Click **"Run"** button
- Wait 10 seconds

### STEP 4: You Should See:
```
✅ BUNDLE MIGRATION COMPLETE!
📊 Added to inventory table:
   ✅ product_type column
   ✅ bundle_components column
   ✅ is_virtual_stock column
   ✅ bundle_metadata column
   ✅ sales_channel column
```

### STEP 5: Restart Dev Server
```bash
# In your terminal, press Ctrl+C to stop
# Then run:
npm run dev
```

### STEP 6: Test Bundle Creation
1. Go to: http://localhost:3000/dashboard/inventory
2. Click "Create Bundle"
3. Fill form
4. Click "Create Bundle"
5. ✅ **SHOULD WORK NOW!**

---

## 🎯 WHAT THIS DOES:

The migration adds 5 new columns to your `inventory` table:
- `product_type` - Marks item as 'bundle'
- `bundle_components` - Stores component items
- `is_virtual_stock` - Enables virtual stock calculation
- `bundle_metadata` - Additional bundle info
- `sales_channel` - Multi-channel support

**NOTE:** This migration does NOT rename `storage_room` to `store`. It keeps your existing column name!

---

## ⏱️ TIME: 1 MINUTE

```
Open Supabase:     10 seconds
Copy SQL:          5 seconds
Paste and Run:     5 seconds
Wait:              10 seconds
Restart server:    20 seconds
Test:              10 seconds
─────────────────────────────
TOTAL:             60 seconds
```

---

## 🔍 VERIFY IT WORKED:

After running migration, run this in SQL Editor:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'inventory' 
  AND column_name IN ('product_type', 'bundle_components', 'is_virtual_stock')
ORDER BY column_name;
```

**Expected:** Should return 3 rows

---

## 📞 IF IT STILL FAILS:

1. Check Supabase logs for errors
2. Make sure you're in the correct project
3. Verify migration completed successfully
4. Clear browser cache (Ctrl+Shift+Delete)
5. Restart dev server completely

---

**STATUS:** 🚨 ACTION REQUIRED NOW  
**FILE TO RUN:** `BUNDLE_MIGRATION_MINIMAL.sql`  
**WHERE TO RUN:** Supabase SQL Editor  
**TIME:** 1 minute  

**DO IT NOW!** 🚀
