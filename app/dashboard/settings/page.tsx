"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, FileSpreadsheet, Key } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Configure your inventory system
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-[5px] bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              Google Sheets Integration
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Connect your Google Sheets for data storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <Database className="h-4 w-4" />
              <AlertDescription className="text-slate-800 dark:text-slate-200">
                <p className="mb-2 font-medium">Required Environment Variables:</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <li>GOOGLE_SHEET_ID - Your Google Sheets spreadsheet ID</li>
                  <li>GOOGLE_CLIENT_EMAIL - Service account email</li>
                  <li>GOOGLE_PRIVATE_KEY - Service account private key</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-[5px] bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                <Database className="h-5 w-5" />
              </div>
              Sheet Structure
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Required sheets and columns in your Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Inventory Sheet</h3>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">Create a sheet named &ldquo;Inventory&rdquo; with these columns:</p>
              <div className="rounded-[5px] bg-slate-50 dark:bg-slate-800 p-4">
                <code className="text-sm text-slate-800 dark:text-slate-200">
                  ID | Name | SKU | Category | Quantity | Cost Price | Selling Price | Reorder Level | Supplier | Last
                  Updated
                </code>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Transactions Sheet</h3>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                Create a sheet named &ldquo;Transactions&rdquo; with these columns:
              </p>
              <div className="rounded-[5px] bg-slate-50 dark:bg-slate-800 p-4">
                <code className="text-sm text-slate-800 dark:text-slate-200">
                  ID | Item ID | Item Name | Quantity | Cost Price | Selling Price | Total Cost | Total Revenue | Profit
                  | Timestamp | Type
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-[5px] bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
                <Key className="h-5 w-5" />
              </div>
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Create a Google Cloud project and enable Google Sheets API</li>
              <li>Create a service account and download the JSON credentials</li>
              <li>Share your Google Sheet with the service account email</li>
              <li>Add the environment variables to your Vercel project</li>
              <li>Create the required sheets with the column structure above</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
