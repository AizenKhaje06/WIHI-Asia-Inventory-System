import { type NextRequest, NextResponse } from "next/server"
// Using Supabase as primary database
import { updateInventoryItem, deleteInventoryItem, getInventoryItems, addLog } from "@/lib/supabase-db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const items = await getInventoryItems()
    const item = items.find(i => i.id === id)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    await updateInventoryItem(id, body)
    const changes = Object.entries(body).map(([key, value]) => `${key}: ${value}`).join(', ')
    await addLog({
      operation: "update",
      itemId: id,
      itemName: item.name,
      details: `Updated "${item.name}" - Changes: ${changes}`
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const items = await getInventoryItems()
    const item = items.find(i => i.id === id)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    await deleteInventoryItem(id)
    await addLog({
      operation: "delete",
      itemId: id,
      itemName: item.name,
      details: `Deleted "${item.name}"`
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
