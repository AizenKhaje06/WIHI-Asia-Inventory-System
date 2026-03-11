import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * PUT /api/packer/pack/[id]
 * Mark order as packed
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { packedBy } = body

    if (!packedBy) {
      return NextResponse.json(
        { error: 'Packer name is required' },
        { status: 400 }
      )
    }

    // Update order status
    const { data: order, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'Packed',
        packed_by: packedBy,
        packed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[Pack Order] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to pack order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order
    }, { status: 200 })

  } catch (error) {
    console.error('[Pack Order] Error:', error)
    return NextResponse.json(
      { error: 'Failed to pack order' },
      { status: 500 }
    )
  }
}
