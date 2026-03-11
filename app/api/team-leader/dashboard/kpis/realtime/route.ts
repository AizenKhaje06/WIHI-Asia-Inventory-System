import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole } from '@/lib/team-leader-middleware'

/**
 * GET /api/team-leader/dashboard/kpis/realtime
 * Get real-time dashboard KPIs for team leader's channel
 * Enhanced with admin-level metrics, all filtered by sales channel
 * 
 * Requirements: 4.4
 */
export const GET = async (request: NextRequest) => {
  try {
    const authResult = requireTeamLeaderRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const context = authResult as any
    const channel = context.channel
    
    // Get time period from query params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'ID'

    // Query orders for the channel
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('sales_channel', channel)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('[Dashboard KPIs Realtime] Query error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 }
      )
    }

    // Query inventory items for the channel
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('sales_channel', channel)

    if (itemsError) {
      console.error('[Dashboard KPIs Realtime] Items query error:', itemsError)
    }

    // Calculate KPIs
    const totalRevenue = orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0
    const totalCost = orders?.reduce((sum: number, order: any) => sum + (order.cogs || 0), 0) || 0
    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0
    const itemsSold = orders?.reduce((sum: number, order: any) => sum + (order.qty || 0), 0) || 0
    const totalOrders = orders?.length || 0

    // Get today's metrics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = orders?.filter((order: any) => {
      const orderDate = new Date(order.created_at)
      orderDate.setHours(0, 0, 0, 0)
      return orderDate.getTime() === today.getTime()
    }) || []

    const revenueToday = todayOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
    const itemsSoldToday = todayOrders.reduce((sum: number, order: any) => sum + (order.qty || 0), 0)
    const recentSales = todayOrders.length

    // Calculate return metrics
    const returnOrders = orders?.filter((order: any) => order.status === 'returned') || []
    const returnValue = returnOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
    const returnRate = totalOrders > 0 ? ((returnOrders.length / totalOrders) * 100) : 0
    
    const damagedReturns = returnOrders.filter((order: any) => order.return_reason === 'damaged')
    const supplierReturns = returnOrders.filter((order: any) => order.return_reason === 'supplier')
    const damagedReturnRate = totalOrders > 0 ? ((damagedReturns.length / totalOrders) * 100) : 0
    const supplierReturnRate = totalOrders > 0 ? ((supplierReturns.length / totalOrders) * 100) : 0

    // Calculate inventory metrics
    const totalItems = items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
    const totalValue = items?.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.cost_price || 0)), 0) || 0

    return NextResponse.json({
      success: true,
      kpis: {
        // Core metrics
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        itemsSold,
        totalOrders,
        channel,
        
        // Today's metrics
        revenueToday,
        itemsSoldToday,
        recentSales,
        
        // Return metrics
        returnValue,
        returnRate,
        damagedReturnRate,
        supplierReturnRate,
        
        // Inventory metrics
        totalItems,
        totalValue,
        
        timestamp: new Date().toISOString()
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[Dashboard KPIs Realtime] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
