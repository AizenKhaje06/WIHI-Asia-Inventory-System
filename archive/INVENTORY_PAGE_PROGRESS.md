# Inventory Page Update Progress

## ✅ COMPLETED in inventory/page.tsx:

1. [x] Updated imports: StorageRoom → Store, added SALES_CHANNELS
2. [x] Updated state variables: warehouses → stores, newWarehouse → newStore (with salesChannel)
3. [x] Updated column widths: storage → salesChannel + store
4. [x] Updated filter logic: storageRoom → store
5. [x] Updated fetchWarehouses() → fetchStores()
6. [x] Updated handleAddWarehouse() → handleAddStore()
7. [x] Updated handleEditWarehouse() → handleEditStore()
8. [x] Updated handleDeleteWarehouse() → handleDeleteStore()
9. [x] Updated useEffect calls: fetchWarehouses → fetchStores

## 🔄 REMAINING in inventory/page.tsx:

### UI Updates Needed:
1. [ ] Update "Storage" button → "Stores" button (line ~460)
2. [ ] Update storage filter dropdown → store filter (line ~506)
3. [ ] Update table header: "Storage" → "Sales Channel" + "Store" columns
4. [ ] Update table cells to show salesChannel and store
5. [ ] Update card view to show salesChannel and store
6. [ ] Update Store Management Dialog:
   - Add Sales Channel dropdown
   - Update form fields
   - Update list display (group by channel)
   - Update edit/delete handlers

### Search Terms to Find:
- "Storage" button text
- "Storage" column header
- storageRoom in table cells
- Warehouse dialog content
- warehouse.name references

## Next Steps:
Continue with UI updates in inventory page, then move to other pages.
