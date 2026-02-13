import { type NextRequest, NextResponse } from "next/server"
import { updateInventoryItem, deleteInventoryItem, getInventoryItems, addLog } from "@/lib/supabase-db"
import { invalidateCachePattern } from "@/lib/cache"
import { requireAuth, requireAdmin } from "@/lib/api-auth"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  try {
    const { id } = await context.params
    const items = await getInventoryItems()
    const item = items.find(i => i.id === id)
    
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    
    return NextResponse.json(item)
  } catch (error) {
    console.error("[API] Error fetching item:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  try {
    const { id } = await context.params
    const body = await request.json()
    const items = await getInventoryItems()
    const item = items.find(i => i.id === id)
    
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    
    await updateInventoryItem(id, body)
    invalidateCachePattern('inventory')
    
    const changes = Object.entries(body).map(([key, value]) => `${key}: ${value}`).join(', ')
    await addLog({
      operation: "update",
      itemId: id,
      itemName: item.name,
      details: `Updated "${item.name}" by ${user.displayName} - Changes: ${changes}`
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  try {
    const { id } = await context.params
    const items = await getInventoryItems()
    const item = items.find(i => i.id === id)
    
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    
    await deleteInventoryItem(id)
    invalidateCachePattern('inventory')
    
    await addLog({
      operation: "delete",
      itemId: id,
      itemName: item.name,
      details: `Deleted "${item.name}" by ${user.displayName}`
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error deleting item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
