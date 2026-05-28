import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * PATCH /api/orders/[id]/cancel
 * Cancel an order (mark as cancelled, prevent packing)
 * Used by department accounts in Packing Queue
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Fetch the order to verify it exists and is not already packed
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order is already packed
    if (order.status === 'Packed' && order.packed_at) {
      return NextResponse.json(
        { error: 'Cannot cancel an order that has already been packed' },
        { status: 400 }
      )
    }

    // Check if order is already cancelled
    if (order.is_cancelled) {
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400 }
      )
    }

    // Update order to mark as cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        is_cancelled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[Cancel Order API] Error updating order:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel order', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      orderId
    })
  } catch (error: any) {
    console.error('[Cancel Order API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order', details: error.message },
      { status: 500 }
    )
  }
}
