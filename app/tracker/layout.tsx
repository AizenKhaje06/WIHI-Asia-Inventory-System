'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, RefreshCw, AlertTriangle } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

const NAV_ITEMS = [
  { href: '/tracker/dashboard', label: 'Dashboard' },
]

export default function TrackerLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [displayName, setDisplayName] = useState('Tracker')

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
      setCurrentTime(timeString)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)

    // Get display name from localStorage
    const storedDisplayName = localStorage.getItem('displayName')
    if (storedDisplayName) {
      setDisplayName(storedDisplayName)
    }

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    ['authToken','currentUser','isLoggedIn','username','userRole','displayName'].forEach(k => localStorage.removeItem(k))
    toast.success('Logged out successfully')
    router.push('/')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Enterprise Header - Fixed, always visible */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Left: Brand + Navigation */}
            <div className="flex items-center gap-3 sm:gap-8">
              {/* Brand */}
              <div className="flex items-center gap-2 sm:gap-3 pr-3 sm:pr-8 border-r border-slate-200 dark:border-slate-800">
                {/* Logo */}
                <img src="/Vertex-icon.png" alt="Vertex" className="h-6 w-auto object-contain dark:hidden" />
                <img src="/Vertex-icon-2.png" alt="Vertex" className="h-6 w-auto object-contain hidden dark:block" />
                <div className="hidden sm:flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">Welcome back</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-tight">{displayName}</span>
                </div>
                <div className="sm:hidden text-xs font-semibold text-slate-900 dark:text-white">{displayName}</div>
              </div>
              
              {/* Navigation Tabs */}
              <nav className="flex items-center h-12 sm:h-14">
                {NAV_ITEMS.map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className={cn(
                        'h-full flex items-center px-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors relative border-b-2',
                        isActive
                          ? 'text-slate-900 dark:text-white border-slate-900 dark:border-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent'
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right: Time + Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Time Display */}
              <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {currentTime}
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLogoutDialog(true)}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-12 sm:pt-14">
        {children}
      </main>

      {/* Professional Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <LogOut className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                  Sign Out
                </AlertDialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Tracker Account
                </p>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              You are about to sign out of your Tracker account. Any unsaved work will be lost.
            </p>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="mt-0 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              Stay Signed In
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout} 
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
