"use client"

import type { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-white to-bg-white">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-[72px]">
            <main className="flex-1 overflow-y-auto overflow-x-hidden pt-4 px-3 sm:px-4 md:px-6 pb-6 min-w-0 w-full">
              <div className="w-full max-w-full min-w-0">
                {children}
              </div>
            </main>
          </div>
        </div>
        <Analytics />
      </Suspense>
    </ThemeProvider>
  )
}
