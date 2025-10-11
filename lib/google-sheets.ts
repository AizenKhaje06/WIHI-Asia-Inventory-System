import { google } from "googleapis"
import type { InventoryItem, Transaction } from "./types"

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

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Inventory!A2:L",
  })

  const rows = response.data.values || []
  return rows.map((row) => ({
    id: row[0] || "",
    name: row[1] || "",
    sku: row[2] || "",
    category: row[3] || "",
    quantity: Number.parseInt(row[4] || "0"),
    costPrice: Number.parseFloat(row[5] || "0"),
    sellingPrice: Number.parseFloat(row[6] || "0"),
    reorderLevel: Number.parseInt(row[7] || "0"),
    supplier: row[8] || "",
    lastUpdated: row[9] || new Date().toISOString(),
    restockAmount: Number.parseFloat(row[10] || "0"),
    restockDate: row[11] || "",
  }))
}

export async function addInventoryItem(item: Omit<InventoryItem, "id" | "lastUpdated">): Promise<InventoryItem> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const id = `ITEM-${Date.now()}`
  const lastUpdated = new Date().toISOString()

  const values = [
    [
      id,
      item.name,
      item.sku,
      item.category,
      item.quantity,
      item.costPrice,
      item.sellingPrice,
      item.reorderLevel,
      item.supplier,
      lastUpdated,
      0,
      "",
    ],
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Inventory!A:L",
    valueInputOption: "RAW",
    requestBody: { values },
  })

  return { ...item, id, lastUpdated }
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const items = await getInventoryItems()
  const index = items.findIndex((item) => item.id === id)

  if (index === -1) {
    throw new Error("Item not found")
  }

  const rowNumber = index + 2

  // Always update lastUpdated if not provided
  if (!updates.lastUpdated) {
    updates.lastUpdated = new Date().toISOString()
  }

  const fieldToColumn: Record<keyof InventoryItem, number> = {
    id: 0,
    name: 1,
    sku: 2,
    category: 3,
    quantity: 4,
    costPrice: 5,
    sellingPrice: 6,
    reorderLevel: 7,
    supplier: 8,
    lastUpdated: 9,
    restockAmount: 10,
    restockDate: 11,
  }

  const requests = []

  for (const [key, value] of Object.entries(updates)) {
    const fieldKey = key as keyof InventoryItem
    const col = fieldToColumn[fieldKey]
    if (col !== undefined && value !== undefined) {
      let userEnteredValue: any
      if (typeof value === 'number') {
        userEnteredValue = { numberValue: value }
      } else if (typeof value === 'string') {
        userEnteredValue = { stringValue: value }
      } else {
        continue
      }

      requests.push({
        updateCells: {
          range: {
            sheetId: 0,
            startRowIndex: rowNumber - 1,
            endRowIndex: rowNumber,
            startColumnIndex: col,
            endColumnIndex: col + 1,
          },
          fields: "userEnteredValue",
          rows: [{
            values: [{
              userEnteredValue
            }]
          }]
        }
      })
    }
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests
      }
    })
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const items = await getInventoryItems()
  const index = items.findIndex((item) => item.id === id)

  if (index === -1) {
    throw new Error("Item not found")
  }

  const rowNumber = index + 2

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  })
}

export async function addTransaction(transaction: Omit<Transaction, "id" | "timestamp">): Promise<Transaction> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const id = `TXN-${Date.now()}`
  const timestamp = new Date().toISOString()

  const values = [
    [
      id,
      transaction.itemId,
      transaction.itemName,
      transaction.quantity,
      transaction.costPrice,
      transaction.sellingPrice,
      transaction.totalCost,
      transaction.totalRevenue,
      transaction.profit,
      timestamp,
      transaction.type,
      transaction.paymentMethod,
      transaction.referenceNumber || "",
    ],
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Transactions!A:M",
    valueInputOption: "RAW",
    requestBody: { values },
  })

  return { ...transaction, id, timestamp }
}

export async function getTransactions(): Promise<Transaction[]> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Transactions!A2:M",
  })

  const rows = response.data.values || []
  return rows.map((row) => ({
    id: row[0] || "",
    itemId: row[1] || "",
    itemName: row[2] || "",
    quantity: Number.parseInt(row[3] || "0"),
    costPrice: Number.parseFloat(row[4] || "0"),
    sellingPrice: Number.parseFloat(row[5] || "0"),
    totalCost: Number.parseFloat(row[6] || "0"),
    totalRevenue: Number.parseFloat(row[7] || "0"),
    profit: Number.parseFloat(row[8] || "0"),
    timestamp: row[9] || "",
    type: (row[10] || "sale") as "sale" | "restock",
    paymentMethod: (row[11] || "cash") as 'cash' | 'gcash' | 'paymaya',
    referenceNumber: row[12] || "",
  }))
}
