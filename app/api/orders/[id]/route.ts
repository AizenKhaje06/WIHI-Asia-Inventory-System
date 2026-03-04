import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PATCH /api/orders/[id] - Update order details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      customer_name,
      customer_contact,
      customer_address,
      courier,
      waybill,
      dispatch_notes,
      total
    } = body

    const { data, error } = await supabase
      .from('orders')
      .update({
        customer_name,
        customer_contact,
        customer_address,
        courier,
        waybill,
        dispatch_notes,
        total,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[API] Error updating order:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
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

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[API] Error deleting order:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' })
  } catch (error: any) {
    console.error('[API] Error in DELETE /api/orders/[id]:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to delete order',
      details: error.toString()
    }, { status: 500 })
  }
}
