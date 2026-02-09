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
        "fixed z-40 backdrop-blur-xl shadow-lg",
        reducedMotion ? "" : "transition-all duration-300",
        // Desktop: floating card with margin and subtle rounded corners - adjust based on sidebar
        sidebarCollapsed ? "lg:left-[100px]" : "lg:left-[260px]",
        "lg:right-4 lg:top-4 lg:h-14 lg:rounded-[5px] lg:border",
        // Mobile: full width at top
        "left-0 right-0 top-0 h-16 border-b",
        // Light mode
        "bg-white/95 border-slate-200",
        // Dark mode - match sidebar with Material Design palette
        "dark:bg-[#1e1e1e]/95 dark:border-[#444444]"
      )}
      role="banner"
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4 min-w-0">
        {/* Left: Mobile Menu + Page Context */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-md transition-all duration-200 flex-shrink-0 text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-[#E0E0E0]"
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Page Context - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex items-center gap-3 min-w-0 flex-1">
            <div className="flex flex-col justify-center min-w-0">
              <h2 className="text-xs font-bold tracking-wide text-slate-800 dark:text-[#E0E0E0] truncate uppercase">
                Inventory Management System
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-[#999999] truncate mt-0.5">
                Real-time stock monitoring and analytics
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-md transition-all duration-200 group flex-shrink-0 text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-[#E0E0E0] active:scale-95"
            title={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
            aria-label={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
          >
            {!mounted ? (
              <Sun className="h-4.5 w-4.5 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
            ) : theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
            ) : (
              <Moon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-rotate-12" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-2.5 rounded-md transition-all duration-200 group flex-shrink-0 text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-[#E0E0E0] active:scale-95"
                aria-label="Notifications (2 unread)"
              >
                <Bell className="h-4.5 w-4.5 transition-all duration-200 group-hover:rotate-12" aria-hidden="true" />
                <span 
                  className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] animate-pulse" 
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
            className="hidden md:block p-2.5 rounded-md transition-all duration-200 group flex-shrink-0 text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-[#E0E0E0] active:scale-95"
            title="Settings"
            aria-label="Open settings"
          >
            <Settings className="h-4.5 w-4.5 transition-transform duration-200 group-hover:rotate-90" aria-hidden="true" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 dark:bg-[#444444] hidden md:block" aria-hidden="true" />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-3 pl-2 pr-3 py-2 rounded-md transition-all duration-200 group flex-shrink-0 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] active:scale-95"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center shadow-sm flex-shrink-0 from-orange-500 to-orange-600 ring-2 ring-white dark:ring-[#1e1e1e]" aria-hidden="true">
                  <User className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="hidden xl:block text-left min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-900 dark:text-[#E0E0E0]">Admin User</p>
                  <p className="text-xs truncate text-slate-500 dark:text-[#888888]">Administrator</p>
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
