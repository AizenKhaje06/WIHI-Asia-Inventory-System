/**
 * API Authentication Middleware
 * 
 * Protects API routes from unauthorized access
 * Validates user sessions and enforces role-based access control
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasPermission, type UserRole } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    username: string
    role: UserRole
    displayName: string
  }
}

/**
 * Authentication error responses
 */
export const AuthErrors = {
  UNAUTHORIZED: NextResponse.json(
    { error: 'Unauthorized - Please login' },
    { status: 401 }
  ),
  FORBIDDEN: NextResponse.json(
    { error: 'Forbidden - Insufficient permissions' },
    { status: 403 }
  ),
  INVALID_SESSION: NextResponse.json(
    { error: 'Invalid or expired session' },
    { status: 401 }
  ),
}

/**
 * Check if user is authenticated
 * This reads from the request headers (set by client)
 */
export function getAuthUser(request: NextRequest): { username: string; role: UserRole; displayName: string } | null {
  try {
    // Get auth headers sent by client
    const username = request.headers.get('x-user-username')
    const role = request.headers.get('x-user-role') as UserRole
    const displayName = request.headers.get('x-user-display-name')

    if (!username || !role) {
      return null
    }

    return { username, role, displayName: displayName || username }
  } catch (error) {
    console.error('[API Auth] Error reading auth headers:', error)
    return null
  }
}

/**
 * Require authentication for API route
 * Returns user if authenticated, otherwise returns error response
 */
export function requireAuth(request: NextRequest): 
  { user: { username: string; role: UserRole; displayName: string } } | NextResponse {
  
  const user = getAuthUser(request)
  
  if (!user) {
    return AuthErrors.UNAUTHORIZED
  }

  return { user }
}

/**
 * Require specific role for API route
 * Returns user if authorized, otherwise returns error response
 */
export function requireRole(request: NextRequest, allowedRoles: UserRole[]): 
  { user: { username: string; role: UserRole; displayName: string } } | NextResponse {
  
  const authResult = requireAuth(request)
  
  // If already an error response, return it
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    return AuthErrors.FORBIDDEN
  }

  return { user }
}

/**
 * Require admin role for API route
 * Convenience function for admin-only routes
 */
export function requireAdmin(request: NextRequest): 
  { user: { username: string; role: UserRole; displayName: string } } | NextResponse {
  
  return requireRole(request, ['admin'])
}

/**
 * Check if user has permission to access a path
 */
export function requirePermission(request: NextRequest, path: string): 
  { user: { username: string; role: UserRole; displayName: string } } | NextResponse {
  
  const authResult = requireAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (!hasPermission(user.role, path)) {
    return AuthErrors.FORBIDDEN
  }

  return { user }
}

/**
 * Middleware helper to add auth headers to requests
 * Call this from your client-side code before making API requests
 */
export function addAuthHeaders(headers: Headers = new Headers()): Headers {
  if (typeof window === 'undefined') return headers

  try {
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('userRole')
    const displayName = localStorage.getItem('displayName')

    if (username) headers.set('x-user-username', username)
    if (role) headers.set('x-user-role', role)
    if (displayName) headers.set('x-user-display-name', displayName)
  } catch (error) {
    console.error('[API Auth] Error adding auth headers:', error)
  }

  return headers
}

/**
 * Fetch wrapper that automatically adds auth headers
 * Use this instead of fetch() for authenticated API calls
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = addAuthHeaders(new Headers(options.headers))
  
  return fetch(url, {
    ...options,
    headers,
  })
}
