"use client"

import React, { useState } from "react"
import { Bell, Settings, User, Menu, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-accessibility"
import { CommandPaletteSearch } from "@/components/command-palette-search"
import { getCurrentUser } from "@/lib/auth"
import { ToggleTheme } from "@/components/ui/toggle-theme"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PremiumNavbarProps {
  sidebarCollapsed?: boolean
  onMenuClick?: () => void
  onMobileMenuToggle?: () => void
}

export function PremiumNavbar({ sidebarCollapsed, onMenuClick, onMobileMenuToggle }: PremiumNavbarProps) {
  const [username, setUsername] = useState("Admin User")
  const [userRole, setUserRole] = useState("Administrator")
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(null)
  const reducedMotion = useReducedMotion()
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  // Get current user only on client side to avoid hydration errors
  React.useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  // Get user info from localStorage
  React.useEffect(() => {
    setCurrentUser(getCurrentUser())
    
    if (typeof window !== 'undefined') {
      try {
        const storedUsername = localStorage.getItem("username")
        const storedRole = localStorage.getItem("userRole")
        const displayName = localStorage.getItem("displayName")
        
        if (storedUsername) {
          setUsername(displayName || storedUsername)
        }
        if (storedRole) {
          setUserRole(storedRole === "admin" ? "Administrator" : "Staff")
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error)
      }
    }
  }, [])

  // Update time and date every second
  React.useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
      const dateString = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
      setCurrentTime(timeString)
      setCurrentDate(dateString)
    }
    
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header
      className={cn(
        "fixed z-40",
        reducedMotion ? "" : "transition-all duration-300",
        // Desktop: full width header starting from sidebar edge
        sidebarCollapsed ? "lg:left-14 xl:lg:left-16" : "lg:left-48 xl:lg:left-52",
        "lg:right-0 lg:top-0 lg:h-14",
        // Mobile: full width at top
        "left-0 right-0 top-0 h-14",
        // White background with border like packer
        "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
      )}
      role="banner"
    >
      <div className="h-full px-6 lg:px-8 flex items-center justify-between gap-4 min-w-0">
        {/* Left: Mobile Menu + Supabase Link */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg transition-colors flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Supabase Link - Desktop Only - Admin Only */}
          {currentUser?.role === 'admin' && (
            <a
              href="https://supabase.com/dashboard/project/rsvzbmhuckwndvqfhzml/editor/22406?schema=public"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center justify-center p-2 rounded-lg transition-all hover:opacity-80 hover:scale-105 flex-shrink-0"
              aria-label="Open Supabase Table Editor"
              title="Open Supabase Table Editor"
            >
              {/* Light Mode */}
              <img
                src="/supabase-logo-wordmark--light.png"
                alt="Supabase"
                className="h-4 w-auto object-contain dark:hidden"
              />
              {/* Dark Mode */}
              <img
                src="/supabase-logo-wordmark--dark.png"
                alt="Supabase"
                className="h-4 w-auto object-contain hidden dark:block"
              />
            </a>
          )}

          {/* Resend Link - Desktop Only - Admin Only */}
          {currentUser?.role === 'admin' && (
            <a
              href="https://resend.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center justify-center p-2 rounded-lg transition-all hover:opacity-80 hover:scale-105 flex-shrink-0"
              aria-label="Open Resend API Keys"
              title="Open Resend API Keys"
            >
              {/* Light Mode - use black */}
              <img
                src="/resend-wordmark-black.png"
                alt="Resend"
                className="h-3.5 w-auto object-contain dark:hidden"
              />
              {/* Dark Mode - use white */}
              <img
                src="/resend-wordmark-white.png"
                alt="Resend"
                className="h-3.5 w-auto object-contain hidden dark:block"
              />
            </a>
          )}
        </div>

        {/* Center: Date and Time - Horizontal Layout */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 absolute left-1/2 -translate-x-1/2">
          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            {currentDate}
          </span>
          <span className="text-slate-400 dark:text-slate-500">•</span>
          <span className="text-sm text-slate-900 dark:text-white font-semibold tabular-nums">
            {currentTime}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 flex-shrink-0 flex-1 justify-end">

          {/* Theme Toggle */}
          <ToggleTheme 
            duration={600}
            animationType="flip-x-in"
            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-2 rounded-lg transition-colors flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Notifications (2 unread)"
              >
                <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                <span 
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" 
                  aria-hidden="true"
                >
                  2
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-2">
                <div className="px-2 py-3 rounded-md cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <p className="text-sm font-medium">Low Stock Alert</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">5 items are running low on stock</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 minutes ago</p>
                </div>
                <div className="px-2 py-3 rounded-md cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <p className="text-sm font-medium">New Order</p>
                  <p className="text-xs text-muted-foreground mt-1">Order #1234 has been placed</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">15 minutes ago</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" aria-hidden="true" />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <User className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <div className="hidden xl:block text-left min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userRole}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => window.location.href = '/dashboard/settings'}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => window.location.href = '/dashboard/settings'}>
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => window.open('https://support.example.com', '_blank')}>
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onSelect={() => {
                  if (typeof window !== 'undefined') {
                    try {
                      localStorage.removeItem("isLoggedIn")
                      localStorage.removeItem("username")
                      localStorage.removeItem("userRole")
                      localStorage.removeItem("displayName")
                    } catch (error) {
                      console.error('Error clearing localStorage:', error)
                    }
                  }
                  window.location.href = "/"
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
