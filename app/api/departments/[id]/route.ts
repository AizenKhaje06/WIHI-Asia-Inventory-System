import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabase } from "@/lib/supabase"
import { 
  filterRevenueOrders, 
  calculateFinancialMetrics,
  EXCLUDED_STATUSES 
} from "@/lib/financial-utils"

// Disable caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Sales Channel Detail API - Accurate Financial Metrics
 * 
 * Data Source: orders table (Track Orders page ONLY - status='Packed')
 * Revenue Recognition: 
 * - Only orders with status='Packed' (Track Orders)
 * - Excludes orders with status='Pending' (Packing Queue)
 * - Within Track Orders, excludes CANCELLED, RETURNED, PROBLEMATIC parcel statuses
 */

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const authResult = requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const departmentName = decodeURIComponent(context.params.id)
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('[Sales Channel API] Channel:', departmentName)
    console.log('[Sales Channel API] Date range:', { startDate, endDate })

    // Fetch orders from orders table (Track Orders ONLY - status='Packed')
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('sales_channel', departmentName)
      .eq('status', 'Packed') // CRITICAL: Only fetch Track Orders, exclude Packing Queue

    if (ordersError) {
      console.error('[Sales Channel API] Error fetching orders:', ordersError)
      return NextResponse.json({ error: ordersError.message }, { status: 500 })
    }

    console.log('[Sales Channel API] Total orders fetched (before date filter):', allOrders?.length || 0)

    // Apply date filters if provided (filter by packed_at for accurate revenue recognition)
    // Use same approach as Dashboard API for consistency
    let orders = allOrders || []
    
    // Parse date parameters
    let startDateObj: Date | null = null
    let endDateObj: Date | null = null
    
    if (startDate) {
      startDateObj = new Date(startDate)
      console.log('[Sales Channel API] Start date filter:', {
        raw: startDate,
        parsed: startDateObj.toISOString(),
        timestamp: startDateObj.getTime()
      })
    }
    if (endDate) {
      endDateObj = new Date(endDate)
      console.log('[Sales Channel API] End date filter:', {
        raw: endDate,
        parsed: endDateObj.toISOString(),
        timestamp: endDateObj.getTime()
      })
    }
    
    if (startDateObj || endDateObj) {
      const beforeFilter = orders.length
      orders = orders.filter(order => {
        if (!order.packed_at && !order.created_at) {
          console.log('[Sales Channel API] Order without packed_at or created_at:', order.id)
          return false
        }
        
        const orderDate = new Date(order.packed_at || order.created_at)
        const orderTimestamp = orderDate.getTime()
        
        if (startDateObj && orderTimestamp < startDateObj.getTime()) {
          return false
        }
        if (endDateObj && orderTimestamp > endDateObj.getTime()) {
          return false
        }
        return true
      })
      console.log('[Sales Channel API] Date filter:', beforeFilter, '->', orders.length)
    }

    console.log('[Sales Channel API] Total orders fetched (after date filter):', orders.length)
    console.log('[Sales Channel API] Date filter applied:', { startDate, endDate })
    if (orders.length > 0) {
      console.log('[Sales Channel API] Sample order:', orders[0])
    } else {
      console.log('[Sales Channel API] ⚠️  NO ORDERS FOUND for this date range!')
    }

    // Filter to active orders only (exclude CANCELLED and RETURNED)
    const activeOrders = filterRevenueOrders(
      orders.map(o => ({
        id: o.id,
        qty: o.qty || 0,
        total: o.total || 0,
        cogs: o.cogs || (o.total * 0.6) || 0, // Calculate COGS if missing (60% of total)
        parcel_status: o.parcel_status || 'PENDING',
        payment_status: o.payment_status || 'pending',
        sales_channel: o.sales_channel,
        date: o.date
      })),
      'active'
    )

    // Calculate overall metrics
    const metrics = calculateFinancialMetrics(activeOrders)

    // Parcel status counts and amounts (all orders, not just active)
    const getStatusData = (status: string) => {
      const statusOrders = orders.filter(o => o.parcel_status === status)
      return {
        count: statusOrders.length,
        amount: statusOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      }
    }

    const pendingData = getStatusData('PENDING')
    const inTransitData = getStatusData('IN TRANSIT')
    const onDeliveryData = getStatusData('ON DELIVERY')
    const pickupData = getStatusData('PICKUP')
    const detainedData = getStatusData('DETAINED')
    const deliveredData = getStatusData('DELIVERED')
    const cancelledData = getStatusData('CANCELLED')
    const returnedData = getStatusData('RETURNED')
    const problematicData = getStatusData('PROBLEMATIC')

    // Calculate undelivered (IN TRANSIT + ON DELIVERY + PICKUP + DETAINED only, exclude PENDING)
    const undeliveredOrders = orders.filter(o => 
      ['IN TRANSIT', 'ON DELIVERY', 'PICKUP', 'DETAINED'].includes(o.parcel_status)
    )
    const undeliveredData = {
      count: undeliveredOrders.length,
      amount: undeliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    }

    // Calculate loss revenue (RETURNED + CANCELLED + PROBLEMATIC)
    const lossRevenueOrders = orders.filter(o => 
      ['RETURNED', 'CANCELLED', 'PROBLEMATIC'].includes(o.parcel_status)
    )
    const lossRevenueData = {
      count: lossRevenueOrders.length,
      amount: lossRevenueOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    }

    const totalOrders = orders.length

    const parcelStatusCounts = {
      pending: pendingData.count,
      pendingAmount: pendingData.amount,
      pendingPercentage: totalOrders > 0 ? (pendingData.count / totalOrders) * 100 : 0,
      
      undelivered: undeliveredData.count,
      undeliveredAmount: undeliveredData.amount,
      undeliveredPercentage: totalOrders > 0 ? (undeliveredData.count / totalOrders) * 100 : 0,
      
      delivered: deliveredData.count,
      deliveredAmount: deliveredData.amount,
      deliveredPercentage: totalOrders > 0 ? (deliveredData.count / totalOrders) * 100 : 0,
      
      lossRevenue: lossRevenueData.count,
      lossRevenueAmount: lossRevenueData.amount,
      lossRevenuePercentage: totalOrders > 0 ? (lossRevenueData.count / totalOrders) * 100 : 0,
      
      // Breakdown for loss revenue card
      returned: returnedData.count,
      returnedAmount: returnedData.amount,
      returnedPercentage: totalOrders > 0 ? (returnedData.count / totalOrders) * 100 : 0,
      
      cancelled: cancelledData.count,
      cancelledAmount: cancelledData.amount,
      cancelledPercentage: totalOrders > 0 ? (cancelledData.count / totalOrders) * 100 : 0,
      
      problematic: problematicData.count,
      problematicAmount: problematicData.amount,
      problematicPercentage: totalOrders > 0 ? (problematicData.count / totalOrders) * 100 : 0,
      
      // Legacy fields (for backward compatibility)
      inTransit: inTransitData.count,
      onDelivery: onDeliveryData.count,
      pickup: pickupData.count,
      detained: detainedData.count,
      total: orders.length,
      deliveryRate: orders.length > 0 
        ? (deliveredData.count / orders.length) * 100 
        : 0
    }

    // Cash flow data (daily aggregation)
    const cashFlowMap = new Map<string, { date: string; revenue: number; cost: number; profit: number }>()

    // Fill in all dates in range with zero values
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        cashFlowMap.set(dateStr, { date: dateStr, revenue: 0, cost: 0, profit: 0 })
      }
    }

    // Add actual order data (only active orders)
    activeOrders.forEach(order => {
      const date = new Date(order.date).toISOString().split('T')[0]

      if (!cashFlowMap.has(date)) {
        cashFlowMap.set(date, { date, revenue: 0, cost: 0, profit: 0 })
      }

      const entry = cashFlowMap.get(date)!
      const revenue = order.total
      const cost = order.cogs || 0 // Use ACTUAL COGS
      const profit = revenue - cost

      entry.revenue += revenue
      entry.cost += cost
      entry.profit += profit
    })

    const cashFlow = Array.from(cashFlowMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    // Top products by revenue (only active orders)
    const productMap = new Map<string, { name: string; quantity: number; revenue: number; orders: number }>()

    orders.forEach(order => {
      // Only count active orders for revenue
      if (EXCLUDED_STATUSES.includes(order.parcel_status)) return

      const productName = order.product || 'Unknown'

      if (!productMap.has(productName)) {
        productMap.set(productName, { name: productName, quantity: 0, revenue: 0, orders: 0 })
      }

      const product = productMap.get(productName)!
      product.quantity += order.qty || 0
      product.revenue += order.total || 0
      product.orders += 1
    })

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Store breakdown (only active orders)
    const storeMap = new Map<string, {
      name: string
      revenue: number
      cost: number
      profit: number
      transactions: number
      quantity: number
    }>()

    orders.forEach(order => {
      // Only count active orders
      if (EXCLUDED_STATUSES.includes(order.parcel_status)) return

      const storeName = order.store || 'Main Store'

      if (!storeMap.has(storeName)) {
        storeMap.set(storeName, {
          name: storeName,
          revenue: 0,
          cost: 0,
          profit: 0,
          transactions: 0,
          quantity: 0
        })
      }

      const store = storeMap.get(storeName)!
      const revenue = order.total || 0
      const cost = order.cogs || 0 // Use ACTUAL COGS
      const profit = revenue - cost

      store.revenue += revenue
      store.cost += cost
      store.profit += profit
      store.transactions += 1
      store.quantity += order.qty || 0
    })

    const storeBreakdown = Array.from(storeMap.values())
      .sort((a, b) => b.revenue - a.revenue)

    // Recent transactions (last 20, only active orders)
    const recentTransactions = orders
      .filter(order => !EXCLUDED_STATUSES.includes(order.parcel_status))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
      .map(order => {
        const revenue = order.total || 0
        const cost = order.cogs || 0 // Use ACTUAL COGS
        const profit = revenue - cost
        
        return {
          id: order.id,
          itemName: order.product || 'Unknown',
          quantity: order.qty || 0,
          revenue,
          cost,
          profit,
          timestamp: order.date,
          staffName: order.dispatched_by || 'N/A',
          notes: order.notes || '',
          parcelStatus: order.parcel_status,
          paymentStatus: order.payment_status
        }
      })

    // Calculate excluded orders summary
    const excludedOrders = orders.filter(o => EXCLUDED_STATUSES.includes(o.parcel_status))
    const excludedRevenue = excludedOrders.reduce((sum, o) => sum + (o.total || 0), 0)

    console.log('[Sales Channel API] Metrics Summary:', {
      channel: departmentName,
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      excludedOrders: excludedOrders.length,
      revenue: metrics.totalRevenue,
      profit: metrics.totalProfit,
      margin: metrics.profitMargin
    })

    return NextResponse.json({
      department: {
        name: departmentName,
        metrics: {
          totalRevenue: metrics.totalRevenue,
          totalCost: metrics.totalCOGS,
          totalProfit: metrics.totalProfit,
          transactionCount: metrics.totalOrders,
          totalQuantity: metrics.totalQuantity,
          profitMargin: metrics.profitMargin
        },
        parcelStatusCounts,
        cashFlow,
        topProducts,
        storeBreakdown,
        recentTransactions,
        excludedSummary: {
          count: excludedOrders.length,
          revenue: excludedRevenue,
          cancelled: orders.filter(o => o.parcel_status === 'CANCELLED').length,
          returned: orders.filter(o => o.parcel_status === 'RETURNED').length
        }
      },
      dateRange: {
        start: startDate || null,
        end: endDate || null
      },
      metadata: {
        source: 'orders table',
        revenueRecognition: 'active orders (excludes cancelled/returned)'
      }
    })
  } catch (error) {
    console.error("[Sales Channel API] Error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch sales channel details",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}
