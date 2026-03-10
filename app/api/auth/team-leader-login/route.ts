import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as bcrypt from 'bcryptjs'

/**
 * POST /api/auth/team-leader-login
 * Team leader login with channel and password
 * 
 * Requirements: 1.2, 1.3, 1.6
 */
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { channel, password } = body

    // Validate input
    if (!channel || typeof channel !== 'string' || channel.trim().length === 0) {
      return NextResponse.json(
        { error: 'Channel is required' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Query users table for team leader with assigned channel
    const { data: user, error: queryError } = await supabaseAdmin
      .from('users')
      .select('id, username, display_name, email, role, assigned_channel, password')
      .eq('assigned_channel', channel)
      .eq('role', 'team_leader')
      .single()

    if (queryError || !user) {
      console.log('[Team Leader Login] User not found for channel:', channel)
      return NextResponse.json(
        { error: 'Invalid channel or credentials' },
        { status: 401 }
      )
    }

    // Verify password using bcrypt
    let passwordMatch = false
    try {
      passwordMatch = await bcrypt.compare(password, user.password)
    } catch (bcryptError) {
      console.error('[Team Leader Login] Bcrypt error:', bcryptError)
      // Fallback to plain text comparison for backward compatibility
      passwordMatch = password === user.password
    }

    if (!passwordMatch) {
      console.log('[Team Leader Login] Invalid password for user:', user.id)
      return NextResponse.json(
        { error: 'Invalid channel or credentials' },
        { status: 401 }
      )
    }

    // Create session token (simple JWT-like structure)
    const sessionData = {
      userId: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      assignedChannel: user.assigned_channel,
      timestamp: Date.now()
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        role: user.role,
        assignedChannel: user.assigned_channel
      },
      sessionData: sessionData
    }, { status: 200 })

  } catch (error) {
    console.error('[Team Leader Login] Error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
