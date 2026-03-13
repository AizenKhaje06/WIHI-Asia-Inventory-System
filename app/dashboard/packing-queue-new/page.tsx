'use client'

/**
 * TEMPORARY PACKING QUEUE PAGE
 * This is a minimal version to test if routing works
 * Once this works, we can add back the full functionality
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Package, ArrowLeft } from 'lucide-react'

export default function PackingQueueNew() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Packing Queue (New Route)
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
          This is a temporary test page. If you can see this, the routing works!
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <p className="text-green-800 dark:text-green-200 font-medium">
            ✅ Route is working!
          </p>
          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
            The page loaded successfully. We can now restore full functionality.
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/track-orders')}
          >
            Track Orders
          </Button>
        </div>
      </div>
    </div>
  )
}
