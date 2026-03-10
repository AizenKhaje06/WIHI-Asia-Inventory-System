import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole } from '@/lib/team-leader-middleware'

/**
 * PUT /api/team-leader/dispatch/:id/dispatch
 * Mark order as dispatched
 * 
 * Requirements: 7.3, 7.5
 */
export const PUT = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const authResult = requireTeamLeaderRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const context = authResult as any
    const orderId = params.id
    const body = await request.json()
    const { courier, trackingNumber } = body

    // Query order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.log('[Dispatch Order] Order not found:', orderId)
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

    // Verify order is packed
    if (order.status !== 'Packed') {
      return NextResponse.json(
        { error: 'Order must be packed before dispatch' },
        { status: 400 }
      )
    }

    // Update order status to Dispatched
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'Dispatched',
        parcel_status: 'IN TRANSIT',
        courier: courier || order.courier,
        waybill: trackingNumber || order.waybill,
        dispatched_by: context.userId,
        created_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('[Dispatch Order] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to dispatch order' },
        { status: 500 }
      )
    }

    // Record dispatch tracking
    const trackingId = `TRACK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const { error: trackingError } = await supabaseAdmin
      .from('dispatch_tracking')
      .insert({
        id: trackingId,
        order_id: orderId,
        dispatch_timestamp: new Date().toISOString(),
        tracking_info: {
          courier: courier || order.courier,
          waybill: trackingNumber || order.waybill,
          dispatchedBy: context.userId
        },
        channel: context.channel
      })

    if (trackingError) {
      console.error('[Dispatch Order] Tracking error:', trackingError)
    }

    return NextResponse.json({
      success: true,
      message: 'Order dispatched successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.id,
        status: updatedOrder.status,
        parcelStatus: updatedOrder.parcel_status,
        courier: updatedOrder.courier,
        trackingNumber: updatedOrder.waybill,
        dispatchedBy: updatedOrder.dispatched_by,
        dispatchedAt: updatedOrder.created_at
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[Dispatch Order] Error:', error)
    return NextResponse.json(
      { error: 'Failed to dispatch order' },
      { status: 500 }
    )
  }
}
