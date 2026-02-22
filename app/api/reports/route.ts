import { type NextRequest, NextResponse } from "next/server"
// Using Supabase as primary database
import { getTransactions } from "@/lib/supabase-db"
import { getCachedData } from "@/lib/cache"
import type { SalesReport, DailySales, MonthlySales } from "@/lib/types"

// Helper function to parse timestamp - handle ISO format from Supabase
// Also supports legacy format for backward compatibility with old data
function parseTimestamp(timestamp: string): Date {
  // Try ISO format first (from Supabase): "2026-02-02T18:32:00"
  if (timestamp.includes('T')) {
    return new Date(timestamp)
  }
  
  // Fall back to legacy format: "YYYY-MM-DD / H:MM AM/PM" (for old data)
  const parts = timestamp.split(' / ')
  if (parts.length !== 2) {
    // If neither format matches, try direct Date parsing
    return new Date(timestamp)
  }

  const datePart = parts[0] // "2025-10-21"
  const timePart = parts[1] // "1:20 PM"

  // Parse time part
  const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!timeMatch) {
    return new Date(timestamp)
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

function emptySalesReport(): SalesReport {
  return {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    itemsSold: 0,
    totalOrders: 0,
    transactions: [],
    dailySales: [],
    monthlySales: [],
    salesOverTime: [],
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const period = searchParams.get("period")
    const view = searchParams.get("view")

    let transactions
    try {
      transactions = await getCachedData(
        'transactions',
        () => getTransactions(),
        60000 // 1 minute
      )
    } catch (dbError) {
      console.error("[Reports API] Database error (returning empty report):", dbError)
      return NextResponse.json(emptySalesReport())
    }

    // Helper function to safely parse timestamp
    const safeParseTimestamp = (timestamp: string): Date | null => {
      try {
        return parseTimestamp(timestamp)
      } catch (error) {
        console.error(`Failed to parse timestamp: ${timestamp}`, error)
        return null
      }
    }

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

      transactions = transactions.filter((t) => {
        const parsed = safeParseTimestamp(t.timestamp)
        return parsed && parsed >= periodStart
      })
    } else {
      // Handle explicit startDate/endDate filtering
      if (startDate) {
        transactions = transactions.filter((t) => {
          const parsed = safeParseTimestamp(t.timestamp)
          return parsed && parsed >= new Date(startDate)
        })
      }

      if (endDate) {
        transactions = transactions.filter((t) => {
          const parsed = safeParseTimestamp(t.timestamp)
          return parsed && parsed <= new Date(endDate)
        })
      }
    }

    // Filter by status if provided
    let salesTransactions = transactions.filter((t) => t.type === "sale" && t.transactionType === "sale")
    
    const statusFilter = searchParams.get("status")
    if (statusFilter && statusFilter !== "all") {
      salesTransactions = salesTransactions.filter((t) => {
        const tStatus = t.status || 'completed'
        return tStatus === statusFilter
      })
    }

    // For revenue calculations, exclude cancelled orders
    const completedSalesTransactions = salesTransactions.filter((t) => t.status !== "cancelled")

    console.log('[Reports API] Total transactions:', transactions.length);
    console.log('[Reports API] Sales transactions:', salesTransactions.length);
    console.log('[Reports API] Completed sales (for revenue):', completedSalesTransactions.length);
    console.log('[Reports API] Sample transaction:', salesTransactions[0]);

    const totalRevenue = completedSalesTransactions.reduce((sum, t) => sum + t.totalRevenue, 0)
    const totalCost = completedSalesTransactions.reduce((sum, t) => sum + t.totalCost, 0)
    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    const itemsSold = completedSalesTransactions.reduce((sum, t) => sum + t.quantity, 0)
    const totalOrders = salesTransactions.length

    console.log('[Reports API] Calculated:', {
      totalRevenue,
      totalCost,
      totalProfit,
      totalOrders
    });

    // Generate salesOverTime data based on period or view
    let salesOverTime: { date: string; revenue: number }[] = []

    if (period) {
      switch (period) {
        case "Today":
          // Group by hour for today
          const hourlyMap = new Map<string, number>()
          completedSalesTransactions.forEach((t) => {
            const parsedDate = safeParseTimestamp(t.timestamp)
            if (parsedDate) {
              const hour = parsedDate.getHours()
              const hourKey = `${hour.toString().padStart(2, '0')}:00`
              hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + t.totalRevenue)
            }
          })
          salesOverTime = Array.from(hourlyMap.entries())
            .map(([hour, revenue]) => ({ date: hour, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date))
          break

        case "1W":
          // Group by day for 1 week
          const weeklyMap = new Map<string, number>()
          completedSalesTransactions.forEach((t) => {
            const parsedDate = safeParseTimestamp(t.timestamp)
            if (parsedDate) {
              const date = parsedDate.toISOString().split("T")[0]
              weeklyMap.set(date, (weeklyMap.get(date) || 0) + t.totalRevenue)
            }
          })
          salesOverTime = Array.from(weeklyMap.entries())
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date))
          break

        case "1M":
          // Group by day for 1 month
          const monthlyMap = new Map<string, number>()
          completedSalesTransactions.forEach((t) => {
            const parsedDate = safeParseTimestamp(t.timestamp)
            if (parsedDate) {
              const date = parsedDate.toISOString().split("T")[0]
              monthlyMap.set(date, (monthlyMap.get(date) || 0) + t.totalRevenue)
            }
          })
          salesOverTime = Array.from(monthlyMap.entries())
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date))
          break
      }
    } else {
      // Use view parameter to determine grouping, default to daily
      const isMonthlyView = view === 'monthly'

      if (isMonthlyView) {
        // Group by month for monthly view
        const monthlyViewMap = new Map<string, number>()
        completedSalesTransactions.forEach((t) => {
          const parsedDate = safeParseTimestamp(t.timestamp)
          if (parsedDate) {
            const month = parsedDate.toISOString().slice(0, 7) // YYYY-MM
            monthlyViewMap.set(month, (monthlyViewMap.get(month) || 0) + t.totalRevenue)
          }
        })
        salesOverTime = Array.from(monthlyViewMap.entries())
          .map(([month, revenue]) => ({ date: month, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date))
      } else {
        // Default to daily sales for backward compatibility
        const dailyMap = new Map<string, number>()
        completedSalesTransactions.forEach((t) => {
          const parsedDate = safeParseTimestamp(t.timestamp)
          if (parsedDate) {
            const date = parsedDate.toISOString().split("T")[0]
            dailyMap.set(date, (dailyMap.get(date) || 0) + t.totalRevenue)
          }
        })
        salesOverTime = Array.from(dailyMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date))
      }
    }

    // Always populate both daily and monthly sales data for other components
    const dailyMap = new Map<string, { revenue: number; itemsSold: number; profit: number }>()

    completedSalesTransactions.forEach((t) => {
      const parsedDate = safeParseTimestamp(t.timestamp)
      if (parsedDate) {
        const date = parsedDate.toISOString().split("T")[0]
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { revenue: 0, itemsSold: 0, profit: 0 })
        }
        const dayData = dailyMap.get(date)!
        dayData.revenue += t.totalRevenue
        dayData.itemsSold += t.quantity
        dayData.profit += t.profit
      }
    })

    const dailySales: DailySales[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const monthlySalesMap = new Map<string, { revenue: number; itemsSold: number; profit: number }>()

    completedSalesTransactions.forEach((t) => {
      const parsedDate = safeParseTimestamp(t.timestamp)
      if (parsedDate) {
        const month = parsedDate.toISOString().slice(0, 7)
        if (!monthlySalesMap.has(month)) {
          monthlySalesMap.set(month, { revenue: 0, itemsSold: 0, profit: 0 })
        }
        const monthData = monthlySalesMap.get(month)!
        monthData.revenue += t.totalRevenue
        monthData.itemsSold += t.quantity
        monthData.profit += t.profit
      }
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
