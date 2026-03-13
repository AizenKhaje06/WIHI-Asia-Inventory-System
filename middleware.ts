import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/api/auth/login',
    '/api/auth/team-leader-login',
    '/api/auth/channels',
    '/api/auth/forgot-password'
  ]
  
  // Skip middleware for public routes, API routes, and static files
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/public/') ||
    pathname.includes('.')  // Skip files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  // Note: Actual session validation happens client-side via RouteGuard
  // This middleware just ensures proper routing structure and allows all routes through
  // The RouteGuard component will handle the actual authentication check
  
  const response = NextResponse.next()
  
  // Add cache control headers to prevent caching of protected pages
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
