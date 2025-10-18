"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, FileSpreadsheet, Key } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your inventory system</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileSpreadsheet className="h-5 w-5" />
              Google Sheets Integration
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Connect your Google Sheets for data storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-secondary border-border">
              <Database className="h-4 w-4" />
              <AlertDescription className="text-foreground">
                <p className="mb-2 font-medium">Required Environment Variables:</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>GOOGLE_SHEET_ID - Your Google Sheets spreadsheet ID</li>
                  <li>GOOGLE_CLIENT_EMAIL - Service account email</li>
                  <li>GOOGLE_PRIVATE_KEY - Service account private key</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Database className="h-5 w-5" />
              Sheet Structure
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Required sheets and columns in your Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Inventory Sheet</h3>
              <p className="mb-2 text-sm text-muted-foreground">Create a sheet named &ldquo;Inventory&rdquo; with these columns:</p>
              <div className="rounded-lg bg-secondary p-4">
                <code className="text-sm text-foreground">
                  ID | Name | SKU | Category | Quantity | Cost Price | Selling Price | Reorder Level | Supplier | Last
                  Updated
                </code>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Transactions Sheet</h3>
              <p className="mb-2 text-sm text-muted-foreground">
                Create a sheet named &ldquo;Transactions&rdquo; with these columns:
              </p>
              <div className="rounded-lg bg-secondary p-4">
                <code className="text-sm text-foreground">
                  ID | Item ID | Item Name | Quantity | Cost Price | Selling Price | Total Cost | Total Revenue | Profit
                  | Timestamp | Type
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Key className="h-5 w-5" />
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
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
