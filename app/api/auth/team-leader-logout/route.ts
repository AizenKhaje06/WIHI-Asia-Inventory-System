import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/team-leader-logout
 * Team leader logout - clear session
 * 
 * Requirements: 9.5
 */
export const POST = async (request: NextRequest) => {
  try {
    // Clear session by returning success response
    // Client will handle clearing localStorage/cookies
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('[Team Leader Logout] Error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
