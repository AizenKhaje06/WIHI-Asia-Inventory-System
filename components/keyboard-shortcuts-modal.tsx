"use client"

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatShortcut, useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { Kbd } from '@/components/ui/kbd'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Command } from 'lucide-react'

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false)
  const { shortcuts } = useKeyboardShortcuts()

  useEffect(() => {
    const handleShow = () => setOpen(true)
    window.addEventListener('show-shortcuts-modal', handleShow)
    return () => window.removeEventListener('show-shortcuts-modal', handleShow)
  }, [])

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(shortcut)
    return acc
  }, {} as Record<string, typeof shortcuts>)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick access to common actions and navigation
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-[5px] hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.ctrl && <Kbd>Ctrl</Kbd>}
                        {shortcut.shift && <Kbd>Shift</Kbd>}
                        {shortcut.alt && <Kbd>Alt</Kbd>}
                        {shortcut.meta && <Kbd>⌘</Kbd>}
                        <Kbd>{shortcut.key.toUpperCase()}</Kbd>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-center pt-4 border-t">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Press <Kbd className="mx-1">?</Kbd> to toggle this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
