import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminRole } from '@/lib/team-leader-middleware'
import * as bcrypt from 'bcryptjs'

/**
 * GET /api/admin/staff
 * Get all staff members grouped by channel
 * 
 * Requirements: 2.6
 */
export const GET = async (request: NextRequest) => {
  try {
    const authResult = requireAdminRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Query all team leaders
    const { data: staff, error } = await supabaseAdmin
      .from('users')
      .select('id, username, display_name, email, role, assigned_channel, created_at')
      .eq('role', 'team_leader')
      .order('assigned_channel', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[Get Staff] Query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      )
    }

    // Group by channel
    const groupedByChannel: Record<string, any[]> = {}
    staff?.forEach((member: any) => {
      const channel = member.assigned_channel || 'Unassigned'
      if (!groupedByChannel[channel]) {
        groupedByChannel[channel] = []
      }
      groupedByChannel[channel].push({
        id: member.id,
        name: member.display_name || member.username,
        username: member.username,
        email: member.email,
        channel: member.assigned_channel,
        role: member.role,
        createdAt: member.created_at
      })
    })

    return NextResponse.json({
      success: true,
      staff: groupedByChannel
    }, { status: 200 })

  } catch (error) {
    console.error('[Get Staff] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/staff
 * Add new staff member
 * 
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */
export const POST = async (request: NextRequest) => {
  try {
    const authResult = requireAdminRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { staffName, assignedChannel, password } = body

    // Validate required fields
    if (!staffName || typeof staffName !== 'string' || staffName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Staff name is required' },
        { status: 400 }
      )
    }

    if (!assignedChannel || typeof assignedChannel !== 'string' || assignedChannel.trim().length === 0) {
      return NextResponse.json(
        { error: 'Assigned channel is required' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Generate unique username from staff name
    const username = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Hash password
    let hashedPassword: string
    try {
      hashedPassword = await bcrypt.hash(password, 10)
    } catch (bcryptError) {
      console.error('[Add Staff] Bcrypt error:', bcryptError)
      hashedPassword = password
    }

    // Create user record
    const { data: newStaff, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        username: username,
        display_name: staffName,
        password: hashedPassword,
        role: 'team_leader',
        assigned_channel: assignedChannel,
        email: null,
        phone: null
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Add Staff] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: newStaff.id,
        name: newStaff.display_name,
        username: newStaff.username,
        channel: newStaff.assigned_channel,
        role: newStaff.role,
        createdAt: newStaff.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('[Add Staff] Error:', error)
    return NextResponse.json(
      { error: 'Failed to add staff member' },
      { status: 500 }
    )
  }
}
