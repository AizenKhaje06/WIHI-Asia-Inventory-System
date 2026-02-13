import { type NextRequest, NextResponse } from "next/server"
import { getStorageRooms, addStorageRoom, addLog } from "@/lib/supabase-db"
import { getCachedData, invalidateCachePattern } from "@/lib/cache"
import { withAuth, withAdmin } from "@/lib/api-helpers"

export const GET = withAuth(async (request, { user }) => {
  try {
    const rooms = await getCachedData(
      'storage-rooms',
      () => getStorageRooms(),
      5 * 60 * 1000 // 5 minutes
    )
    return NextResponse.json(rooms)
  } catch (error) {
    console.error("[API] Error fetching storage rooms:", error)
    return NextResponse.json({ error: "Failed to fetch storage rooms" }, { status: 500 })
  }
})

export const POST = withAdmin(async (request, { user }) => {
  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    const room = await addStorageRoom(name.trim())
    invalidateCachePattern('storage-rooms')
    
    await addLog({
      operation: "create",
      itemId: room.id,
      itemName: name.trim(),
      details: `Created storage room "${name.trim()}" by ${user.displayName}`
    })
    
    return NextResponse.json(room)
  } catch (error) {
    console.error("[API] Error adding storage room:", error)
    return NextResponse.json({ error: "Failed to add storage room" }, { status: 500 })
  }
})
