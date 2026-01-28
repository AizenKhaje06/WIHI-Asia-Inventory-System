"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser, hasPermission, getDefaultRoute } from '@/lib/auth'

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const user = getCurrentUser()

    // If not logged in and not on login page, redirect to login
    if (!user && pathname !== '/') {
      router.push('/')
      return
    }

    // If logged in and on login page, redirect to dashboard
    if (user && pathname === '/') {
      const defaultRoute = getDefaultRoute(user.role)
      router.push(defaultRoute)
      return
    }

    // Check if user has permission to access current route
    if (user && pathname !== '/' && !hasPermission(user.role, pathname)) {
      // Redirect to default route for their role
      const defaultRoute = getDefaultRoute(user.role)
      router.push(defaultRoute)
      return
    }
  }, [pathname, router])

  return <>{children}</>
}
