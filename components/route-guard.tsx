"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser, hasPermission, getDefaultRoute } from '@/lib/auth'

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [redirectCount, setRedirectCount] = useState(0)

  useEffect(() => {
    // Prevent infinite redirect loops
    if (redirectCount > 3) {
      console.error('[RouteGuard] Too many redirects, stopping')
      setIsChecking(false)
      setIsAuthorized(false)
      return
    }

    // Check auth on mount and when pathname changes
    const checkAuth = () => {
      console.log('[RouteGuard] Starting auth check for:', pathname)
      
      // Always allow login page
      if (pathname === '/') {
        console.log('[RouteGuard] Login page - allowing access')
        setIsAuthorized(true)
        setIsChecking(false)
        setRedirectCount(0) // Reset counter on login page
        return
      }

      // CHECK FOR LOGOUT PARAMETER - if present, force redirect to login
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const logoutParam = urlParams.get('logout')
        
        if (logoutParam) {
          console.log('[RouteGuard] LOGOUT DETECTED - forcing redirect to login')
          setIsAuthorized(false)
          setIsChecking(false)
          setRedirectCount(prev => prev + 1)
          router.replace('/')
          return
        }
      }

      const user = getCurrentUser()
      console.log('[RouteGuard] User:', user)

      // If not logged in and not on login page, redirect to login
      if (!user) {
        console.log('[RouteGuard] No user found, redirecting to login')
        setIsAuthorized(false)
        setIsChecking(false)
        setRedirectCount(prev => prev + 1)
        router.replace('/')
        return
      }

      // Check if user has permission to access current route
      const hasAccess = hasPermission(user.role, pathname)
      console.log('[RouteGuard] Permission check:', {
        role: user.role,
        pathname,
        hasAccess
      })
      
      if (!hasAccess) {
        const defaultRoute = getDefaultRoute(user.role)
        console.log('[RouteGuard] NO PERMISSION! Redirecting to:', defaultRoute)
        setIsAuthorized(false)
        setIsChecking(false)
        setRedirectCount(prev => prev + 1)
        router.replace(defaultRoute)
        return
      }
      
      console.log('[RouteGuard] Access granted!')
      setIsAuthorized(true)
      setIsChecking(false)
      setRedirectCount(0) // Reset counter on successful auth
    }

    // Reset state when pathname changes
    setIsChecking(true)
    setIsAuthorized(false)

    // Run immediately on client side
    if (typeof window !== 'undefined') {
      checkAuth()
    }
  }, [pathname, router, redirectCount])

  // Show loading spinner while checking (prevents 404)
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Only render children if authorized
  if (!isAuthorized && pathname !== '/') {
    return null
  }

  return <>{children}</>
}
