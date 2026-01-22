"use client"

import React, { useState } from "react"
import { Search, Bell, Settings, User, Moon, Sun, Menu } from "lucide-react"
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
  const [searchFocused, setSearchFocused] = useState(false)
  const reducedMotion = useReducedMotion()

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 backdrop-blur-xl border-b z-40",
        reducedMotion ? "" : "transition-all duration-300",
        "lg:left-[260px] left-0"
      )}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border)',
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
      role="banner"
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg transition-colors duration-200"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--foreground-secondary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div
            className={cn(
              "relative flex-1",
              reducedMotion ? "" : "transition-all duration-300",
              searchFocused && !reducedMotion && "scale-[1.02]"
            )}
          >
            <label htmlFor="global-search" className="sr-only">
              Search products, customers, transactions
            </label>
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" 
              style={{ color: 'var(--foreground-tertiary)' }}
              aria-hidden="true"
            />
            <input
              id="global-search"
              type="search"
              placeholder="Search products, customers, transactions..."
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm",
                reducedMotion ? "" : "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
              style={{
                backgroundColor: 'var(--background-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Global search"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-lg transition-colors duration-200 group"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--foreground-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--background-secondary)'
              e.currentTarget.style.color = 'var(--foreground)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--foreground-secondary)'
            }}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-2.5 rounded-lg transition-colors duration-200 group"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--foreground-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--background-secondary)'
                  e.currentTarget.style.color = 'var(--foreground)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--foreground-secondary)'
                }}
                aria-label="Notifications (2 unread)"
              >
                <Bell className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
                <span 
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2" 
                  style={{ 
                    backgroundColor: 'var(--error)',
                    ringColor: 'var(--card-bg)'
                  }}
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
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Order #1234 has been placed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">15 minutes ago</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <button
            className="hidden md:block p-2.5 rounded-lg transition-colors duration-200 group"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--foreground-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--background-secondary)'
              e.currentTarget.style.color = 'var(--foreground)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--foreground-secondary)'
            }}
            title="Settings"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5 transition-colors duration-200" aria-hidden="true" />
          </button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg transition-colors duration-200 group"
                style={{ 
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md" aria-hidden="true">
                  <User className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Admin User</p>
                  <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>Administrator</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={() => {
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
