import { type NextRequest, NextResponse } from "next/server"
import { getTransactions } from "@/lib/google-sheets"
import type { SalesReport, DailySales, MonthlySales } from "@/lib/types"

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
    const totalOrders = salesTransactions.length

    // Always populate both daily and monthly sales data
    const dailyMap = new Map<string, { revenue: number; itemsSold: number; profit: number }>()

    salesTransactions.forEach((t) => {
      const date = new Date(t.timestamp).toISOString().split("T")[0]
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { revenue: 0, itemsSold: 0, profit: 0 })
      }
      const dayData = dailyMap.get(date)!
      dayData.revenue += t.totalRevenue
      dayData.itemsSold += t.quantity
      dayData.profit += t.profit
    })

    const dailySales: DailySales[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const monthlyMap = new Map<string, { revenue: number; itemsSold: number; profit: number }>()

    salesTransactions.forEach((t) => {
      const month = new Date(t.timestamp).toISOString().slice(0, 7)
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { revenue: 0, itemsSold: 0, profit: 0 })
      }
      const monthData = monthlyMap.get(month)!
      monthData.revenue += t.totalRevenue
      monthData.itemsSold += t.quantity
      monthData.profit += t.profit
    })

    const monthlySales: MonthlySales[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const report: SalesReport = {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      itemsSold,
      totalOrders,
      transactions: salesTransactions,
      dailySales,
      monthlySales,
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("[v0] Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
