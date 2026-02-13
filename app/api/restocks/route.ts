import { type NextRequest, NextResponse } from "next/server"
import { getRestocks } from "@/lib/supabase-db"
import { getCachedData } from "@/lib/cache"
import { withAuth } from "@/lib/api-helpers"

export const GET = withAuth(async (request, { user }) => {
  try {
    const restocks = await getCachedData(
      'restocks',
      () => getRestocks(),
      2 * 60 * 1000 // 2 minutes
    )
    
    return NextResponse.json({
      success: true,
      count: restocks.length,
      restocks
    })
  } catch (error) {
    console.error("[API] Error fetching restocks:", error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch restocks" 
    }, { status: 500 })
  }
})
