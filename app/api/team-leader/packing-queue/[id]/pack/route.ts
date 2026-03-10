import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole } from '@/lib/team-leader-middleware'

/**
 * PUT /api/team-leader/packing-queue/:id/pack
 * Mark order as packed
 * 
 * Requirements: 6.3, 6.5
 */
export const PUT = async (request: NextRequest, { params }: { params: { id: string } }) => {
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
      console.log('[Pack Order] Order not found:', orderId)
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

    // Validate items are available (simplified check)
    if (!order.qty || order.qty <= 0) {
      return NextResponse.json(
        { error: 'Invalid order quantity' },
        { status: 400 }
      )
    }

    // Update order status to Packed
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'Packed',
        packed_by: context.userId,
        packed_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('[Pack Order] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to pack order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order packed successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.id,
        status: updatedOrder.status,
        packedBy: updatedOrder.packed_by,
        packedAt: updatedOrder.packed_at
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[Pack Order] Error:', error)
    return NextResponse.json(
      { error: 'Failed to pack order' },
      { status: 500 }
    )
  }
}
