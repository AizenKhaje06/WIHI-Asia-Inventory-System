/**
 * Enterprise Notification Center
 * In-app notifications and alerts
 */

"use client"

import * as React from "react"
import { Bell, Check, X, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionLabel?: string
  onAction?: () => void
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDismiss: (id: string) => void
  onClearAll: () => void
}

const notificationIcons = {
  info: <Info className="h-4 w-4 text-blue-600" />,
  success: <CheckCircle className="h-4 w-4 text-green-600" />,
  warning: <AlertCircle className="h-4 w-4 text-amber-600" />,
  error: <XCircle className="h-4 w-4 text-red-600" />,
}

const notificationColors = {
  info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900",
  success: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
  warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
  error: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
}: NotificationCenterProps) {
  const [open, setOpen] = React.useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {unreadCount} unread
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              No notifications yet
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                      !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {notificationIcons[notification.type]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {notification.title}
                          </p>
                          <button
                            onClick={() => onDismiss(notification.id)}
                            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {formatTime(notification.timestamp)}
                          </span>

                          <div className="flex items-center gap-2">
                            {notification.actionLabel && notification.onAction && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={notification.onAction}
                                className="h-7 text-xs"
                              >
                                {notification.actionLabel}
                              </Button>
                            )}

                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMarkAsRead(notification.id)}
                                className="h-7 text-xs"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="w-full text-xs"
                >
                  Clear all notifications
                </Button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
