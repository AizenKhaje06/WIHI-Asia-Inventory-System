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
    const body = await request.json()
    const { reason, cancelledBy } = body

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

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
        cancellation_reason: reason.trim(),
        cancelled_by: cancelledBy || 'Unknown',
        cancelled_at: new Date().toISOString(),
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

    // Log activity
    try {
      await supabase.from('logs').insert({
        operation: 'CANCEL',
        item_name: order.product || 'Unknown Product',
        quantity: order.qty || 0,
        details: `Order cancelled. Reason: ${reason.trim()}. Waybill: ${order.waybill || 'N/A'}. Cancelled by: ${cancelledBy || 'Unknown'}`,
        timestamp: new Date().toISOString()
      })
    } catch (logError) {
      console.error('[Cancel Order API] Failed to log activity:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      orderId,
      reason: reason.trim()
    })
  } catch (error: any) {
    console.error('[Cancel Order API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/orders/[id]/cancel
 * Uncancel an order (restore cancelled order)
 * Used by department accounts in Packing Queue
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    const { restoredBy } = body

    // Fetch the order to verify it exists and is cancelled
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

    // Check if order is actually cancelled
    if (!order.is_cancelled) {
      return NextResponse.json(
        { error: 'Order is not cancelled' },
        { status: 400 }
      )
    }

    // Check if order is already packed
    if (order.status === 'Packed' && order.packed_at) {
      return NextResponse.json(
        { error: 'Cannot uncancel an order that has already been packed' },
        { status: 400 }
      )
    }

    // Update order to uncancel
    const updateData: any = {
      is_cancelled: false,
      cancellation_reason: null,
      cancelled_by: null,
      cancelled_at: null,
      updated_at: new Date().toISOString()
    }
    
    // Add restoration tracking if columns exist (backward compatible)
    try {
      updateData.restored_by = restoredBy || 'Unknown'
      updateData.restored_at = new Date().toISOString()
    } catch (e) {
      // Columns don't exist yet, skip restoration tracking
      console.log('[Uncancel] Restoration tracking columns not available yet')
    }
    
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (updateError) {
      console.error('[Uncancel Order API] Error updating order:', updateError)
      return NextResponse.json(
        { error: 'Failed to uncancel order', details: updateError.message },
        { status: 500 }
      )
    }

    // Log activity
    try {
      await supabase.from('logs').insert({
        operation: 'UNCANCEL',
        item_name: order.product || 'Unknown Product',
        quantity: order.qty || 0,
        details: `Order uncancelled and restored to packing queue. Waybill: ${order.waybill || 'N/A'}. Restored by: ${restoredBy || 'Unknown'}`,
        timestamp: new Date().toISOString()
      })
    } catch (logError) {
      console.error('[Uncancel Order API] Failed to log activity:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Order uncancelled successfully',
      orderId
    })
  } catch (error: any) {
    console.error('[Uncancel Order API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to uncancel order', details: error.message },
      { status: 500 }
    )
  }
}
