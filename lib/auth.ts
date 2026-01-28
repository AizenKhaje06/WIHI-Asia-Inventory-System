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

// Page permissions per role
export const ROLE_PERMISSIONS = {
  admin: [
    '/dashboard',
    '/dashboard/analytics',
    '/dashboard/sales',
    '/dashboard/customers',
    '/dashboard/reports',
    '/dashboard/insights',
    '/dashboard/inventory',
    '/dashboard/inventory/create',
    '/dashboard/inventory/low-stock',
    '/dashboard/inventory/out-of-stock',
    '/dashboard/pos',
    '/dashboard/settings',
    '/dashboard/log'
  ],
  operations: [
    '/dashboard/operations',
    '/dashboard/pos',
    '/dashboard/inventory',
    '/dashboard/inventory/create',
    '/dashboard/inventory/low-stock',
    '/dashboard/inventory/out-of-stock',
    '/dashboard/customers'
  ]
} as const

// Default passwords per role
export const DEFAULT_PASSWORDS: Record<UserRole, string> = {
  admin: 'admin123',
  operations: 'ops456'
}

// Auth helpers
export function hasPermission(role: UserRole, path: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  
  // Check for exact match
  return permissions.includes(path as any)
}

export function getDefaultRoute(role: UserRole): string {
  if (role === 'operations') {
    return '/dashboard/operations'
  }
  return '/dashboard'
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  const username = localStorage.getItem('username')
  const role = localStorage.getItem('userRole') as UserRole
  const displayName = localStorage.getItem('displayName')
  
  if (isLoggedIn === 'true' && username && role) {
    return { username, role, displayName: displayName || username }
  }
  
  return null
}

export function setCurrentUser(user: User): void {
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('username', user.username)
  localStorage.setItem('userRole', user.role)
  localStorage.setItem('displayName', user.displayName)
}

export function validateRolePassword(role: UserRole, password: string): boolean {
  // Check custom stored password first
  const storedPassword = localStorage.getItem(`${role}Password`)
  if (storedPassword) {
    return password === storedPassword
  }
  // Fall back to default password
  return password === DEFAULT_PASSWORDS[role]
}

export function clearCurrentUser(): void {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  localStorage.removeItem('userRole')
  localStorage.removeItem('displayName')
}
