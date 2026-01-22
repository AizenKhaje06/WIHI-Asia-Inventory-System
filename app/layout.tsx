import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import type { ReactNode } from "react"

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
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`min-h-screen w-full overflow-x-hidden font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
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
      </body>
    </html>
  )
}
