"use client"

import React, { useState } from "react"
import { Bell, Settings, User, Moon, Sun, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-accessibility"
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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const reducedMotion = useReducedMotion()

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header
      className={cn(
        "fixed z-40",
        reducedMotion ? "" : "transition-all duration-300",
        // Desktop: clean minimal header - adjust based on sidebar
        sidebarCollapsed ? "lg:left-20" : "lg:left-64",
        "lg:right-0 lg:top-0 lg:h-16",
        // Mobile: full width at top
        "left-0 right-0 top-0 h-16",
        // Fully transparent - invisible background
        "bg-transparent"
      )}
      role="banner"
    >
      <div className="h-full px-6 lg:px-8 flex items-center justify-between gap-6 min-w-0">
        {/* Left: Mobile Menu only (brand is in sidebar on desktop) */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg transition-colors flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Center: Breathing space (intentionally empty) */}
        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg transition-colors flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
            aria-label={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
          >
            {!mounted ? (
              <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-2 rounded-lg transition-colors flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Notifications (2 unread)"
              >
                <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                <span 
                  className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-[#0a0a0a]" 
                  aria-hidden="true" 
                />
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

          {/* Settings */}
          <button
            onClick={() => window.location.href = '/dashboard/settings'}
            className="hidden md:block p-2 rounded-lg transition-colors flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Settings"
            aria-label="Open settings"
          >
            <Settings className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" aria-hidden="true" />

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
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Admin User</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Administrator</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => window.location.href = '/dashboard/settings'}>
                Profile Settings
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
