/**
 * Enterprise Bulk Action Bar Component
 * Sticky action bar for bulk operations on selected items
 */

import * as React from "react"
import { X, Trash2, Edit, Download, Archive, Copy, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface BulkAction {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline'
  requiresConfirmation?: boolean
  confirmTitle?: string
  confirmDescription?: string
  action: () => void | Promise<void>
}

interface BulkActionBarProps {
  selectedCount: number
  totalCount: number
  actions: BulkAction[]
  onClearSelection: () => void
  onSelectAll?: () => void
  className?: string
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  actions,
  onClearSelection,
  onSelectAll,
  className,
}: BulkActionBarProps) {
  const [confirmAction, setConfirmAction] = React.useState<BulkAction | null>(null)
  const [isExecuting, setIsExecuting] = React.useState(false)

  const handleActionClick = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action)
    } else {
      executeAction(action)
    }
  }

  const executeAction = async (action: BulkAction) => {
    setIsExecuting(true)
    try {
      await action.action()
      setConfirmAction(null)
    } catch (error) {
      console.error('Bulk action error:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      {/* Sticky Action Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          "bg-slate-900 dark:bg-slate-950",
          "border-t border-slate-700",
          "shadow-2xl",
          "animate-in slide-in-from-bottom-5 duration-300",
          className
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Selection Info */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-base px-3 py-1.5 bg-orange-500 text-white">
                {selectedCount} selected
              </Badge>

              {selectedCount < totalCount && onSelectAll && (
                <button
                  onClick={onSelectAll}
                  className="text-sm text-slate-400 hover:text-white transition-colors underline underline-offset-4"
                >
                  Select all {totalCount} items
                </button>
              )}

              <button
                onClick={onClearSelection}
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => handleActionClick(action)}
                  disabled={isExecuting}
                  className={cn(
                    "bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
                    action.variant === 'destructive' && "bg-red-600 hover:bg-red-700 border-red-600"
                  )}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden */}
      <div className="h-20" aria-hidden="true" />

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmTitle || 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription || 
                `Are you sure you want to perform this action on ${selectedCount} items? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExecuting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              disabled={isExecuting}
              className={cn(
                confirmAction?.variant === 'destructive' && "bg-red-600 hover:bg-red-700"
              )}
            >
              {isExecuting ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * Common bulk actions presets
 */
export const commonBulkActions = {
  delete: (onDelete: () => Promise<void>): BulkAction => ({
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    requiresConfirmation: true,
    confirmTitle: 'Delete Items',
    confirmDescription: 'Are you sure you want to delete the selected items? This action cannot be undone.',
    action: onDelete,
  }),

  archive: (onArchive: () => Promise<void>): BulkAction => ({
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirmation: true,
    confirmTitle: 'Archive Items',
    confirmDescription: 'Are you sure you want to archive the selected items?',
    action: onArchive,
  }),

  export: (onExport: () => Promise<void>): BulkAction => ({
    id: 'export',
    label: 'Export',
    icon: <Download className="h-4 w-4" />,
    variant: 'outline',
    action: onExport,
  }),

  duplicate: (onDuplicate: () => Promise<void>): BulkAction => ({
    id: 'duplicate',
    label: 'Duplicate',
    icon: <Copy className="h-4 w-4" />,
    variant: 'outline',
    action: onDuplicate,
  }),

  markComplete: (onMarkComplete: () => Promise<void>): BulkAction => ({
    id: 'mark-complete',
    label: 'Mark Complete',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'default',
    action: onMarkComplete,
  }),

  bulkEdit: (onBulkEdit: () => Promise<void>): BulkAction => ({
    id: 'bulk-edit',
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    variant: 'outline',
    action: onBulkEdit,
  }),
}
