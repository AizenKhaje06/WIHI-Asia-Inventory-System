/**
 * Role Detection and Authentication Utilities
 * Handles both admin and team leader authentication
 */

export type UserRole = 'admin' | 'team_leader' | 'operations' | null

export interface UserSession {
  role: UserRole
  username?: string
  displayName?: string
  channel?: string
  userId?: string
}

/**
 * Get current user's role
 */
export function getCurrentUserRole(): UserRole {
  if (typeof window === 'undefined') return null
  
  // Check if team leader
  const teamLeaderRole = localStorage.getItem('x-team-leader-role')
  if (teamLeaderRole === 'team_leader') return 'team_leader'
  
  // Check if admin/operations
  const userRole = localStorage.getItem('userRole')
  return (userRole as UserRole) || null
}

/**
 * Get current user session data
 */
export function getCurrentUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null
  
  const role = getCurrentUserRole()
  
  if (role === 'team_leader') {
    return {
      role: 'team_leader',
      userId: localStorage.getItem('x-team-leader-user-id') || undefined,
      channel: localStorage.getItem('x-team-leader-channel') || undefined,
      displayName: localStorage.getItem('x-team-leader-display-name') || undefined
    }
  }
  
  if (role === 'admin' || role === 'operations') {
    return {
      role,
      username: localStorage.getItem('username') || undefined,
      displayName: localStorage.getItem('displayName') || undefined
    }
  }
  
  return null
}

/**
 * Get authentication headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  
  const role = getCurrentUserRole()
  
  if (role === 'team_leader') {
    return {
      'x-team-leader-user-id': localStorage.getItem('x-team-leader-user-id') || '',
      'x-team-leader-channel': localStorage.getItem('x-team-leader-channel') || '',
      'x-team-leader-role': 'team_leader'
    }
  }
  
  return {
    'username': localStorage.getItem('username') || '',
    'role': localStorage.getItem('userRole') || '',
    'displayName': localStorage.getItem('displayName') || ''
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return getCurrentUserRole() === 'admin'
}

/**
 * Check if user is team leader
 */
export function isTeamLeader(): boolean {
  return getCurrentUserRole() === 'team_leader'
}

/**
 * Check if user is operations
 */
export function isOperations(): boolean {
  return getCurrentUserRole() === 'operations'
}

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(action: 'view' | 'edit' | 'delete'): boolean {
  const role = getCurrentUserRole()
  
  if (role === 'admin') return true
  if (role === 'operations') return action === 'view' || action === 'edit'
  if (role === 'team_leader') {
    // Team leaders can view and edit dispatch, but only view track orders and packing queue
    return action === 'view'
  }
  
  return false
}

/**
 * Get API endpoint based on user role
 */
export function getApiEndpoint(baseEndpoint: string): string {
  const role = getCurrentUserRole()
  
  if (role === 'team_leader') {
    // Team leader endpoints are prefixed with /team-leader
    return `/api/team-leader${baseEndpoint}`
  }
  
  // Admin and operations use regular endpoints
  return `/api${baseEndpoint}`
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  
  const role = getCurrentUserRole()
  return role !== null
}

/**
 * Logout user
 */
export function logout() {
  if (typeof window === 'undefined') return
  
  // Clear all auth data
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  localStorage.removeItem('userRole')
  localStorage.removeItem('displayName')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('x-team-leader-user-id')
  localStorage.removeItem('x-team-leader-channel')
  localStorage.removeItem('x-team-leader-role')
  localStorage.removeItem('x-team-leader-display-name')
  
  // Redirect to login
  window.location.href = '/'
}
