import { NextResponse } from "next/server"
import { getRestocks } from "@/lib/supabase-db"

export async function GET() {
  try {
    const restocks = await getRestocks()
    return NextResponse.json({
      success: true,
      count: restocks.length,
      restocks
    })
  } catch (error) {
    console.error("Error fetching restocks:", error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch restocks" 
    }, { status: 500 })
  }
}
