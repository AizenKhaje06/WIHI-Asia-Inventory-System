import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole } from '@/lib/team-leader-middleware'

/**
 * GET /api/team-leader/dispatch
 * Get packed orders ready for dispatch
 * 
 * Requirements: 7.1, 7.2, 7.4
 */
export const GET = async (request: NextRequest) => {
  try {
    const authResult = requireTeamLeaderRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const context = authResult as any
    const channel = context.channel

    // Query packed orders for the channel
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('sales_channel', channel)
      .eq('status', 'Packed')
      .order('packed_at', { ascending: true })

    if (ordersError) {
      console.error('[Dispatch Queue] Query error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch dispatch queue' },
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
      orderStatus: order.status || 'Packed',
      parcelStatus: order.parcel_status || 'PENDING',
      paymentStatus: order.payment_status || 'pending',
      courier: order.courier || '-',
      trackingNumber: order.waybill || '-',
      orderDate: order.date,
      packedAt: order.packed_at,
      channel: order.sales_channel,
      store: order.store
    })) || []

    return NextResponse.json({
      success: true,
      queue: transformedOrders,
      count: transformedOrders.length
    }, { status: 200 })

  } catch (error) {
    console.error('[Dispatch Queue] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dispatch queue' },
      { status: 500 }
    )
  }
}
