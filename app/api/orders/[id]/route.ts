import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// PATCH /api/orders/[id] - Update order details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      customer_name,
      customer_contact,
      customer_address,
      courier,
      waybill,
      dispatch_notes,
      qty,
      total
    } = body

    // Get current order details to check if quantity changed
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('qty, product, status')
      .eq('id', id)
      .single()

    if (fetchError || !currentOrder) {
      console.error('[API PATCH] Error fetching current order:', fetchError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('[API PATCH] Current order:', {
      id,
      currentQty: currentOrder.qty,
      newQty: qty,
      status: currentOrder.status,
      product: currentOrder.product
    })

    // Update order details
    const { data, error } = await supabase
      .from('orders')
      .update({
        customer_name,
        customer_contact,
        customer_address,
        courier,
        waybill,
        dispatch_notes,
        qty,
        total,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API PATCH] Error updating order:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If order is Packed and quantity changed, adjust inventory
    if (currentOrder.status === 'Packed' && qty !== currentOrder.qty && currentOrder.product) {
      const qtyDifference = qty - currentOrder.qty
      
      console.log('[API PATCH] Quantity changed, adjusting inventory:', {
        oldQty: currentOrder.qty,
        newQty: qty,
        difference: qtyDifference
      })

      // Clean product name (remove quantity suffix)
      const cleanProductName = currentOrder.product.replace(/\s*\(\d+\)\s*$/, '').trim()

      // Try exact match first
      let { data: inventoryItem, error: inventoryError } = await supabaseAdmin
        .from('inventory')
        .select('quantity, name')
        .eq('name', cleanProductName)
        .single()

      // If exact match fails, try case-insensitive match
      if (inventoryError && inventoryError.code === 'PGRST116') {
        console.log('[API PATCH] Exact match failed, trying case-insensitive match...')
        const { data: items } = await supabaseAdmin
          .from('inventory')
          .select('quantity, name')
          .ilike('name', cleanProductName)

        if (items && items.length > 0) {
          inventoryItem = items[0]
          inventoryError = null
          console.log('[API PATCH] Found case-insensitive match:', inventoryItem.name)
        }
      }

      if (inventoryError) {
        console.error('[API PATCH] Inventory item not found:', {
          searchedFor: cleanProductName,
          error: inventoryError.message
        })
        // Continue without inventory adjustment
        console.log('[API PATCH] Continuing without inventory adjustment')
      } else if (inventoryItem) {
        // Adjust inventory: if qty increased, deduct more; if decreased, restore some
        const newInventoryQty = inventoryItem.quantity - qtyDifference

        console.log('[API PATCH] Adjusting inventory:', {
          product: inventoryItem.name,
          currentInventoryQty: inventoryItem.quantity,
          qtyDifference,
          newInventoryQty
        })

        const { error: updateError } = await supabaseAdmin
          .from('inventory')
          .update({
            quantity: newInventoryQty,
            last_updated: new Date().toISOString()
          })
          .eq('name', inventoryItem.name)

        if (updateError) {
          console.error('[API PATCH] Error adjusting inventory:', updateError)
          // Log error but don't fail the order update
          console.log('[API PATCH] Order updated but inventory adjustment failed')
        } else {
          console.log(`[API PATCH] ✅ Inventory adjusted: ${inventoryItem.name} ${qtyDifference > 0 ? '-' : '+'}${Math.abs(qtyDifference)} (New: ${newInventoryQty})`)
        }
      }
    } else {
      console.log('[API PATCH] No inventory adjustment needed:', {
        isPacked: currentOrder.status === 'Packed',
        qtyChanged: qty !== currentOrder.qty,
        hasProduct: !!currentOrder.product
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[API] Error in PATCH /api/orders/[id]:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to update order',
      details: error.toString()
    }, { status: 500 })
  }
}

// DELETE /api/orders/[id] - Delete order and restore inventory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('[API DELETE] Starting delete for order:', id)
    
    // Get order details first to restore inventory
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('product, qty, status')
      .eq('id', id)
      .single()
    
    if (orderError) {
      console.error('[API DELETE] Error fetching order:', orderError)
      return NextResponse.json({ 
        error: 'Order not found',
        details: orderError.message 
      }, { status: 404 })
    }
    
    if (!order) {
      console.error('[API DELETE] Order not found:', id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    console.log('[API DELETE] Order found:', { 
      id, 
      product: order.product, 
      qty: order.qty, 
      status: order.status 
    })
    
    // Only restore inventory if order was packed (inventory was deducted)
    if (order.status === 'Packed' && order.product) {
      try {
        // Clean product name (remove quantity suffix like "(1)")
        const cleanProductName = order.product.replace(/\s*\(\d+\)\s*$/, '').trim()
        
        console.log('[API DELETE] Attempting to restore inventory for:', cleanProductName)
        
        // Try exact match first
        let { data: inventoryItem, error: inventoryError } = await supabase
          .from('inventory')
          .select('quantity, name')
          .eq('name', cleanProductName)
          .single()
        
        // If exact match fails, try case-insensitive match
        if (inventoryError && inventoryError.code === 'PGRST116') {
          console.log('[API DELETE] Exact match failed, trying case-insensitive match...')
          const { data: items } = await supabase
            .from('inventory')
            .select('quantity, name')
            .ilike('name', cleanProductName)
          
          if (items && items.length > 0) {
            inventoryItem = items[0]
            inventoryError = null
            console.log('[API DELETE] Found case-insensitive match:', inventoryItem.name)
          }
        }
        
        if (inventoryError) {
          console.error('[API DELETE] Inventory item not found:', {
            searchedFor: cleanProductName,
            error: inventoryError.message
          })
          // Continue with deletion even if inventory not found
          console.log('[API DELETE] Continuing with deletion despite inventory error')
        } else if (inventoryItem) {
          const newQuantity = inventoryItem.quantity + order.qty
          
          console.log('[API DELETE] Restoring inventory:', {
            product: inventoryItem.name,
            currentQty: inventoryItem.quantity,
            orderQty: order.qty,
            newQty: newQuantity
          })
          
          const { error: updateError } = await supabase
            .from('inventory')
            .update({ 
              quantity: newQuantity,
              last_updated: new Date().toISOString()
            })
            .eq('name', inventoryItem.name)
          
          if (updateError) {
            console.error('[API DELETE] Error restoring inventory:', updateError)
            // Log error but continue with deletion
            console.log('[API DELETE] Continuing with deletion despite inventory update error')
          } else {
            console.log(`[API DELETE] ✅ Inventory restored: ${inventoryItem.name} +${order.qty} (New: ${newQuantity})`)
          }
        } else {
          console.log('[API DELETE] No inventory item found for:', cleanProductName)
        }
      } catch (inventoryError: any) {
        console.error('[API DELETE] Error in inventory restoration:', inventoryError)
        // Continue with deletion even if inventory restoration fails
        console.log('[API DELETE] Continuing with deletion despite inventory error')
      }
    } else {
      console.log('[API DELETE] Skipping inventory restoration:', {
        status: order.status,
        hasProduct: !!order.product,
        reason: order.status !== 'Packed' ? 'Not packed' : 'No product name'
      })
    }
    
    // Delete the order
    console.log('[API DELETE] Deleting order:', id)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[API DELETE] Error deleting order:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete order',
        details: deleteError.message 
      }, { status: 500 })
    }

    console.log('[API DELETE] ✅ Order deleted successfully:', id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order deleted successfully',
      inventoryRestored: order.status === 'Packed' && !!order.product
    })
  } catch (error: any) {
    console.error('[API DELETE] Unexpected error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to delete order',
      details: error.toString()
    }, { status: 500 })
  }
}
