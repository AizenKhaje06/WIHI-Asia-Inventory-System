import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { withAuth } from "@/lib/api-helpers"
import { filterRevenueOrders, EXCLUDED_STATUSES } from "@/lib/financial-utils"

export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const departmentFilter = searchParams.get('department')

    console.log('[Departments API] Params:', { startDate, endDate, departmentFilter })

    // Fetch orders from orders table (Track Orders ONLY - status='Packed')
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Packed') // CRITICAL: Only fetch Track Orders, exclude Packing Queue

    if (ordersError) {
      console.error("[Departments API] Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    console.log('[Departments API] Total orders fetched:', allOrders?.length || 0)

    // Apply date filters if provided (filter by packed_at for accurate revenue recognition)
    // Use same approach as Dashboard API for consistency
    let filteredOrders = allOrders || []
    
    // Parse date parameters
    let startDateObj: Date | null = null
    let endDateObj: Date | null = null
    
    if (startDate) {
      startDateObj = new Date(startDate)
    }
    if (endDate) {
      endDateObj = new Date(endDate)
    }
    
    if (startDateObj || endDateObj) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.packed_at || order.created_at) // Use packed_at (when revenue recognized)
        if (startDateObj && orderDate < startDateObj) return false
        if (endDateObj && orderDate > endDateObj) return false
        return true
      })
    }

    console.log('[Departments API] Orders after date filter:', filteredOrders.length)
    if (filteredOrders.length > 0) {
      console.log('[Departments API] Sample order packed_at:', filteredOrders[0].packed_at)
    } else {
      console.log('[Departments API] ⚠️  NO ORDERS FOUND for this date range!')
    }

    // Filter to active orders only (exclude CANCELLED and RETURNED)
    const activeOrders = filterRevenueOrders(
      filteredOrders.map(o => ({
        id: o.id,
        qty: o.qty || 0,
        total: o.total || 0,
        cogs: o.cogs || (o.total * 0.6) || 0, // Calculate COGS if missing (60% of total)
        parcel_status: o.parcel_status || 'PENDING',
        payment_status: o.payment_status || 'pending',
        sales_channel: o.sales_channel,
        date: o.date
      })),
      'active' // Excludes CANCELLED and RETURNED
    )

    console.log('[Departments API] Active orders (excluding CANCELLED/RETURNED):', activeOrders.length)

    // Group by sales channel
    const departmentMap = new Map<string, {
      name: string
      type: 'sale'
      revenue: number
      cost: number
      profit: number
      transactions: number
      quantity: number
    }>()

    activeOrders.forEach(order => {
      const salesChannel = order.sales_channel || 'Unknown'
      
      if (!departmentMap.has(salesChannel)) {
        departmentMap.set(salesChannel, {
          name: salesChannel,
          type: 'sale',
          revenue: 0,
          cost: 0,
          profit: 0,
          transactions: 0,
          quantity: 0
        })
      }

      const dept = departmentMap.get(salesChannel)!
      dept.revenue += order.total
      dept.cost += order.cogs
      dept.profit += (order.total - order.cogs)
      dept.transactions += 1
      dept.quantity += order.qty
    })

    console.log('[Departments API] Sales channels found:', Array.from(departmentMap.keys()))

    // Convert to array
    const departments = Array.from(departmentMap.values())
      .sort((a, b) => b.revenue - a.revenue)

    // Filter by specific department if requested
    const finalDepartments = departmentFilter 
      ? departments.filter(d => d.name === departmentFilter)
      : departments

    // Calculate totals
    const totals = {
      revenue: departments.reduce((sum, d) => sum + d.revenue, 0),
      cost: departments.reduce((sum, d) => sum + d.cost, 0),
      profit: departments.reduce((sum, d) => sum + d.profit, 0),
      transactions: departments.reduce((sum, d) => sum + d.transactions, 0),
      quantity: departments.reduce((sum, d) => sum + d.quantity, 0)
    }

    console.log('[Departments API] Totals:', totals)

    return NextResponse.json({
      departments: finalDepartments,
      totals,
      dateRange: {
        start: startDate || null,
        end: endDate || null
      }
    })
  } catch (error) {
    console.error("[Departments API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch departments data" }, { status: 500 })
  }
})
