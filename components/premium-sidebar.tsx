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
      { name: "Internal Usage", href: "/dashboard/internal-usage", icon: Users }, // Track Demo & Internal Use
      { name: "Reports", href: "/dashboard/reports", icon: FileText }, // Admin only
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
        const response = await fetch('/api/items')
        if (response.ok) {
          const items = await response.json()
          const lowStock = items.filter((item: any) => item.quantity > 0 && item.quantity <= item.reorderLevel).length
          const outOfStock = items.filter((item: any) => item.quantity === 0).length
          setLowStockCount(lowStock)
          setOutOfStockCount(outOfStock)
        }
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
          "fixed z-50 ease-in-out flex flex-col",
          reducedMotion ? "" : "transition-all duration-300",
          collapsed ? "w-20" : "w-[240px]",
          isMobile && !mobileOpen && "-translate-x-full",
          isMobile && mobileOpen && "translate-x-0",
          // Desktop: floating card with margin and subtle rounded corners
          "lg:left-4 lg:top-4 lg:h-[calc(100vh-2rem)] lg:rounded-[5px] lg:shadow-2xl",
          // Mobile: full screen
          "left-0 top-0 h-screen",
          // Light mode
          "bg-white border border-slate-200",
          // Dark mode - Material Design dark surface
          "dark:bg-[#1e1e1e] dark:border-[#444444] dark:shadow-2xl"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo & Brand - Premium Layout */}
        <div 
          className="h-16 lg:h-14 flex items-center justify-between px-3 border-b relative flex-shrink-0 border-slate-200 dark:border-[#444444] bg-gradient-to-r from-transparent via-slate-50/50 to-transparent dark:via-[#2a2a2a]/30"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!collapsed ? (
              <div className="flex items-center gap-2 w-full min-w-0">
                <div className="flex-shrink-0 w-9 h-9 relative" aria-hidden="true">
                  <img 
                    src="/System Logo.png" 
                    alt="StockSync Logo" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1">
                  <h1 className="text-[10px] font-extrabold tracking-tight leading-none bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent whitespace-nowrap">
                    StockSync
                  </h1>
                  <p className="text xs-[10px] leading-none text-slate-500 dark:text-[#888888] font-semibold tracking-wide uppercase whitespace-nowrap">
                  
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 w-11 h-11 relative mx-auto" aria-hidden="true">
                <img 
                  src="/System Logo.png" 
                  alt="StockSync Logo" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
            )}
          </div>
          
          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-[5px] transition-colors text-slate-600 hover:bg-slate-100 dark:text-[#B0B0B0] dark:hover:bg-[#2a2a2a] dark:hover:text-[#E0E0E0] flex-shrink-0 ml-1"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

          {/* User Profile Section */}
        <div className="p-3 border-b flex-shrink-0 border-slate-200 dark:border-[#444444] relative">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-[#2a2a2a] dark:to-[#2a2a2a]/50 border border-slate-200/50 dark:border-[#444444]/50 shadow-sm",
            collapsed && "justify-center"
          )}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm from-orange-500 to-orange-600 shadow-md ring-2 ring-white/50 dark:ring-[#1e1e1e]/50">
                <User className="h-4.5 w-4.5" />
              </div>
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#2a2a2a]" aria-hidden="true" />
            </div>
            {!collapsed && currentUser && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-900 dark:text-[#E0E0E0]">{currentUser.displayName}</p>
                <p className="text-xs truncate text-slate-600 dark:text-[#888888] flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full" aria-hidden="true" />
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
                "absolute top-1/2 -translate-y-1/2 -right-2 z-50",
                "w-5 h-5 flex items-center justify-center",
                "bg-white dark:bg-[#2a2a2a]",
                "border border-slate-200 dark:border-[#444444]",
                "rounded-full",
                "shadow-md hover:shadow-lg",
                "transition-all duration-200 ease-out",
                "text-slate-600 dark:text-[#B0B0B0]",
                "hover:text-orange-500 dark:hover:text-orange-400",
                "hover:bg-slate-50 dark:hover:bg-[#333333]",
                "hover:border-orange-500 dark:hover:border-orange-400",
                "hover:scale-110",
                "active:scale-95",
                "group"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className={cn(
                "transition-transform duration-200",
                collapsed ? "rotate-180" : "rotate-0"
              )}>
                <ChevronLeft className="h-3 w-3" strokeWidth={2.5} />
              </div>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 min-h-0 max-h-full" style={{ scrollbarGutter: 'stable' }} aria-label="Primary">
          {navigation.map((section, sectionIdx) => (
            <div key={section.section} className={cn("mb-6", sectionIdx === 0 && "mt-0")}>
              {!collapsed && (
                <div className="px-3 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#888888]">
                    {section.section}
                  </p>
                </div>
              )}
              {collapsed && sectionIdx > 0 && (
                <div className="h-px my-2 mx-2 bg-slate-200 dark:bg-[#444444]" />
              )}
              <div className="space-y-1" role="list">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  const NavLink = (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md group relative",
                        reducedMotion ? "" : "transition-all duration-200",
                        isActive 
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 dark:bg-orange-500 dark:text-white dark:shadow-orange-500/20 scale-[1.02]" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#B0B0B0] dark:hover:bg-[#2a2a2a] dark:hover:text-[#E0E0E0] hover:scale-[1.01] active:scale-[0.98]"
                      )}
                      aria-current={isActive ? "page" : undefined}
                      role="listitem"
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/80 rounded-r-full" aria-hidden="true" />
                      )}
                      <item.icon
                        className={cn("h-5 w-5 flex-shrink-0", reducedMotion ? "" : "transition-all duration-200", isActive && "drop-shadow-sm")}
                        strokeWidth={isActive ? 2.5 : 2}
                        aria-hidden="true"
                      />
                      {!collapsed && (
                        <>
                          <span className={cn("text-sm font-medium flex-1", reducedMotion ? "" : "animate-in fade-in-0 slide-in-from-left-2 duration-300")}>
                            {item.name}
                          </span>
                          {item.badge !== undefined && (
                            <Badge 
                              variant={item.badgeVariant === 'destructive' ? 'destructive' : item.badgeVariant === 'warning' ? 'default' : 'default'}
                              className={cn(
                                "ml-auto",
                                item.badgeVariant === 'warning' && "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border-amber-200 dark:border-amber-800",
                                isActive && "bg-white/20 text-white border-white/30 dark:bg-white/20 dark:text-white dark:border-white/30"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && item.badge !== undefined && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
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
        <div className="p-3 border-t flex-shrink-0 border-slate-200 dark:border-[#444444]">
          <button
            onClick={() => {
              clearCurrentUser()
              window.location.href = "/"
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-[5px] w-full group border",
              reducedMotion ? "" : "transition-all duration-200",
              "text-slate-600 hover:bg-red-50 hover:text-red-600 border-transparent dark:text-[#B0B0B0] dark:hover:bg-[#2a2a2a] dark:hover:text-red-400"
            )}
            title={collapsed ? "Logout" : undefined}
            aria-label="Logout from application"
          >
            <LogOut
              className={cn(
                "h-5 w-5 flex-shrink-0",
                reducedMotion ? "" : "transition-colors duration-200"
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
            {!collapsed && (
              <span className={cn("text-sm font-medium", reducedMotion ? "" : "animate-in fade-in-0 slide-in-from-left-2 duration-300")}>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
