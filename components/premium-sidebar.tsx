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
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Warehouse Dispatch", href: "/dashboard/pos", icon: ShoppingCart },
      { name: "Reports", href: "/dashboard/reports", icon: FileText },
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
}

export function PremiumSidebar({ onNavClick, mobileOpen = false, onMobileClose }: PremiumSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const reducedMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [outOfStockCount, setOutOfStockCount] = useState(0)

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

  const navigation = getNavigation(lowStockCount, outOfStockCount)

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
          "fixed left-0 top-0 h-screen z-50 ease-in-out border-r flex flex-col",
          reducedMotion ? "" : "transition-all duration-300",
          collapsed ? "w-20" : "w-[240px]",
          isMobile && !mobileOpen && "-translate-x-full",
          isMobile && mobileOpen && "translate-x-0",
          // Light mode
          "bg-white border-slate-200 shadow-xl",
          // Dark mode - black with cyan glow
          "dark:bg-black dark:border-white/10 dark:shadow-2xl",
          "dark:after:absolute dark:after:top-0 dark:after:right-0 dark:after:w-[1px] dark:after:h-full dark:after:bg-gradient-to-b dark:after:from-cyan-500/0 dark:after:via-cyan-500/50 dark:after:to-cyan-500/0"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo & Brand */}
        <div 
          className="h-16 flex items-center justify-between px-3 border-b relative flex-shrink-0 border-slate-200 dark:border-white/10 dark:bg-gradient-to-r dark:from-transparent dark:via-cyan-500/5 dark:to-transparent"
        >
          <div className="flex items-center gap-2 flex-1">
            {!collapsed ? (
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br shadow-lg flex-shrink-0 from-blue-600 to-purple-600 dark:from-cyan-500 dark:to-cyan-600 dark:shadow-cyan-500/50" aria-hidden="true">
                    <Warehouse className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </div>
                  <h1 className="text-sm font-bold tracking-tight leading-none whitespace-nowrap text-slate-900 dark:text-white">
                    StockSync
                  </h1>
                </div>
                <p className="text-[10px] leading-none whitespace-nowrap text-slate-600 dark:text-gray-400 ml-8">Inventory System</p>
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-gradient-to-br shadow-lg flex-shrink-0 from-blue-600 to-purple-600 dark:from-cyan-500 dark:to-cyan-600 dark:shadow-cyan-500/50" aria-hidden="true">
                <Warehouse className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
            )}
          </div>
          
          {/* Collapse/Close Button */}
          {isMobile ? (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <div className="p-3 border-b flex-shrink-0 border-slate-200 dark:border-white/10">
          <div className={cn("flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 dark:border dark:border-white/10", collapsed && "justify-center")}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm from-blue-600 to-purple-600 dark:from-cyan-500 dark:to-cyan-600 dark:shadow-lg dark:shadow-cyan-500/30">
              <User className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">Admin User</p>
                <p className="text-xs truncate text-slate-600 dark:text-gray-400">Administrator</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 min-h-0 max-h-full" style={{ scrollbarGutter: 'stable' }} aria-label="Primary">
          {navigation.map((section, sectionIdx) => (
            <div key={section.section} className={cn("mb-6", sectionIdx === 0 && "mt-0")}>
              {!collapsed && (
                <div className="px-3 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500">
                    {section.section}
                  </p>
                </div>
              )}
              {collapsed && sectionIdx > 0 && (
                <div className="h-px my-2 mx-2 bg-slate-200 dark:bg-white/10" />
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
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg group relative border",
                        reducedMotion ? "" : "transition-all duration-200",
                        isActive 
                          ? "bg-blue-50 text-blue-600 border-transparent dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30 dark:shadow-lg dark:shadow-cyan-500/20" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                      )}
                      aria-current={isActive ? "page" : undefined}
                      role="listitem"
                    >
                      <item.icon
                        className={cn("h-5 w-5 flex-shrink-0", reducedMotion ? "" : "transition-colors duration-200")}
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
                                item.badgeVariant === 'warning' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
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
        <div className="p-3 border-t flex-shrink-0 border-slate-200 dark:border-white/10 dark:bg-gradient-to-r dark:from-transparent dark:via-red-500/5 dark:to-transparent">
          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn")
              window.location.href = "/"
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full group border",
              reducedMotion ? "" : "transition-all duration-200",
              "text-slate-600 hover:bg-red-50 hover:text-red-600 border-transparent dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:border-red-500/30"
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
