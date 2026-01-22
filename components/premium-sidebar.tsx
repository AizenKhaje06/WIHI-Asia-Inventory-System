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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-accessibility"

const navigation = [
  {
    section: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Point of Sales", href: "/dashboard/pos", icon: ShoppingCart },
      { name: "Transactions", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    section: "Inventory",
    items: [
      { name: "Products", href: "/dashboard/inventory", icon: Package },
      { name: "Low Stocks", href: "/dashboard/inventory/low-stock", icon: AlertTriangle },
      { name: "Out of Stocks", href: "/dashboard/inventory/out-of-stock", icon: XCircle },
    ],
  },
  {
    section: "Insights",
    items: [
      { name: "Sales Analytics", href: "/dashboard/sales", icon: TrendingUp },
      { name: "Business Insights", href: "/dashboard/insights", icon: Brain },
    ],
  },
  {
    section: "CRM",
    items: [{ name: "Customers", href: "/dashboard/customers", icon: Users }],
  },
  {
    section: "Operations",
    items: [{ name: "Logs", href: "/dashboard/log", icon: FileText }],
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
          "fixed left-0 top-0 h-screen z-50 ease-in-out border-r",
          reducedMotion ? "" : "transition-all duration-300",
          collapsed ? "w-20" : "w-[240px]",
          isMobile && !mobileOpen && "-translate-x-full",
          isMobile && mobileOpen && "translate-x-0"
        )}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.3)",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo & Brand */}
        <div 
          className="h-16 flex items-center justify-between px-6 border-b"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#BFFF00] to-[#9FFF00] shadow-lg" aria-hidden="true">
              <Warehouse className="h-6 w-6 text-[#0a0e1a]" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <div className={cn(reducedMotion ? "" : "animate-in fade-in-0 slide-in-from-left-2 duration-300")}>
                <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--sidebar-text)' }}>
                  StockSync
                </h1>
                <p className="text-xs" style={{ color: 'var(--sidebar-text-secondary)' }}>Inventory System</p>
              </div>
            )}
          </div>
          {isMobile ? (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg transition-colors duration-200"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--sidebar-text-secondary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg transition-colors duration-200"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--sidebar-text-secondary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3" aria-label="Primary">
          {navigation.map((section, sectionIdx) => (
            <div key={section.section} className={cn("mb-6", sectionIdx === 0 && "mt-0")}>
              {!collapsed && (
                <div className="px-3 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sidebar-text-secondary)' }}>
                    {section.section}
                  </p>
                </div>
              )}
              <div className="space-y-1" role="list">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-full group relative",
                        reducedMotion ? "" : "transition-all duration-200"
                      )}
                      style={{
                        backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                        color: isActive ? '#BFFF00' : 'var(--sidebar-text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'
                          e.currentTarget.style.color = 'var(--sidebar-text)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = 'var(--sidebar-text-secondary)'
                        }
                      }}
                      title={collapsed ? item.name : undefined}
                      aria-current={isActive ? "page" : undefined}
                      role="listitem"
                    >
                      <item.icon
                        className={cn("h-5 w-5 flex-shrink-0", reducedMotion ? "" : "transition-colors duration-200")}
                        strokeWidth={isActive ? 2.5 : 2}
                        aria-hidden="true"
                      />
                      {!collapsed && (
                        <span className={cn("text-sm font-semibold", reducedMotion ? "" : "animate-in fade-in-0 slide-in-from-left-2 duration-300")}>
                          {item.name}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn")
              window.location.href = "/"
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-full w-full group",
              reducedMotion ? "" : "transition-all duration-200"
            )}
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--sidebar-text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--sidebar-text-secondary)'
            }}
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
              <span className={cn("text-sm font-semibold", reducedMotion ? "" : "animate-in fade-in-0 slide-in-from-left-2 duration-300")}>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
