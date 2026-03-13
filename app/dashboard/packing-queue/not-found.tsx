'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center min-h-[600px]">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <Package className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The packing queue page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/track-orders">
              <Package className="h-4 w-4 mr-2" />
              Track Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
