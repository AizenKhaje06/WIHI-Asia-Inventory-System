import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/orders/check-waybill?waybill=XXX
 * Check if waybill number already exists in the system
 * Returns: { exists: boolean, orders: [...] }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const waybill = searchParams.get('waybill')

    if (!waybill || waybill.trim() === '') {
      return NextResponse.json({
        exists: false,
        orders: []
      })
    }

    // Check for existing orders with this waybill
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, waybill, status, parcel_status, product, customer_name, created_at, is_cancelled')
      .ilike('waybill', waybill.trim())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Check Waybill] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to check waybill' },
        { status: 500 }
      )
    }

    const exists = orders && orders.length > 0

    // Format order details for display
    const formattedOrders = orders?.map(order => ({
      id: order.id,
      orderNumber: `#${order.id.slice(-6)}`,
      waybill: order.waybill,
      status: order.status,
      parcelStatus: order.parcel_status,
      product: order.product,
      customerName: order.customer_name,
      location: order.status === 'Packed' ? 'Track Orders' : 'Packing Queue',
      isCancelled: order.is_cancelled || false,
      createdAt: order.created_at
    })) || []

    return NextResponse.json({
      exists,
      orders: formattedOrders,
      count: formattedOrders.length
    })
  } catch (error: any) {
    console.error('[Check Waybill] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check waybill', details: error.message },
      { status: 500 }
    )
  }
}
