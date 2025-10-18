
import { google } from "googleapis"
import { format, parse } from "date-fns"
import type { InventoryItem, Transaction, Log, Restock } from "./types"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

const formatTimestamp = (date: Date) => format(date, "yyyy-MM-dd / hh:mm a")

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
    range: "Inventory!A2:J",
  })

  const rows = response.data.values || []
  return rows.map((row) => {
    const quantity = Number.parseInt(row[3] || "0") || 0
    const storedTotalCOGS = Number.parseFloat(row[4] || "0") || 0
    const costPrice = Number.parseFloat(row[5] || "0") || 0
    const totalCOGS = storedTotalCOGS > 0 ? storedTotalCOGS : quantity * costPrice

    return {
      id: row[0] || "",
      name: row[1] || "",
      category: row[2] || "",
      storageRoom: row[3] || "",
      quantity,
      totalCOGS: isNaN(totalCOGS) ? 0 : totalCOGS,
      costPrice,
      sellingPrice: Number.parseFloat(row[6] || "0") || 0,
      reorderLevel: Number.parseInt(row[7] || "0") || 0,
      lastUpdated: row[8] || formatTimestamp(new Date()),
    }
  })
}

export async function addInventoryItem(item: Omit<InventoryItem, "id" | "lastUpdated">): Promise<InventoryItem> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const id = `ITEM-${Date.now()}`
  const lastUpdated = formatTimestamp(new Date())
  const totalCOGS = item.quantity * item.costPrice

  const values = [
    [
      id,
      item.name,
      item.category,
      item.storageRoom,
      item.quantity,
      totalCOGS,
      item.costPrice,
      item.sellingPrice,
      item.reorderLevel,
      lastUpdated,
    ],
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Inventory!A:J",
    valueInputOption: "RAW",
    requestBody: { values },
  })

  return { ...item, id, lastUpdated, totalCOGS }
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
    updates.lastUpdated = formatTimestamp(new Date())
  }

  const fieldToColumn: Record<keyof InventoryItem, number> = {
    id: 0,
    name: 1,
    category: 2,
    storageRoom: 3,
    quantity: 4,
    totalCOGS: 5,
    costPrice: 6,
    sellingPrice: 7,
    reorderLevel: 8,
    lastUpdated: 9,
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

  // If quantity or costPrice is being updated, recalculate totalCOGS
  if (updates.quantity !== undefined || updates.costPrice !== undefined) {
    const updatedItem = { ...items[index], ...updates }
    const newTotalCOGS = updatedItem.quantity * updatedItem.costPrice

    requests.push({
      updateCells: {
        range: {
          sheetId: 0,
          startRowIndex: rowNumber - 1,
          endRowIndex: rowNumber,
          startColumnIndex: 4,
          endColumnIndex: 5,
        },
        fields: "userEnteredValue",
        rows: [{
          values: [{
            userEnteredValue: { numberValue: newTotalCOGS }
          }]
        }]
      }
    })
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
  const timestamp = formatTimestamp(new Date())

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

async function initializeLogsSheet() {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Logs!A1:F1"
    })
  } catch (error) {
    // Sheet doesn't exist, create it
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Logs',
              gridProperties: {
                rowCount: 1000,
                columnCount: 6
              }
            }
          }
        }]
      }
    })
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Logs!A1:F1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Operation", "Item ID", "Item Name", "Details", "Timestamp"]]
      }
    })
  }
}

export async function addLog(log: Omit<Log, "id" | "timestamp">): Promise<Log> {
  await initializeLogsSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const id = `LOG-${Date.now()}`
  const timestamp = formatTimestamp(new Date())

  const values = [
    [
      id,
      log.operation,
      log.itemId || "",
      log.itemName || "",
      log.details,
      timestamp,
    ],
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Logs!A:F",
    valueInputOption: "RAW",
    requestBody: { values },
  })

  return { ...log, id, timestamp }
}

export async function getLogs(): Promise<Log[]> {
  await initializeLogsSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Logs!A2:F",
  })

  const rows = response.data.values || []
  return rows.map((row) => ({
    id: row[0] || "",
    operation: row[1] || "",
    itemId: row[2] || "",
    itemName: row[3] || "",
    details: row[4] || "",
    timestamp: row[5] || "",
  })).sort((a, b) => parse(b.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime() - parse(a.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime())
}

async function initializeRestockSheet() {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Restock!A1:H1"
    })
  } catch (error) {
    // Sheet doesn't exist, create it
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Restock',
              gridProperties: {
                rowCount: 1000,
                columnCount: 8
              }
            }
          }
        }]
      }
    })
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Restock!A1:H1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Item ID", "Item Name", "Quantity Added", "Cost Price", "Total Cost", "Timestamp", "Reason"]]
      }
    })
  }
}

export async function addRestock(restock: Omit<Restock, "id" | "timestamp">): Promise<Restock> {
  await initializeRestockSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const id = `RSTK-${Date.now()}`
  const timestamp = formatTimestamp(new Date())

  const values = [
    [
      id,
      restock.itemId,
      restock.itemName,
      restock.quantity,
      restock.costPrice,
      restock.totalCost,
      timestamp,
      restock.reason,
    ],
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Restock!A:H",
    valueInputOption: "RAW",
    requestBody: { values },
  })

  return { ...restock, id, timestamp }
}

export async function getRestocks(): Promise<Restock[]> {
  await initializeRestockSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Restock!A2:H",
  })

  const rows = response.data.values || []
  return rows.map((row) => ({
    id: row[0] || "",
    itemId: row[1] || "",
    itemName: row[2] || "",
    quantity: Number.parseInt(row[3] || "0"),
    costPrice: Number.parseFloat(row[4] || "0"),
    totalCost: Number.parseFloat(row[5] || "0"),
    timestamp: row[6] || "",
    reason: row[7] || "",
  })).sort((a, b) => parse(b.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime() - parse(a.timestamp, "yyyy-MM-dd / hh:mm a", new Date()).getTime())
}
