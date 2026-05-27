"use client"

import React, { useState } from "react"
import { Bell, Settings, User, Menu, RefreshCw, LogOut } from "lucide-react"
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
        const assignedChannel = localStorage.getItem("assignedChannel")
        
        if (storedUsername) {
          setUsername(displayName || storedUsername)
        }
        if (storedRole) {
          setUserRole(storedRole === "admin" ? "Administrator" : storedRole === "operations" ? assignedChannel || "Staff" : "Staff")
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
        // Full width header - edge to edge
        "left-0 right-0 top-0 h-14",
        // White background with border
        "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
      )}
      role="banner"
    >
      <div 
        className={cn(
          "h-full px-3 sm:px-6 flex items-center justify-between",
          // Content respects sidebar boundary
          reducedMotion ? "" : "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-14 xl:lg:ml-16" : "lg:ml-48 xl:lg:ml-52"
        )}
      >
        {/* Left: Department Logo + Welcome Message */}
        <div className="flex items-center gap-3 sm:gap-8">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg transition-colors flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Department Logo + Welcome - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3">
            {/* Department Logo */}
            {currentUser?.role === 'operations' && currentUser?.assignedChannel && (
              <div className="flex-shrink-0">
                {currentUser.assignedChannel === 'Shopee' && (
                  <img src="/Shopee.png" alt="Shopee" className="h-6 w-auto object-contain" />
                )}
                {currentUser.assignedChannel === 'Lazada' && (
                  <img src="/Lazada.png" alt="Lazada" className="h-6 w-auto object-contain" />
                )}
                {currentUser.assignedChannel === 'Facebook' && (
                  <img src="/facebook.png" alt="Facebook" className="h-6 w-auto object-contain" />
                )}
                {currentUser.assignedChannel === 'TikTok' && (
                  <img src="/tiktok.png" alt="TikTok" className="h-6 w-auto object-contain" />
                )}
                {currentUser.assignedChannel === 'Physical Store' && (
                  <img src="/Physical Store.png" alt="Physical Store" className="h-6 w-auto object-contain" />
                )}
              </div>
            )}
            
            {/* Welcome Message */}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">Welcome back</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-tight">{username}</span>
            </div>
          </div>
        </div>

        {/* Right: Time + Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Time Display - Desktop Only */}
          <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {currentTime}
          </div>
          
          {/* Divider - Desktop Only */}
          <div className="hidden sm:block h-4 w-px bg-slate-200 dark:border-slate-800"></div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button 
              onClick={() => window.location.reload()}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Refresh page"
            >
              <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
            
            <ToggleTheme 
              duration={600}
              animationType="flip-x-in"
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            />
            
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.removeItem("isLoggedIn")
                    localStorage.removeItem("username")
                    localStorage.removeItem("userRole")
                    localStorage.removeItem("displayName")
                    localStorage.removeItem("assignedChannel")
                    localStorage.removeItem("currentUser")
                  } catch (error) {
                    console.error('Error clearing localStorage:', error)
                  }
                }
                window.location.href = "/"
              }}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
