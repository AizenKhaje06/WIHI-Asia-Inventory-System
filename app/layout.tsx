import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Inventory Pro - Professional Inventory Management",
  description: "Manage your inventory with Google Sheets integration",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div>Loading...</div>}>
            <div className="relative flex h-screen">
              <div className="absolute inset-0 bg-[url('/Corporate%20Building.png')] bg-cover bg-center bg-no-repeat"></div>
              <div className="absolute inset-0 bg-background/60"></div>
              <div className="relative z-10 flex h-full w-full">
                <Sidebar />
                <main className="flex-1 overflow-auto p-6">{children}</main>
              </div>
            </div>
            <Analytics />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
