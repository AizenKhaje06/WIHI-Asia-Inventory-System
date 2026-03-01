"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Package,
  AlertTriangle,
  XCircle,
  TrendingUp,
  FileText,
  LogOut,
  Warehouse,
  Users,
  Brain,
  ChevronsLeft,
  ChevronsRight,
  X,
  Settings,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-accessibility"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getCurrentUser, hasPermission, clearCurrentUser, ROLES, type UserRole } from "@/lib/auth"
import { apiGet } from "@/lib/api-client"

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: number
  badgeVariant?: 'default' | 'destructive' | 'warning'
}

interface NavSection {
  section: string
  items: NavItem[]
}

const getNavigation = (lowStockCount: number = 0, outOfStockCount: number = 0, cancelledCount: number = 0): NavSection[] => [
  {
    section: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }, // Admin only
      { name: "Operations Dashboard", href: "/dashboard/operations", icon: LayoutDashboard }, // Operations only
      { name: "Warehouse Dispatch", href: "/dashboard/pos", icon: ShoppingCart }, // Operations only
      { name: "Packing Queue", href: "/dashboard/operations/transaction-history", icon: FileText }, // Orders waiting to be packed
      { name: "Track Orders", href: "/dashboard/track-orders", icon: Package }, // Track customer orders
      { name: "Transactions", href: "/dashboard/reports", icon: FileText }, // Admin + Operations
      { 
        name: "Cancelled Orders", 
        href: "/dashboard/cancelled-orders", 
        icon: XCircle,
        badge: cancelledCount > 0 ? cancelledCount : undefined,
        badgeVariant: 'destructive'
      }, // Admin only - Track cancelled transactions
      { name: "Internal Usage", href: "/dashboard/internal-usage", icon: Users }, // Track Demo & Internal Use (Admin only)
    ],
  },
  {
    section: "Inventory",
    items: [
      { name: "Products", href: "/dashboard/inventory", icon: Package },
      { 
        name: "Low Stocks", 
        href: "/dashboard/inventory/low-stock", 
        icon: AlertTriangle,
        badge: lowStockCount > 0 ? lowStockCount : undefined,
        badgeVariant: 'warning'
      },
      { 
        name: "Out of Stocks", 
        href: "/dashboard/inventory/out-of-stock", 
        icon: XCircle,
        badge: outOfStockCount > 0 ? outOfStockCount : undefined,
        badgeVariant: 'destructive'
      },
    ],
  },
  {
    section: "Analytics",
    items: [
      { name: "Sales Channels", href: "/dashboard/sales-channels", icon: TrendingUp },
      { name: "Sales Analytics", href: "/dashboard/analytics", icon: TrendingUp },
      { name: "Business Insights", href: "/dashboard/insights", icon: Brain },
    ],
  },
  {
    section: "CRM",
    items: [{ name: "Customers", href: "/dashboard/customers", icon: Users }],
  },
  {
    section: "System",
    items: [
      { name: "Activity Logs", href: "/dashboard/log", icon: FileText },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

interface PremiumSidebarProps {
  onNavClick?: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
  onCollapsedChange?: (collapsed: boolean) => void
}

export function PremiumSidebar({ onNavClick, mobileOpen = false, onMobileClose, onCollapsedChange }: PremiumSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const reducedMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [outOfStockCount, setOutOfStockCount] = useState(0)
  const [cancelledCount, setCancelledCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(null)

  // Get current user
  useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  // Notify parent when collapsed state changes
  useEffect(() => {
    onCollapsedChange?.(collapsed)
  }, [collapsed, onCollapsedChange])

  // Fetch inventory counts for badges
  useEffect(() => {
    const fetchInventoryCounts = async () => {
      try {
        const items = await apiGet<any[]>('/api/items')
        const lowStock = items.filter((item: any) => item.quantity > 0 && item.quantity <= item.reorderLevel).length
        const outOfStock = items.filter((item: any) => item.quantity === 0).length
        setLowStockCount(lowStock)
        setOutOfStockCount(outOfStock)

        // Fetch cancelled orders count from reports API
        const reportsData = await apiGet<any>('/api/reports')
        const allTransactions = Array.isArray(reportsData) ? reportsData : (reportsData.transactions || [])
        const cancelled = allTransactions.filter((t: any) => t.status === 'cancelled').length
        setCancelledCount(cancelled)
      } catch (error) {
        console.error('Error fetching inventory counts:', error)
      }
    }

    fetchInventoryCounts()
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchInventoryCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const allNavigation = getNavigation(lowStockCount, outOfStockCount, cancelledCount)
  
  // Filter navigation based on user role
  const navigation = currentUser ? allNavigation.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const hasAccess = hasPermission(currentUser.role, item.href)
      console.log(`[Sidebar] ${currentUser.role} - ${item.name} (${item.href}): ${hasAccess}`)
      return hasAccess
    })
  })).filter(section => section.items.length > 0) : allNavigation

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && mobileOpen) {
      onMobileClose?.()
    }
  }, [pathname])

  const handleNavClick = () => {
    onNavClick?.()
    if (isMobile) {
      onMobileClose?.()
    }
  }

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, mobileOpen])

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-50 flex flex-col",
          reducedMotion ? "" : "transition-all duration-300",
          // Responsive width: smaller on <27" screens, optimal on 27"+
          collapsed ? "w-30 xl:w-[72px]" : "w-48 xl:w-52", // Increased collapsed width from 14/16 to 16/72px
          isMobile && !mobileOpen && "-translate-x-full",
          isMobile && mobileOpen && "translate-x-0",
          // Desktop: clean edge with subtle border
          "lg:left-0 lg:top-0 lg:h-screen",
          // Mobile: full screen
          "left-0 top-0 h-screen",
          // Light mode - vibrant purple/magenta gradient
          "bg-gradient-to-b from-fuchsia-600 to-purple-700 border-r border-fuchsia-500/30",
          // Dark mode - pure black with subtle border
          "dark:bg-black dark:border-slate-800/60"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo & Brand - Professional Layout with Dark Mode Support */}
        <div 
          className="h-14 xl:h-16 flex items-center justify-center px-1.5 xl:px-2 flex-shrink-0 relative"
        >
          {/* Bottom border line - matching separator style */}
          <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white to-transparent dark:from-transparent dark:via-white dark:to-transparent" />
          
          {!collapsed ? (
            <div className="flex items-center justify-center w-full py-1.5">
              {/* Light mode logo */}
              <img 
                src="/Vertex-icon.png" 
                alt="Vertex" 
                className="h-11 xl:h-[52px] w-auto object-contain dark:hidden"
              />
              {/* Dark mode logo */}
              <img 
                src="/Vertex-icon-2.png" 
                alt="Vertex" 
                className="h-11 xl:h-[52px] w-auto object-contain hidden dark:block"
              />
            </div>
          ) : (
            <div className="w-9 h-9 xl:w-10 xl:h-10 relative" aria-hidden="true">
              <img 
                src="/Vertex-icon-3.png" 
                alt="Vertex" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="absolute right-2 p-2 rounded-lg transition-colors text-white hover:bg-white/10 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2.5 xl:py-3 px-1.5 xl:px-2 min-h-0 max-h-full scrollbar-hide" aria-label="Primary">
          {navigation.map((section, sectionIdx) => (
            <div key={section.section} className={cn("mb-4 xl:mb-5", sectionIdx === 0 && "mt-0")}>
              {/* Separator line above section (except first section) */}
              {!collapsed && sectionIdx > 0 && (
                <div className="h-px mb-3 mx-2 bg-gradient-to-r from-transparent via-white to-transparent dark:from-transparent dark:via-white dark:to-transparent" />
              )}
              {!collapsed && (
                <div className="px-1.5 xl:px-2 mb-1">
                  <p className="text-xs xl:text-sm font-semibold uppercase tracking-wider text-white dark:text-white">
                    {section.section}
                  </p>
                </div>
              )}
              {collapsed && sectionIdx > 0 && (
                <div className="h-px my-2.5 xl:my-3 mx-2 bg-gradient-to-r from-transparent via-white to-transparent dark:from-transparent dark:via-white dark:to-transparent" />
              )}
              <div className="space-y-0.5 xl:space-y-1" role="list">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  const NavLink = (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center rounded-lg group relative overflow-hidden",
                        reducedMotion ? "" : "transition-all duration-200",
                        // Collapsed state: centered icon with better spacing
                        collapsed ? "justify-center py-2.5 xl:py-3 mx-auto" : "gap-1.5 xl:gap-2 px-1.5 xl:px-2 py-1.5 xl:py-2",
                        // Active state with gradient and shadow
                        isActive 
                          ? "bg-white/20 text-white shadow-lg shadow-white/10 backdrop-blur-sm" 
                          : "text-white hover:bg-white/10 hover:text-white dark:text-white dark:hover:bg-slate-800/80 dark:hover:text-white",
                        // Hover effects for collapsed state
                        collapsed && !isActive && "hover:bg-white/10 dark:hover:from-slate-800 dark:hover:to-slate-800/50",
                        // Scale effect on hover (collapsed only)
                        collapsed && !reducedMotion && "hover:scale-105"
                      )}
                      aria-current={isActive ? "page" : undefined}
                      role="listitem"
                    >
                      {/* Icon with better sizing in collapsed state */}
                      <div className={cn(
                        "flex items-center justify-center flex-shrink-0",
                        collapsed ? "w-5 h-5 xl:w-6 xl:h-6" : ""
                      )}>
                        <item.icon
                          className={cn(
                            "flex-shrink-0",
                            collapsed 
                              ? "h-[16px] w-[16px] xl:h-[18px] xl:w-[18px]" 
                              : "h-[13px] w-[13px] xl:h-[14px] xl:w-[14px]",
                            // Icon animation on hover
                            !reducedMotion && collapsed && "group-hover:scale-110 transition-transform duration-200"
                          )}
                          strokeWidth={isActive ? 2.5 : 2}
                          aria-hidden="true"
                        />
                      </div>
                      
                      {!collapsed && (
                        <>
                          <span className="text-xs xl:text-sm font-normal flex-1">
                            {item.name}
                          </span>
                          {item.badge !== undefined && (
                            <Badge 
                              variant={item.badgeVariant === 'destructive' ? 'destructive' : item.badgeVariant === 'warning' ? 'default' : 'default'}
                              className={cn(
                                "ml-auto text-xs xl:text-sm px-1 xl:px-1.5 py-0",
                                item.badgeVariant === 'warning' && "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
                                isActive && "bg-white/20 text-white"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      
                      {/* Enhanced badge for collapsed state */}
                      {collapsed && item.badge !== undefined && (
                        <div className={cn(
                          "absolute -top-0.5 -right-0.5 xl:-top-1 xl:-right-1",
                          "min-w-[16px] h-[16px] xl:min-w-[18px] xl:h-[18px]",
                          "rounded-full flex items-center justify-center",
                          "text-white text-xs xl:text-sm font-bold",
                          "shadow-lg",
                          "border-2 border-white dark:border-slate-900",
                          item.badgeVariant === 'destructive' 
                            ? "bg-gradient-to-br from-red-500 to-red-600" 
                            : item.badgeVariant === 'warning'
                            ? "bg-gradient-to-br from-amber-500 to-amber-600"
                            : "bg-gradient-to-br from-blue-500 to-blue-600",
                          !reducedMotion && "animate-pulse"
                        )}>
                          {item.badge > 9 ? '9+' : item.badge}
                        </div>
                      )}
                      
                      {/* Active indicator bar for collapsed state */}
                      {collapsed && isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                      )}
                    </Link>
                  )

                  return collapsed ? (
                    <TooltipProvider key={item.name}>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          {NavLink}
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          className={cn(
                            "font-medium shadow-xl border-slate-200 dark:border-slate-700",
                            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
                          )}
                          sideOffset={12}
                        >
                          <p className="font-semibold">{item.name}</p>
                          {item.badge !== undefined && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.badge} {item.badgeVariant === 'warning' ? 'low stock' : item.badgeVariant === 'destructive' ? 'out of stock' : 'items'}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : NavLink
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout & Collapse Button Container */}
        <div className="p-2.5 xl:p-3 border-t flex-shrink-0 border-white/10 dark:border-slate-800/60 relative">
          {collapsed ? (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      clearCurrentUser()
                      window.location.href = "/"
                    }}
                    className={cn(
                      "flex items-center justify-center rounded-lg w-full group relative overflow-hidden",
                      "py-2.5 xl:py-3",
                      reducedMotion ? "" : "transition-all duration-200",
                      "text-white hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600",
                      "dark:text-white dark:hover:bg-gradient-to-r dark:hover:from-red-900/20 dark:hover:to-red-900/30 dark:hover:text-white",
                      !reducedMotion && "hover:scale-105"
                    )}
                    aria-label="Logout from application"
                  >
                    <div className="flex items-center justify-center w-5 h-5 xl:w-6 xl:h-6">
                      <LogOut
                        className={cn(
                          "h-[12px] w-[12px] xl:h-[18px] xl:w-[18px] flex-shrink-0",
                          !reducedMotion && "group-hover:scale-110 transition-transform duration-200"
                        )}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  className={cn(
                    "font-medium shadow-xl border-slate-200 dark:border-slate-700",
                    "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
                  )}
                  sideOffset={12}
                >
                  <p className="font-semibold text-red-600 dark:text-red-400">Logout</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sign out of your account</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <button
              onClick={() => {
                clearCurrentUser()
                window.location.href = "/"
              }}
              className={cn(
                "flex items-center gap-1.5 xl:gap-2 px-1.5 xl:px-2 py-1.5 xl:py-2 rounded-lg w-full",
                reducedMotion ? "" : "transition-colors duration-200",
                "text-white hover:bg-red-500/20 hover:text-white dark:text-white dark:hover:bg-red-900/20 dark:hover:text-white"
              )}
              aria-label="Logout from application"
            >
              <LogOut
                className="h-[13px] w-[13px] xl:h-[14px] xl:w-[14px] flex-shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="text-xs xl:text-sm font-medium">
                Logout
              </span>
            </button>
          )}

          {/* Collapse/Expand Button - Desktop Only - Aligned with Logout */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 -right-2 z-50",
                "w-4 h-4 flex items-center justify-center",
                "bg-white dark:bg-slate-900",
                "border border-fuchsia-400 dark:border-slate-800",
                "rounded-full shadow-md",
                "transition-all duration-200",
                "text-fuchsia-600 dark:text-slate-400",
                "hover:text-fuchsia-700 dark:hover:text-blue-400",
                "hover:bg-fuchsia-50 dark:hover:bg-slate-800",
                "hover:border-fuchsia-500 dark:hover:border-blue-800",
                "hover:shadow-lg hover:scale-110"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronsRight className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <ChevronsLeft className="h-3 w-3" strokeWidth={2.5} />
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
