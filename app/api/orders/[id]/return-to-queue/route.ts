import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { withAuth } from '@/lib/api-helpers'

/**
 * POST /api/orders/[id]/return-to-queue
 * Return a packed order back to packing queue
 * Only accessible by tracker and admin roles
 */
export const POST = withAuth(async (request: NextRequest, { params, user }) => {
  try {
    const orderId = params?.id

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Only tracker and admin can return orders to queue
    if (user.role !== 'tracker' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Only tracker and admin can return orders to queue' }, { status: 403 })
    }

    const body = await request.json()
    const { reason, returnedBy } = body

    if (!reason || !returnedBy) {
      return NextResponse.json({ error: 'Reason and returnedBy are required' }, { status: 400 })
    }

    console.log('[Return to Queue] Processing order:', orderId)
    console.log('[Return to Queue] Reason:', reason)
    console.log('[Return to Queue] Returned by:', returnedBy)

    // Step 1: Get the current order details
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      console.error('[Return to Queue] Order not found:', fetchError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Step 2: Verify order is packed (can only return packed orders)
    if (order.status !== 'Packed') {
      return NextResponse.json({ 
        error: 'Order must be in Packed status to return to queue',
        currentStatus: order.status 
      }, { status: 400 })
    }

    // Step 3: Update order status back to Pending
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'Pending',
        packed_by: null,
        packed_at: null,
        parcel_status: 'PENDING',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[Return to Queue] Failed to update order:', updateError)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }

    // Step 4: Restore inventory (add back the quantity)
    // Find the product by name from the order
    const { data: inventoryItem, error: inventoryFetchError } = await supabaseAdmin
      .from('inventory')
      .select('*')
      .eq('name', order.product)
      .eq('store', order.store)
      .single()

    if (inventoryFetchError) {
      console.warn('[Return to Queue] Could not find inventory item:', inventoryFetchError)
      // Continue even if inventory not found - log it but don't fail
    } else if (inventoryItem) {
      // Restore the quantity
      const newQuantity = inventoryItem.quantity + order.qty
      
      const { error: inventoryUpdateError } = await supabaseAdmin
        .from('inventory')
        .update({
          quantity: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', inventoryItem.id)

      if (inventoryUpdateError) {
        console.error('[Return to Queue] Failed to restore inventory:', inventoryUpdateError)
        // Continue even if inventory update fails - log it but don't fail
      } else {
        console.log('[Return to Queue] Inventory restored:', {
          item: inventoryItem.name,
          oldQty: inventoryItem.quantity,
          newQty: newQuantity,
          restored: order.qty
        })
      }
    }

    // Step 5: Remove from activity logs (sales record)
    // Find and delete the sale activity log for this order
    const { error: deleteLogError } = await supabaseAdmin
      .from('activity_logs')
      .delete()
      .eq('order_id', orderId)
      .eq('operation', 'sale')

    if (deleteLogError) {
      console.warn('[Return to Queue] Could not delete sale log:', deleteLogError)
      // Continue even if log deletion fails
    } else {
      console.log('[Return to Queue] Sale activity log removed')
    }

    // Step 6: Create activity log for return to queue action
    const { error: logError } = await supabaseAdmin
      .from('activity_logs')
      .insert({
        item_id: inventoryItem?.id || null,
        item_name: order.product,
        operation: 'return-to-queue',
        quantity: order.qty,
        details: `Order returned to packing queue. Reason: ${reason}`,
        performed_by: returnedBy,
        order_id: orderId,
        store: order.store,
        sales_channel: order.sales_channel,
        timestamp: new Date().toISOString()
      })

    if (logError) {
      console.error('[Return to Queue] Failed to create activity log:', logError)
      // Continue even if logging fails
    }

    console.log('[Return to Queue] Order successfully returned to queue:', orderId)

    return NextResponse.json({
      success: true,
      message: 'Order returned to packing queue successfully',
      order: {
        id: orderId,
        status: 'Pending',
        inventoryRestored: !!inventoryItem
      }
    })

  } catch (error) {
    console.error('[Return to Queue] Exception:', error)
    return NextResponse.json({ 
      error: 'Failed to return order to queue',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})
