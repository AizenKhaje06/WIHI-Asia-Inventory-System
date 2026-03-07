# Supabase Bundles Setup - Visual Guide

## 📋 Complete Setup Checklist

```
Step 1: Apply Supabase Migration
  ↓
Step 2: Verify Tables Created
  ↓
Step 3: Restart Dev Server
  ↓
Step 4: Test Bundle Creation
```

---

## Step 1: Apply Supabase Migration

### 1.1 Open Supabase Dashboard
```
Browser → https://supabase.com/dashboard
```

### 1.2 Select Your Project
```
┌─────────────────────────────────────────┐
│ My Projects                             │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📦 Your Project Name                │ │ ← Click here
│ │ Active • Last updated 2 hours ago   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 1.3 Open SQL Editor
```
Left Sidebar:
├─ 🏠 Home
├─ 📊 Table Editor
├─ 🔧 SQL Editor          ← Click here
├─- 🔐 Authentication
└─ ⚙️ Settings
```

### 1.4 Create New Query
```
SQL Editor Page:
┌─────────────────────────────────────────┐
│ + New query                             │ ← Click here
└─────────────────────────────────────────┘
```

### 1.5 Copy Migration SQL
```
Open file: supabase/migrations/020_create_bundles_table.sql

Select All (Ctrl+A)
Copy (Ctrl+C)
```

### 1.6 Paste and Run
```
SQL Editor:
┌─────────────────────────────────────────┐
│ [Paste SQL here]                        │
│                                         │
│ CREATE TABLE IF NOT EXISTS bundles (    │
│   id TEXT PRIMARY KEY,                  │
│   name TEXT NOT NULL,                   │
│   ...                                   │
│                                         │
│ [Run] button                            │ ← Click here
└─────────────────────────────────────────┘
```

### 1.7 Check Success
```
Result:
┌─────────────────────────────────────────┐
│ ✅ Success. No rows returned            │
└─────────────────────────────────────────┘
```

---

## Step 2: Verify Tables Created

### 2.1 Open Table Editor
```
Left Sidebar:
├─ 🏠 Home
├─ 📊 Table Editor        ← Click here
├─ 🔧 SQL Editor
└─ ...
```

### 2.2 Check for New Tables
```
Table List:
├─ inventory ✅
├─ transactions ✅
├─ customers ✅
├─ bundles ✅              ← Should see this
├─ bundle_items ✅         ← Should see this
└─ ...
```

### 2.3 Inspect `bundles` Table
```
Click on "bundles" table

Columns:
├─ id (text)
├─ name (text)
├─ description (text)
├─ category (text)
├─ store (text)
├─ sales_channel (text)
├─ bundle_price (numeric)
├─ bundle_cost (numeric)
├─ regular_price (numeric)
├─ savings (numeric)
├─ quantity (int4)
├─ reorder_level (int4)
├─ sku (text)
├─ is_active (bool)
├─ created_at (timestamptz)
├─ updated_at (timestamptz)
├─ image_url (text)
└─ badge (text)

Rows: 0 (empty - this is correct!)
```

### 2.4 Inspect `bundle_items` Table
```
Click on "bundle_items" table

Columns:
├─ id (text)
├─ bundle_id (text) → references bundles(id)
├─ item_id (text) → references inventory(id)
├─ quantity (int4)
└─ created_at (timestamptz)

Rows: 0 (empty - this is correct!)
```

---

## Step 3: Restart Dev Server

### 3.1 Stop Current Server
```
Terminal:
Press Ctrl+C

Output:
^C
Server stopped
```

### 3.2 Run Restart Script
```
Command Prompt:
> RESTART-DEV.cmd

Output:
Stopping Next.js server...
Cleaning build cache...
Starting development server...
✓ Ready in 3.2s
```

### 3.3 Wait for Server Ready
```
Terminal Output:
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 3.2s              ← Wait for this
```

---

## Step 4: Test Bundle Creation

### 4.1 Refresh Browser
```
Browser:
Press Ctrl+Shift+R (hard refresh)
```

### 4.2 Open Bundle Dialog
```
Go to: Warehouse Dispatch (POS) page
Click: "Quick Create Bundle" button
```

### 4.3 Fill in Form
```
Bundle Name: "Test Bundle"
Category: Select any
Store: Select any
Add 2-3 products
Bundle Price: Set above cost
```

### 4.4 Create Bundle
```
Click: "Create Bundle" button

Expected:
┌─────────────────────────────────────────┐
│ ✅ Bundle created successfully!         │
└─────────────────────────────────────────┘

Dialog closes
```

### 4.5 Verify in Supabase
```
Supabase Dashboard → Table Editor → bundles

Should see:
┌─────────────────────────────────────────┐
│ id              │ name         │ ...    │
├─────────────────────────────────────────┤
│ BUNDLE-1234... │ Test Bundle  │ ...    │
└─────────────────────────────────────────┘
```

### 4.6 Verify in Settings Page
```
Go to: Settings page
Click: "Inventory" tab

Should see:
┌─────────────────────────────────────────┐
│ Bundle Products Management              │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Test Bundle                         │ │
│ │ ₱598.00 • Save ₱152.00             │ │
│ │ 3 items • Active                    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Common Issues & Solutions

### Issue 1: "relation 'bundles' does not exist"
```
❌ Error in console or API

Cause: Migration not applied

Solution:
1. Go to Supabase Dashboard
2. SQL Editor
3. Run migration SQL
4. Verify tables exist
```

### Issue 2: "Request failed" when creating bundle
```
❌ Error in browser

Cause: Dev server not restarted

Solution:
1. Stop server (Ctrl+C)
2. Run: RESTART-DEV.cmd
3. Wait for "Ready"
4. Refresh browser
5. Try again
```

### Issue 3: Tables exist but can't insert
```
❌ Permission denied error

Cause: RLS policies not created

Solution:
1. Re-run migration SQL
2. Check RLS policies exist
3. Verify policies allow all operations
```

### Issue 4: Foreign key constraint error
```
❌ Error: item_id does not exist

Cause: Trying to add items that don't exist

Solution:
1. Check inventory table has items
2. Use existing item IDs
3. Don't use deleted items
```

---

## Verification Checklist

### Database Setup ✅
- [ ] Opened Supabase Dashboard
- [ ] Ran migration SQL
- [ ] Saw "Success" message
- [ ] `bundles` table exists
- [ ] `bundle_items` table exists
- [ ] Tables have correct columns
- [ ] RLS is enabled
- [ ] Policies are created

### Server Setup ✅
- [ ] Stopped dev server
- [ ] Ran RESTART-DEV.cmd
- [ ] Server started successfully
- [ ] No errors in terminal

### Browser Setup ✅
- [ ] Refreshed browser (Ctrl+Shift+R)
- [ ] No console errors
- [ ] Can open bundle dialog

### Functionality Test ✅
- [ ] Can search products
- [ ] Can add products to bundle
- [ ] Can fill in all fields
- [ ] Can create bundle
- [ ] See success toast
- [ ] Bundle appears in Settings
- [ ] Bundle appears in Supabase

---

## Quick Reference

### Migration File
```
Location: supabase/migrations/020_create_bundles_table.sql
Size: ~2KB
Tables: bundles, bundle_items
```

### Supabase Dashboard URLs
```
Main: https://supabase.com/dashboard
SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
Table Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
```

### Commands
```
RESTART-DEV.cmd          # Restart server
FIX-BUNDLE-ERROR.cmd     # Quick fix
```

### Test URLs
```
POS Page: http://localhost:3000/dashboard/pos
Settings: http://localhost:3000/dashboard/settings
```

---

## Timeline

```
Total Time: ~5 minutes

1. Apply Migration (1 min)
   - Open Supabase
   - Copy & paste SQL
   - Run

2. Verify Tables (1 min)
   - Check Table Editor
   - Verify columns

3. Restart Server (2 min)
   - Stop server
   - Run restart script
   - Wait for ready

4. Test Bundle (1 min)
   - Open dialog
   - Create bundle
   - Verify success
```

---

## Success Indicators

### ✅ Migration Applied
```
Supabase SQL Editor:
"Success. No rows returned"
```

### ✅ Tables Created
```
Table Editor shows:
- bundles (0 rows)
- bundle_items (0 rows)
```

### ✅ Server Restarted
```
Terminal shows:
"✓ Ready in 3.2s"
```

### ✅ Bundle Created
```
Browser shows:
"✅ Bundle created successfully!"
```

### ✅ Data Saved
```
Supabase shows:
1 row in bundles table
3 rows in bundle_items table
```

---

**Next Step**: Apply the migration in Supabase Dashboard, then restart your dev server!
