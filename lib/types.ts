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
  discount?: number // Percentage discount
  discountType?: 'percentage' | 'fixed'
  discountEndDate?: string
  minPrice?: number // Minimum selling price (for profit protection)
  images?: string[]
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
  transactionType?: "sale" | "demo" | "internal" | "transfer" // Distinguishes sales from non-sales movements
  department?: string
  customerId?: string
  customerName?: string
  discount?: number
  discountAmount?: number
  staffName?: string
  notes?: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  loyaltyPoints: number
  totalPurchases: number
  totalSpent: number
  lastPurchase?: string
  createdAt: string
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  notes?: string
}

export interface Promotion {
  id: string
  name: string
  description: string
  type: 'percentage' | 'fixed' | 'bogo' | 'bundle'
  value: number
  startDate: string
  endDate: string
  applicableItems?: string[] // Item IDs
  applicableCategories?: string[]
  minPurchase?: number
  maxDiscount?: number
  active: boolean
  usageCount: number
  createdAt: string
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
  salesOverTime?: { date: string; revenue: number }[]
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
  topProducts: { name: string; sales: number; revenue: number }[]
  recentTransactions: Transaction[]
  topCategories: { name: string; sales: number }[]
  totalCategories: number
  totalProducts: number
  stockPercentageByCategory: { name: string; percentage: number }[]
  stocksCountByCategory: { name: string; count: number }[]
  stocksCountByStorageRoom: { name: string; count: number }[]
  totalCustomers?: number
  topCustomers?: { name: string; spent: number }[]
  averageOrderValue?: number
  returnRate?: number
  damagedReturnRate?: number
  supplierReturnRate?: number
  totalSales?: number
  totalReturns?: number
  returnValue?: number
  itemsSoldToday?: number
  revenueToday?: number
  supplierReturns?: { itemName: string; quantity: number; value: number }[]
  recentRestocks?: any[]
  outOfStockCount?: number
  inventoryHealthScore?: number
  insights?: { type: string; message: string }[]
  salesVelocity?: number
  yesterdaySales?: number
  lastWeekSales?: number
  lastMonthSales?: number
}

export interface Log {
  id: string
  operation: string
  itemId?: string
  itemName?: string
  details: string
  timestamp: string
  staffName?: string
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

export interface PredictiveAnalytics {
  itemId: string
  itemName: string
  predictedDemand: number
  recommendedReorderQty: number
  predictedStockoutDate?: string
  confidence: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface ABCAnalysis {
  itemId: string
  itemName: string
  category: 'A' | 'B' | 'C'
  revenueContribution: number
  cumulativePercentage: number
  recommendation: string
}

export interface InventoryTurnover {
  itemId: string
  itemName: string
  turnoverRatio: number
  daysToSell: number
  status: 'fast-moving' | 'normal' | 'slow-moving' | 'dead-stock'
}

export interface StorageRoom {
  id: string
  name: string
  createdAt: string
}
