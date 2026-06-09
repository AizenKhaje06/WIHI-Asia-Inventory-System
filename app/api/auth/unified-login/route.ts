import { NextRequest, NextResponse } from "next/server"
import { validateCredentials } from "@/lib/supabase-db"
import { createSession } from "@/lib/session-manager"

/**
 * Unified Login API - Auto-detects user role and authenticates
 * Supports: Admin, Operations, Logistics (Admin/Packer/Tracker), Dept-Manager
 * 
 * All users (including operations/departments) are stored in the users table
 * 
 * Security: Single-device login - only one active session per account
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberDevice } = await request.json()

    console.log('[Unified Login] Login attempt:', { username })

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Validate credentials using SQLite-compatible function
    console.log('[Unified Login] Validating credentials...')
    const account = await validateCredentials(username, password)
    
    if (!account) {
      console.log('[Unified Login] Login failed: Invalid credentials')
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      )
    }

    console.log('[Unified Login] Account found:', { username: account.username, role: account.role })
    
    // Create new session (invalidates any existing sessions on other devices)
    console.log('[Unified Login] Creating new session...')
    const sessionId = await createSession(username)
    console.log('[Unified Login] Session created:', sessionId.substring(0, 8) + '...')
    
    const userRole = account.role
    
    // Determine redirect path based on role
    let redirectPath = '/dashboard'
    if (userRole === 'logistics-admin') {
      redirectPath = '/logistics/dashboard'
    } else if (userRole === 'packer') {
      redirectPath = '/packer/dashboard'
    } else if (userRole === 'tracker') {
      redirectPath = '/tracker/dashboard'
    } else if (userRole === 'dept-manager') {
      redirectPath = '/dashboard/operations'
    } else if (userRole === 'operations') {
      redirectPath = '/dashboard/operations'
    }

    console.log('[Unified Login] Login successful, redirecting to:', redirectPath)
    return NextResponse.json({
      success: true,
      sessionId, // Return session ID to store in client
      user: {
        username: account.username,
        role: userRole,
        displayName: account.displayName || account.username,
        profileImage: account.profileImage || null,
        email: account.email || '',
        phone: account.phone || '',
        assignedChannel: account.assignedChannel || null
      },
      redirectPath,
      rememberDevice
    })

  } catch (error) {
    console.error('[Unified Login] Error:', error)
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    )
  }
}
