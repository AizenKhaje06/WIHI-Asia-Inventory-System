import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/packer/history
 * Get packed orders history
 */
export async function GET(request: NextRequest) {
  try {
    // Query packed orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('status', 'Packed')
      .not('packed_at', 'is', null)
      .order('packed_at', { ascending: false })
      .limit(100)

    if (ordersError) {
      console.error('[Packer History] Query error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch packed history' },
        { status: 500 }
      )
    }

    // Transform orders
    const transformedOrders = orders?.map((order: any) => ({
      id: order.id,
      waybill: order.waybill || order.id,
      itemName: order.product || 'N/A',
      quantity: order.qty || 0,
      packedAt: order.packed_at,
      packedBy: order.packed_by || 'Unknown'
    })) || []

    return NextResponse.json({
      success: true,
      history: transformedOrders,
      count: transformedOrders.length
    }, { status: 200 })

  } catch (error) {
    console.error('[Packer History] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packed history' },
      { status: 500 }
    )
  }
}
