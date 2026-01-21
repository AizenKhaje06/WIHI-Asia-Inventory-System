import { google } from "googleapis"
import type { Customer } from "./types"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

const formatTimestamp = (date: Date) => {
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
  const [datePart, timePart] = formatted.split(', ')
  const [month, day, year] = datePart.split('/')
  const [hour, minute] = timePart.split(':')
  const hour24 = parseInt(hour)
  const ampm = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 || 12
  return `${year}-${month}-${day} / ${hour12}:${minute} ${ampm}`
}

async function getGoogleSheetsClient() {
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

async function initializeCustomersSheet() {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Customers!A1:K1"
    })
  } catch (error) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Customers',
              gridProperties: {
                rowCount: 1000,
                columnCount: 11
              }
            }
          }
        }]
      }
    })
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Customers!A1:K1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Name", "Email", "Phone", "Address", "Loyalty Points", "Total Purchases", "Total Spent", "Last Purchase", "Tier", "Created At"]]
      }
    })
  }
}

export async function getCustomers(): Promise<Customer[]> {
  await initializeCustomersSheet()

  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Customers!A2:K",
  })

  const rows = response.data.values || []
  return rows.map((row) => ({
    id: row[0] || "",
    name: row[1] || "",
    email: row[2] || "",
    phone: row[3] || "",
    address: row[4] || "",
    loyaltyPoints: Number.parseInt(row[5] || "0") || 0,
    totalPurchases: Number.parseInt(row[6] || "0") || 0,
    totalSpent: Number.parseFloat(row[7] || "0") || 0,
    lastPurchase: row[8] || "",
    tier: (row[9] || "bronze") as 'bronze' | 'silver' | 'gold' | 'platinum',
    createdAt: row[10] || formatTimestamp(new Date()),
  }))
}

export async function addCustomer(customer: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const id = `CUST-${Date.now()}`
  const createdAt = formatTimestamp(new Date())

  const values = [
    [
      id,
      customer.name,
      customer.email || "",
      customer.phone || "",
      customer.address || "",
      customer.loyaltyPoints,
      customer.totalPurchases,
      customer.totalSpent,
      customer.lastPurchase || "",
      customer.tier || "bronze",
      createdAt,
    ],
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Customers!A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  })

  return { ...customer, id, createdAt }
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const customers = await getCustomers()
  const index = customers.findIndex((customer) => customer.id === id)

  if (index === -1) {
    throw new Error("Customer not found")
  }

  const rowNumber = index + 2

  const fieldToColumn: Record<keyof Customer, number> = {
    id: 0,
    name: 1,
    email: 2,
    phone: 3,
    address: 4,
    loyaltyPoints: 5,
    totalPurchases: 6,
    totalSpent: 7,
    lastPurchase: 8,
    tier: 9,
    createdAt: 10,
    notes: 11,
  }

  const requests = []

  for (const [key, value] of Object.entries(updates)) {
    const fieldKey = key as keyof Customer
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

export async function calculateCustomerTier(totalSpent: number): Promise<'bronze' | 'silver' | 'gold' | 'platinum'> {
  if (totalSpent >= 100000) return 'platinum'
  if (totalSpent >= 50000) return 'gold'
  if (totalSpent >= 20000) return 'silver'
  return 'bronze'
}

export async function addLoyaltyPoints(customerId: string, amount: number): Promise<void> {
  const customers = await getCustomers()
  const customer = customers.find(c => c.id === customerId)
  
  if (!customer) {
    throw new Error("Customer not found")
  }

  const points = Math.floor(amount / 100) // 1 point per 100 spent
  await updateCustomer(customerId, {
    loyaltyPoints: customer.loyaltyPoints + points
  })
}
