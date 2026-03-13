'use client'

import { Metadata } from 'next'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Package } from 'lucide-react'
import { toast } from 'sonner'

export default function PackerLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    
    // Clear all storage
    localStorage.clear()
    sessionStorage.clear()
    
    toast.success('Logged out successfully')
    
    // Redirect to login
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Professional Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Section */}
            <div className="flex items-center gap-4">
              {/* Professional Logo */}
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Package className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
              
              {/* Title & Subtitle */}
              <div className="flex flex-col">
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Packer Portal
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                  Order Fulfillment Center
                </p>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3">
              {/* Status Badge - Optional */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                  Active
                </span>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2 h-9 px-4 font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
