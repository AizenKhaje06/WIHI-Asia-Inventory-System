/**
 * Enterprise Loading States
 * Skeleton screens and progress indicators
 */

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

/**
 * Table Loading Skeleton
 */
export function TableLoadingSkeleton({ rows = 10, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading table data">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                "h-4",
                colIndex === 0 ? "w-1/4" : "flex-1"
              )} 
            />
          ))}
        </div>
      ))}
      
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Card Grid Loading Skeleton
 */
export function CardGridLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div 
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading cards"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-[5px] border p-6 space-y-3">
          <Skeleton className="h-8 w-8 rounded-[5px]" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Stats Cards Loading Skeleton
 */
export function StatsLoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div 
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-label="Loading statistics"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-[5px] border p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-8 rounded-[5px]" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Form Loading Skeleton
 */
export function FormLoadingSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading form">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * List Loading Skeleton
 */
export function ListLoadingSkeleton({ items = 8 }: { items?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-[5px] border">
          <Skeleton className="h-12 w-12 rounded-[5px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Inline Loader
 */
export function InlineLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400" role="status">
      <Spinner className="h-4 w-4" />
      <span>{text}</span>
      <span className="sr-only">{text}</span>
    </div>
  )
}

/**
 * Full Page Loader
 */
export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      role="status"
      aria-label={text}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{text}</p>
        <span className="sr-only">{text}</span>
      </div>
    </div>
  )
}

/**
 * Progress Bar
 */
export function ProgressBar({ 
  progress, 
  label,
  showPercentage = true 
}: { 
  progress: number
  label?: string
  showPercentage?: boolean 
}) {
  return (
    <div className="space-y-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-700 dark:text-slate-300">{label}</span>
          {showPercentage && (
            <span className="text-slate-500 dark:text-slate-400 font-medium">{progress}%</span>
          )}
        </div>
      )}
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Pulsing Dot Loader
 */
export function PulsingDotLoader() {
  return (
    <div className="flex items-center gap-1" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Shimmer Effect Container
 */
export function ShimmerContainer({ 
  children,
  loading 
}: { 
  children: React.ReactNode
  loading: boolean 
}) {
  if (loading) {
    return (
      <div className="relative overflow-hidden">
        <div className="opacity-50">{children}</div>
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    )
  }
  
  return <>{children}</>
}
