/**
 * Orders to Transactions Transformation Layer
 * 
 * This file transforms orders data (new system) to transaction format (legacy)
 * to maintain backward compatibility with existing analytics functions.
 */

import type { Transaction } from './types'
import type { Order } from './supabase-db'

/**
 * Transform orders to transaction format for analytics
 * 
 * Key transformations:
 * - Filters out CANCELLED and RETURNED orders
 * - Maps sales_channel to department
 * - Maps qty to quantity
 * - Maps cogs to totalCost
 * - Maps total to totalRevenue
 * - Calculates profit (total - cogs)
 * - Maps date to timestamp
 * - Sets type to 'sale' and transactionType to 'sale'
 * - Sets status to 'completed'
 */
export function transformOrdersToTransactions(orders: Order[]): Transaction[] {
  return orders
    .filter(order => {
      // Exclude cancelled and returned orders from analytics
      const excludedStatuses = ['CANCELLED', 'RETURNED']
      return !excludedStatuses.includes(order.parcel_status?.toUpperCase())
    })
    .map(order => {
      // Calculate per-item averages
      const quantity = order.qty || 1
      const costPrice = order.cogs / quantity
      const sellingPrice = order.total / quantity
      const profit = order.total - order.cogs

      return {
        id: order.id,
        itemId: order.id, // Use order ID as item ID (orders can have multiple items)
        itemName: order.product,
        quantity: quantity,
        costPrice: costPrice,
        sellingPrice: sellingPrice,
        totalCost: order.cogs,
        totalRevenue: order.total,
        profit: profit,
        timestamp: order.date, // Use order date as timestamp
        type: 'sale' as const,
        transactionType: 'sale' as const,
        department: order.sales_channel, // Map sales_channel to department
        status: 'completed' as const,
        // Additional fields from orders
        staffName: order.dispatched_by,
        notes: `Order ${order.id} - ${order.product}`
      }
    })
}

/**
 * Filter orders by date range
 */
export function filterOrdersByDateRange(
  orders: Order[],
  startDate?: string,
  endDate?: string
): Order[] {
  let filtered = orders

  if (startDate) {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    filtered = filtered.filter(order => new Date(order.date) >= start)
  }

  if (endDate) {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    filtered = filtered.filter(order => new Date(order.date) <= end)
  }

  return filtered
}

/**
 * Get orders summary statistics
 */
export function getOrdersSummary(orders: Order[]) {
  const activeOrders = orders.filter(order => 
    !['CANCELLED', 'RETURNED'].includes(order.parcel_status?.toUpperCase())
  )

  return {
    total: orders.length,
    active: activeOrders.length,
    cancelled: orders.filter(o => o.parcel_status?.toUpperCase() === 'CANCELLED').length,
    returned: orders.filter(o => o.parcel_status?.toUpperCase() === 'RETURNED').length,
    totalRevenue: activeOrders.reduce((sum, o) => sum + o.total, 0),
    totalCost: activeOrders.reduce((sum, o) => sum + o.cogs, 0),
    totalProfit: activeOrders.reduce((sum, o) => sum + (o.total - o.cogs), 0),
    totalQuantity: activeOrders.reduce((sum, o) => sum + o.qty, 0)
  }
}

/**
 * Group orders by sales channel
 */
export function groupOrdersBySalesChannel(orders: Order[]) {
  const grouped = new Map<string, Order[]>()

  orders.forEach(order => {
    const channel = order.sales_channel || 'Unknown'
    if (!grouped.has(channel)) {
      grouped.set(channel, [])
    }
    grouped.get(channel)!.push(order)
  })

  return grouped
}
