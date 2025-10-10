import { NextResponse } from "next/server"
import { getInventoryItems, getTransactions } from "@/lib/google-sheets"
import type { DashboardStats } from "@/lib/types"

export async function GET() {
  try {
    const items = await getInventoryItems()
    const transactions = await getTransactions()

    const totalItems = items.length
    const lowStockItems = items.filter((item) => item.quantity <= item.reorderLevel).length
    const totalValue = items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const recentSales = transactions.filter((t) => t.type === "sale" && new Date(t.timestamp) >= today).length

    const stats: DashboardStats = {
      totalItems,
      lowStockItems,
      totalValue,
      recentSales,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
