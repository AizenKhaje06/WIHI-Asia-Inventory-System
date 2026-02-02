import { type NextRequest, NextResponse } from "next/server"
// Using Supabase as primary database
import { getInventoryItems, addInventoryItem, addLog } from "@/lib/supabase-db"
import { getCachedData, invalidateCachePattern } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    // Use caching for inventory items (2 minute TTL)
    const items = await getCachedData(
      'inventory-items',
      () => getInventoryItems(),
      2 * 60 * 1000 // 2 minutes
    )

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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await addInventoryItem(body)
    
    // Invalidate cache after creating new item
    invalidateCachePattern('inventory')
    
    await addLog({
      operation: "create",
      itemId: item.id,
      itemName: item.name,
      details: `Added "${item.name}" - Qty: ${item.quantity}, Cost: ₱${item.costPrice.toFixed(2)}, Sell: ₱${item.sellingPrice.toFixed(2)}`
    })
    
    return NextResponse.json(item)
  } catch (error) {
    console.error("[API] Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
