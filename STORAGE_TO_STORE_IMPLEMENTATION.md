# Storage Room to Store - Implementation Checklist

## Database ✅ COMPLETE
- [x] Renamed `storage_rooms` → `stores` table
- [x] Renamed `storage_room` → `store` column in inventory
- [x] Added `sales_channel` column to stores
- [x] Added `sales_channel` column to inventory

## Files to Update:

### 1. API Routes
- [ ] `app/api/storage-rooms/route.ts` → Rename to `app/api/stores/route.ts`
- [ ] `app/api/storage-rooms/[id]/route.ts` → Rename to `app/api/stores/[id]/route.ts`
- [ ] Update all function names and references

### 2. Type Definitions
- [ ] `lib/types.ts` - Update Item interface
- [ ] `lib/supabase.ts` - Update database types
- [ ] `lib/supabase-db.ts` - Update all functions

### 3. Components
- [ ] `components/add-item-dialog.tsx` - Add Sales Channel, update Store dropdown
- [ ] `components/edit-item-dialog.tsx` - Add Sales Channel, update Store dropdown

### 4. Pages
- [ ] `app/dashboard/inventory/page.tsx` - Update button, table, modal
- [ ] `app/dashboard/pos/page.tsx` - Update references
- [ ] `app/dashboard/inventory/low-stock/page.tsx` - Update table columns
- [ ] `app/dashboard/inventory/out-of-stock/page.tsx` - Update table columns

### 5. Test Files
- [ ] `lib/test-supabase-connection.ts` - Update table name
- [ ] `app/api/test-supabase/route.ts` - Update table name

## Changes Summary:

### API Endpoints:
- `/api/storage-rooms` → `/api/stores`
- `/api/storage-rooms/[id]` → `/api/stores/[id]`

### Database Functions:
- `getStorageRooms()` → `getStores()`
- `addStorageRoom()` → `addStore()`
- `updateStorageRoom()` → `updateStore()`
- `deleteStorageRoom()` → `deleteStore()`

### Type Names:
- `StorageRoom` → `Store`
- `storage_room` → `store`
- `storageRoom` → `store`

### UI Labels:
- "Storage Room" → "Store"
- "Storage" button → "Stores" button
- "Warehouse" → "Store" (in some contexts)

## New Features:

### Add Store Modal:
```
Sales Channel: [Dropdown]
  - Shopee
  - Lazada
  - Facebook
  - TikTok
  - Physical Store

Store Name: [Input]

[Add Store]
```

### Inventory Table:
Add columns:
- Sales Channel (badge)
- Store (text)

### Add/Edit Product:
Add fields:
- Sales Channel (dropdown)
- Store (dropdown - filtered by channel)
