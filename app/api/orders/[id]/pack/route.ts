import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/orders/[id]/pack - Mark order as packed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { packedBy } = body
    
    if (!packedBy) {
      return NextResponse.json(
        { error: 'packedBy is required' },
        { status: 400 }
      )
    }
    
    // Get order details first to deduct inventory
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('product, qty')
      .eq('id', id)
      .single()
    
    if (orderError || !order) {
      console.error('[API] Error fetching order:', orderError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Get current Manila time for packed_at
    // Format: YYYY-MM-DD HH:mm:ss (without timezone, as Philippine time)
    const now = new Date()
    const manilaTimeString = now.toLocaleString('en-US', { 
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    // Convert "MM/DD/YYYY, HH:mm:ss" to "YYYY-MM-DD HH:mm:ss"
    const [datePart, timePart] = manilaTimeString.split(', ')
    const [month, day, year] = datePart.split('/')
    const packedAt = `${year}-${month}-${day} ${timePart}`
    
    // Clean product name (remove quantity suffix like "(1)")
    const cleanProductName = order.product.replace(/\s*\(\d+\)\s*$/, '').trim()
    
    console.log('[API PACK] Attempting to deduct inventory:', {
      originalProduct: order.product,
      cleanProductName,
      quantity: order.qty
    })
    
    // Try exact match first
    let { data: inventoryItem, error: inventoryError } = await supabaseAdmin
      .from('inventory')
      .select('quantity, name')
      .eq('name', cleanProductName)
      .single()
    
    // If exact match fails, try case-insensitive match
    if (inventoryError && inventoryError.code === 'PGRST116') {
      console.log('[API PACK] Exact match failed, trying case-insensitive match...')
      const { data: items } = await supabaseAdmin
        .from('inventory')
        .select('quantity, name')
        .ilike('name', cleanProductName)
      
      if (items && items.length > 0) {
        inventoryItem = items[0]
        inventoryError = null
        console.log('[API PACK] Found case-insensitive match:', inventoryItem.name)
      }
    }
    
    if (inventoryError) {
      console.error('[API PACK] Inventory item not found:', {
        searchedFor: cleanProductName,
        error: inventoryError.message,
        code: inventoryError.code
      })
      // Continue even if inventory not found (for backwards compatibility)
      console.log('[API PACK] Continuing without inventory deduction (item not found)')
    } else if (inventoryItem) {
      const newQuantity = inventoryItem.quantity - order.qty
      
      console.log('[API PACK] Updating inventory:', {
        product: inventoryItem.name,
        currentQty: inventoryItem.quantity,
        orderQty: order.qty,
        newQty: newQuantity
      })
      
      const { error: updateError } = await supabaseAdmin
        .from('inventory')
        .update({ 
          quantity: newQuantity,
          last_updated: packedAt
        })
        .eq('name', inventoryItem.name)
      
      if (updateError) {
        console.error('[API PACK] Error updating inventory:', updateError)
        return NextResponse.json({ 
          error: 'Failed to update inventory',
          details: updateError.message 
        }, { status: 500 })
      }
      
      console.log(`[API PACK] ✅ Inventory deducted: ${inventoryItem.name} -${order.qty} (New: ${newQuantity})`)
    } else {
      console.log('[API PACK] No inventory item found for:', cleanProductName)
    }
    
    // Update order status to Packed
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'Packed',
        packed_by: packedBy,
        packed_at: packedAt,
        updated_at: packedAt
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('[API] Error marking order as packed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[API] Error in POST /api/orders/[id]/pack:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
