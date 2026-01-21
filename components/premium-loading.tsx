import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PremiumDashboardLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-80 mb-2 bg-slate-700" />
        <Skeleton className="h-5 w-96 bg-slate-700" />
      </div>

      {/* Chart Skeleton */}
      <Card className="mb-8 border-0 shadow-lg glass-card">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-64 bg-slate-700" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full bg-slate-700" />
        </CardContent>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg stat-card-restaurant">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32 bg-slate-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-40 bg-slate-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg glass-card">
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-slate-700" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full bg-slate-700" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function PremiumTableLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-80 mb-2 bg-slate-700" />
        <Skeleton className="h-5 w-96 bg-slate-700" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg stat-card-restaurant">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32 bg-slate-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-40 bg-slate-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar Skeleton */}
      <Card className="mb-8 border-0 shadow-lg glass-card">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1 bg-slate-700" />
            <Skeleton className="h-10 w-32 bg-slate-700" />
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="border-0 shadow-lg glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-slate-700" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-slate-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
