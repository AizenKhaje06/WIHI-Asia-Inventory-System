import { NextRequest, NextResponse } from "next/server"
import { syncOrderLogsToInventory } from "@/lib/order-sync"
import { withAdmin } from "@/lib/api-helpers"

export const POST = withAdmin(async (request, { user }) => {
  try {
    await syncOrderLogsToInventory()
    return NextResponse.json({ success: true, message: "Order sync completed successfully" })
  } catch (error) {
    console.error("[API] Order sync error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to sync orders" },
      { status: 500 }
    )
  }
})
