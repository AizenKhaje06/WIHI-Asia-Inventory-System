import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "StockSync - Professional Inventory Management System",
  description: "Enterprise-grade inventory management with real-time analytics, Google Sheets integration, and offline-first architecture",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["inventory", "management", "stock", "analytics", "POS", "enterprise"],
  authors: [{ name: "StockSync Team" }],
  creator: "StockSync",
  publisher: "StockSync",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StockSync",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "StockSync - Professional Inventory Management",
    description: "Enterprise-grade inventory management system",
    siteName: "StockSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "StockSync - Professional Inventory Management",
    description: "Enterprise-grade inventory management system",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "StockSync",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/System Logo.png" sizes="any" />
        <link rel="icon" href="/System Logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/System Logo.png" />
      </head>
      <body className={`min-h-screen w-full overflow-x-hidden antialiased ${GeistSans.variable} ${GeistMono.variable} font-sans`} suppressHydrationWarning>
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {/* Skip to main content for accessibility */}
              <a href="#main-content" className="skip-to-main sr-only focus:not-sr-only">
                Skip to main content
              </a>
              
              {/* Screen reader announcement region */}
              <div 
                role="status" 
                aria-live="polite" 
                aria-atomic="true" 
                className="sr-only"
                id="screen-reader-announcements"
              />
              
              {children}
              
              <Toaster richColors position="top-right" />
              <Analytics />
              
              {/* PWA Installation Script */}
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    let deferredPrompt;

                    window.addEventListener('beforeinstallprompt', (e) => {
                      e.preventDefault();
                      deferredPrompt = e;
                      console.log('PWA install prompt available');
                    });

                    window.addEventListener('appinstalled', (evt) => {
                      console.log('PWA was installed');
                    });

                    window.installPWA = () => {
                      if (deferredPrompt) {
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then((choiceResult) => {
                          if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                          } else {
                            console.log('User dismissed the install prompt');
                          }
                          deferredPrompt = null;
                        });
                      }
                    };

                    if ('serviceWorker' in navigator) {
                      window.addEventListener('load', function() {
                        navigator.serviceWorker.register('/service-worker.js')
                          .then(function(registration) {
                            console.log('SW registered: ', registration);
                          })
                          .catch(function(registrationError) {
                            console.log('SW registration failed: ', registrationError);
                          });
                      });
                    }
                  `,
                }}
              />
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
