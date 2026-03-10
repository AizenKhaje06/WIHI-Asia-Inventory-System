/**
 * Team Leader Authentication & Authorization
 * Handles session management and access control for team leaders
 */

export interface TeamLeaderSession {
  userId: string
  username: string
  displayName: string
  email: string
  role: 'admin' | 'operations' | 'team_leader'
  assignedChannel: string
  timestamp: number
}

/**
 * Get team leader session from localStorage
 * Requirements: 1.6, 9.4
 */
export function getTeamLeaderSession(): TeamLeaderSession | null {
  try {
    if (typeof window === 'undefined') return null
    
    const sessionData = localStorage.getItem('teamLeaderSession')
    if (!sessionData) return null
    
    return JSON.parse(sessionData) as TeamLeaderSession
  } catch (error) {
    console.error('[Team Leader Auth] Error reading session:', error)
    return null
  }
}

/**
 * Set team leader session in localStorage
 * Requirements: 1.6
 */
export function setTeamLeaderSession(session: TeamLeaderSession): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem('teamLeaderSession', JSON.stringify(session))
  } catch (error) {
    console.error('[Team Leader Auth] Error setting session:', error)
  }
}

/**
 * Clear team leader session
 * Requirements: 9.5
 */
export function clearTeamLeaderSession(): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem('teamLeaderSession')
  } catch (error) {
    console.error('[Team Leader Auth] Error clearing session:', error)
  }
}

/**
 * Check if user is authenticated
 * Requirements: 9.4
 */
export function isTeamLeaderAuthenticated(): boolean {
  return getTeamLeaderSession() !== null
}

/**
 * Get user's assigned channel
 * Requirements: 9.2, 9.4
 */
export function getAssignedChannel(): string | null {
  const session = getTeamLeaderSession()
  return session?.assignedChannel || null
}

/**
 * Check if user has specific role
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export function hasRole(requiredRole: 'admin' | 'operations' | 'team_leader'): boolean {
  const session = getTeamLeaderSession()
  if (!session) return false
  return session.role === requiredRole
}

/**
 * Check if user is admin
 * Requirements: 10.5
 */
export function isAdmin(): boolean {
  return hasRole('admin')
}

/**
 * Check if user is team leader
 * Requirements: 10.1
 */
export function isTeamLeader(): boolean {
  return hasRole('team_leader')
}

/**
 * Verify channel access - ensure user can only access their assigned channel
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */
export function canAccessChannel(requestedChannel: string): boolean {
  const session = getTeamLeaderSession()
  if (!session) return false
  
  // Admin can access all channels
  if (session.role === 'admin') return true
  
  // Team leaders can only access their assigned channel
  return session.assignedChannel === requestedChannel
}

/**
 * Get authorization headers for API requests
 * Requirements: 1.6, 9.4
 */
export function getAuthHeaders(): Record<string, string> {
  const session = getTeamLeaderSession()
  if (!session) return {}
  
  return {
    'x-team-leader-user-id': session.userId,
    'x-team-leader-channel': session.assignedChannel,
    'x-team-leader-role': session.role
  }
}
