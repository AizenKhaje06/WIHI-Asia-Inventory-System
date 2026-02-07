import { NextResponse } from "next/server"
// Using Supabase as primary database
import { getInventoryItems, getTransactions, getRestocks } from "@/lib/supabase-db"
import { getCachedData } from "@/lib/cache"
import { parse } from "date-fns"
import type { DashboardStats, Transaction, InventoryItem } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'ID'

    // Cache dashboard data with period-specific keys (1 minute TTL for real-time feel)
    const cacheKey = `dashboard-${period}`
    
    const items = await getCachedData(
      'inventory-items',
      () => getInventoryItems(),
      60000 // 1 minute
    )
    
    const transactions = await getCachedData(
      'transactions',
      () => getTransactions(),
      60000 // 1 minute
    )
    
    const restockHistory = await getCachedData(
      'restocks',
      () => getRestocks(),
      60000 // 1 minute
    )

    const totalItems = items.length
    const lowStockItems = items.filter((item: InventoryItem) => item.quantity <= item.reorderLevel).length
    const totalValue = items.reduce((sum, item: InventoryItem) => sum + item.quantity * item.sellingPrice, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const recentSales = transactions.filter((t: Transaction) => t.type === "sale" && t.transactionType === "sale" && parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date()) >= today).length

    // Items sold today (quantity)
    const itemsSoldToday = transactions
      .filter((t: Transaction) => t.type === "sale" && t.transactionType === "sale" && parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date()) >= today)
      .reduce((sum, t) => sum + t.quantity, 0)
    
    // Revenue today
    const revenueToday = transactions
      .filter((t: Transaction) => t.type === "sale" && t.transactionType === "sale" && parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date()) >= today)
      .reduce((sum, t) => sum + t.totalRevenue, 0)

    // Sales over time based on period
    let salesOverTime: { date: string; purchases: number; sales: number }[] = []

    if (period === 'ID') {
      // Today: Last 24 hours, hourly data points
      salesOverTime = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date()
        hour.setHours(hour.getHours() - i, 0, 0, 0)
        const hourStr = hour.toISOString().split('T')[0] + ' ' + hour.getHours().toString().padStart(2, '0') + ':00'
        const sales = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "sale" && t.transactionType === "sale" && tDate >= hour && tDate < new Date(hour.getTime() + 3600000)
        }).reduce((sum, t) => sum + t.totalRevenue, 0)
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "restock" && tDate >= hour && tDate < new Date(hour.getTime() + 3600000)
        }).reduce((sum, t) => sum + t.totalCost, 0)
        return { date: hourStr, purchases, sales }
      }).reverse()
    } else if (period === '1W') {
      // Last 7 days, daily data points
      salesOverTime = Array.from({ length: 7 }, (_, i) => {
        const day = new Date()
        day.setDate(day.getDate() - i)
        day.setHours(0, 0, 0, 0)
        const dayStr = day.toISOString().split('T')[0] + ' 00:00'
        const nextDay = new Date(day)
        nextDay.setDate(nextDay.getDate() + 1)
        const sales = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "sale" && t.transactionType === "sale" && tDate >= day && tDate < nextDay
        }).reduce((sum, t) => sum + t.totalRevenue, 0)
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "restock" && tDate >= day && tDate < nextDay
        }).reduce((sum, t) => sum + t.totalCost, 0)
        return { date: dayStr, purchases, sales }
      }).reverse()
    } else if (period === '1M') {
      // Last 30 days, daily data points
      salesOverTime = Array.from({ length: 30 }, (_, i) => {
        const day = new Date()
        day.setDate(day.getDate() - i)
        day.setHours(0, 0, 0, 0)
        const dayStr = day.toISOString().split('T')[0] + ' 00:00'
        const nextDay = new Date(day)
        nextDay.setDate(nextDay.getDate() + 1)
        const sales = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "sale" && t.transactionType === "sale" && tDate >= day && tDate < nextDay
        }).reduce((sum, t) => sum + t.totalRevenue, 0)
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "restock" && tDate >= day && tDate < nextDay
        }).reduce((sum, t) => sum + t.totalCost, 0)
        return { date: dayStr, purchases, sales }
      }).reverse()
    }

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

    // Recent transactions (last 5 sales)
    const recentTransactions = transactions
      .filter((t: Transaction) => t.type === "sale" && t.transactionType === "sale")
      .sort((a: Transaction, b: Transaction) => parse(b.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime() - parse(a.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime())
      .slice(0, 5)

    // Top categories (top 3 by sales)
    const categorySales = items.reduce((acc: { [key: string]: number }, item: InventoryItem) => {
      const sales = transactions
        .filter((t: Transaction) => t.type === "sale" && t.transactionType === "sale" && t.itemName === item.name)
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

    // Calculate financial metrics (only actual sales, not demo/internal)
    const totalRevenue = transactions
      .filter((t: Transaction) => t.type === "sale" && t.transactionType === "sale")
      .reduce((sum, t) => sum + t.totalRevenue, 0)

    const totalCost = transactions.reduce((sum, t) => sum + t.totalCost, 0)

    const totalProfit = totalRevenue - totalCost

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

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
      .sort((a, b) => parse(b.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime() - parse(a.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime())
      .slice(0, 5)

    // Average order value
    const averageOrderValue = recentSales > 0 ? totalRevenue / recentSales : 0

    // Out of stock count
    const outOfStockCount = items.filter((item: InventoryItem) => item.quantity === 0).length

    // Return rate - calculate from restock history (damaged-return and supplier-return)
    // Use overall return rate: total returns / total sales
    const returns = restockHistory.filter(r => r.reason === 'damaged-return' || r.reason === 'supplier-return')
    const totalReturns = returns.reduce((sum, r) => sum + r.quantity, 0)
    const totalSales = transactions
      .filter((t: Transaction) => t.type === 'sale' && t.transactionType === 'sale')
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
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[Dashboard API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
