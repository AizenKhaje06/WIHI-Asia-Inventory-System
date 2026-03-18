import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all email schedules
export async function GET(request: NextRequest) {
  try {
    const { data: schedules, error } = await supabaseAdmin
      .from('email_report_schedules')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

// POST - Create new email schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipient_email, recipient_name, frequency, schedule_time, schedule_day, start_date, end_date } = body

    // Validate required fields
    if (!recipient_email || !recipient_name || !frequency || !schedule_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique ID
    const id = `SCHED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const { data, error } = await supabaseAdmin
      .from('email_report_schedules')
      .insert({
        id,
        recipient_email,
        recipient_name,
        report_type: 'track_orders',
        frequency,
        schedule_time,
        schedule_day: schedule_day || null,
        start_date: start_date || null,
        end_date: end_date || null,
        is_active: true,
        filters: {},
        created_by: 'admin'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}

// PUT - Update email schedule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, recipient_email, recipient_name, frequency, schedule_time, schedule_day, start_date, end_date, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (recipient_email !== undefined) updateData.recipient_email = recipient_email
    if (recipient_name !== undefined) updateData.recipient_name = recipient_name
    if (frequency !== undefined) updateData.frequency = frequency
    if (schedule_time !== undefined) updateData.schedule_time = schedule_time
    if (schedule_day !== undefined) updateData.schedule_day = schedule_day
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabaseAdmin
      .from('email_report_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

// DELETE - Delete email schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('email_report_schedules')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
