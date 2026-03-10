import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole } from '@/lib/team-leader-middleware'

/**
 * GET /api/team-leader/orders/search
 * Search orders for team leader's channel
 * 
 * Requirements: 5.4
 */
export const GET = async (request: NextRequest) => {
  try {
    const authResult = requireTeamLeaderRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const context = authResult as any
    const channel = context.channel

    // Get search query
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Search orders by customer name, phone, or order ID
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('sales_channel', channel)
      .or(`customer_name.ilike.%${query}%,customer_contact.ilike.%${query}%,id.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (ordersError) {
      console.error('[Search Orders] Query error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to search orders' },
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
      query,
      results: transformedOrders,
      count: transformedOrders.length
    }, { status: 200 })

  } catch (error) {
    console.error('[Search Orders] Error:', error)
    return NextResponse.json(
      { error: 'Failed to search orders' },
      { status: 500 }
    )
  }
}
