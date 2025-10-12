"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Clock } from "@/components/clock"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  const handleMouseEnter = () => setIsSidebarHovered(true)
  const handleMouseLeave = () => setIsSidebarHovered(false)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense fallback={<div>Loading...</div>}>
        <div className="relative flex min-h-screen bg-black">
          <div className="relative z-10 flex h-full w-full flex-1">
            {/* Sidebar */}
            <div
              className={cn(
                "fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r border-gray-800 bg-black/90 backdrop-blur-sm text-white transition-all duration-300",
                isSidebarHovered ? "w-56" : "w-16"
              )}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Sidebar isHovered={isSidebarHovered} />
            </div>

            <main className={cn(
              "flex-1 overflow-auto pt-16 px-6 pb-6 transition-all duration-300",
              isSidebarHovered ? "ml-56" : "ml-16"
            )}>
              {children}
            </main>
            <Clock />
          </div>
        </div>
        <Analytics />
      </Suspense>
    </ThemeProvider>
  )
}
