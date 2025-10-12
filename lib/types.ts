export interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  costPrice: number
  sellingPrice: number
  reorderLevel: number
  supplier: string
  lastUpdated: string
}

export interface Transaction {
  id: string
  itemId: string
  itemName: string
  quantity: number
  costPrice: number
  sellingPrice: number
  totalCost: number
  totalRevenue: number
  profit: number
  timestamp: string
  type: "sale" | "restock"
  paymentMethod?: 'cash' | 'gcash' | 'paymaya'
  referenceNumber?: string
}

export interface DailySales {
  date: string
  revenue: number
  itemsSold: number
  profit: number
}

export interface MonthlySales {
  month: string
  revenue: number
  itemsSold: number
  profit: number
}

export interface SalesReport {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  itemsSold: number
  transactions: Transaction[]
  dailySales?: DailySales[]
  monthlySales?: MonthlySales[]
}

export interface DashboardStats {
  totalItems: number
  lowStockItems: number
  totalValue: number
  recentSales: number
  salesOverTime: { date: string; purchases: number; sales: number }[]
  topProducts: { name: string; sales: number }[]
  recentTransactions: Transaction[]
  topCategories: { name: string; sales: number }[]
  totalCategories: number
  totalProducts: number
}

export interface Log {
  id: string
  operation: string
  itemId?: string
  itemName?: string
  details: string
  timestamp: string
}

export interface Restock {
  id: string
  itemId: string
  itemName: string
  quantity: number
  costPrice: number
  totalCost: number
  timestamp: string
}
