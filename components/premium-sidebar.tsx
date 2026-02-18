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
  ChevronLeft,
  ChevronRight,
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

const getNavigation = (lowStockCount: number = 0, outOfStockCount: number = 0): NavSection[] => [
  {
    section: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }, // Admin only
      { name: "Operations Dashboard", href: "/dashboard/operations", icon: LayoutDashboard }, // Operations only
      { name: "Warehouse Dispatch", href: "/dashboard/pos", icon: ShoppingCart }, // Operations only
      { name: "Transactions", href: "/dashboard/reports", icon: FileText }, // Admin + Operations
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
      } catch (error) {
        console.error('Error fetching inventory counts:', error)
      }
    }

    fetchInventoryCounts()
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchInventoryCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const allNavigation = getNavigation(lowStockCount, outOfStockCount)
  
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
          collapsed ? "w-14 xl:w-16" : "w-48 xl:w-52", // Smaller on standard screens, larger on XL+
          isMobile && !mobileOpen && "-translate-x-full",
          isMobile && mobileOpen && "translate-x-0",
          // Desktop: clean edge with subtle border
          "lg:left-0 lg:top-0 lg:h-screen",
          // Mobile: full screen
          "left-0 top-0 h-screen",
          // Light mode - clean white with subtle border
          "bg-white/80 backdrop-blur-md border-r border-slate-200/60",
          // Dark mode - minimal dark with subtle border
          "dark:bg-[#0a0a0a]/80 dark:border-slate-800/60"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo & Brand - Clean Minimal Layout */}
        <div 
          className="h-14 xl:h-16 flex items-center justify-between px-2.5 xl:px-3 border-b flex-shrink-0 border-slate-200/60 dark:border-slate-800/60"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!collapsed ? (
              <div className="flex items-center gap-2 w-full min-w-0">
                <div className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 relative" aria-hidden="true">
                  <img 
                    src="/System Logo.png" 
                    alt="StockSync Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <h1 className="text-[9px] xl:text-[10px] font-semibold text-slate-900 dark:text-white truncate">
                    StockSync
                  </h1>
                  <p className="text-[9px] xl:text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Advanced Inventory System
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 relative mx-auto" aria-hidden="true">
                <img 
                  src="/System Logo.png" 
                  alt="StockSync Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 flex-shrink-0 ml-2"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

          {/* User Profile Section - Clean Minimal */}
        <div className="p-2.5 xl:p-3 border-b flex-shrink-0 border-slate-200/60 dark:border-slate-800/60">
          <div className={cn(
            "flex items-center gap-2 px-1.5 xl:px-2 py-1.5 xl:py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50",
            collapsed && "justify-center px-1"
          )}>
            <div className="relative flex-shrink-0">
              <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <User className="h-2.5 w-2.5 xl:h-3 xl:w-3" strokeWidth={2} />
              </div>
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 xl:w-2 xl:h-2 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" aria-hidden="true" />
            </div>
            {!collapsed && currentUser && (
              <div className="flex-1 min-w-0">
                <p className="text-[10px] xl:text-xs font-medium text-slate-900 dark:text-white truncate">{currentUser.displayName}</p>
                <p className="text-[9px] xl:text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {ROLES[currentUser.role]?.name || currentUser.role}
                </p>
              </div>
            )}
          </div>
          
          {/* Collapse/Expand Button - Desktop Only */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 -right-2.5 xl:-right-3 z-50",
                "w-5 h-5 xl:w-6 xl:h-6 flex items-center justify-center",
                "bg-white dark:bg-slate-900",
                "border border-slate-200 dark:border-slate-800",
                "rounded-full shadow-sm",
                "transition-all duration-200",
                "text-slate-600 dark:text-slate-400",
                "hover:text-blue-500 dark:hover:text-blue-400",
                "hover:bg-slate-50 dark:hover:bg-slate-800",
                "hover:border-blue-200 dark:hover:border-blue-800"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className={cn(
                "transition-transform duration-200",
                collapsed ? "rotate-180" : "rotate-0"
              )}>
                <ChevronLeft className="h-3 w-3 xl:h-3.5 xl:w-3.5" strokeWidth={2} />
              </div>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2.5 xl:py-3 px-1.5 xl:px-2 min-h-0 max-h-full" style={{ scrollbarGutter: 'stable' }} aria-label="Primary">
          {navigation.map((section, sectionIdx) => (
            <div key={section.section} className={cn("mb-4 xl:mb-5", sectionIdx === 0 && "mt-0")}>
              {!collapsed && (
                <div className="px-1.5 xl:px-2 mb-1">
                  <p className="text-[9px] xl:text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {section.section}
                  </p>
                </div>
              )}
              {collapsed && sectionIdx > 0 && (
                <div className="h-px my-2 mx-1 bg-slate-200 dark:bg-slate-800" />
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
                        "flex items-center gap-1.5 xl:gap-2 px-1.5 xl:px-2 py-1.5 xl:py-2 rounded-lg group relative",
                        reducedMotion ? "" : "transition-colors duration-200",
                        isActive 
                          ? "bg-blue-500 text-white" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      )}
                      aria-current={isActive ? "page" : undefined}
                      role="listitem"
                    >
                      <item.icon
                        className="h-[13px] w-[13px] xl:h-[14px] xl:w-[14px] flex-shrink-0"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      {!collapsed && (
                        <>
                          <span className="text-[10px] xl:text-xs font-medium flex-1">
                            {item.name}
                          </span>
                          {item.badge !== undefined && (
                            <Badge 
                              variant={item.badgeVariant === 'destructive' ? 'destructive' : item.badgeVariant === 'warning' ? 'default' : 'default'}
                              className={cn(
                                "ml-auto text-[9px] xl:text-[10px] px-1 xl:px-1.5 py-0",
                                item.badgeVariant === 'warning' && "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
                                isActive && "bg-white/20 text-white"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && item.badge !== undefined && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 xl:w-4 xl:h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px] xl:text-[10px] font-bold">
                          {item.badge > 9 ? '9+' : item.badge}
                        </div>
                      )}
                    </Link>
                  )

                  return collapsed ? (
                    <TooltipProvider key={item.name}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          {NavLink}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          <p>{item.name}</p>
                          {item.badge !== undefined && (
                            <p className="text-xs text-slate-500 mt-1">{item.badge} items</p>
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

        {/* Logout */}
        <div className="p-2.5 xl:p-3 border-t flex-shrink-0 border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={() => {
              clearCurrentUser()
              window.location.href = "/"
            }}
            className={cn(
              "flex items-center gap-1.5 xl:gap-2 px-1.5 xl:px-2 py-1.5 xl:py-2 rounded-lg w-full",
              reducedMotion ? "" : "transition-colors duration-200",
              "text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            )}
            title={collapsed ? "Logout" : undefined}
            aria-label="Logout from application"
          >
            <LogOut
              className="h-[13px] w-[13px] xl:h-[14px] xl:w-[14px] flex-shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />
            {!collapsed && (
              <span className="text-[10px] xl:text-xs font-medium">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
