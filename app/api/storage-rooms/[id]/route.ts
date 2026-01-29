import { NextResponse } from "next/server"
import { updateStorageRoom, deleteStorageRoom } from "@/lib/google-sheets"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    await updateStorageRoom(params.id, name.trim())
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating storage room:", error)
    return NextResponse.json({ error: "Failed to update storage room" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteStorageRoom(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting storage room:", error)
    return NextResponse.json({ error: "Failed to delete storage room" }, { status: 500 })
  }
}
