import { type NextRequest, NextResponse } from "next/server"
import { getTransactions } from "@/lib/google-sheets"
import type { SalesReport, DailySales, MonthlySales } from "@/lib/types"

// Helper function to parse Google Sheets timestamp format: "YYYY-MM-DD / H:MM AM/PM"
function parseGoogleSheetsTimestamp(timestamp: string): Date {
  // Format: "2025-10-21 / 1:20 PM"
  const parts = timestamp.split(' / ')
  if (parts.length !== 2) {
    throw new Error(`Invalid timestamp format: ${timestamp}`)
  }

  const datePart = parts[0] // "2025-10-21"
  const timePart = parts[1] // "1:20 PM"

  // Parse time part
  const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!timeMatch) {
    throw new Error(`Invalid time format: ${timePart}`)
  }

  let hours = parseInt(timeMatch[1])
  const minutes = parseInt(timeMatch[2])
  const ampm = timeMatch[3].toUpperCase()

  if (ampm === 'PM' && hours !== 12) {
    hours += 12
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0
  }

  // Create date object
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const period = searchParams.get("period")

    let transactions = await getTransactions()

    // Handle period-based filtering
    if (period) {
      const now = new Date()
      let periodStart: Date

      switch (period) {
        case "Today":
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "1W":
          periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "1M":
          periodStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() + 1)
          break
        default:
          periodStart = new Date(0) // Default to beginning of time if invalid period
      }

      transactions = transactions.filter((t) => parseGoogleSheetsTimestamp(t.timestamp) >= periodStart)
    } else {
      // Handle explicit startDate/endDate filtering
      if (startDate) {
        transactions = transactions.filter((t) => parseGoogleSheetsTimestamp(t.timestamp) >= new Date(startDate))
      }

      if (endDate) {
        transactions = transactions.filter((t) => parseGoogleSheetsTimestamp(t.timestamp) <= new Date(endDate))
      }
    }

    const salesTransactions = transactions.filter((t) => t.type === "sale")

    const totalRevenue = salesTransactions.reduce((sum, t) => sum + t.totalRevenue, 0)
    const totalCost = salesTransactions.reduce((sum, t) => sum + t.totalCost, 0)
    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    const itemsSold = salesTransactions.reduce((sum, t) => sum + t.quantity, 0)
    const totalOrders = salesTransactions.length

    // Generate salesOverTime data based on period
    let salesOverTime: { date: string; revenue: number }[] = []

    if (period) {
      switch (period) {
        case "Today":
          // Group by hour for today
          const hourlyMap = new Map<string, number>()
          salesTransactions.forEach((t) => {
            const parsedDate = parseGoogleSheetsTimestamp(t.timestamp)
            const hour = parsedDate.getHours()
            const hourKey = `${hour.toString().padStart(2, '0')}:00`
            hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + t.totalRevenue)
          })
          salesOverTime = Array.from(hourlyMap.entries())
            .map(([hour, revenue]) => ({ date: hour, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date))
          break

        case "1W":
          // Group by day for 1 week
          const weeklyMap = new Map<string, number>()
          salesTransactions.forEach((t) => {
            const parsedDate = parseGoogleSheetsTimestamp(t.timestamp)
            const date = parsedDate.toISOString().split("T")[0]
            weeklyMap.set(date, (weeklyMap.get(date) || 0) + t.totalRevenue)
          })
          salesOverTime = Array.from(weeklyMap.entries())
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date))
          break

        case "1M":
          // Group by day for 1 month
          const monthlyMap = new Map<string, number>()
          salesTransactions.forEach((t) => {
            const parsedDate = parseGoogleSheetsTimestamp(t.timestamp)
            const date = parsedDate.toISOString().split("T")[0]
            monthlyMap.set(date, (monthlyMap.get(date) || 0) + t.totalRevenue)
          })
          salesOverTime = Array.from(monthlyMap.entries())
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date))
          break
      }
    } else {
      // Default to daily sales for backward compatibility
      const dailyMap = new Map<string, number>()
      salesTransactions.forEach((t) => {
        const parsedDate = parseGoogleSheetsTimestamp(t.timestamp)
        const date = parsedDate.toISOString().split("T")[0]
        dailyMap.set(date, (dailyMap.get(date) || 0) + t.totalRevenue)
      })
      salesOverTime = Array.from(dailyMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }

    // Always populate both daily and monthly sales data for other components
    const dailyMap = new Map<string, { revenue: number; itemsSold: number; profit: number }>()

    salesTransactions.forEach((t) => {
      const parsedDate = parseGoogleSheetsTimestamp(t.timestamp)
      const date = parsedDate.toISOString().split("T")[0]
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

    const monthlySalesMap = new Map<string, { revenue: number; itemsSold: number; profit: number }>()

    salesTransactions.forEach((t) => {
      const parsedDate = parseGoogleSheetsTimestamp(t.timestamp)
      const month = parsedDate.toISOString().slice(0, 7)
      if (!monthlySalesMap.has(month)) {
        monthlySalesMap.set(month, { revenue: 0, itemsSold: 0, profit: 0 })
      }
      const monthData = monthlySalesMap.get(month)!
      monthData.revenue += t.totalRevenue
      monthData.itemsSold += t.quantity
      monthData.profit += t.profit
    })

    const monthlySales: MonthlySales[] = Array.from(monthlySalesMap.entries())
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
      salesOverTime,
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("[v0] Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
