import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

/**
 * Unified Login API - Auto-detects user role and authenticates
 * Supports: Admin, Operations, Logistics (Admin/Packer/Tracker), Dept-Manager
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberDevice } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      )
    }

    // 1. Check if it's a regular account (Admin, Logistics, Dept-Manager)
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (account && !accountError) {
      // Account found - return based on role
      const userRole = account.role
      
      // Determine redirect path based on role
      let redirectPath = '/dashboard'
      if (userRole === 'logistics-admin') {
        redirectPath = '/logistics/dashboard'
      } else if (userRole === 'packer') {
        redirectPath = '/packer/dashboard'
      } else if (userRole === 'tracker') {
        redirectPath = '/tracker/dashboard'
      } else if (userRole === 'dept-manager' || userRole === 'operations') {
        redirectPath = '/dashboard/operations'
      }

      return NextResponse.json({
        success: true,
        user: {
          username: account.username,
          role: userRole,
          displayName: account.display_name || account.username,
          profileImage: account.profile_image || null,
          email: account.email || '',
          phone: account.phone || '',
          assignedChannel: account.assigned_channel || null
        },
        redirectPath,
        rememberDevice
      })
    }

    // 2. Check if it's a department account (Operations)
    const { data: department, error: deptError } = await supabaseAdmin
      .from('departments')
      .select('*')
      .eq('name', username)
      .eq('password', password)
      .single()

    if (department && !deptError) {
      // Department account found
      return NextResponse.json({
        success: true,
        user: {
          username: department.name,
          role: 'operations',
          displayName: department.display_name || department.name,
          profileImage: department.profile_image || null,
          email: '',
          phone: '',
          assignedChannel: department.assigned_channel || null
        },
        redirectPath: '/dashboard/operations',
        rememberDevice
      })
    }

    // 3. No match found - invalid credentials
    return NextResponse.json(
      { success: false, error: "Invalid username or password" },
      { status: 401 }
    )

  } catch (error) {
    console.error('[Unified Login] Error:', error)
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    )
  }
}
