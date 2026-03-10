import { NextRequest, NextResponse } from 'next/server'

/**
 * Team Leader Access Control Middleware
 * Enforces channel-based and role-based access control
 */

export interface TeamLeaderContext {
  userId: string
  channel: string
  role: 'admin' | 'operations' | 'team_leader'
}

/**
 * Extract team leader context from request headers
 * Requirements: 9.2, 9.4
 */
export function getTeamLeaderContext(request: NextRequest): TeamLeaderContext | null {
  try {
    const userId = request.headers.get('x-team-leader-user-id')
    const channel = request.headers.get('x-team-leader-channel')
    const role = request.headers.get('x-team-leader-role') as any

    if (!userId || !channel || !role) {
      return null
    }

    return { userId, channel, role }
  } catch (error) {
    console.error('[Team Leader Middleware] Error extracting context:', error)
    return null
  }
}

/**
 * Require team leader authentication
 * Requirements: 1.6, 9.4
 */
export function requireTeamLeaderAuth(request: NextRequest): TeamLeaderContext | NextResponse {
  const context = getTeamLeaderContext(request)
  
  if (!context) {
    return NextResponse.json(
      { error: 'Unauthorized - authentication required' },
      { status: 401 }
    )
  }

  return context
}

/**
 * Require specific channel access
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */
export function requireChannelAccess(
  request: NextRequest,
  requiredChannel: string
): TeamLeaderContext | NextResponse {
  const authResult = requireTeamLeaderAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const context = authResult as TeamLeaderContext

  // Admin can access all channels
  if (context.role === 'admin') {
    return context
  }

  // Team leaders can only access their assigned channel
  if (context.channel !== requiredChannel) {
    return NextResponse.json(
      { error: 'Forbidden - channel access denied' },
      { status: 403 }
    )
  }

  return context
}

/**
 * Require admin role
 * Requirements: 10.2, 10.3, 10.4, 10.5
 */
export function requireAdminRole(request: NextRequest): TeamLeaderContext | NextResponse {
  const authResult = requireTeamLeaderAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const context = authResult as TeamLeaderContext

  if (context.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - admin role required' },
      { status: 403 }
    )
  }

  return context
}

/**
 * Require team leader role
 * Requirements: 10.1, 10.2
 */
export function requireTeamLeaderRole(request: NextRequest): TeamLeaderContext | NextResponse {
  const authResult = requireTeamLeaderAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const context = authResult as TeamLeaderContext

  if (context.role !== 'team_leader' && context.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - team leader role required' },
      { status: 403 }
    )
  }

  return context
}

/**
 * Require specific role
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export function requireRole(
  request: NextRequest,
  allowedRoles: Array<'admin' | 'operations' | 'team_leader'>
): TeamLeaderContext | NextResponse {
  const authResult = requireTeamLeaderAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const context = authResult as TeamLeaderContext

  if (!allowedRoles.includes(context.role)) {
    return NextResponse.json(
      { error: 'Forbidden - insufficient permissions' },
      { status: 403 }
    )
  }

  return context
}
