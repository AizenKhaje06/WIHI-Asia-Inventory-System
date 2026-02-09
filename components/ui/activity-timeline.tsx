/**
 * Enterprise Activity Timeline Component
 * Visualize audit trails and activity logs
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { formatTableDate } from "@/lib/table-utils"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Package,
  ShoppingCart,
  Users,
  Settings,
  Trash2,
  Edit,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

export interface ActivityItem {
  id: string
  type: 'create' | 'update' | 'delete' | 'sale' | 'restock' | 'return' | 'system' | 'user'
  title: string
  description?: string
  timestamp: string | Date
  user?: {
    name: string
    initials?: string
  }
  metadata?: Record<string, any>
  status?: 'success' | 'error' | 'warning' | 'info'
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
  loading?: boolean
  emptyMessage?: string
  maxHeight?: string
  showFilters?: boolean
}

const activityIcons: Record<string, React.ReactNode> = {
  create: <Plus className="h-4 w-4" />,
  update: <Edit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  sale: <ShoppingCart className="h-4 w-4" />,
  restock: <Package className="h-4 w-4" />,
  return: <XCircle className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
  user: <Users className="h-4 w-4" />,
}

const activityColors: Record<string, string> = {
  create: "bg-green-500 text-white",
  update: "bg-blue-500 text-white",
  delete: "bg-red-500 text-white",
  sale: "bg-purple-500 text-white",
  restock: "bg-orange-500 text-white",
  return: "bg-amber-500 text-white",
  system: "bg-slate-500 text-white",
  user: "bg-cyan-500 text-white",
}

const statusColors: Record<string, string> = {
  success: "border-green-500 bg-green-50 dark:bg-green-950/30",
  error: "border-red-500 bg-red-50 dark:bg-red-950/30",
  warning: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
}

export function ActivityTimeline({
  activities,
  loading = false,
  emptyMessage = "No activities to display",
  maxHeight = "600px",
  showFilters = false,
}: ActivityTimelineProps) {
  const [filterType, setFilterType] = React.useState<string | null>(null)

  const filteredActivities = React.useMemo(() => {
    if (!filterType) return activities
    return activities.filter((activity) => activity.type === filterType)
  }, [activities, filterType])

  const groupedActivities = React.useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {}
    
    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let key: string
      if (date.toDateString() === today.toDateString()) {
        key = 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday'
      } else {
        key = formatTableDate(date, 'long')
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(activity)
    })

    return groups
  }, [filteredActivities])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
        <p className="text-slate-600 dark:text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterType(null)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
              !filterType
                ? "bg-orange-500 text-white border-orange-500"
                : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
            )}
          >
            All
          </button>
          {Object.keys(activityIcons).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize",
                filterType === type
                  ? "bg-orange-500 text-white border-orange-500"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-8" style={{ maxHeight, overflowY: 'auto' }}>
        {Object.entries(groupedActivities).map(([date, items]) => (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {date}
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Activities */}
            <div className="space-y-3 pl-4">
              {items.map((activity, index) => (
                <div
                  key={activity.id}
                  className="relative pl-8 pb-4 last:pb-0"
                >
                  {/* Timeline Line */}
                  {index < items.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  )}

                  {/* Activity Icon */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center",
                      activityColors[activity.type] || activityColors.system
                    )}
                  >
                    {activityIcons[activity.type] || activityIcons.system}
                  </div>

                  {/* Activity Content */}
                  <div
                    className={cn(
                      "rounded-[5px] border p-4 transition-all hover:shadow-md",
                      activity.status && statusColors[activity.status]
                    )}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {activity.title}
                        </h4>
                        {activity.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      
                      {activity.status && (
                        <Badge
                          variant={
                            activity.status === 'error' ? 'destructive' :
                            activity.status === 'success' ? 'default' :
                            'secondary'
                          }
                          className="flex-shrink-0"
                        >
                          {activity.status}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                      {/* User */}
                      {activity.user && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {activity.user.initials || activity.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{activity.user.name}</span>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(activity.timestamp).toLocaleTimeString('en-PH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Type Badge */}
                      <Badge variant="outline" className="capitalize">
                        {activity.type}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-slate-500 dark:text-slate-500 capitalize">
                                {key}:
                              </span>{' '}
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
