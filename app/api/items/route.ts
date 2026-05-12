import { type NextRequest, NextResponse } from "next/server"
// Using Supabase as primary database
import { getInventoryItems, addInventoryItem, addLog } from "@/lib/supabase-db"
import { getCachedData, invalidateCachePattern } from "@/lib/cache"
import { withAuth, withAdmin } from "@/lib/api-helpers"

// GET - Requires authentication (any role)
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    let items
    try {
      items = await getCachedData(
        'inventory-items',
        () => getInventoryItems(),
        2 * 60 * 1000 // 2 minutes
      )
    } catch (dbError) {
      console.error("[API] Database error fetching items (returning empty list):", dbError)
      return NextResponse.json([])
    }

    // DEPARTMENT FILTERING: Operations users only see their department's data
    if (user.role === 'operations' && user.assignedChannel) {
      items = items.filter(item => item.salesChannel === user.assignedChannel)
    }
    // Admin and packer see all items

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

// POST - Requires admin role
export const POST = withAdmin(async (request, { user }) => {
  try {
    const body = await request.json()
    
    // Check for duplicates: same name, store, and sales channel
    const existingItems = await getInventoryItems()
    const duplicate = existingItems.find(item => 
      item.name.toLowerCase() === body.name.toLowerCase() &&
      item.store === body.store &&
      item.salesChannel === body.salesChannel
    )
    
    if (duplicate) {
      return NextResponse.json({ 
        error: `Product "${body.name}" already exists in ${body.store} (${body.salesChannel}). Please update the existing product instead of creating a duplicate.`,
        existingProduct: {
          id: duplicate.id,
          name: duplicate.name,
          store: duplicate.store,
          salesChannel: duplicate.salesChannel,
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
