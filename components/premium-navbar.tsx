"use client"

import React, { useState } from "react"
import { Bell, Settings, User, Menu, RefreshCw, LogOut, AlertTriangle } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PremiumNavbarProps {
  sidebarCollapsed?: boolean
  onMenuClick?: () => void
  onMobileMenuToggle?: () => void
}

export function PremiumNavbar({ sidebarCollapsed, onMenuClick, onMobileMenuToggle }: PremiumNavbarProps) {
  const [username, setUsername] = useState("Admin User")
  const [userRole, setUserRole] = useState("Administrator")
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const reducedMotion = useReducedMotion()
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // Get current user only on client side to avoid hydration errors
  React.useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  // Get user info from localStorage
  React.useEffect(() => {
    const loadUserData = () => {
      setCurrentUser(getCurrentUser())
      
      if (typeof window !== 'undefined') {
        try {
          const storedUsername = localStorage.getItem("username")
          const storedRole = localStorage.getItem("userRole")
          const displayName = localStorage.getItem("displayName")
          const assignedChannel = localStorage.getItem("assignedChannel")
          const storedProfileImage = localStorage.getItem("profileImage")
          
          console.log('[Header] Loading user data from localStorage:', {
            storedUsername,
            displayName,
            storedProfileImage,
            hasImage: !!storedProfileImage
          })
          
          if (storedUsername) {
            setUsername(displayName || storedUsername)
          }
          if (storedRole) {
            setUserRole(storedRole === "admin" ? "Administrator" : storedRole === "operations" ? assignedChannel || "Staff" : "Staff")
          }
          if (storedProfileImage && storedProfileImage !== 'null' && storedProfileImage !== 'undefined') {
            console.log('[Header] Setting profile image:', storedProfileImage)
            setProfileImage(storedProfileImage)
          } else {
            console.log('[Header] No valid profile image, using fallback')
            setProfileImage(null)
          }
        } catch (error) {
          console.error('Error reading from localStorage:', error)
        }
      }
    }

    // Load on mount
    loadUserData()

    // Listen for storage events (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'displayName' || e.key === 'profileImage' || e.key === 'currentUser') {
        console.log('[Header] Storage event detected:', e.key, e.newValue)
        loadUserData()
      }
    }

    // Listen for custom event (from same tab)
    const handleProfileUpdate = () => {
      console.log('[Header] Profile update event detected')
      loadUserData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('profileUpdated', handleProfileUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profileUpdated', handleProfileUpdate)
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
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600"
                  aria-label="User menu"
                >
                  {profileImage ? (
                    <img 
                      src={`/api/image-proxy?url=${encodeURIComponent(profileImage)}`}
                      alt={username}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error('[Header] Image load error:', profileImage)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" strokeWidth={2} />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{username}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{userRole}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => window.location.href = '/dashboard/settings'}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onSelect={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Professional Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <AlertDialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Confirm Sign Out
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              You are about to sign out of your account. Any unsaved changes may be lost. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="mt-0 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.removeItem("isLoggedIn")
                    localStorage.removeItem("username")
                    localStorage.removeItem("userRole")
                    localStorage.removeItem("displayName")
                    localStorage.removeItem("assignedChannel")
                    localStorage.removeItem("currentUser")
                    localStorage.removeItem("profileImage")
                  } catch (error) {
                    console.error('Error clearing localStorage:', error)
                  }
                }
                window.location.href = "/"
              }}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
