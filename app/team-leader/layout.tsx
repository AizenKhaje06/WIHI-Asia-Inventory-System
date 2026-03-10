'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { LayoutDashboard, ShoppingCart, Package, Truck, AlertTriangle, Settings, LogOut, Menu, X } from 'lucide-react'
import { getTeamLeaderSession, clearTeamLeaderSession, isTeamLeaderAuthenticated } from '@/lib/team-leader-auth'
import { toast } from 'sonner'
import Link from 'next/link'

/**
 * Team Leader Layout
 * Requirements: 18.1, 18.2, 18.3
 */
export default function TeamLeaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [session, setSession] = useState(getTeamLeaderSession())

  // Check authentication
  useEffect(() => {
    if (!isTeamLeaderAuthenticated()) {
      router.push('/team-leader-login')
    } else {
      setSession(getTeamLeaderSession())
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/team-leader-logout', {
        method: 'POST'
      })

      clearTeamLeaderSession()
      localStorage.removeItem('x-team-leader-user-id')
      localStorage.removeItem('x-team-leader-channel')
      localStorage.removeItem('x-team-leader-role')

      toast.success('Logged out successfully')
      router.push('/team-leader-login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const navItems = [
    { href: '/team-leader/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/team-leader/track-orders', label: 'Track Orders', icon: ShoppingCart },
    { href: '/team-leader/packing-queue', label: 'Packing Queue', icon: Package },
    { href: '/team-leader/dispatch', label: 'Dispatch', icon: Truck },
    { href: '/team-leader/inventory-alerts', label: 'Inventory Alerts', icon: AlertTriangle },
    { href: '/team-leader/settings', label: 'Settings', icon: Settings }
  ]

  const isActive = (href: string) => pathname === href

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Team Leader</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">{session.assignedChannel}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Welcome, <span className="font-semibold text-slate-900 dark:text-white">{session.displayName}</span>
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
