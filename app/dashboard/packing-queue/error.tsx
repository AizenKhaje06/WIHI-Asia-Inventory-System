'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Packing Queue Error]:', error)
  }, [error])

  return (
    <div className="flex h-full items-center justify-center min-h-[600px]">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Something went wrong!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {error.message || 'Failed to load packing queue'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
            Go to Dashboard
          </Button>
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
