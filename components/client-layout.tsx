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
              className="fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r border-gray-800 bg-black/90 backdrop-blur-sm text-white w-52"
            >
              <Sidebar />
            </div>

            <main className="flex-1 overflow-auto pt-4 px-6 pb-6 ml-52">
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
