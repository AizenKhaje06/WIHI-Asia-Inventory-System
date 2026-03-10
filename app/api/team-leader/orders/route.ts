import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole } from '@/lib/team-leader-middleware'

/**
 * GET /api/team-leader/orders
 * Get all orders for team leader's channel
 * 
 * Requirements: 5.1, 5.2, 5.3
 */
export const GET = async (request: NextRequest) => {
  try {
    const authResult = requireTeamLeaderRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const context = authResult as any
    const channel = context.channel

    // Get pagination parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Query orders for the channel
    const { data: orders, error: ordersError, count } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('sales_channel', channel)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (ordersError) {
      console.error('[Get Orders] Query error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Transform orders
    const transformedOrders = orders?.map((order: any) => ({
      id: order.id,
      orderNumber: order.id,
      customerName: order.customer_name || 'N/A',
      customerPhone: order.customer_contact || 'N/A',
      customerAddress: order.customer_address || 'N/A',
      itemName: order.product || 'N/A',
      quantity: order.qty || 0,
      totalAmount: order.total || 0,
      orderStatus: order.status || 'Pending',
      parcelStatus: order.parcel_status || 'PENDING',
      paymentStatus: order.payment_status || 'pending',
      courier: order.courier || '-',
      trackingNumber: order.waybill || '-',
      orderDate: order.date,
      channel: order.sales_channel
    })) || []

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[Get Orders] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
