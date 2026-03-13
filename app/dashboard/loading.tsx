"use client"

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )
}
