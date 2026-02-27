import { NextResponse } from "next/server"
// Using Supabase as primary database
import { getInventoryItems, getTransactions, getRestocks } from "@/lib/supabase-db"
import { getCachedData } from "@/lib/cache"
import type { DashboardStats, Transaction, InventoryItem } from "@/lib/types"

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

  const datePart = parts[0] // "2026-02-06"
  const timePart = parts[1] // "4:42 PM"

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

// Empty dashboard stats when database is unavailable (so the page still loads)
function emptyDashboardStats(): DashboardStats {
  return {
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    recentSales: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    salesOverTime: [],
    topProducts: [],
    recentTransactions: [],
    topCategories: [],
    totalCategories: 0,
    totalProducts: 0,
    stockPercentageByCategory: [],
    stocksCountByCategory: [],
    stocksCountByStorageRoom: [],
    totalSales: 0,
    returnRate: 0,
    damagedReturnRate: 0,
    supplierReturnRate: 0,
    totalReturns: 0,
    returnValue: 0,
    itemsSoldToday: 0,
    revenueToday: 0,
    supplierReturns: [],
    recentRestocks: [],
    averageOrderValue: 0,
    outOfStockCount: 0,
    inventoryHealthScore: 100,
    insights: [],
    salesVelocity: 0,
    yesterdaySales: 0,
    lastWeekSales: 0,
    lastMonthSales: 0,
    totalCancelledOrders: 0,
    cancelledOrdersValue: 0,
    cancellationRate: 0,
    topCancellationReasons: [],
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'ID'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let items: InventoryItem[] = []
    let transactions: Transaction[] = []
    let restockHistory: any[] = []

    try {
      items = await getCachedData(
        'inventory-items',
        () => getInventoryItems(),
        60000 // 1 minute
      )
      transactions = await getCachedData(
        'transactions',
        () => getTransactions(),
        60000 // 1 minute
      )
      restockHistory = await getCachedData(
        'restocks',
        () => getRestocks(),
        60000 // 1 minute
      )
    } catch (dbError) {
      console.error("[Dashboard API] Database error (returning empty stats):", dbError)
      return NextResponse.json(emptyDashboardStats())
    }

    // Apply date filters if provided (takes precedence over period)
    if (startDate || endDate) {
      transactions = transactions.filter((t: Transaction) => {
        const tDate = parseTimestamp(t.timestamp)
        if (startDate && tDate < new Date(startDate)) return false
        if (endDate && tDate > new Date(endDate)) return false
        return true
      })
    }

    const totalItems = items.length
    const lowStockItems = items.filter((item: InventoryItem) => item.quantity <= item.reorderLevel).length
    const totalValue = items.reduce((sum, item: InventoryItem) => sum + item.quantity * item.sellingPrice, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    
    console.log('[Dashboard API] Today range:', {
      start: today.toISOString(),
      end: todayEnd.toISOString(),
      startLocal: today.toLocaleString(),
      endLocal: todayEnd.toLocaleString()
    })
    
    const recentSales = transactions.filter((t: Transaction) => {
      const tDate = parseTimestamp(t.timestamp)
      return t.type === "sale" && t.transactionType === "sale" && t.status !== "cancelled" && tDate >= today && tDate <= todayEnd
    }).length

    // Items sold today (quantity, excluding cancelled)
    const itemsSoldToday = transactions
      .filter((t: Transaction) => {
        const tDate = parseTimestamp(t.timestamp)
        return t.type === "sale" && t.transactionType === "sale" && t.status !== "cancelled" && tDate >= today && tDate <= todayEnd
      })
      .reduce((sum, t) => sum + t.quantity, 0)
    
    // Revenue today (excluding cancelled)
    const todayTransactions = transactions.filter((t: Transaction) => {
      const tDate = parseTimestamp(t.timestamp)
      const matches = t.type === "sale" && t.transactionType === "sale" && t.status !== "cancelled" && tDate >= today && tDate <= todayEnd
      if (matches) {
        console.log('[Dashboard API] Today transaction:', {
          itemName: t.itemName,
          quantity: t.quantity,
          revenue: t.totalRevenue,
          timestamp: t.timestamp,
          parsed: tDate.toISOString(),
          parsedLocal: tDate.toLocaleString()
        })
      }
      return matches
    })
    
    const revenueToday = todayTransactions.reduce((sum, t) => sum + t.totalRevenue, 0)
    
    console.log('[Dashboard API] Today summary:', {
      count: todayTransactions.length,
      total: revenueToday
    })

    // Sales over time based on period
    let salesOverTime: { date: string; purchases: number; sales: number }[] = []

    if (period === 'ID') {
      // Today: Hourly data points for today only (00:00 to 23:00 local time)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      
      salesOverTime = Array.from({ length: 24 }, (_, i) => {
        // Create hour boundaries in local time
        const hourStart = new Date(todayStart)
        hourStart.setHours(i, 0, 0, 0)
        const hourEnd = new Date(todayStart)
        hourEnd.setHours(i, 59, 59, 999)
        
        // Format hour in local time (e.g., "14:00" for 2 PM)
        const hourStr = i.toString().padStart(2, '0') + ':00'
        
        const sales = transactions.filter((t: Transaction) => {
          const tDate = parseTimestamp(t.timestamp)
          return t.type === "sale" && t.transactionType === "sale" && tDate >= hourStart && tDate <= hourEnd
        }).reduce((sum, t) => sum + t.totalRevenue, 0)
        
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parseTimestamp(t.timestamp)
          return t.type === "restock" && tDate >= hourStart && tDate <= hourEnd
        }).reduce((sum, t) => sum + t.totalCost, 0)
        
        return { date: hourStr, purchases, sales }
      })
    } else if (period === '1W') {
      // Last 7 days, daily data points (including today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      salesOverTime = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(today)
        day.setDate(today.getDate() - (6 - i)) // Start from 6 days ago to today
        const nextDay = new Date(day)
        nextDay.setDate(day.getDate() + 1)
        
        const dayStr = day.toISOString().split('T')[0] + ' 00:00'
        
        const sales = transactions.filter((t: Transaction) => {
          const tDate = parseTimestamp(t.timestamp)
          return t.type === "sale" && t.transactionType === "sale" && t.status !== "cancelled" && tDate >= day && tDate < nextDay
        }).reduce((sum, t) => sum + t.totalRevenue, 0)
        
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parseTimestamp(t.timestamp)
          return t.type === "restock" && tDate >= day && tDate < nextDay
        }).reduce((sum, t) => sum + t.totalCost, 0)
        
        return { date: dayStr, purchases, sales }
      })
      
      console.log('[Dashboard API] Final salesOverTime:', salesOverTime)
    } else if (period === '1M') {
      // Current month: 30 days, daily data points
      const today = new Date()
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
      
      salesOverTime = Array.from({ length: daysInMonth }, (_, i) => {
        const day = new Date(today.getFullYear(), today.getMonth(), i + 1)
        day.setHours(0, 0, 0, 0)
        const nextDay = new Date(day)
        nextDay.setDate(nextDay.getDate() + 1)
        
        const dayStr = `${today.toLocaleDateString('en-US', { month: 'short' })} ${i + 1}`
        
        const sales = transactions.filter((t: Transaction) => {
          const tDate = parseTimestamp(t.timestamp)
          return t.type === "sale" && t.transactionType === "sale" && t.status !== "cancelled" && tDate >= day && tDate < nextDay
        }).reduce((sum, t) => sum + t.totalRevenue, 0)
        
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parseTimestamp(t.timestamp)
          return t.type === "restock" && tDate >= day && tDate < nextDay
        }).reduce((sum, t) => sum + t.totalCost, 0)
        
        return { date: dayStr, purchases, sales }
      })
    }

    // IMPORTANT: Exclude cancelled orders from revenue calculations (define this first!)
    const completedTransactions = transactions.filter((t: Transaction) => 
      t.type === "sale" && 
      t.transactionType === "sale" && 
      t.status !== "cancelled"
    )

    // Top products (top 4 by sales count) with revenue
    const productSales = transactions
      .filter((t: Transaction) => t.type === "sale" && t.transactionType === "sale")
      .reduce((acc: { [key: string]: { quantity: number; revenue: number } }, t: Transaction) => {
        if (!acc[t.itemName]) {
          acc[t.itemName] = { quantity: 0, revenue: 0 }
        }
        acc[t.itemName].quantity += t.quantity
        acc[t.itemName].revenue += t.totalRevenue
        return acc
      }, {})
    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b.quantity - a.quantity)
      .slice(0, 4)
      .map(([name, data]) => ({ 
        name, 
        sales: data.quantity,
        revenue: data.revenue
      }))

    // Recent transactions (last 5 sales, excluding cancelled)
    const recentTransactions = completedTransactions
      .sort((a: Transaction, b: Transaction) => parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime())
      .slice(0, 5)

    // Top categories (top 3 by sales, excluding cancelled)
    const categorySales = items.reduce((acc: { [key: string]: number }, item: InventoryItem) => {
      const sales = completedTransactions
        .filter((t: Transaction) => t.itemName === item.name)
        .reduce((sum, t) => sum + t.quantity, 0)
      acc[item.category] = (acc[item.category] || 0) + sales
      return acc
    }, {})
    const topCategories = Object.entries(categorySales)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([name, sales]) => ({ name, sales: sales as number }))

    // Total categories and products
    const totalCategories = new Set(items.map((item: InventoryItem) => item.category)).size
    const totalProducts = totalItems

    // Calculate financial metrics (only actual sales, not demo/internal, excluding cancelled)
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.totalRevenue, 0)

    const totalCost = completedTransactions.reduce((sum, t) => sum + t.totalCost, 0)

    const totalProfit = completedTransactions.reduce((sum, t) => sum + t.profit, 0)

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    // Cancelled orders metrics
    const cancelledTransactions = transactions.filter((t: Transaction) => 
      t.type === "sale" && 
      t.transactionType === "sale" && 
      t.status === "cancelled"
    ) || []

    const totalCancelledOrders = cancelledTransactions.length || 0
    const cancelledOrdersValue = cancelledTransactions.reduce((sum, t) => sum + (t.totalRevenue || 0), 0)

    const totalOrders = transactions.filter((t: Transaction) => 
      t.type === "sale" && 
      t.transactionType === "sale"
    ).length || 0

    const cancellationRate = totalOrders > 0 ? (totalCancelledOrders / totalOrders) * 100 : 0

    // Top cancellation reasons
    const cancellationReasons = cancelledTransactions.reduce((acc: { [key: string]: number }, t: Transaction) => {
      const reason = t.cancellationReason || 'unknown'
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {})

    const topCancellationReasons = Object.entries(cancellationReasons)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count: count as number })) || []

    // Stock percentage by category (percentage of total stock value)
    const stockValueByCategory = items.reduce((acc: { [key: string]: number }, item: InventoryItem) => {
      const value = item.quantity * item.costPrice
      acc[item.category] = (acc[item.category] || 0) + value
      return acc
    }, {})
    const stockPercentageByCategory = Object.entries(stockValueByCategory)
      .map(([name, value]) => ({
        name,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)

    // Stocks count by category (total quantity)
    const stocksCountByCategory = items.reduce((acc: { [key: string]: number }, item: InventoryItem) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity
      return acc
    }, {})
    const stocksCountByCategorySorted = Object.entries(stocksCountByCategory)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)

    // Stocks count by storage room (total quantity)
    const stocksCountByStorageRoom = items.reduce((acc: { [key: string]: number }, item: InventoryItem) => {
      acc[item.storageRoom] = (acc[item.storageRoom] || 0) + item.quantity
      return acc
    }, {})
    const stocksCountByStorageRoomSorted = Object.entries(stocksCountByStorageRoom)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)

    // Supplier returns (top 5 items returned to supplier)
    const supplierReturns = restockHistory
      .filter(r => r.reason === 'supplier-return')
      .reduce((acc: { [key: string]: { quantity: number; value: number } }, r) => {
        if (!acc[r.itemName]) {
          acc[r.itemName] = { quantity: 0, value: 0 }
        }
        acc[r.itemName].quantity += r.quantity
        acc[r.itemName].value += r.totalCost
        return acc
      }, {})
    
    const topSupplierReturns = Object.entries(supplierReturns)
      .sort(([, a], [, b]) => (b as { quantity: number; value: number }).value - (a as { quantity: number; value: number }).value)
      .slice(0, 5)
      .map(([name, data]) => ({
        itemName: name,
        quantity: (data as { quantity: number; value: number }).quantity,
        value: (data as { quantity: number; value: number }).value
      }))

    // Recent restocks (last 5) - include all restock reasons except supplier returns
    const recentRestocks = restockHistory
      .filter(r => r.reason !== 'supplier-return') // Exclude supplier returns (they're shown separately)
      .sort((a, b) => parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime())
      .slice(0, 5)

    // Average order value
    const averageOrderValue = recentSales > 0 ? totalRevenue / recentSales : 0

    // Out of stock count
    const outOfStockCount = items.filter((item: InventoryItem) => item.quantity === 0).length

    // Return rate - calculate from restock history (damaged-return and supplier-return)
    // Use overall return rate: total returns / total sales
    const returns = restockHistory.filter(r => r.reason === 'damaged-return' || r.reason === 'supplier-return')
    const totalReturns = returns.reduce((sum, r) => sum + r.quantity, 0)
    const totalSales = completedTransactions
      .reduce((sum, t) => sum + t.quantity, 0)
    const returnRate = totalSales > 0 ? (totalReturns / totalSales) * 100 : 0
    
    // Calculate breakdown by reason
    const damagedReturns = returns.filter(r => r.reason === 'damaged-return').reduce((sum, r) => sum + r.quantity, 0)
    const supplierReturnsCount = returns.filter(r => r.reason === 'supplier-return').reduce((sum, r) => sum + r.quantity, 0)
    const damagedReturnRate = totalSales > 0 ? (damagedReturns / totalSales) * 100 : 0
    const supplierReturnRate = totalSales > 0 ? (supplierReturnsCount / totalSales) * 100 : 0

    // Inventory health score (0-100)
    const stockHealthPercent = totalItems > 0 ? ((totalItems - outOfStockCount) / totalItems) * 100 : 100
    const returnHealthPercent = 100 - Math.min(returnRate * 10, 100)
    const lowStockHealthPercent = totalItems > 0 ? ((totalItems - lowStockItems) / totalItems) * 100 : 100
    const inventoryHealthScore = Math.round((stockHealthPercent * 0.4 + returnHealthPercent * 0.3 + lowStockHealthPercent * 0.3))

    // Business insights
    const insights = []
    
    // Best selling product
    if (topProducts.length > 0) {
      const revenue = topProducts[0].revenue
      insights.push({
        type: 'success',
        message: `Best seller: ${topProducts[0].name} with ₱${revenue.toLocaleString()} revenue`
      })
    }
    
    // Low stock warning
    if (lowStockItems > 0) {
      insights.push({
        type: 'warning',
        message: `${lowStockItems} items need restocking soon`
      })
    }
    
    // Out of stock alert
    if (outOfStockCount > 0) {
      insights.push({
        type: 'error',
        message: `${outOfStockCount} items are out of stock - immediate action required`
      })
    }
    
    // Profit margin insight
    if (profitMargin >= 30) {
      insights.push({
        type: 'success',
        message: `Excellent profit margin of ${profitMargin.toFixed(1)}% - keep it up!`
      })
    } else if (profitMargin < 15) {
      insights.push({
        type: 'warning',
        message: `Profit margin is ${profitMargin.toFixed(1)}% - consider reviewing pricing`
      })
    }
    
    // Return rate insight
    if ((returnRate || 0) > 10) {
      insights.push({
        type: 'error',
        message: `High return rate of ${(returnRate || 0).toFixed(1)}% - check product quality`
      })
    }

    // Sales velocity (items sold per day)
    const salesVelocity = itemsSoldToday

    // Calculate previous period sales for comparison
    // Use local date (not UTC) to match user's timezone
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0) // Start of yesterday in local time
    
    const yesterdayEnd = new Date(today)
    yesterdayEnd.setHours(0, 0, 0, 0) // Start of today in local time
    
    console.log('[Dashboard API] Yesterday range (local):', {
      start: yesterday.toISOString(),
      end: yesterdayEnd.toISOString(),
      startLocal: yesterday.toLocaleString(),
      endLocal: yesterdayEnd.toLocaleString()
    })
    
    const yesterdayTransactions = transactions.filter((t: Transaction) => {
      const tDate = parseTimestamp(t.timestamp)
      const matches = t.type === "sale" && t.transactionType === "sale" && t.status !== "cancelled" && tDate >= yesterday && tDate < yesterdayEnd
      if (matches) {
        console.log('[Dashboard API] Yesterday transaction:', {
          itemName: t.itemName,
          quantity: t.quantity,
          revenue: t.totalRevenue,
          timestamp: t.timestamp,
          parsed: tDate.toISOString(),
          parsedLocal: tDate.toLocaleString()
        })
      }
      return matches
    })
    
    const yesterdaySales = yesterdayTransactions.reduce((sum, t) => sum + t.totalRevenue, 0)
    
    console.log('[Dashboard API] Yesterday summary:', {
      count: yesterdayTransactions.length,
      total: yesterdaySales
    })

    // Last week sales (7 days ago to 14 days ago)
    const lastWeekStart = new Date(today)
    lastWeekStart.setDate(lastWeekStart.getDate() - 14)
    const lastWeekEnd = new Date(today)
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7)
    
    const lastWeekSales = transactions
      .filter((t: Transaction) => {
        const tDate = parseTimestamp(t.timestamp)
        return t.type === "sale" && t.transactionType === "sale" && t.status !== "cancelled" && tDate >= lastWeekStart && tDate < lastWeekEnd
      })
      .reduce((sum, t) => sum + t.totalRevenue, 0)

    // Last month sales (previous calendar month)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    lastMonthStart.setHours(0, 0, 0, 0)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1)
    lastMonthEnd.setHours(0, 0, 0, 0)
    
    const lastMonthSales = transactions
      .filter((t: Transaction) => {
        const tDate = parseTimestamp(t.timestamp)
        return t.type === "sale" && t.transactionType === "sale" && t.status !== "cancelled" && tDate >= lastMonthStart && tDate < lastMonthEnd
      })
      .reduce((sum, t) => sum + t.totalRevenue, 0)

    const stats: DashboardStats = {
      totalItems,
      lowStockItems,
      totalValue,
      recentSales,
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      salesOverTime,
      topProducts,
      recentTransactions,
      topCategories,
      totalCategories,
      totalProducts,
      stockPercentageByCategory,
      stocksCountByCategory: stocksCountByCategorySorted,
      stocksCountByStorageRoom: stocksCountByStorageRoomSorted,
      totalSales, // Overall quantity sold (all-time)
      returnRate: Math.round(returnRate * 100) / 100,
      damagedReturnRate: Math.round(damagedReturnRate * 100) / 100,
      supplierReturnRate: Math.round(supplierReturnRate * 100) / 100,
      totalReturns,
      returnValue: returns.reduce((sum, r) => sum + r.totalCost, 0),
      itemsSoldToday,
      revenueToday,
      supplierReturns: topSupplierReturns,
      recentRestocks,
      averageOrderValue,
      outOfStockCount,
      inventoryHealthScore,
      insights,
      salesVelocity,
      yesterdaySales,
      lastWeekSales,
      lastMonthSales,
      // Cancelled orders tracking
      totalCancelledOrders,
      cancelledOrdersValue,
      cancellationRate,
      topCancellationReasons,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[Dashboard API] Error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("[Dashboard API] Error details:", {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json({ 
      error: "Failed to fetch dashboard stats",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
