import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  })

  const sheets = google.sheets({ version: "v4", auth })
  return sheets
}

export async function syncOrderLogsToInventory() {
  const sheets = await getGoogleSheetsClient()
  const masterSpreadsheetId = process.env.GOOGLE_SHEET_ID

  // Define the four order log sheet IDs (these need to be set in environment variables)
  const orderLogSheetIds = [
    process.env.ORDER_LOG_SHEET_1_ID,
    process.env.ORDER_LOG_SHEET_2_ID,
    process.env.ORDER_LOG_SHEET_3_ID,
    process.env.ORDER_LOG_SHEET_4_ID,
  ].filter(Boolean) as string[]

  if (orderLogSheetIds.length === 0) {
    throw new Error("No order log sheet IDs configured")
  }

  // Get master inventory
  const masterResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: masterSpreadsheetId,
    range: "Inventory!A2:B", // Get ID and Name columns
  })

  const masterRows = masterResponse.data.values || []
  const inventoryMap = new Map<string, { id: string; name: string; rowIndex: number }>()
  masterRows.forEach((row, index) => {
    const id = row[0] || ""
    const name = row[1] || ""
    if (id && name) {
      inventoryMap.set(name.toLowerCase(), { id, name, rowIndex: index + 2 }) // +2 because rows start at 2
    }
  })

  const validStatuses = ["SHIPPED", "PACKED", "DELIVERED", "RETURNED"]
  const processedOrders = new Set<string>()

  for (const orderLogSheetId of orderLogSheetIds) {
    try {
      // Get all sheet names (tabs) from the order log sheet
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: orderLogSheetId,
      })

      const sheetsList = spreadsheet.data.sheets || []
      const latestTab = sheetsList
        .filter(sheet => sheet.properties?.title)
        .sort((a, b) => (b.properties?.sheetId || 0) - (a.properties?.sheetId || 0))[0]

      if (!latestTab?.properties?.title) {
        console.warn(`No tabs found in order log sheet ${orderLogSheetId}`)
        continue
      }

      const latestTabName = latestTab.properties.title

      // Read data from the latest tab
      const orderResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: orderLogSheetId,
        range: `${latestTabName}!A:I`, // Columns A to I
      })

      const orderRows = orderResponse.data.values || []

      for (const row of orderRows.slice(1)) { // Skip header row
        if (row.length < 9) continue // Ensure we have all columns

        const date = row[0] || ""
        const store = row[1] || ""
        const qty = parseInt(row[3] || "0") || 0
        const product = row[4] || ""
        const status = row[8] || ""

        // Create a unique order identifier
        const orderKey = `${orderLogSheetId}-${latestTabName}-${date}-${store}-${product}-${qty}`

        // Skip if already processed or invalid status
        if (processedOrders.has(orderKey) || !validStatuses.includes(status.toUpperCase())) {
          continue
        }

        // Find matching product in master inventory
        const inventoryItem = inventoryMap.get(product.toLowerCase())
        if (!inventoryItem) {
          console.warn(`Product "${product}" not found in master inventory`)
          continue
        }

        // Get current quantity from master sheet
        const currentQtyResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: masterSpreadsheetId,
          range: `Inventory!D${inventoryItem.rowIndex}`,
        })

        const currentQty = parseInt(currentQtyResponse.data.values?.[0]?.[0] || "0") || 0

        // Deduct quantity
        const newQty = Math.max(0, currentQty - qty)

        // Update master inventory
        await sheets.spreadsheets.values.update({
          spreadsheetId: masterSpreadsheetId,
          range: `Inventory!D${inventoryItem.rowIndex}`,
          valueInputOption: "RAW",
          requestBody: {
            values: [[newQty]],
          },
        })

        // Update lastUpdated timestamp
        const timestamp = new Date().toISOString().split('T')[0] + " / " + new Date().toLocaleTimeString('en-US', { hour12: true })
        await sheets.spreadsheets.values.update({
          spreadsheetId: masterSpreadsheetId,
          range: `Inventory!J${inventoryItem.rowIndex}`,
          valueInputOption: "RAW",
          requestBody: {
            values: [[timestamp]],
          },
        })

        // Mark as processed
        processedOrders.add(orderKey)

        console.log(`Processed order: ${product} - ${qty} units deducted from ${store}`)
      }
    } catch (error) {
      console.error(`Error processing order log sheet ${orderLogSheetId}:`, error)
    }
  }

  console.log(`Order sync completed. Processed ${processedOrders.size} orders.`)
}
