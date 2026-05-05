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

    // Fetch orders from orders table (same as Dashboard)
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      // Don't filter by status - get ALL orders from Track Orders page

    if (ordersError) {
      console.error("[Departments API] Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    console.log('[Departments API] Total orders fetched:', allOrders?.length || 0)
    if (allOrders && allOrders.length > 0) {
      console.log('[Departments API] Sample order:', allOrders[0])
    }

    // Apply date filters if provided
    let filteredOrders = allOrders || []
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      filteredOrders = filteredOrders.filter(order => new Date(order.date) >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filteredOrders = filteredOrders.filter(order => new Date(order.date) <= end)
    }

    console.log('[Departments API] After date filter:', filteredOrders.length)

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
