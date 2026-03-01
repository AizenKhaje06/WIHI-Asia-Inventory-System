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
    
    // Update order status to Packed
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'Packed',
        packed_by: packedBy,
        packed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
