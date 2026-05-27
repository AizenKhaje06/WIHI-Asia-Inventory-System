import { type NextRequest, NextResponse } from "next/server"
// Using Supabase as primary database
import { getInventoryItems, addInventoryItem, addLog } from "@/lib/supabase-db"
import { getCachedData, invalidateCachePattern } from "@/lib/cache"
import { withAuth, withAdmin, withRoles } from "@/lib/api-helpers"

// GET - Requires authentication (any role)
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    let items
    try {
      const hasTimestamp = searchParams.get("t")
      // Fetch from unified view that includes both items and bundles
      items = await getCachedData(
        hasTimestamp ? `inventory-items-${hasTimestamp}` : 'inventory-items-with-bundles',
        () => getInventoryItems(),
        hasTimestamp ? 0 : 2 * 60 * 1000 // No cache if timestamp present
      )
    } catch (dbError) {
      console.error("[API] Database error fetching items (returning empty list):", dbError)
      return NextResponse.json([])
    }

    // Products are universal - all roles can see all products (including bundles)
    // No department/channel filtering needed

    if (search) {
      const searchLower = search.toLowerCase()
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower),
      )
      return NextResponse.json(filtered)
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error("[API] Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
})

// POST - Requires admin, operations, or logistics-admin role
export const POST = withRoles(['admin', 'operations', 'logistics-admin'], async (request, { user }) => {
  try {
    const body = await request.json()
    
    // Products are now universal - check for duplicates by name only
    const existingItems = await getInventoryItems()
    const duplicate = existingItems.find(item => 
      item.name.toLowerCase() === body.name.toLowerCase()
    )
    
    if (duplicate) {
      return NextResponse.json({ 
        error: `Product "${body.name}" already exists. Please update the existing product instead of creating a duplicate.`,
        existingProduct: {
          id: duplicate.id,
          name: duplicate.name,
          quantity: duplicate.quantity
        }
      }, { status: 409 }) // 409 Conflict
    }
    
    const item = await addInventoryItem(body)
    
    // Invalidate cache after creating new item
    invalidateCachePattern('inventory')
    
    await addLog({
      operation: "create",
      itemId: item.id,
      itemName: item.name,
      details: `Added "${item.name}" by ${user.displayName} - Qty: ${item.quantity}, Cost: ₱${item.costPrice.toFixed(2)}, Sell: ₱${item.sellingPrice.toFixed(2)}`
    })
    
    return NextResponse.json(item)
  } catch (error) {
    console.error("[API] Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
})
