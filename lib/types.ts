export interface InventoryItem {
  id: string
  name: string
  category: string
  storageRoom: string
  quantity: number
  costPrice: number
  sellingPrice: number
  reorderLevel: number
  lastUpdated: string
  totalCOGS: number
  sku?: string
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
  paymentMethod?: 'cash' | 'gcash' | 'paymaya' | 'online'
  referenceNumber?: string
  department?: string
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
  totalOrders: number
  transactions: Transaction[]
  dailySales?: DailySales[]
  monthlySales?: MonthlySales[]
}

export interface DashboardStats {
  totalItems: number
  lowStockItems: number
  totalValue: number
  recentSales: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  salesOverTime: { date: string; purchases: number; sales: number }[]
  topProducts: { name: string; sales: number }[]
  recentTransactions: Transaction[]
  topCategories: { name: string; sales: number }[]
  totalCategories: number
  totalProducts: number
  stockPercentageByCategory: { name: string; percentage: number }[]
  stocksCountByCategory: { name: string; count: number }[]
  stocksCountByStorageRoom: { name: string; count: number }[]
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
  reason: string
}
