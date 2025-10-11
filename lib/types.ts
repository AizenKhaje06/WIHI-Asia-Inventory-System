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
  restockAmount?: number
  restockDate?: string
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
  paymentMethod: 'cash' | 'gcash' | 'paymaya'
  referenceNumber?: string
}

export interface SalesReport {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  itemsSold: number
  transactions: Transaction[]
}

export interface DashboardStats {
  totalItems: number
  lowStockItems: number
  totalValue: number
  recentSales: number
}

export interface Log {
  id: string
  operation: string
  itemId?: string
  itemName?: string
  details: string
  timestamp: string
}
