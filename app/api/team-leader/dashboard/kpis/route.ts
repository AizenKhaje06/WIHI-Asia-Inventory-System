import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole, requireChannelAccess } from '@/lib/team-leader-middleware'

/**
 * GET /api/team-leader/dashboard/kpis
 * Get dashboard KPIs for team leader's channel
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.5
 */
export const GET = async (request: NextRequest) => {
  try {
    const authResult = requireTeamLeaderRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const context = authResult as any
    const channel = context.channel

    // Query orders for the channel
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('sales_channel', channel)

    if (ordersError) {
      console.error('[Dashboard KPIs] Query error:', ordersError)
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

    return NextResponse.json({
      success: true,
      kpis: {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        itemsSold,
        totalOrders,
        channel
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[Dashboard KPIs] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
