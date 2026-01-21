"use client"

import { useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import { PremiumSidebar } from "@/components/premium-sidebar"
import { PremiumNavbar } from "@/components/premium-navbar"
import { OfflineIndicator } from "@/components/offline-indicator"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Premium Sidebar */}
          <PremiumSidebar />

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-72 transition-all duration-300">
            {/* Premium Navbar */}
            <PremiumNavbar sidebarCollapsed={sidebarCollapsed} />

            {/* Main content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden mt-[72px] p-6 min-w-0 w-full">
              <div className="w-full max-w-full min-w-0">
                {children}
              </div>
            </main>
          </div>
        </div>
        <OfflineIndicator />
        <Analytics />
      </Suspense>
    </ThemeProvider>
  )
}
