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
        "fixed top-0 right-0 h-16 backdrop-blur-xl border-b z-40 shadow-lg",
        reducedMotion ? "" : "transition-all duration-300",
        "lg:left-[240px] left-0",
        // Light mode
        "bg-white/95 border-slate-200",
        // Dark mode - black with cyan glow
        "dark:bg-black/95 dark:border-white/10",
        "dark:after:absolute dark:after:bottom-0 dark:after:left-0 dark:after:right-0 dark:after:h-[1px] dark:after:bg-gradient-to-r dark:after:from-transparent dark:after:via-cyan-500/50 dark:after:to-transparent"
      )}
      role="banner"
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-3 min-w-0">
        {/* Left: Mobile Menu */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg transition-colors duration-200 flex-shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg transition-colors duration-200 group flex-shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
            title={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
            aria-label={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
          >
            {!mounted ? (
              <Sun className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
            ) : theme === "dark" ? (
              <Sun className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-2 rounded-lg transition-colors duration-200 group flex-shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Notifications (2 unread)"
              >
                <Bell className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
                <span 
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card" 
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
            className="hidden md:block p-2 rounded-lg transition-colors duration-200 group flex-shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Settings"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
          </button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg transition-colors duration-200 group flex-shrink-0 hover:bg-accent"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0 from-blue-600 to-blue-700 dark:from-cyan-500 dark:to-cyan-600 dark:shadow-cyan-500/30" aria-hidden="true">
                  <User className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="hidden xl:block text-left min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">Admin User</p>
                  <p className="text-xs truncate text-muted-foreground">Administrator</p>
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
                  localStorage.removeItem("isLoggedIn")
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
