"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, Bell, Search, Plus, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface CleanSaaSHeaderProps {
  sidebarCollapsed: boolean
  onMobileMenuToggle: () => void
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/inventory": "Inventory",
  "/dashboard/inventory/create": "Add New Item",
  "/dashboard/inventory/low-stock": "Low Stock Items",
  "/dashboard/inventory/out-of-stock": "Out of Stock",
  "/dashboard/pos": "Warehouse Dispatch",
  "/dashboard/sales": "Sales Analytics",
  "/dashboard/reports": "Sales Reports",
  "/dashboard/insights": "Business Insights",
  "/dashboard/analytics": "Analytics",
  "/dashboard/customers": "Customers",
  "/dashboard/log": "Activity Log",
  "/dashboard/settings": "Settings",
}

export function CleanSaaSHeader({ sidebarCollapsed, onMobileMenuToggle }: CleanSaaSHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [username, setUsername] = useState("")

  // Get page title
  const pageTitle = pageTitles[pathname] || "Dashboard"

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean)
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/")
      const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ")
      return { title, href }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("username")
      localStorage.removeItem("userRole")
      localStorage.removeItem("displayName")
    }
    router.push("/")
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-[#F8FAFC] border-b border-[#E5E7EB] z-40 transition-all duration-200",
        sidebarCollapsed ? "left-[72px]" : "left-[240px]",
        "max-lg:left-0"
      )}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Mobile Menu + Breadcrumbs + Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>

          {/* Breadcrumbs + Title */}
          <div className="flex items-center gap-2">
            {breadcrumbs.length > 1 && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                {breadcrumbs.slice(0, -1).map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-2">
                    <span className="hover:text-slate-700 cursor-pointer">
                      {crumb.title}
                    </span>
                    <span>/</span>
                  </div>
                ))}
              </div>
            )}
            <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
          </div>
        </div>

        {/* Right: Actions + User */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-xs font-mono bg-slate-100 border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-slate-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Primary CTA */}
          <Button
            onClick={() => router.push("/dashboard/inventory/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-700" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {typeof window !== "undefined" && localStorage.getItem("displayName") || "User"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {typeof window !== "undefined" && localStorage.getItem("username") || ""}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <User className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
