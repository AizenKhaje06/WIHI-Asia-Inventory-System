import { type NextRequest, NextResponse } from "next/server"
import { updateInventoryItem, deleteInventoryItem } from "@/lib/google-sheets"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    await updateInventoryItem(params.id, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteInventoryItem(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
