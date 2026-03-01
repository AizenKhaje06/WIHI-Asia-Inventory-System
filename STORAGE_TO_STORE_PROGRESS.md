# Storage to Store Migration - Progress Report

## ✅ COMPLETED

### 1. Database Migration
- [x] Renamed `storage_rooms` → `stores` table
- [x] Renamed `storage_room` → `store` column in inventory
- [x] Added `sales_channel` column to stores
- [x] Added `sales_channel` column to inventory

### 2. Type Definitions
- [x] Updated `lib/types.ts`:
  - `StorageRoom` → `Store` interface
  - `InventoryItem.storageRoom` → `store`
  - Added `InventoryItem.salesChannel`
  - `stocksCountByStorageRoom` → `stocksCountByStore`

- [x] Updated `lib/supabase.ts`:
  - `storage_rooms` → `stores` table type
  - `storage_room` → `store` in inventory
  - Added `sales_channel` to both tables

### 3. Database Functions
- [x] Updated `lib/supabase-db.ts`:
  - `getStorageRooms()` → `getStores()`
  - `addStorageRoom()` → `addStore()`
  - `updateStorageRoom()` → `updateStore()`
  - `deleteStorageRoom()` → `deleteStore()`
  - Updated inventory item mapping to use `store` and `salesChannel`

### 4. API Routes
- [x] Created `app/api/stores/route.ts` (GET, POST)
- [x] Created `app/api/stores/[id]/route.ts` (PUT, DELETE)
- [x] Added sales_channel parameter to all store operations

## 🔄 IN PROGRESS / TODO

### 5. Frontend Components
- [ ] Update `components/add-item-dialog.tsx`
- [ ] Update `components/edit-item-dialog.tsx`

### 6. Pages
- [ ] Update `app/dashboard/inventory/page.tsx`
- [ ] Update `app/dashboard/pos/page.tsx`
- [ ] Update `app/dashboard/inventory/low-stock/page.tsx`
- [ ] Update `app/dashboard/inventory/out-of-stock/page.tsx`

### 7. Test Files
- [ ] Update `lib/test-supabase-connection.ts`
- [ ] Update `app/api/test-supabase/route.ts`

### 8. Cleanup
- [ ] Delete old `app/api/storage-rooms/` folder
- [ ] Update any documentation files

## Next Steps:

1. Update Add Product Modal - add Sales Channel dropdown
2. Update Edit Product Modal - add Sales Channel dropdown
3. Update Inventory page - add columns, update button
4. Update POS page - update store references
5. Test all functionality

## Sales Channel Options:
- Shopee
- Lazada
- Facebook
- TikTok
- Physical Store
