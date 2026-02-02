
import { google } from "googleapis"
import { format, parse } from "date-fns"
import type { InventoryItem, Transaction, Log, Restock } from "./types"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

const formatTimestamp = (date: Date) => {
  // Use Taipei timezone (UTC+8) for accurate local time
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  const formatted = date.toLocaleString('en-US', options)
  // Convert to format: YYYY-MM-DD / HH:MM AM/PM
  const [datePart, timePart] = formatted.split(', ')
  const [month, day, year] = datePart.split('/')
  const [hour, minute] = timePart.split(':')
  const hour24 = parseInt(hour)
  const ampm = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 || 12
  return `${year}-${month}-${day} / ${hour12}:${minute} ${ampm}`
}

async function initializeInventorySheet() {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Inventory!A1:J1"
    })
  } catch (error) {
    // Sheet doesn't exist, create it
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Inventory',
              gridProperties: {
                rowCount: 1000,
                columnCount: 10
              }
            }
          }
        }]
      }
    })
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Inventory!A1:J1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Name", "Category", "Quantity", "Total COGS", "Cost Price", "Selling Price", "Reorder Level", "Storage Room", "Last Updated"]]
      }
    })
  }
}

async function initializeTransactionsSheet() {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Transactions!A1:M1"
    })
  } catch (error) {
    // Sheet doesn't exist, create it
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Transactions',
              gridProperties: {
                rowCount: 1000,
                columnCount: 13
              }
            }
          }
        }]
      }
    })
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Transactions!A1:M1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Item ID", "Item Name", "Quantity", "Cost Price", "Selling Price", "Total Cost", "Profit", "Timestamp", "Department", "Staff Name", "Notes", "Transaction Type"]]
      }
    })
  }
}

export async function getGoogleSheetsClient() {
  // Validate required environment variables
  if (!process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error('Missing required environment variable: GOOGLE_CLIENT_EMAIL')
  }
  
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing required environment variable: GOOGLE_PRIVATE_KEY')
  }
  
  if (!process.env.GOOGLE_SHEET_ID) {
    throw new Error('Missing required environment variable: GOOGLE_SHEET_ID')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  })

  const authClient = await auth.getClient()
  const sheets = google.sheets({ version: "v4", auth: authClient as any })
  return sheets
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  await initializeInventorySheet()

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
      storageRoom: row[8] || "",
      quantity,
      totalCOGS: isNaN(totalCOGS) ? 0 : totalCOGS,
      costPrice,
      sellingPrice: Number.parseFloat(row[6] || "0") || 0,
      reorderLevel: Number.parseInt(row[7] || "0") || 0,
      lastUpdated: row[9] || formatTimestamp(new Date()),
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
      item.quantity,
      totalCOGS,
      item.costPrice,
      item.sellingPrice,
      item.reorderLevel,
      item.storageRoom,
      lastUpdated,
    ],
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Inventory!A:J",
    valueInputOption: "USER_ENTERED",
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

  const fieldToColumn: Partial<Record<keyof InventoryItem, number>> = {
    id: 0,
    name: 1,
    category: 2,
    quantity: 3,
    totalCOGS: 4,
    costPrice: 5,
    sellingPrice: 6,
    reorderLevel: 7,
    storageRoom: 8,
    lastUpdated: 9,
    sku: 10,
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
  await initializeTransactionsSheet()

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
      transaction.profit,
      timestamp,
      transaction.department || "",
      transaction.staffName || "",
      transaction.notes || "",
      transaction.transactionType || "sale",
    ],
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Transactions!A:M",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  })

  return { ...transaction, id, timestamp }
}

export async function getTransactions(): Promise<Transaction[]> {
  await initializeTransactionsSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Transactions!A2:M",
  })

  const rows = response.data.values || []
  return rows.map((row) => {
    const quantity = Number.parseInt(row[3] || "0")
    const sellingPrice = Number.parseFloat(row[5] || "0")
    const transactionType = (row[12] || "sale") as "sale" | "demo" | "internal" | "transfer"
    // For non-sales transactions, totalRevenue should be 0
    const totalRevenue = transactionType === 'sale' ? quantity * sellingPrice : 0
    return {
      id: row[0] || "",
      itemId: row[1] || "",
      itemName: row[2] || "",
      quantity,
      costPrice: Number.parseFloat(row[4] || "0"),
      sellingPrice,
      totalCost: Number.parseFloat(row[6] || "0"),
      totalRevenue,
      profit: Number.parseFloat(row[7] || "0"),
      timestamp: row[8] || "",
      type: "sale" as "sale" | "restock",
      transactionType,
      department: row[9] || "",
      staffName: row[10] || "",
      notes: row[11] || "",
    }
  })
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
    valueInputOption: "USER_ENTERED",
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
    valueInputOption: "USER_ENTERED",
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

// ============================================
// STORAGE ROOMS MANAGEMENT
// ============================================

async function initializeStorageRoomsSheet() {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "StorageRooms!A1:C1"
    })
  } catch (error) {
    // Sheet doesn't exist, create it
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'StorageRooms',
              gridProperties: {
                rowCount: 100,
                columnCount: 3
              }
            }
          }
        }]
      }
    })
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "StorageRooms!A1:C1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Room Name", "Created At"]]
      }
    })
    
    // Add default storage rooms
    const defaultRooms = [
      ["ROOM-DEFAULT-1", "Main Warehouse", formatTimestamp(new Date())],
      ["ROOM-DEFAULT-2", "Cold Storage", formatTimestamp(new Date())],
      ["ROOM-DEFAULT-3", "Dry Storage", formatTimestamp(new Date())],
      ["ROOM-DEFAULT-4", "Receiving Area", formatTimestamp(new Date())],
    ]
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "StorageRooms!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: defaultRooms }
    })
  }
}

export async function getStorageRooms(): Promise<import("./types").StorageRoom[]> {
  await initializeStorageRoomsSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "StorageRooms!A2:C",
  })

  const rows = response.data.values || []
  return rows.map((row) => ({
    id: row[0] || "",
    name: row[1] || "",
    createdAt: row[2] || formatTimestamp(new Date()),
  }))
}

export async function addStorageRoom(name: string): Promise<import("./types").StorageRoom> {
  await initializeStorageRoomsSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const id = `ROOM-${Date.now()}`
  const createdAt = formatTimestamp(new Date())

  const values = [[id, name, createdAt]]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "StorageRooms!A:C",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  })

  return { id, name, createdAt }
}

export async function updateStorageRoom(id: string, name: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const rooms = await getStorageRooms()
  const index = rooms.findIndex((room) => room.id === id)

  if (index === -1) {
    throw new Error("Storage room not found")
  }

  const rowNumber = index + 2

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `StorageRooms!B${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[name]]
    }
  })
}

export async function deleteStorageRoom(id: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const rooms = await getStorageRooms()
  const index = rooms.findIndex((room) => room.id === id)

  if (index === -1) {
    throw new Error("Storage room not found")
  }

  const rowNumber = index + 2

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: await getSheetId(sheets, spreadsheetId, "StorageRooms"),
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

async function getSheetId(sheets: any, spreadsheetId: string, sheetName: string): Promise<number> {
  const response = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = response.data.sheets.find((s: any) => s.properties.title === sheetName)
  return sheet?.properties?.sheetId || 0
}


// ==================== CATEGORIES MANAGEMENT ====================

async function initializeCategoriesSheet() {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Categories!A1:C1"
    })
  } catch (error) {
    // Sheet doesn't exist, create it
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Categories',
              gridProperties: {
                rowCount: 100,
                columnCount: 3
              }
            }
          }
        }]
      }
    })
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Categories!A1:C1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Category Name", "Created At"]]
      }
    })

    // Add default categories
    const timestamp = formatTimestamp(new Date())
    const defaultCategories = [
      ["CAT-1", "Electronics & Gadgets", timestamp],
      ["CAT-2", "Fashion & Apparel", timestamp],
      ["CAT-3", "Health, Beauty & Personal Care", timestamp],
      ["CAT-4", "Home & Living", timestamp],
      ["CAT-5", "Sports & Outdoors", timestamp],
      ["CAT-6", "Baby, Kids & Toys", timestamp],
      ["CAT-7", "Groceries & Pets", timestamp],
      ["CAT-8", "Automotive & Industrial", timestamp],
      ["CAT-9", "Stationery & Books", timestamp],
      ["CAT-10", "Other / Miscellaneous", timestamp],
    ]
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Categories!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: defaultCategories }
    })
  }
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export async function getCategories(): Promise<Category[]> {
  await initializeCategoriesSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Categories!A2:C",
  })

  const rows = response.data.values || []
  return rows.map((row) => ({
    id: row[0] || "",
    name: row[1] || "",
    createdAt: row[2] || formatTimestamp(new Date()),
  }))
}

export async function addCategory(name: string): Promise<Category> {
  await initializeCategoriesSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const id = `CAT-${Date.now()}`
  const createdAt = formatTimestamp(new Date())

  const values = [[id, name, createdAt]]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Categories!A:C",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  })

  return { id, name, createdAt }
}

export async function updateCategory(id: string, name: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const categories = await getCategories()
  const index = categories.findIndex((cat) => cat.id === id)

  if (index === -1) {
    throw new Error("Category not found")
  }

  const rowNumber = index + 2

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Categories!B${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[name]]
    }
  })
}

export async function deleteCategory(id: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const categories = await getCategories()
  const index = categories.findIndex((cat) => cat.id === id)

  if (index === -1) {
    throw new Error("Category not found")
  }

  const rowNumber = index + 2

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: await getSheetId(sheets, spreadsheetId, "Categories"),
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

// ==================== ACCOUNTS MANAGEMENT ====================

async function initializeAccountsSheet() {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Accounts!A1:F1"
    })
  } catch (error) {
    // Sheet doesn't exist, create it
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Accounts',
              gridProperties: {
                rowCount: 100,
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
      range: "Accounts!A1:F1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Username", "Password", "Role", "Display Name", "Created At"]]
      }
    })

    // Add default accounts
    const timestamp = formatTimestamp(new Date())
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Accounts!A2:F",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          ["1", "admin", "admin123", "admin", "Administrator", timestamp],
          ["2", "staff", "ops456", "operations", "Operations Staff", timestamp]
        ]
      }
    })
  }
}

export interface Account {
  id: string
  username: string
  password: string
  role: 'admin' | 'operations'
  displayName: string
  createdAt: string
}

export async function getAccounts(): Promise<Account[]> {
  await initializeAccountsSheet()
  
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Accounts!A2:F"
  })

  const rows = response.data.values || []
  return rows.map(row => ({
    id: row[0] || "",
    username: row[1] || "",
    password: row[2] || "",
    role: (row[3] || "operations") as 'admin' | 'operations',
    displayName: row[4] || "",
    createdAt: row[5] || ""
  }))
}

export async function getAccountByUsername(username: string): Promise<Account | null> {
  const accounts = await getAccounts()
  return accounts.find(acc => acc.username === username) || null
}

export async function validateCredentials(username: string, password: string): Promise<Account | null> {
  const account = await getAccountByUsername(username)
  if (account && account.password === password) {
    return account
  }
  return null
}

export async function updateAccount(username: string, updates: { password?: string; displayName?: string }): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  // Get all accounts to find the row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Accounts!A2:F"
  })

  const rows = response.data.values || []
  const rowIndex = rows.findIndex(row => row[1] === username)

  if (rowIndex === -1) {
    throw new Error("Account not found")
  }

  const actualRowNumber = rowIndex + 2 // +2 because: +1 for header, +1 for 0-based index
  const currentRow = rows[rowIndex]

  // Update only the fields that are provided
  const updatedRow = [
    currentRow[0], // ID
    currentRow[1], // Username (unchanged)
    updates.password !== undefined ? updates.password : currentRow[2], // Password
    currentRow[3], // Role (unchanged)
    updates.displayName !== undefined ? updates.displayName : currentRow[4], // Display Name
    currentRow[5] // Created At (unchanged)
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Accounts!A${actualRowNumber}:F${actualRowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [updatedRow]
    }
  })
}

export async function updateUsername(oldUsername: string, newUsername: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  // Get all accounts to find the row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Accounts!A2:F"
  })

  const rows = response.data.values || []
  const rowIndex = rows.findIndex(row => row[1] === oldUsername)

  if (rowIndex === -1) {
    throw new Error("Account not found")
  }

  // Check if new username already exists
  const usernameExists = rows.some(row => row[1] === newUsername)
  if (usernameExists) {
    throw new Error("Username already exists")
  }

  const actualRowNumber = rowIndex + 2
  const currentRow = rows[rowIndex]

  // Update username
  const updatedRow = [
    currentRow[0], // ID
    newUsername, // New Username
    currentRow[2], // Password
    currentRow[3], // Role
    currentRow[4], // Display Name
    currentRow[5] // Created At
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Accounts!A${actualRowNumber}:F${actualRowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [updatedRow]
    }
  })
}

export async function addAccount(account: Omit<Account, "id" | "createdAt">): Promise<Account> {
  await initializeAccountsSheet()
  
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  // Check if username already exists
  const existingAccount = await getAccountByUsername(account.username)
  if (existingAccount) {
    throw new Error("Username already exists")
  }

  // Get current accounts to generate new ID
  const accounts = await getAccounts()
  const newId = (accounts.length + 1).toString()
  const timestamp = formatTimestamp(new Date())

  const newAccount: Account = {
    id: newId,
    ...account,
    createdAt: timestamp
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Accounts!A2:F",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        newAccount.id,
        newAccount.username,
        newAccount.password,
        newAccount.role,
        newAccount.displayName,
        newAccount.createdAt
      ]]
    }
  })

  return newAccount
}
