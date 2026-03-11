import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/packer/queue
 * Get all unpacked orders for packer
 */
export async function GET(request: NextRequest) {
  try {
    // Query unpacked orders (status != 'Packed')
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .neq('status', 'Packed')
      .order('created_at', { ascending: true })

    if (ordersError) {
      console.error('[Packer Queue] Query error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch packing queue' },
        { status: 500 }
      )
    }

    // Transform orders
    const transformedOrders = orders?.map((order: any) => ({
      id: order.id,
      orderNumber: order.id,
      waybill: order.waybill || order.id,
      customerName: order.customer_name || 'N/A',
      customerPhone: order.customer_contact || 'N/A',
      customerAddress: order.customer_address || 'N/A',
      itemName: order.product || 'N/A',
      quantity: order.qty || 0,
      totalAmount: order.total || 0,
      orderStatus: order.status || 'Pending',
      parcelStatus: order.parcel_status || 'PENDING',
      paymentStatus: order.payment_status || 'pending',
      orderDate: order.date,
      channel: order.sales_channel,
      store: order.store,
      courier: order.courier || 'N/A'
    })) || []

    return NextResponse.json({
      success: true,
      queue: transformedOrders,
      count: transformedOrders.length
    }, { status: 200 })

  } catch (error) {
    console.error('[Packer Queue] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packing queue' },
      { status: 500 }
    )
  }
}
