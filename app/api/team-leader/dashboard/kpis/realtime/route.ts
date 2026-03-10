import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole } from '@/lib/team-leader-middleware'

/**
 * GET /api/team-leader/dashboard/kpis/realtime
 * Get real-time dashboard KPIs for team leader's channel
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

    // Query latest orders for the channel (with timestamp filter for real-time)
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

    return NextResponse.json({
      success: true,
      kpis: {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        itemsSold,
        totalOrders,
        revenueToday,
        itemsSoldToday,
        channel,
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
