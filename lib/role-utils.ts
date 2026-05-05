/**
 * Role utility functions
 * Simple wrappers around lib/auth.ts for backward compatibility
 */

import { getCurrentUser, type UserRole } from './auth'

/**
 * Get current user's role
 * Returns null if no user is logged in
 */
export function getCurrentUserRole(): UserRole | null {
  const user = getCurrentUser()
  return user?.role || null
}

/**
 * Get auth headers for API requests
 * Note: Team leader role has been removed, this now returns empty object
 * Kept for backward compatibility with existing code
 */
export function getAuthHeaders(): Record<string, string> {
  // Team leader auth headers removed - role no longer exists
  // This function is kept for backward compatibility but returns empty object
  return {}
}
