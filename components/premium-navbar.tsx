"use client"

import React, { useState } from "react"
import { Search, Bell, Settings, User, Moon, Sun, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
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
}

export function PremiumNavbar({ sidebarCollapsed, onMenuClick }: PremiumNavbarProps) {
  const { theme, setTheme } = useTheme()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 transition-all duration-300",
        sidebarCollapsed ? "left-20" : "left-72"
      )}
      style={{
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left: Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
          
          <div
            className={cn(
              "relative flex-1 transition-all duration-300",
              searchFocused && "scale-[1.02]"
            )}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, customers, transactions..."
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 group"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
            )}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 group">
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-2">
                <div className="px-2 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors duration-200">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Low Stock Alert</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">5 items are running low on stock</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">2 minutes ago</p>
                </div>
                <div className="px-2 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors duration-200">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">New Order</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Order #1234 has been placed</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">15 minutes ago</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <button
            className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 group"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
          </button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Admin User</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
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
