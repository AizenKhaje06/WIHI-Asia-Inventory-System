'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command as CommandPrimitive } from 'cmdk'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Users,
  TrendingUp,
  Settings,
  History,
  AlertCircle,
  XCircle,
  BarChart3,
  Warehouse,
  PackagePlus,
  Search,
  ArrowRight,
  X,
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: any
  href: string
  category: 'pages' | 'actions' | 'quick-links'
  keywords?: string[]
}

const commandItems: CommandItem[] = [
  // Main Pages
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Overview and analytics',
    icon: LayoutDashboard,
    href: '/dashboard',
    category: 'pages',
    keywords: ['home', 'overview', 'main'],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Manage products and stock',
    icon: Package,
    href: '/dashboard/inventory',
    category: 'pages',
    keywords: ['products', 'items', 'stock'],
  },
  {
    id: 'warehouse-dispatch',
    title: 'Warehouse Dispatch',
    description: 'Create transactions and sales',
    icon: ShoppingCart,
    href: '/dashboard/pos',
    category: 'pages',
    keywords: ['pos', 'sales', 'checkout', 'transaction'],
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'View sales and analytics',
    icon: FileText,
    href: '/dashboard/reports',
    category: 'pages',
    keywords: ['analytics', 'data', 'export'],
  },
  {
    id: 'customers',
    title: 'Customers',
    description: 'Manage customer information',
    icon: Users,
    href: '/dashboard/customers',
    category: 'pages',
    keywords: ['clients', 'contacts'],
  },
  {
    id: 'sales-channels',
    title: 'Sales Channels',
    description: 'Track channel performance',
    icon: TrendingUp,
    href: '/dashboard/sales-channels',
    category: 'pages',
    keywords: ['shopee', 'lazada', 'facebook', 'tiktok'],
  },
  {
    id: 'activity-logs',
    title: 'Activity Logs',
    description: 'View system activity',
    icon: History,
    href: '/dashboard/log',
    category: 'pages',
    keywords: ['history', 'audit', 'trail'],
  },
  {
    id: 'cancelled-orders',
    title: 'Cancelled Orders',
    description: 'View cancelled transactions',
    icon: XCircle,
    href: '/dashboard/cancelled-orders',
    category: 'pages',
    keywords: ['cancelled', 'refund', 'void'],
  },
  {
    id: 'internal-usage',
    title: 'Internal Usage',
    description: 'Track internal consumption',
    icon: Warehouse,
    href: '/dashboard/internal-usage',
    category: 'pages',
    keywords: ['demo', 'sample', 'internal'],
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    description: 'Detailed insights and trends',
    icon: BarChart3,
    href: '/dashboard/analytics',
    category: 'pages',
    keywords: ['insights', 'trends', 'metrics', 'charts'],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'System configuration',
    icon: Settings,
    href: '/dashboard/settings',
    category: 'pages',
    keywords: ['config', 'preferences', 'options'],
  },

  // Quick Links - Inventory Sub-pages
  {
    id: 'low-stock',
    title: 'Low Stock Items',
    description: 'Items below reorder level',
    icon: AlertCircle,
    href: '/dashboard/inventory/low-stock',
    category: 'quick-links',
    keywords: ['alert', 'warning', 'reorder', 'inventory'],
  },
  {
    id: 'out-of-stock',
    title: 'Out of Stock',
    description: 'Items with zero quantity',
    icon: PackagePlus,
    href: '/dashboard/inventory/out-of-stock',
    category: 'quick-links',
    keywords: ['empty', 'zero', 'restock', 'inventory'],
  },
  
  // Analytics Sub-pages
  {
    id: 'sales-analytics',
    title: 'Sales Analytics',
    description: 'Sales performance and trends',
    icon: TrendingUp,
    href: '/dashboard/analytics',
    category: 'quick-links',
    keywords: ['sales', 'revenue', 'performance'],
  },
  {
    id: 'insights',
    title: 'Business Insights',
    description: 'Key business metrics',
    icon: BarChart3,
    href: '/dashboard/insights',
    category: 'quick-links',
    keywords: ['metrics', 'kpi', 'performance'],
  },
  
  // Operations
  {
    id: 'operations',
    title: 'Operations',
    description: 'Operational management',
    icon: Settings,
    href: '/dashboard/operations',
    category: 'quick-links',
    keywords: ['manage', 'operations', 'workflow'],
  },
]

export function CommandPaletteSearch() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = useCallback((href: string) => {
    setOpen(false)
    setSearch('')
    router.push(href)
  }, [router])

  const filteredPages = commandItems.filter(item => item.category === 'pages')
  const filteredQuickLinks = commandItems.filter(item => item.category === 'quick-links')

  return (
    <>
      {/* Search Button Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 lg:max-w-full"
        aria-label="Search (Ctrl+K)"
      >
        <Search className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm flex-1 text-left">Search pages, actions, or commands...</span>
        <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 font-mono text-[10px] font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Palette Dialog - Production-Ready Linear Style */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        {/* Compact Search Bar */}
        <div className="p-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-md transition-colors">
            <Search className="h-4 w-4 text-slate-400 flex-shrink-0" strokeWidth={2} />
            <CommandPrimitive.Input
              placeholder="Search pages, actions, or type a command..." 
              value={search}
              onValueChange={setSearch}
              className="flex-1 bg-transparent border-0 text-[13px] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none text-slate-900 dark:text-white"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded flex-shrink-0">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
        
        <CommandList className="max-h-[400px] overflow-y-auto px-1.5 py-1.5 pb-0">
          <CommandEmpty className="py-14 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Search className="h-4.5 w-4.5 text-slate-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">No results found</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Try a different search term</p>
              </div>
            </div>
          </CommandEmpty>

          {/* Pages Section */}
          <CommandGroup 
            heading="PAGES" 
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500 dark:[&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:mb-0.5"
          >
            {filteredPages.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.description} ${item.keywords?.join(' ')}`}
                  onSelect={() => handleSelect(item.href)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/20 transition-colors group"
                >
                  <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 group-data-[selected=true]:text-blue-600 dark:group-data-[selected=true]:text-blue-400 flex-shrink-0" strokeWidth={2.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 group-data-[selected=true]:text-blue-900 dark:group-data-[selected=true]:text-blue-100 group-data-[selected=true]:font-semibold leading-tight">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 group-data-[selected=true]:text-blue-700 dark:group-data-[selected=true]:text-blue-300 truncate leading-tight mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>

          {filteredPages.length > 0 && filteredQuickLinks.length > 0 && (
            <div className="my-1.5 h-px bg-slate-200/60 dark:bg-slate-800/60" />
          )}

          {/* Quick Links Section */}
          <CommandGroup 
            heading="QUICK LINKS" 
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500 dark:[&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:mb-0.5 pb-2"
          >
            {filteredQuickLinks.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.description} ${item.keywords?.join(' ')}`}
                  onSelect={() => handleSelect(item.href)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/20 transition-colors group"
                >
                  <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 group-data-[selected=true]:text-blue-600 dark:group-data-[selected=true]:text-blue-400 flex-shrink-0" strokeWidth={2.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 group-data-[selected=true]:text-blue-900 dark:group-data-[selected=true]:text-blue-100 group-data-[selected=true]:font-semibold leading-tight">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 group-data-[selected=true]:text-blue-700 dark:group-data-[selected=true]:text-blue-300 truncate leading-tight mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>

        {/* Compact Footer */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 px-3 py-2 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">↑↓</span>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">↵</span>
                <span>to select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <span className="text-slate-400 font-medium">Esc</span>
              <span>to close</span>
            </span>
          </div>
        </div>
      </CommandDialog>
    </>
  )
}
