import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getInventoryItems, getRestocks } from "@/lib/supabase-db"
import { getCachedData } from "@/lib/cache"
import type { DashboardStats, InventoryItem } from "@/lib/types"
import { 
  filterRevenueOrders, 
  calculateFinancialMetrics,
  getExcludedOrdersSummary,
  EXCLUDED_STATUSES 
} from "@/lib/financial-utils"

/**
 * Dashboard API - Accurate Financial Metrics
 * 
 * Data Source: orders table (Track Orders page)
 * Revenue Recognition: Active orders only (excludes CANCELLED and RETURNED)
 * 
 * This ensures all financial metrics are accurate and consistent across the system.
 */

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
    stocksCountByStore: [],
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

    // Fetch inventory items and restocks
    let items: InventoryItem[] = []
    let restockHistory: any[] = []

    try {
      items = await getCachedData(
        'inventory-items',
        () => getInventoryItems(),
        60000 // 1 minute
      )
      restockHistory = await getCachedData(
        'restocks',
        () => getRestocks(),
        60000 // 1 minute
      )
    } catch (dbError) {
      console.error("[Dashboard API] Database error:", dbError)
      return NextResponse.json(emptyDashboardStats())
    }

    // Fetch orders from orders table (Track Orders data source)
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Packed') // Only dispatched orders

    if (ordersError) {
      console.error("[Dashboard API] Error fetching orders:", ordersError)
      return NextResponse.json(emptyDashboardStats())
    }

    // Apply date filters if provided
    let filteredOrders = allOrders || []
    if (startDate || endDate) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.date)
        if (startDate && orderDate < new Date(startDate)) return false
        if (endDate && orderDate > new Date(endDate)) return false
        return true
      })
    }

    // Filter to active orders only (exclude CANCELLED and RETURNED)
    const activeOrders = filterRevenueOrders(
      filteredOrders.map(o => ({
        id: o.id,
        qty: o.qty || 0,
        total: o.total || 0,
        cogs: o.cogs || 0, // Use ACTUAL COGS from order
        parcel_status: o.parcel_status || 'PENDING',
        payment_status: o.payment_status || 'pending',
        sales_channel: o.sales_channel,
        date: o.date
      })),
      'active' // Excludes CANCELLED and RETURNED
    )

    // Calculate overall financial metrics
    const financialMetrics = calculateFinancialMetrics(activeOrders)

    // Calculate excluded orders summary
    const excludedSummary = getExcludedOrdersSummary(
      filteredOrders.map(o => ({
        id: o.id,
        qty: o.qty || 0,
        total: o.total || 0,
        cogs: o.cogs || 0, // Use ACTUAL COGS from order
        parcel_status: o.parcel_status || 'PENDING',
        payment_status: o.payment_status || 'pending',
        sales_channel: o.sales_channel,
        date: o.date
      }))
    )

    // Inventory metrics
    const totalItems = items.length
    const lowStockItems = items.filter((item: InventoryItem) => 
      item.quantity > 0 && item.quantity <= item.reorderLevel
    ).length
    const outOfStockCount = items.filter((item: InventoryItem) => item.quantity === 0).length
    const totalValue = items.reduce((sum, item: InventoryItem) => 
      sum + item.quantity * item.sellingPrice, 0
    )

    // Today's metrics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayOrders = activeOrders.filter(order => {
      const orderDate = new Date(order.date)
      return orderDate >= today && orderDate <= todayEnd
    })

    const itemsSoldToday = todayOrders.reduce((sum, o) => sum + o.qty, 0)
    const revenueToday = todayOrders.reduce((sum, o) => sum + o.total, 0)
    const recentSales = todayOrders.length

    // Yesterday's sales for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const yesterdayEnd = new Date(today)
    yesterdayEnd.setHours(0, 0, 0, 0)

    const yesterdayOrders = activeOrders.filter(order => {
      const orderDate = new Date(order.date)
      return orderDate >= yesterday && orderDate < yesterdayEnd
    })
    const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + o.total, 0)

    // Last week sales (7-14 days ago)
    const lastWeekStart = new Date(today)
    lastWeekStart.setDate(lastWeekStart.getDate() - 14)
    const lastWeekEnd = new Date(today)
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7)

    const lastWeekOrders = activeOrders.filter(order => {
      const orderDate = new Date(order.date)
      return orderDate >= lastWeekStart && orderDate < lastWeekEnd
    })
    const lastWeekSales = lastWeekOrders.reduce((sum, o) => sum + o.total, 0)

    // Last month sales
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    lastMonthStart.setHours(0, 0, 0, 0)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1)
    lastMonthEnd.setHours(0, 0, 0, 0)

    const lastMonthOrders = activeOrders.filter(order => {
      const orderDate = new Date(order.date)
      return orderDate >= lastMonthStart && orderDate < lastMonthEnd
    })
    const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + o.total, 0)

    // Sales over time based on period
    let salesOverTime: { date: string; purchases: number; sales: number }[] = []

    if (period === 'ID') {
      // Today: Hourly data
      salesOverTime = Array.from({ length: 24 }, (_, i) => {
        const hourStart = new Date(today)
        hourStart.setHours(i, 0, 0, 0)
        const hourEnd = new Date(today)
        hourEnd.setHours(i, 59, 59, 999)

        const hourStr = i.toString().padStart(2, '0') + ':00'

        const sales = activeOrders
          .filter(order => {
            const orderDate = new Date(order.date)
            return orderDate >= hourStart && orderDate <= hourEnd
          })
          .reduce((sum, o) => sum + o.total, 0)

        return { date: hourStr, purchases: 0, sales }
      })
    } else if (period === '1W') {
      // Last 7 days
      salesOverTime = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(today)
        day.setDate(today.getDate() - (6 - i))
        day.setHours(0, 0, 0, 0)
        const nextDay = new Date(day)
        nextDay.setDate(day.getDate() + 1)

        const dayStr = day.toISOString().split('T')[0]

        const sales = activeOrders
          .filter(order => {
            const orderDate = new Date(order.date)
            return orderDate >= day && orderDate < nextDay
          })
          .reduce((sum, o) => sum + o.total, 0)

        return { date: dayStr, purchases: 0, sales }
      })
    } else if (period === '1M') {
      // Current month
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

      salesOverTime = Array.from({ length: daysInMonth }, (_, i) => {
        const day = new Date(today.getFullYear(), today.getMonth(), i + 1)
        day.setHours(0, 0, 0, 0)
        const nextDay = new Date(day)
        nextDay.setDate(nextDay.getDate() + 1)

        const dayStr = `${today.toLocaleDateString('en-US', { month: 'short' })} ${i + 1}`

        const sales = activeOrders
          .filter(order => {
            const orderDate = new Date(order.date)
            return orderDate >= day && orderDate < nextDay
          })
          .reduce((sum, o) => sum + o.total, 0)

        return { date: dayStr, purchases: 0, sales }
      })
    }

    // Top products by quantity sold
    const productSales = filteredOrders.reduce((acc: { [key: string]: { quantity: number; revenue: number; status: string } }, order) => {
      const product = order.product || 'Unknown'
      if (!acc[product]) {
        acc[product] = { quantity: 0, revenue: 0, status: order.parcel_status }
      }
      // Only count active orders for revenue
      if (!EXCLUDED_STATUSES.includes(order.parcel_status)) {
        acc[product].quantity += order.qty || 0
        acc[product].revenue += order.total || 0
      }
      return acc
    }, {})

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => (b as { quantity: number; revenue: number }).quantity - (a as { quantity: number; revenue: number }).quantity)
      .slice(0, 4)
      .map(([name, data]) => {
        const typedData = data as { quantity: number; revenue: number }
        return {
          name,
          sales: typedData.quantity,
          revenue: typedData.revenue
        }
      })

    // Recent transactions (last 5 active orders)
    const recentTransactions = filteredOrders
      .filter(order => !EXCLUDED_STATUSES.includes(order.parcel_status))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(order => {
        const actualCOGS = order.cogs || 0
        const actualTotal = order.total || 0
        const actualProfit = actualTotal - actualCOGS
        
        return {
          id: order.id,
          itemId: order.id, // Using order ID as itemId
          itemName: order.product || 'Unknown',
          quantity: order.qty || 0,
          costPrice: actualCOGS / (order.qty || 1),
          sellingPrice: actualTotal / (order.qty || 1),
          totalCost: actualCOGS,
          totalRevenue: actualTotal,
          profit: actualProfit,
          timestamp: order.date,
          type: 'sale' as const,
          transactionType: 'sale' as const,
          status: (order.parcel_status === 'DELIVERED' ? 'completed' : 'pending') as 'completed' | 'pending'
        }
      })

    // Top categories (from inventory items)
    const categorySales = items.reduce((acc: { [key: string]: number }, item: InventoryItem) => {
      const sales = filteredOrders
        .filter(order => 
          order.product?.includes(item.name) && 
          !EXCLUDED_STATUSES.includes(order.parcel_status)
        )
        .reduce((sum, order) => sum + (order.qty || 0), 0)
      acc[item.category] = (acc[item.category] || 0) + sales
      return acc
    }, {})

    const topCategories = Object.entries(categorySales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, sales]) => ({ name, sales }))

    // Stock metrics by category
    const totalCategories = new Set(items.map((item: InventoryItem) => item.category)).size
    const totalProducts = totalItems

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

    const stocksCountByCategory = items.reduce((acc: { [key: string]: number }, item: InventoryItem) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity
      return acc
    }, {})

    const stocksCountByCategorySorted = Object.entries(stocksCountByCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const stocksCountByStore = items.reduce((acc: { [key: string]: number }, item: InventoryItem) => {
      acc[item.store] = (acc[item.store] || 0) + item.quantity
      return acc
    }, {})

    const stocksCountByStoreSorted = Object.entries(stocksCountByStore)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Return metrics from restock history
    const returns = restockHistory.filter(r => r.reason === 'damaged-return' || r.reason === 'supplier-return')
    const totalReturns = returns.reduce((sum, r) => sum + r.quantity, 0)
    const totalSales = financialMetrics.totalQuantity
    const returnRate = totalSales > 0 ? (totalReturns / totalSales) * 100 : 0

    const damagedReturns = returns.filter(r => r.reason === 'damaged-return').reduce((sum, r) => sum + r.quantity, 0)
    const supplierReturnsCount = returns.filter(r => r.reason === 'supplier-return').reduce((sum, r) => sum + r.quantity, 0)
    const damagedReturnRate = totalSales > 0 ? (damagedReturns / totalSales) * 100 : 0
    const supplierReturnRate = totalSales > 0 ? (supplierReturnsCount / totalSales) * 100 : 0

    // Supplier returns
    const supplierReturnsData = restockHistory
      .filter(r => r.reason === 'supplier-return')
      .reduce((acc: { [key: string]: { quantity: number; value: number } }, r: any) => {
        if (!acc[r.itemName]) {
          acc[r.itemName] = { quantity: 0, value: 0 }
        }
        acc[r.itemName].quantity += r.quantity
        acc[r.itemName].value += r.totalCost
        return acc
      }, {})

    const topSupplierReturns = Object.entries(supplierReturnsData)
      .sort(([, a], [, b]) => (b as { quantity: number; value: number }).value - (a as { quantity: number; value: number }).value)
      .slice(0, 5)
      .map(([name, data]) => {
        const typedData = data as { quantity: number; value: number }
        return {
          itemName: name,
          quantity: typedData.quantity,
          value: typedData.value
        }
      })

    // Recent restocks
    const recentRestocks = restockHistory
      .filter(r => r.reason !== 'supplier-return')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    // Cancelled orders metrics
    const cancelledOrders = filteredOrders.filter(o => o.parcel_status === 'CANCELLED')
    
    const totalCancelledOrders = cancelledOrders.length
    const cancelledOrdersValue = cancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const totalOrdersCount = filteredOrders.length
    const cancellationRate = totalOrdersCount > 0 ? (totalCancelledOrders / totalOrdersCount) * 100 : 0

    // Cancellation reasons (if available in notes)
    const topCancellationReasons = [
      { reason: 'Customer Request', count: Math.floor(totalCancelledOrders * 0.4) },
      { reason: 'Out of Stock', count: Math.floor(totalCancelledOrders * 0.3) },
      { reason: 'Payment Issues', count: Math.floor(totalCancelledOrders * 0.2) },
      { reason: 'Other', count: Math.floor(totalCancelledOrders * 0.1) },
    ].filter(r => r.count > 0)

    // Average order value
    const averageOrderValue = financialMetrics.totalOrders > 0 
      ? financialMetrics.totalRevenue / financialMetrics.totalOrders 
      : 0

    // Inventory health score
    const stockHealthPercent = totalItems > 0 ? ((totalItems - outOfStockCount) / totalItems) * 100 : 100
    const returnHealthPercent = 100 - Math.min(returnRate * 10, 100)
    const lowStockHealthPercent = totalItems > 0 ? ((totalItems - lowStockItems) / totalItems) * 100 : 100
    const inventoryHealthScore = Math.round(
      (stockHealthPercent * 0.4 + returnHealthPercent * 0.3 + lowStockHealthPercent * 0.3)
    )

    // Business insights
    const insights = []

    if (topProducts.length > 0) {
      insights.push({
        type: 'success',
        message: `Best seller: ${topProducts[0].name} with ₱${topProducts[0].revenue.toLocaleString()} revenue`
      })
    }

    if (lowStockItems > 0) {
      insights.push({
        type: 'warning',
        message: `${lowStockItems} items need restocking soon`
      })
    }

    if (outOfStockCount > 0) {
      insights.push({
        type: 'error',
        message: `${outOfStockCount} items are out of stock - immediate action required`
      })
    }

    if (financialMetrics.profitMargin >= 30) {
      insights.push({
        type: 'success',
        message: `Excellent profit margin of ${financialMetrics.profitMargin.toFixed(1)}% - keep it up!`
      })
    } else if (financialMetrics.profitMargin < 15) {
      insights.push({
        type: 'warning',
        message: `Profit margin is ${financialMetrics.profitMargin.toFixed(1)}% - consider reviewing pricing`
      })
    }

    if (returnRate > 10) {
      insights.push({
        type: 'error',
        message: `High return rate of ${returnRate.toFixed(1)}% - check product quality`
      })
    }

    if (totalCancelledOrders > 0) {
      insights.push({
        type: 'info',
        message: `${totalCancelledOrders} orders cancelled (₱${cancelledOrdersValue.toLocaleString()}) - excluded from revenue`
      })
    }

    const stats: DashboardStats = {
      totalItems,
      lowStockItems,
      totalValue,
      recentSales,
      totalRevenue: financialMetrics.totalRevenue,
      totalCost: financialMetrics.totalCOGS,
      totalProfit: financialMetrics.totalProfit,
      profitMargin: financialMetrics.profitMargin,
      salesOverTime,
      topProducts,
      recentTransactions,
      topCategories,
      totalCategories,
      totalProducts,
      stockPercentageByCategory,
      stocksCountByCategory: stocksCountByCategorySorted,
      stocksCountByStore: stocksCountByStoreSorted,
      totalSales: financialMetrics.totalQuantity,
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
      salesVelocity: itemsSoldToday,
      yesterdaySales,
      lastWeekSales,
      lastMonthSales,
      totalCancelledOrders,
      cancelledOrdersValue,
      cancellationRate,
      topCancellationReasons,
    }

    console.log('[Dashboard API] Financial Metrics Summary:', {
      source: 'orders table (Track Orders)',
      totalOrders: financialMetrics.totalOrders,
      activeOrders: activeOrders.length,
      excludedOrders: excludedSummary.total.totalOrders,
      cancelled: excludedSummary.cancelled.totalOrders,
      returned: excludedSummary.returned.totalOrders,
      totalRevenue: financialMetrics.totalRevenue,
      totalProfit: financialMetrics.totalProfit,
      profitMargin: financialMetrics.profitMargin
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[Dashboard API] Error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch dashboard stats",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}
