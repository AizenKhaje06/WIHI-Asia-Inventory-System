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

    // Update order status
    const { data: order, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'Packed',
        packed_by: packedBy,
        packed_at: packedAt
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
