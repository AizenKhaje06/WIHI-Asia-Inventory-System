import { NextRequest, NextResponse } from "next/server"
import { validateSession, updateActivity } from "@/lib/session-manager"

/**
 * Session Validation API
 * 
 * Checks if the user's current session is still valid.
 * Returns 401 if session is invalid (user logged in elsewhere).
 */
export async function POST(request: NextRequest) {
  try {
    const { username, sessionId } = await request.json()

    if (!username || !sessionId) {
      return NextResponse.json(
        { valid: false, error: "Missing credentials" },
        { status: 400 }
      )
    }

    // Validate session
    const isValid = await validateSession(username, sessionId)

    if (!isValid) {
      console.log('[Session Validator] Invalid session for:', username)
      return NextResponse.json(
        { 
          valid: false, 
          error: "Session invalid. You may have logged in on another device.",
          shouldLogout: true
        },
        { status: 401 }
      )
    }

    // Update last activity
    await updateActivity(username)

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('[Session Validator] Error:', error)
    return NextResponse.json(
      { valid: false, error: "Validation failed" },
      { status: 500 }
    )
  }
}
