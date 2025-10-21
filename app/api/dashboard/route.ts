import { NextResponse } from "next/server"
import { getInventoryItems, getTransactions } from "@/lib/google-sheets"
import { parse } from "date-fns"
import type { DashboardStats, Transaction, InventoryItem } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'ID'

    const items = await getInventoryItems()
    const transactions = await getTransactions()

    const totalItems = items.length
    const lowStockItems = items.filter((item: InventoryItem) => item.quantity <= item.reorderLevel).length
    const totalValue = items.reduce((sum, item: InventoryItem) => sum + item.quantity * item.costPrice, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const recentSales = transactions.filter((t: Transaction) => t.type === "sale" && parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date()) >= today).length

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
          return t.type === "sale" && tDate >= hour && tDate < new Date(hour.getTime() + 3600000)
        }).length
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "restock" && tDate >= hour && tDate < new Date(hour.getTime() + 3600000)
        }).length
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
          return t.type === "sale" && tDate >= day && tDate < nextDay
        }).length
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "restock" && tDate >= day && tDate < nextDay
        }).length
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
          return t.type === "sale" && tDate >= day && tDate < nextDay
        }).length
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "restock" && tDate >= day && tDate < nextDay
        }).length
        return { date: dayStr, purchases, sales }
      }).reverse()
    } else if (period === '3M') {
      // Last 90 days, weekly data points
      salesOverTime = Array.from({ length: 12 }, (_, i) => {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (i * 7))
        weekStart.setHours(0, 0, 0, 0)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        const weekStr = weekStart.toISOString().split('T')[0] + ' 00:00'
        const sales = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "sale" && tDate >= weekStart && tDate < weekEnd
        }).length
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "restock" && tDate >= weekStart && tDate < weekEnd
        }).length
        return { date: weekStr, purchases, sales }
      }).reverse()
    } else if (period === '6M') {
      // Last 180 days, weekly data points
      salesOverTime = Array.from({ length: 26 }, (_, i) => {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (i * 7))
        weekStart.setHours(0, 0, 0, 0)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        const weekStr = weekStart.toISOString().split('T')[0] + ' 00:00'
        const sales = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "sale" && tDate >= weekStart && tDate < weekEnd
        }).length
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "restock" && tDate >= weekStart && tDate < weekEnd
        }).length
        return { date: weekStr, purchases, sales }
      }).reverse()
    } else if (period === '1Y') {
      // Last 365 days, monthly data points
      salesOverTime = Array.from({ length: 12 }, (_, i) => {
        const monthStart = new Date()
        monthStart.setMonth(monthStart.getMonth() - i, 1)
        monthStart.setHours(0, 0, 0, 0)
        const monthEnd = new Date(monthStart)
        monthEnd.setMonth(monthEnd.getMonth() + 1)
        const monthStr = monthStart.toISOString().split('T')[0] + ' 00:00'
        const sales = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "sale" && tDate >= monthStart && tDate < monthEnd
        }).length
        const purchases = transactions.filter((t: Transaction) => {
          const tDate = parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
          return t.type === "restock" && tDate >= monthStart && tDate < monthEnd
        }).length
        return { date: monthStr, purchases, sales }
      }).reverse()
    }

    // Top products (top 4 by sales count)
    const productSales = transactions
      .filter((t: Transaction) => t.type === "sale")
      .reduce((acc: { [key: string]: number }, t: Transaction) => {
        acc[t.itemName] = (acc[t.itemName] || 0) + t.quantity
        return acc
      }, {})
    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 4)
      .map(([name, sales]) => ({ name, sales: sales as number }))

    // Recent transactions (last 5 sales)
    const recentTransactions = transactions
      .filter((t: Transaction) => t.type === "sale")
      .sort((a: Transaction, b: Transaction) => parse(b.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime() - parse(a.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime())
      .slice(0, 5)

    // Top categories (top 3 by sales)
    const categorySales = items.reduce((acc: { [key: string]: number }, item: InventoryItem) => {
      const sales = transactions
        .filter((t: Transaction) => t.type === "sale" && t.itemName === item.name)
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

    // Calculate financial metrics
    const totalRevenue = transactions
      .filter((t: Transaction) => t.type === "sale")
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
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
