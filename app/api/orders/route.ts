import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/orders - Get orders with optional status filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    // Filter by status if provided
    if (status) {
      if (status === 'Pending') {
        query = query.eq('status', 'Pending')
      } else if (status === 'Packed') {
        query = query.in('status', ['Packed', 'Shipped', 'Delivered'])
      }
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('[API] Error fetching orders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('[API] Error in GET /api/orders:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      date,
      salesChannel,
      store,
      courier,
      waybill,
      qty,
      cogs,
      total,
      product,
      dispatchedBy,
      orderItems = []
    } = body
    
    // Validate required fields
    if (!date || !salesChannel || !store || !courier || !waybill || !qty || !cogs || !total || !product || !dispatchedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Generate order ID
    const orderId = `ORD-${Date.now()}`
    
    // Insert order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: orderId,
        date,
        sales_channel: salesChannel,
        store,
        courier,
        waybill,
        qty,
        cogs,
        total,
        product,
        status: 'Pending',
        parcel_status: 'Pending',
        dispatched_by: dispatchedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (orderError) {
      console.error('[API] Error creating order:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }
    
    // Insert order items if provided
    if (orderItems.length > 0) {
      const orderItemsData = orderItems.map((item: any) => ({
        id: `ORDITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        order_id: orderId,
        item_id: item.itemId,
        item_name: item.itemName,
        quantity: item.quantity,
        cost_price: item.costPrice,
        selling_price: item.sellingPrice,
        total_cost: item.quantity * item.costPrice,
        total_revenue: item.quantity * item.sellingPrice,
        created_at: new Date().toISOString()
      }))
      
      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItemsData)
      
      if (itemsError) {
        console.error('[API] Error creating order items:', itemsError)
        // Don't fail the whole request, just log the error
      }
    }
    
    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error in POST /api/orders:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
