import { NextResponse } from 'next/server'

/**
 * Logout API Endpoint
 * Clears all session data and returns success
 */
export async function POST() {
  try {
    // Create response with success message
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    })

    // Clear all possible cookies (if any are set)
    response.cookies.delete('session')
    response.cookies.delete('token')
    response.cookies.delete('auth')

    return response
  } catch (error) {
    console.error('[Logout API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
