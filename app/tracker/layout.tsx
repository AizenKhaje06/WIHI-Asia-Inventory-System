'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, RefreshCw } from 'lucide-react'
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
      {/* Enterprise Header - Single Line, Minimal, Mobile Responsive */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Left: Brand + Navigation */}
            <div className="flex items-center gap-3 sm:gap-8">
              {/* Brand */}
              <div className="flex items-center gap-2 sm:gap-3 pr-3 sm:pr-8 border-r border-slate-200 dark:border-slate-800">
                <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  Tracker
                </div>
                <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {displayName}
                </div>
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
      <main className="w-full">
        {children}
      </main>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Sign Out</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to sign out from Tracker Dashboard?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
