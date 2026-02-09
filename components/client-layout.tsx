"use client"

import { useState } from "react"
import { PremiumSidebar } from "@/components/premium-sidebar"
import { PremiumNavbar } from "@/components/premium-navbar"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ErrorBoundary } from "@/components/error-boundary"
import { CommandPalette } from "@/components/command-palette"
import { RouteGuard } from "@/components/route-guard"
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs"
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { cn } from "@/lib/utils"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <RouteGuard>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#121212]">
        {/* Premium Sidebar */}
        <PremiumSidebar 
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Main content area */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden ml-0 transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[96px]" : "lg:ml-[256px]"
        )}>
          {/* Premium Navbar */}
          <PremiumNavbar 
            sidebarCollapsed={sidebarCollapsed}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />

          {/* Main content */}
          <main 
            id="main-content" 
            className="flex-1 overflow-y-auto overflow-x-hidden lg:mt-20 mt-16 lg:p-6 p-4 min-w-0 w-full"
            role="main"
          >
            <div className="w-full max-w-full min-w-0">
              {/* Breadcrumb Navigation */}
              <DynamicBreadcrumbs />
              
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
      <CommandPalette />
      <OfflineIndicator />
      <KeyboardShortcutsModal />
    </RouteGuard>
  )
}
