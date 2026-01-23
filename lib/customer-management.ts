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

async function getCustomersSheetId(): Promise<number> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  })

  const customersSheet = response.data.sheets?.find(
    sheet => sheet.properties?.title === 'Customers'
  )

  return customersSheet?.properties?.sheetId ?? 0
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

  const customer = customers[index]
  const rowNumber = index + 2

  // Merge updates with existing customer data
  const updatedCustomer = { ...customer, ...updates }

  // Prepare the row data
  const rowData = [
    updatedCustomer.id,
    updatedCustomer.name,
    updatedCustomer.email || "",
    updatedCustomer.phone || "",
    updatedCustomer.address || "",
    updatedCustomer.loyaltyPoints,
    updatedCustomer.totalPurchases,
    updatedCustomer.totalSpent,
    updatedCustomer.lastPurchase || "",
    updatedCustomer.tier || "bronze",
    updatedCustomer.createdAt || "",
  ]

  // Update the entire row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Customers!A${rowNumber}:K${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [rowData]
    }
  })
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

export async function deleteCustomer(id: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  const customers = await getCustomers()
  const index = customers.findIndex((customer) => customer.id === id)

  if (index === -1) {
    throw new Error("Customer not found")
  }

  const rowNumber = index + 2
  const sheetId = await getCustomersSheetId()

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowNumber - 1,
            endIndex: rowNumber
          }
        }
      }]
    }
  })
}
