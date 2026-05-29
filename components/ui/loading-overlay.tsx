import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  message?: string
  show: boolean
}

export function LoadingOverlay({ message = 'Please wait...', show }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-sm mx-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Spinner */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 animate-spin">
              <div className="absolute inset-2 bg-white dark:bg-slate-900 rounded-full"></div>
            </div>
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          
          {/* Message */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Processing...
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
