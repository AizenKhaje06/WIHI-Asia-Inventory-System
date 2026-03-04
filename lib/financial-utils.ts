/**
 * Financial Utilities
 * 
 * Centralized financial calculation functions to ensure consistency
 * across the entire application.
 * 
 * IMPORTANT: All financial metrics should use orders from the Track Orders
 * page (orders table with status='Packed') and EXCLUDE:
 * - CANCELLED orders
 * - RETURNED orders
 */

export interface Order {
  id: string
  qty: number
  total: number
  parcel_status: string
  payment_status: string
  sales_channel?: string
  date: string
}

export interface FinancialMetrics {
  totalOrders: number
  totalQuantity: number
  totalRevenue: number
  totalCOGS: number
  totalProfit: number
  profitMargin: number
}

/**
 * Parcel statuses that should be EXCLUDED from revenue calculations
 * 
 * CANCELLED - Order was cancelled, no revenue
 * RETURNED - Order was returned, revenue reversed
 * DETAINED - Order detained by courier, uncertain outcome
 * PROBLEMATIC - Order has issues, uncertain outcome
 */
export const EXCLUDED_STATUSES = ['CANCELLED', 'RETURNED', 'DETAINED', 'PROBLEMATIC']

/**
 * Parcel statuses that represent confirmed revenue
 */
export const CONFIRMED_REVENUE_STATUSES = ['DELIVERED']

/**
 * Parcel statuses that represent pending/in-progress revenue
 */
export const PENDING_REVENUE_STATUSES = ['PENDING', 'IN TRANSIT', 'ON DELIVERY', 'PICKUP']

/**
 * Parcel statuses that may need special handling (NOW EXCLUDED)
 * These are now part of EXCLUDED_STATUSES for conservative revenue recognition
 */
export const PROBLEMATIC_STATUSES = ['DETAINED', 'PROBLEMATIC'] // Now excluded by default

/**
 * Filter orders to only include those that should count toward revenue
 * 
 * @param orders - Array of orders
 * @param includeMode - 'delivered' (most conservative), 'active' (all non-cancelled/returned), 'all' (everything)
 * @returns Filtered orders
 */
export function filterRevenueOrders(
  orders: Order[],
  includeMode: 'delivered' | 'active' | 'all' = 'active'
): Order[] {
  if (includeMode === 'all') {
    return orders
  }

  if (includeMode === 'delivered') {
    // Most conservative: Only confirmed delivered orders
    return orders.filter(order => 
      CONFIRMED_REVENUE_STATUSES.includes(order.parcel_status)
    )
  }

  // Default 'active': Exclude cancelled and returned
  return orders.filter(order => 
    !EXCLUDED_STATUSES.includes(order.parcel_status)
  )
}

/**
 * Calculate financial metrics from orders
 * 
 * @param orders - Array of orders (should be pre-filtered)
 * @param cogsPercentage - Cost of Goods Sold as percentage (default 60%)
 * @returns Financial metrics
 */
export function calculateFinancialMetrics(
  orders: Order[],
  cogsPercentage: number = 0.6
): FinancialMetrics {
  const totalOrders = orders.length
  const totalQuantity = orders.reduce((sum, order) => sum + (order.qty || 0), 0)
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const totalCOGS = totalRevenue * cogsPercentage
  const totalProfit = totalRevenue - totalCOGS
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return {
    totalOrders,
    totalQuantity,
    totalRevenue,
    totalCOGS,
    totalProfit,
    profitMargin,
  }
}

/**
 * Calculate metrics for a specific parcel status
 */
export function calculateStatusMetrics(
  orders: Order[],
  status: string,
  cogsPercentage: number = 0.6
): FinancialMetrics {
  const statusOrders = orders.filter(o => o.parcel_status === status)
  return calculateFinancialMetrics(statusOrders, cogsPercentage)
}

/**
 * Calculate metrics grouped by sales channel
 */
export function calculateBySalesChannel(
  orders: Order[],
  cogsPercentage: number = 0.6
): Record<string, FinancialMetrics> {
  const grouped: Record<string, Order[]> = {}

  orders.forEach(order => {
    const channel = order.sales_channel || 'Unknown'
    if (!grouped[channel]) {
      grouped[channel] = []
    }
    grouped[channel].push(order)
  })

  const result: Record<string, FinancialMetrics> = {}
  Object.keys(grouped).forEach(channel => {
    result[channel] = calculateFinancialMetrics(grouped[channel], cogsPercentage)
  })

  return result
}

/**
 * Calculate metrics grouped by payment status
 */
export function calculateByPaymentStatus(
  orders: Order[],
  cogsPercentage: number = 0.6
): Record<string, FinancialMetrics> {
  const grouped: Record<string, Order[]> = {}

  orders.forEach(order => {
    const status = order.payment_status || 'unknown'
    if (!grouped[status]) {
      grouped[status] = []
    }
    grouped[status].push(order)
  })

  const result: Record<string, FinancialMetrics> = {}
  Object.keys(grouped).forEach(status => {
    result[status] = calculateFinancialMetrics(grouped[status], cogsPercentage)
  })

  return result
}

/**
 * Get a summary of excluded orders for reporting
 */
export function getExcludedOrdersSummary(orders: Order[]): {
  cancelled: FinancialMetrics
  returned: FinancialMetrics
  total: FinancialMetrics
} {
  const cancelled = orders.filter(o => o.parcel_status === 'CANCELLED')
  const returned = orders.filter(o => o.parcel_status === 'RETURNED')
  const allExcluded = [...cancelled, ...returned]

  return {
    cancelled: calculateFinancialMetrics(cancelled),
    returned: calculateFinancialMetrics(returned),
    total: calculateFinancialMetrics(allExcluded),
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = '₱'): string {
  return `${currency}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}
