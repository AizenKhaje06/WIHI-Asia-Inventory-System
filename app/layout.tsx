import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"


export const metadata: Metadata = {
  title: "Inventory Pro - Professional Inventory Management",
  description: "Manage your inventory with Google Sheets integration",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inventory Pro",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Inventory Pro",
    "msapplication-TileColor": "#4f46e5",
    "msapplication-config": "/browserconfig.xml",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              let deferredPrompt;

              window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent the mini-infobar from appearing on mobile
                e.preventDefault();
                // Stash the event so it can be triggered later.
                deferredPrompt = e;
                // Update UI to notify the user they can install the PWA
                console.log('PWA install prompt available');
                // Optionally, show a custom install button here
              });

              window.addEventListener('appinstalled', (evt) => {
                console.log('PWA was installed');
                // Optionally, hide the install button
              });

              // Function to trigger the install prompt
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
