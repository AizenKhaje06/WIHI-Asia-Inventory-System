import type { InventoryItem, Transaction, PredictiveAnalytics, ABCAnalysis, InventoryTurnover } from "./types"
import { parse } from "date-fns"

/**
 * Calculate sales forecast using simple linear regression
 */
export function calculateSalesForecast(
  transactions: Transaction[],
  itemId: string,
  daysToForecast: number = 30
): PredictiveAnalytics | null {
  const itemTransactions = transactions
    .filter(t => t.itemId === itemId && t.type === 'sale')
    .sort((a, b) => {
      const dateA = parse(a.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
      const dateB = parse(b.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
      return dateA.getTime() - dateB.getTime()
    })

  if (itemTransactions.length < 3) {
    return null // Not enough data
  }

  // Group by day and sum quantities
  const dailySales = new Map<string, number>()
  itemTransactions.forEach(t => {
    const date = t.timestamp.split(' / ')[0]
    dailySales.set(date, (dailySales.get(date) || 0) + t.quantity)
  })

  const salesData = Array.from(dailySales.entries()).map(([date, qty]) => ({
    date,
    quantity: qty,
    timestamp: parse(date, "yyyy-MM-dd", new Date()).getTime()
  }))

  // Simple linear regression
  const n = salesData.length
  const sumX = salesData.reduce((sum, d, i) => sum + i, 0)
  const sumY = salesData.reduce((sum, d) => sum + d.quantity, 0)
  const sumXY = salesData.reduce((sum, d, i) => sum + i * d.quantity, 0)
  const sumX2 = salesData.reduce((sum, d, i) => sum + i * i, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Predict demand for next period
  const predictedDemand = Math.max(0, Math.round(slope * n + intercept))
  
  // Calculate trend
  const avgRecent = salesData.slice(-7).reduce((sum, d) => sum + d.quantity, 0) / Math.min(7, salesData.length)
  const avgOlder = salesData.slice(0, -7).reduce((sum, d) => sum + d.quantity, 0) / Math.max(1, salesData.length - 7)
  
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  if (avgRecent > avgOlder * 1.2) trend = 'increasing'
  else if (avgRecent < avgOlder * 0.8) trend = 'decreasing'

  // Calculate confidence based on data consistency
  const variance = salesData.reduce((sum, d) => {
    const predicted = slope * salesData.indexOf(d) + intercept
    return sum + Math.pow(d.quantity - predicted, 2)
  }, 0) / n
  const confidence = Math.max(0, Math.min(100, 100 - (variance / (sumY / n)) * 10))

  return {
    itemId,
    itemName: itemTransactions[0].itemName,
    predictedDemand: predictedDemand * daysToForecast / 30,
    recommendedReorderQty: Math.ceil(predictedDemand * 1.5), // 50% buffer
    confidence: Math.round(confidence),
    trend
  }
}

/**
 * ABC Analysis - Pareto principle (80/20 rule)
 * A items: Top 20% of items contributing to 80% of revenue
 * B items: Next 30% contributing to 15% of revenue
 * C items: Bottom 50% contributing to 5% of revenue
 */
export function performABCAnalysis(
  items: InventoryItem[],
  transactions: Transaction[]
): ABCAnalysis[] {
  // Calculate revenue per item
  const itemRevenue = new Map<string, { name: string; revenue: number }>()
  
  transactions
    .filter(t => t.type === 'sale')
    .forEach(t => {
      const current = itemRevenue.get(t.itemId) || { name: t.itemName, revenue: 0 }
      itemRevenue.set(t.itemId, {
        name: t.itemName,
        revenue: current.revenue + t.totalRevenue
      })
    })

  // Sort by revenue descending
  const sortedItems = Array.from(itemRevenue.entries())
    .map(([id, data]) => ({ itemId: id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)

  const totalRevenue = sortedItems.reduce((sum, item) => sum + item.revenue, 0)

  // Calculate cumulative percentage and assign categories
  let cumulativeRevenue = 0
  const analysis: ABCAnalysis[] = sortedItems.map((item, index) => {
    cumulativeRevenue += item.revenue
    const cumulativePercentage = (cumulativeRevenue / totalRevenue) * 100
    const revenueContribution = (item.revenue / totalRevenue) * 100

    let category: 'A' | 'B' | 'C'
    let recommendation: string

    if (cumulativePercentage <= 80) {
      category = 'A'
      recommendation = 'High priority - maintain optimal stock levels, monitor closely'
    } else if (cumulativePercentage <= 95) {
      category = 'B'
      recommendation = 'Medium priority - regular monitoring, moderate stock levels'
    } else {
      category = 'C'
      recommendation = 'Low priority - minimal stock, consider discontinuation if slow-moving'
    }

    return {
      itemId: item.itemId,
      itemName: item.name,
      category,
      revenueContribution,
      cumulativePercentage,
      recommendation
    }
  })

  return analysis
}

/**
 * Calculate inventory turnover ratio
 * Turnover Ratio = Cost of Goods Sold / Average Inventory Value
 * Days to Sell = 365 / Turnover Ratio
 */
export function calculateInventoryTurnover(
  items: InventoryItem[],
  transactions: Transaction[],
  periodDays: number = 90
): InventoryTurnover[] {
  const now = new Date()
  const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

  return items.map(item => {
    const itemSales = transactions.filter(t => 
      t.itemId === item.id && 
      t.type === 'sale' &&
      parse(t.timestamp, "yyyy-MM-dd / hh:mm a", new Date()) >= periodStart
    )

    const totalCOGS = itemSales.reduce((sum, t) => sum + t.totalCost, 0)
    const avgInventoryValue = item.totalCOGS || (item.quantity * item.costPrice)

    const turnoverRatio = avgInventoryValue > 0 ? totalCOGS / avgInventoryValue : 0
    const daysToSell = turnoverRatio > 0 ? periodDays / turnoverRatio : Infinity

    let status: 'fast-moving' | 'normal' | 'slow-moving' | 'dead-stock'
    if (daysToSell < 30) status = 'fast-moving'
    else if (daysToSell < 90) status = 'normal'
    else if (daysToSell < 180) status = 'slow-moving'
    else status = 'dead-stock'

    return {
      itemId: item.id,
      itemName: item.name,
      turnoverRatio: Math.round(turnoverRatio * 100) / 100,
      daysToSell: Math.round(daysToSell),
      status
    }
  })
}

/**
 * Calculate optimal reorder point
 * Reorder Point = (Average Daily Sales × Lead Time) + Safety Stock
 */
export function calculateReorderPoint(
  transactions: Transaction[],
  itemId: string,
  leadTimeDays: number = 7,
  serviceLevel: number = 0.95 // 95% service level
): number {
  const itemSales = transactions
    .filter(t => t.itemId === itemId && t.type === 'sale')
    .slice(-30) // Last 30 transactions

  if (itemSales.length === 0) return 0

  const totalQty = itemSales.reduce((sum, t) => sum + t.quantity, 0)
  const avgDailySales = totalQty / 30

  // Calculate standard deviation for safety stock
  const dailySalesArray = itemSales.map(t => t.quantity)
  const mean = avgDailySales
  const variance = dailySalesArray.reduce((sum, qty) => sum + Math.pow(qty - mean, 2), 0) / dailySalesArray.length
  const stdDev = Math.sqrt(variance)

  // Z-score for 95% service level ≈ 1.65
  const zScore = 1.65
  const safetyStock = zScore * stdDev * Math.sqrt(leadTimeDays)

  const reorderPoint = (avgDailySales * leadTimeDays) + safetyStock

  return Math.ceil(reorderPoint)
}

/**
 * Identify dead stock (items with no sales in X days)
 */
export function identifyDeadStock(
  items: InventoryItem[],
  transactions: Transaction[],
  daysSinceLastSale: number = 90
): InventoryItem[] {
  const now = new Date()
  const cutoffDate = new Date(now.getTime() - daysSinceLastSale * 24 * 60 * 60 * 1000)

  return items.filter(item => {
    const lastSale = transactions
      .filter(t => t.itemId === item.id && t.type === 'sale')
      .sort((a, b) => {
        const dateA = parse(a.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
        const dateB = parse(b.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
        return dateB.getTime() - dateA.getTime()
      })[0]

    if (!lastSale) return true // Never sold

    const lastSaleDate = parse(lastSale.timestamp, "yyyy-MM-dd / hh:mm a", new Date())
    return lastSaleDate < cutoffDate
  })
}

/**
 * Calculate profit margin by category
 */
export function calculateProfitMarginByCategory(
  transactions: Transaction[],
  items: InventoryItem[]
): { category: string; margin: number; revenue: number; profit: number }[] {
  const categoryMap = new Map<string, { revenue: number; profit: number }>()

  transactions
    .filter(t => t.type === 'sale')
    .forEach(t => {
      const item = items.find(i => i.id === t.itemId)
      if (!item) return

      const current = categoryMap.get(item.category) || { revenue: 0, profit: 0 }
      categoryMap.set(item.category, {
        revenue: current.revenue + t.totalRevenue,
        profit: current.profit + t.profit
      })
    })

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
      revenue: data.revenue,
      profit: data.profit
    }))
    .sort((a, b) => b.margin - a.margin)
}
