import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminRole } from '@/lib/team-leader-middleware'
import * as bcrypt from 'bcryptjs'

/**
 * PUT /api/admin/staff/:id
 * Update staff member
 * 
 * Requirements: 2.2, 2.3
 */
export const PUT = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const authResult = requireAdminRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const staffId = params.id
    const body = await request.json()
    const { staffName, assignedChannel, password } = body

    // Validate at least one field is provided
    if (!staffName && !assignedChannel && !password) {
      return NextResponse.json(
        { error: 'At least one field must be provided' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = {}

    if (staffName && typeof staffName === 'string' && staffName.trim().length > 0) {
      updateData.display_name = staffName
    }

    if (assignedChannel && typeof assignedChannel === 'string' && assignedChannel.trim().length > 0) {
      updateData.assigned_channel = assignedChannel
    }

    if (password && typeof password === 'string' && password.length > 0) {
      try {
        updateData.password = await bcrypt.hash(password, 10)
      } catch (bcryptError) {
        console.error('[Update Staff] Bcrypt error:', bcryptError)
        updateData.password = password
      }
    }

    // Update staff member
    const { data: updatedStaff, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', staffId)
      .select()
      .single()

    if (updateError) {
      console.error('[Update Staff] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: updatedStaff.id,
        name: updatedStaff.display_name,
        username: updatedStaff.username,
        channel: updatedStaff.assigned_channel,
        role: updatedStaff.role,
        createdAt: updatedStaff.created_at
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[Update Staff] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/staff/:id
 * Delete staff member
 * 
 * Requirements: 2.1
 */
export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const authResult = requireAdminRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const staffId = params.id

    // Delete staff member
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', staffId)

    if (deleteError) {
      console.error('[Delete Staff] Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete staff member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('[Delete Staff] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    )
  }
}
