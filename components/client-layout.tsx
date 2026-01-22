"use client"

import { useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import { PremiumSidebar } from "@/components/premium-sidebar"
import { PremiumNavbar } from "@/components/premium-navbar"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Premium Sidebar */}
            <PremiumSidebar 
              mobileOpen={mobileMenuOpen}
              onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-[260px] ml-0 transition-all duration-300">
              {/* Premium Navbar */}
              <PremiumNavbar 
                sidebarCollapsed={sidebarCollapsed}
                onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
              />

              {/* Main content */}
              <main 
                id="main-content" 
                className="flex-1 overflow-y-auto overflow-x-hidden mt-16 p-4 lg:p-6 min-w-0 w-full"
                style={{ backgroundColor: 'var(--background)' }}
                role="main"
              >
                <div className="w-full max-w-full min-w-0">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </div>
              </main>
            </div>
          </div>
          <OfflineIndicator />
          <Analytics />
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
