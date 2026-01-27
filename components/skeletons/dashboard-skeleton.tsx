import { Card, CardContent } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-10 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-lg w-64 animate-shimmer" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-96 animate-pulse" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded w-32 animate-shimmer" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mini Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20 animate-pulse" />
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse" />
              <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded w-32 animate-pulse" />
            </div>
            <div className="h-80 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-40 animate-pulse mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-lg animate-pulse" />
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
