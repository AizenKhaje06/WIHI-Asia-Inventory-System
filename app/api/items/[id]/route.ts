import { type NextRequest, NextResponse } from "next/server"
import { updateInventoryItem, deleteInventoryItem, getInventoryItems, addLog } from "@/lib/google-sheets"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const items = await getInventoryItems()
    const item = items.find(i => i.id === params.id)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    await updateInventoryItem(params.id, body)
    const changes = Object.entries(body).map(([key, value]) => `${key}: ${value}`).join(', ')
    await addLog({
      operation: "update",
      itemId: params.id,
      itemName: item.name,
      details: `Updated "${item.name}" - Changes: ${changes}`
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const items = await getInventoryItems()
    const item = items.find(i => i.id === params.id)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    await deleteInventoryItem(params.id)
    await addLog({
      operation: "delete",
      itemId: params.id,
      itemName: item.name,
      details: `Deleted "${item.name}" (SKU: ${item.sku})`
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
