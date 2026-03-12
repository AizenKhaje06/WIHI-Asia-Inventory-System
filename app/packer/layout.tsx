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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Packer Portal
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Order Fulfillment System
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2 h-9"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-4 sm:p-6">
        {children}
      </div>
    </div>
  )
}
