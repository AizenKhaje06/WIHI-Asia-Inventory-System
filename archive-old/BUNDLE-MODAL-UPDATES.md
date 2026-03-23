# Bundle Modal Updates - Complete

## Changes Made

### 1. ✅ Removed Category Field
- Removed from modal UI
- Removed from formData state
- Removed from validation
- Removed from API submission
- Removed from API route validation

### 2. ✅ Removed SKU Field
- Removed from modal UI
- Removed from formData state
- Removed from API submission
- Removed from API route

### 3. ✅ Sales Channel → Store Filtering
**How it works:**
- User selects Sales Channel first (Physical Store, Shopee, Lazada, Facebook, TikTok, or "All Channels")
- Store dropdown automatically filters to show only stores for that sales channel
- When sales channel changes, store selection is reset
- Store names show with their sales channel in parentheses: "Store Name (Shopee)"

**Example:**
1. Select "Shopee" as Sales Channel
2. Store dropdown shows only Shopee stores
3. Select "Lazada" → Store dropdown updates to show only Lazada stores
4. Select "All Channels" → Store dropdown shows all stores

### 4. ✅ Database Migration Created
**File:** `supabase/migrations/028_remove_category_sku_from_bundles.sql`

**What it does:**
```sql
ALTER TABLE bundles DROP COLUMN IF EXISTS category;
ALTER TABLE bundles DROP COLUMN IF EXISTS sku;
```

**To run:** Copy and paste the SQL into Supabase SQL Editor and execute.

---

## Updated Modal Fields

### Required Fields:
1. **Bundle Name** - Text input
2. **Sales Channel** - Dropdown (Physical Store, Shopee, Lazada, Facebook, TikTok, All Channels)
3. **Store** - Dropdown (filtered by sales channel)
4. **Bundle Items** - At least 1 item
5. **Bundle Price** - Must be above cost

### Optional Fields:
1. **Description** - Text area
2. **Badge** - Text input (e.g., "BEST VALUE", "SAVE 20%")

---

## Field Order in Modal

```
1. Bundle Name *
2. Description
3. Sales Channel *
4. Store * (filtered by sales channel)
5. Badge
6. [Pricing Summary Card]
7. [Bundle Items Section]
8. Bundle Price *
```

---

## API Changes

### Request Body (Before):
```json
{
  "name": "Bundle Name",
  "description": "...",
  "category": "Category Name",  ❌ REMOVED
  "store": "Store Name",
  "salesChannel": "Shopee",
  "bundlePrice": 100,
  "items": [...],
  "sku": "SKU123",  ❌ REMOVED
  "badge": "SAVE 20%"
}
```

### Request Body (After):
```json
{
  "name": "Bundle Name",
  "description": "...",
  "store": "Store Name",
  "salesChannel": "Shopee",
  "bundlePrice": 100,
  "items": [...],
  "badge": "SAVE 20%"
}
```

---

## Database Schema Changes

### Bundles Table (Before):
```
- id
- name
- description
- category        ❌ REMOVED
- store
- sales_channel
- bundle_price
- bundle_cost
- regular_price
- savings
- sku             ❌ REMOVED
- badge
- is_active
- quantity
- reorder_level
- created_at
- updated_at
```

### Bundles Table (After):
```
- id
- name
- description
- store
- sales_channel
- bundle_price
- bundle_cost
- regular_price
- savings
- badge
- is_active
- quantity
- reorder_level
- created_at
- updated_at
```

---

## Testing Steps

1. **Clear Cache** (if needed):
   ```cmd
   NUCLEAR-CACHE-CLEAR.cmd
   ```

2. **Run Migration**:
   - Open Supabase SQL Editor
   - Run: `supabase/migrations/028_remove_category_sku_from_bundles.sql`

3. **Test Bundle Creation**:
   - Go to Inventory page
   - Click "Create Bundle"
   - Select Sales Channel (e.g., "Shopee")
   - Verify Store dropdown shows only Shopee stores
   - Fill in other fields
   - Add items
   - Set bundle price
   - Click "Create Bundle"
   - Should see success message

4. **Test Sales Channel Filtering**:
   - Select "Physical Store" → See only physical stores
   - Select "Shopee" → See only Shopee stores
   - Select "All Channels" → See all stores
   - Verify store selection resets when changing channel

---

## Benefits

1. **Simpler UI** - Removed unnecessary fields
2. **Better UX** - Sales channel filtering makes store selection easier
3. **Cleaner Data** - No unused category/SKU fields in database
4. **Logical Flow** - Select channel first, then see relevant stores

---

## Notes

- Category was removed because bundles don't need categories (items already have categories)
- SKU was removed because bundles use auto-generated IDs (BUNDLE-timestamp)
- Sales channel filtering helps users quickly find the right store
- Store dropdown shows channel name for clarity: "Store Name (Shopee)"
