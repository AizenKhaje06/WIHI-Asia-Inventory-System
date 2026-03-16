import { type NextRequest, NextResponse } from "next/server"
import { getRestocks } from "@/lib/supabase-db"

export async function GET(request: NextRequest) {
  try {
    const restocks = await getRestocks()
    return NextResponse.json(restocks)
  } catch (error) {
    console.error("[API] Error fetching restocks:", error)
    return NextResponse.json(
      { error: "Failed to fetch restocks" },
      { status: 500 }
    )
  }
}
