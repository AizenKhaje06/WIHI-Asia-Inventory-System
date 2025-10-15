import { NextResponse } from "next/server"
import { getInventoryItems, getTransactions } from "@/lib/google-sheets"
import type { DashboardStats, Transaction, InventoryItem } from "@/lib/types"

export async function GET() {
  try {
    const items = await getInventoryItems()
    const transactions = await getTransactions()

    const totalItems = items.length
    const lowStockItems = items.filter((item: InventoryItem) => item.quantity <= item.reorderLevel).length
    const totalValue = items.reduce((sum, item: InventoryItem) => sum + item.quantity * item.costPrice, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const recentSales = transactions.filter((t: Transaction) => t.type === "sale" && new Date(t.timestamp) >= today).length

    // Sales over time (last 24 hours for ID view, adjust for other periods if needed)
    const salesOverTime = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date()
      hour.setHours(hour.getHours() - i, 0, 0, 0)
      const hourStr = hour.toISOString().split('T')[0] + ' ' + hour.getHours().toString().padStart(2, '0') + ':00'
      const sales = transactions.filter((t: Transaction) => {
        const tDate = new Date(t.timestamp)
        return t.type === "sale" && tDate >= hour && tDate < new Date(hour.getTime() + 3600000)
      }).length
      const purchases = transactions.filter((t: Transaction) => {
        const tDate = new Date(t.timestamp)
        return t.type === "restock" && tDate >= hour && tDate < new Date(hour.getTime() + 3600000)
      }).length
      return { date: hourStr, purchases, sales }
    }).reverse()

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
      .sort((a: Transaction, b: Transaction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
