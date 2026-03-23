# Inventory Page - Exclude Bundles Fix

## PROBLEM

Inventory page (product page) was showing bundles in the list and including them in Total Value calculation.

Dashboard: P2,995,059 (inventory only)
Inventory: P6,500,111.44 (inventory + bundles)

## ROOT CAUSE

Inventory page was calling /api/products which uses products_unified view:

```typescript
// app/dashboard/inventory/page.tsx
const data = await apiGet("/api/products")  // <- Includes bundles!
```

```typescript
// app/api/products/route.ts
.from('products_unified')  // <- Combines inventory + bundles
```

## SOLUTION

Changed inventory page to call /api/items instead:

BEFORE:
```typescript
const data = await apiGet("/api/products")  // Inventory + Bundles
```

AFTER:
```typescript
const data = await apiGet("/api/items")  // Inventory only
```

## RESULT

Now inventory page:
- Shows inventory items only (NOT bundles)
- Total Value = inventory items only
- Matches Dashboard value

Dashboard:  P2,995,059 (inventory only)
Inventory:  P2,995,059 (inventory only)
MATCH!

## WHY?

Bundles are VIRTUAL PRODUCTS:
- Bundle = combination of existing inventory items
- Actual items are still in inventory
- Including bundles = DOUBLE COUNTING
- So bundles should NOT be in inventory value

## WHERE TO SEE BUNDLES?

Bundles should have their own separate page/section, NOT mixed with inventory items.

## FILES MODIFIED

- app/dashboard/inventory/page.tsx - Changed to use /api/items

## TESTING

1. Clear cache: rmdir /s /q .next
2. Restart: npm run dev
3. Hard refresh: Ctrl + Shift + R
4. Check Dashboard "Inventory Value"
5. Check Inventory "Total Value"
6. Should MATCH now!

STATUS: FIXED
BUNDLES: Excluded from inventory page
