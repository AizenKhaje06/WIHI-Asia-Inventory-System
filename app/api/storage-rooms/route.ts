import { NextResponse } from "next/server"
// Using Supabase as primary database
import { getStorageRooms, addStorageRoom } from "@/lib/supabase-db"

export async function GET() {
  try {
    const rooms = await getStorageRooms()
    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Error fetching storage rooms:", error)
    return NextResponse.json({ error: "Failed to fetch storage rooms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    const room = await addStorageRoom(name.trim())
    return NextResponse.json(room)
  } catch (error) {
    console.error("Error adding storage room:", error)
    return NextResponse.json({ error: "Failed to add storage room" }, { status: 500 })
  }
}
