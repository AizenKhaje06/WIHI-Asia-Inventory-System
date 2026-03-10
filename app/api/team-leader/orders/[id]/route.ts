import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole, requireChannelAccess } from '@/lib/team-leader-middleware'

/**
 * GET /api/team-leader/orders/:id
 * Get order details for team leader's channel
 * 
 * Requirements: 5.2
 */
export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const authResult = requireTeamLeaderRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const context = authResult as any
    const orderId = params.id

    // Query order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.log('[Get Order] Order not found:', orderId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify channel access
    if (context.role !== 'admin' && order.sales_channel !== context.channel) {
      return NextResponse.json(
        { error: 'Forbidden - channel access denied' },
        { status: 403 }
      )
    }

    // Transform order
    const transformedOrder = {
      id: order.id,
      orderNumber: order.id,
      customerName: order.customer_name || 'N/A',
      customerPhone: order.customer_contact || 'N/A',
      customerEmail: order.customer_email,
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
      channel: order.sales_channel,
      store: order.store,
      dispatchedBy: order.dispatched_by,
      dispatchedAt: order.created_at,
      packedBy: order.packed_by,
      packedAt: order.packed_at,
      dispatchNotes: order.dispatch_notes
    }

    return NextResponse.json({
      success: true,
      order: transformedOrder
    }, { status: 200 })

  } catch (error) {
    console.error('[Get Order] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
