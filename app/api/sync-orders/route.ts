import { NextRequest, NextResponse } from "next/server"
import { syncOrderLogsToInventory } from "@/lib/order-sync"

export async function POST(request: NextRequest) {
  try {
    await syncOrderLogsToInventory()
    return NextResponse.json({ success: true, message: "Order sync completed successfully" })
  } catch (error) {
    console.error("Order sync error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to sync orders" },
      { status: 500 }
    )
  }
}
