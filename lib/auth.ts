// Role-based access control system

export type UserRole = 'admin' | 'team_leader' | 'operations' | 'packer'

export interface User {
  username: string
  role: UserRole
  displayName: string
  email?: string
  phone?: string
  sales_channel?: string
}

// Role definitions with better names
export const ROLES = {
  admin: {
    id: 'admin' as const,
    name: 'Administrator',
    description: 'Full system access - Analytics, Reports, Settings',
    icon: '👔'
  },
  team_leader: {
    id: 'team_leader' as const,
    name: 'Team Leader',
    description: 'Sales channel management, team oversight, view-only tracking',
    icon: '👨‍💼'
  },
  operations: {
    id: 'operations' as const,
    name: 'Operations Staff',
    description: 'POS, Inventory, and Customer Management',
    icon: '📦'
  },
  packer: {
    id: 'packer' as const,
    name: 'Packer',
    description: 'Packing queue and order fulfillment',
    icon: '📦'
  }
} as const

// Page permissions per role - supports wildcards for nested routes
export const ROLE_PERMISSIONS = {
  admin: [
    '/dashboard',
    '/dashboard/analytics',
    '/dashboard/sales',
    '/dashboard/sales-channels/**',
    '/dashboard/customers',
    '/dashboard/reports',
    '/dashboard/operations/transaction-history',
    '/dashboard/track-orders',
    '/dashboard/cancelled-orders',
    '/dashboard/insights',
    '/dashboard/inventory/**',
    '/dashboard/pos',
    '/dashboard/internal-usage',
    '/dashboard/settings',
    '/dashboard/log'
  ],
  team_leader: [
    '/team-leader/dashboard', // Team Leader Dashboard
    '/dashboard/pos', // Warehouse Dispatch
    '/dashboard/packing-queue', // Packing Queue
    '/dashboard/track-orders', // Track Orders
    '/dashboard/inventory/**', // All Inventory pages (Products, Low Stock, Out of Stock)
    '/dashboard/sales-channels/**', // Sales Channels
    '/dashboard/analytics', // Sales Analytics
    '/dashboard/insights', // Business Insights
    '/dashboard/customers', // Customers
    '/dashboard/internal-usage', // Internal Usage
    '/dashboard/log' // Activity Logs
    // Settings is excluded - admin only
  ],
  operations: [
    '/dashboard/operations',
    '/dashboard/pos',
    '/dashboard/operations/transaction-history',
    '/dashboard/track-orders',
    '/dashboard/inventory/**',
    '/dashboard/customers',
    '/dashboard/log',
    '/dashboard/reports'
  ],
  packer: [
    '/packer/dashboard'
  ]
} as const

// Default passwords per role
export const DEFAULT_PASSWORDS: Record<UserRole, string> = {
  admin: 'admin123',
  team_leader: 'leader456',
  operations: 'ops456',
  packer: 'pack789'
}

// Auth helpers
/**
 * Check if a role has permission to access a path.
 * Supports exact matches and wildcard patterns (e.g., /dashboard/inventory/**)
 * 
 * Pattern matching rules:
 * - Exact: /dashboard/sales matches only /dashboard/sales
 * - Wildcard: /dashboard/inventory/** matches /dashboard/inventory and all sub-routes
 * 
 * @param role - User role to check
 * @param path - Path to validate access for
 * @returns true if role has permission, false otherwise
 */
export function hasPermission(role: UserRole, path: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  
  // Normalize path (remove trailing slash)
  const normalizedPath = path.replace(/\/$/, '')
  
  return permissions.some(pattern => {
    // Normalize pattern
    const normalizedPattern = pattern.replace(/\/$/, '')
    
    // Exact match
    if (normalizedPattern === normalizedPath) return true
    
    // Wildcard match: /dashboard/inventory/** matches /dashboard/inventory/create
    if (normalizedPattern.endsWith('/**')) {
      const basePattern = normalizedPattern.slice(0, -3)
      return normalizedPath === basePattern || normalizedPath.startsWith(basePattern + '/')
    }
    
    return false
  })
}

export function getDefaultRoute(role: UserRole): string {
  if (role === 'operations') {
    return '/dashboard/operations'
  }
  if (role === 'team_leader') {
    return '/team-leader/dashboard'
  }
  if (role === 'packer') {
    return '/packer/dashboard'
  }
  return '/dashboard'
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    // Check for team leader session first
    const teamLeaderRole = localStorage.getItem('x-team-leader-role')
    if (teamLeaderRole === 'team_leader') {
      const teamLeaderSession = localStorage.getItem('teamLeaderSession')
      if (teamLeaderSession) {
        try {
          const session = JSON.parse(teamLeaderSession)
          
          // Validate session has required fields
          if (!session.userId || !session.assignedChannel) {
            console.warn('[Auth] Invalid team leader session structure, clearing...')
            clearCurrentUser()
            return null
          }
          
          // Check session expiry (24 hours)
          const sessionTimestamp = session.timestamp || 0
          const now = Date.now()
          const twentyFourHours = 24 * 60 * 60 * 1000
          
          if (now - sessionTimestamp > twentyFourHours) {
            console.warn('[Auth] Team leader session expired, clearing...')
            clearCurrentUser()
            return null
          }
          
          return {
            username: session.username,
            role: 'team_leader' as UserRole,
            displayName: session.displayName,
            email: session.email,
            sales_channel: session.assignedChannel
          }
        } catch (error) {
          console.error('[Auth] Error parsing team leader session:', error)
          clearCurrentUser()
          return null
        }
      }
    }
    
    // Check for admin/operations session
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('userRole') as UserRole
    const displayName = localStorage.getItem('displayName')
    
    if (isLoggedIn === 'true' && username && role) {
      // Validate role is valid
      if (!['admin', 'team_leader', 'operations', 'packer'].includes(role)) {
        console.warn('[Auth] Invalid role in session, clearing...')
        clearCurrentUser()
        return null
      }
      
      return { username, role, displayName: displayName || username }
    }
  } catch (error) {
    console.error('[Auth] Error reading user from localStorage:', error)
    clearCurrentUser()
  }
  
  return null
}

export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', user.username)
    localStorage.setItem('userRole', user.role)
    localStorage.setItem('displayName', user.displayName)
  } catch (error) {
    console.error('Error saving user to localStorage:', error)
  }
}

export function validateRolePassword(role: UserRole, password: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Check custom stored password first
    const storedPassword = localStorage.getItem(`${role}Password`)
    if (storedPassword) {
      return password === storedPassword
    }
    // Fall back to default password
    return password === DEFAULT_PASSWORDS[role]
  } catch (error) {
    console.error('Error validating password:', error)
    return false
  }
}

export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return
  
  try {
    // Clear admin/operations session
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    localStorage.removeItem('displayName')
    localStorage.removeItem('currentUser')
    
    // Clear team leader session
    localStorage.removeItem('teamLeaderSession')
    localStorage.removeItem('x-team-leader-user-id')
    localStorage.removeItem('x-team-leader-channel')
    localStorage.removeItem('x-team-leader-role')
  } catch (error) {
    console.error('Error clearing user from localStorage:', error)
  }
}

/**
 * Check if current user can edit tracking/packing status
 * Only admins can edit, team leaders can only view
 */
export function canEditTracking(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

/**
 * Check if current user can edit warehouse dispatch
 * Both admins and team leaders can edit
 */
export function canEditWarehouseDispatch(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin' || user?.role === 'team_leader'
}

/**
 * Check if current user is a team leader
 */
export function isTeamLeader(): boolean {
  const user = getCurrentUser()
  return user?.role === 'team_leader'
}
