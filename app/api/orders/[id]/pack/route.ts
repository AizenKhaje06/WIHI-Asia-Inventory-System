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
