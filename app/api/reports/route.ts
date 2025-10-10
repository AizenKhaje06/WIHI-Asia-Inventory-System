import { type NextRequest, NextResponse } from "next/server"
import { getTransactions } from "@/lib/google-sheets"
import type { SalesReport } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let transactions = await getTransactions()

    if (startDate) {
      transactions = transactions.filter((t) => new Date(t.timestamp) >= new Date(startDate))
    }

    if (endDate) {
      transactions = transactions.filter((t) => new Date(t.timestamp) <= new Date(endDate))
    }

    const salesTransactions = transactions.filter((t) => t.type === "sale")

    const totalRevenue = salesTransactions.reduce((sum, t) => sum + t.totalRevenue, 0)
    const totalCost = salesTransactions.reduce((sum, t) => sum + t.totalCost, 0)
    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    const itemsSold = salesTransactions.reduce((sum, t) => sum + t.quantity, 0)

    const report: SalesReport = {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      itemsSold,
      transactions: salesTransactions,
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("[v0] Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
