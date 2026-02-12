// Role-based access control system

export type UserRole = 'admin' | 'operations'

export interface User {
  username: string
  role: UserRole
  displayName: string
}

// Role definitions with better names
export const ROLES = {
  admin: {
    id: 'admin' as const,
    name: 'Administrator',
    description: 'Full system access - Analytics, Reports, Settings',
    icon: '👔'
  },
  operations: {
    id: 'operations' as const,
    name: 'Operations Staff',
    description: 'POS, Inventory, and Customer Management',
    icon: '📦'
  }
} as const

// Page permissions per role - supports wildcards for nested routes
export const ROLE_PERMISSIONS = {
  admin: [
    '/dashboard',
    '/dashboard/analytics',
    '/dashboard/sales',
    '/dashboard/sales-channels',
    '/dashboard/sales-channels/*',
    '/dashboard/customers',
    '/dashboard/reports',
    '/dashboard/insights',
    '/dashboard/inventory',
    '/dashboard/inventory/*',
    '/dashboard/pos',
    '/dashboard/internal-usage',
    '/dashboard/settings',
    '/dashboard/log'
  ],
  operations: [
    '/dashboard/operations',
    '/dashboard/pos',
    '/dashboard/internal-usage',
    '/dashboard/inventory',
    '/dashboard/inventory/*',
    '/dashboard/customers'
  ]
} as const

// Default passwords per role
export const DEFAULT_PASSWORDS: Record<UserRole, string> = {
  admin: 'admin123',
  operations: 'ops456'
}

// Auth helpers
/**
 * Check if a role has permission to access a path.
 * Supports exact matches and wildcard patterns (e.g., /dashboard/inventory/*)
 * 
 * @param role - User role to check
 * @param path - Path to validate access for
 * @returns true if role has permission, false otherwise
 */
export function hasPermission(role: UserRole, path: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  
  return permissions.some(pattern => {
    // Exact match
    if (pattern === path) return true
    
    // Wildcard match: /dashboard/inventory/* matches /dashboard/inventory/create
    if (pattern.endsWith('/*')) {
      const basePattern = pattern.slice(0, -2)
      return path.startsWith(basePattern + '/')
    }
    
    return false
  })
}

export function getDefaultRoute(role: UserRole): string {
  if (role === 'operations') {
    return '/dashboard/operations'
  }
  return '/dashboard'
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('userRole') as UserRole
    const displayName = localStorage.getItem('displayName')
    
    if (isLoggedIn === 'true' && username && role) {
      return { username, role, displayName: displayName || username }
    }
  } catch (error) {
    console.error('Error reading user from localStorage:', error)
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
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    localStorage.removeItem('displayName')
  } catch (error) {
    console.error('Error clearing user from localStorage:', error)
  }
}
