import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as bcrypt from 'bcryptjs'

/**
 * POST /api/auth/team-leader-change-password
 * Team leader password change
 * 
 * Requirements: 3.2, 3.3, 3.4, 3.5
 */
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { userId, currentPassword, newPassword } = body

    // Validate input
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    // Validate new password length (minimum 8 characters)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Query user
    const { data: user, error: queryError } = await supabaseAdmin
      .from('users')
      .select('id, password')
      .eq('id', userId)
      .single()

    if (queryError || !user) {
      console.log('[Change Password] User not found:', userId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    let passwordMatch = false
    try {
      passwordMatch = await bcrypt.compare(currentPassword, user.password)
    } catch (bcryptError) {
      console.error('[Change Password] Bcrypt error:', bcryptError)
      // Fallback to plain text comparison
      passwordMatch = currentPassword === user.password
    }

    if (!passwordMatch) {
      console.log('[Change Password] Invalid current password for user:', userId)
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash new password
    let hashedPassword: string
    try {
      hashedPassword = await bcrypt.hash(newPassword, 10)
    } catch (bcryptError) {
      console.error('[Change Password] Bcrypt hash error:', bcryptError)
      // Fallback to plain text storage
      hashedPassword = newPassword
    }

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId)

    if (updateError) {
      console.error('[Change Password] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('[Change Password] Error:', error)
    return NextResponse.json(
      { error: 'Password change failed' },
      { status: 500 }
    )
  }
}
