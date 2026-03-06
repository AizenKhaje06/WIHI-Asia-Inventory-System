/**
 * =====================================================
 * BUNDLE PRODUCT SYSTEM - TYPE DEFINITIONS
 * Enterprise-Grade TypeScript Types
 * =====================================================
 */

/**
 * Product type enumeration
 */
export type ProductType = 'simple' | 'bundle' | 'variant'

/**
 * Bundle component definition
 * Represents a single item within a bundle
 */
export interface BundleComponent {
  itemId: string // Camel case for frontend
  item_id?: string // Snake case for backend compatibility
  quantity: number
  itemName?: string // Populated on fetch
  item_name?: string // Backend compatibility
  costPrice?: number // Populated on fetch
  item_cost?: number // Backend compatibility
  currentStock?: number // Current available stock
  item_price?: number // Populated on fetch
}

/**
 * Bundle metadata for additional information
 */
export interface BundleMetadata {
  discount_percentage?: number
  original_price?: number
  savings_amount?: number
  description?: string
  tags?: string[]
  created_by?: string
  created_at?: string
}

/**
 * Bundle product interface
 * Extends base InventoryItem with bundle-specific fields
 */
export interface BundleProduct {
  id: string
  name: string
  sku?: string
  product_type: 'bundle'
  bundle_components: BundleComponent[]
  is_virtual_stock: boolean
  bundle_metadata?: BundleMetadata
  
  // Pricing
  cost_price: number // Sum of component costs
  selling_price: number // Bundle selling price
  profit_margin: number // Calculated
  
  // Inventory
  quantity: number // Virtual or actual stock
  available_stock: number // Calculated from components
  reorder_level: number
  
  // Multi-channel
  sales_channel?: string
  store: string
  
  // Timestamps
  last_updated: string
  created_at?: string
}

/**
 * Bundle transaction record
 * Audit trail for bundle sales
 */
export interface BundleTransaction {
  id: string
  bundle_id: string
  transaction_id?: string
  component_deductions: ComponentDeduction[]
  created_at: string
  created_by?: string
}

/**
 * Component deduction record
 * Tracks how much of each component was deducted
 */
export interface ComponentDeduction {
  item_id: string
  quantity_per_bundle: number
  bundles_sold: number
  total_deducted: number
  item_name?: string
}

/**
 * Bundle creation request
 */
export interface CreateBundleRequest {
  name: string
  sku?: string
  category?: string
  components: BundleComponent[]
  selling_price: number
  sales_channel?: string
  store: string
  reorder_level?: number
  is_virtual_stock?: boolean
  metadata?: BundleMetadata
}

/**
 * Bundle validation result
 */
export interface BundleValidation {
  isValid: boolean // Frontend camel case
  is_valid?: boolean // Backend snake case
  errors: string[]
  warnings: string[]
  insufficientComponents?: Array<{
    itemId: string
    itemName: string
    required: number
    available: number
  }>
  calculated_cost?: number
  available_stock?: number
  profit_margin?: number
}

/**
 * Bundle analytics data
 */
export interface BundleAnalytics {
  bundle_id: string
  bundle_name: string
  total_sold: number
  total_revenue: number
  total_profit: number
  average_margin: number
  component_usage: {
    item_id: string
    item_name: string
    total_used: number
  }[]
  sales_by_channel: {
    channel: string
    quantity: number
    revenue: number
  }[]
}

/**
 * Virtual stock calculation result
 */
export interface VirtualStockResult {
  bundle_id: string
  available_bundles: number
  bottleneck_component?: {
    item_id: string
    item_name: string
    available_stock: number
    required_per_bundle: number
  }
  component_status: {
    item_id: string
    item_name: string
    available_stock: number
    required_per_bundle: number
    max_bundles_possible: number
  }[]
}

/**
 * Bundle sale request
 */
export interface BundleSaleRequest {
  bundleId: string // Frontend camel case
  bundle_id?: string // Backend snake case
  quantity: number
  transaction_id?: string
  staffName?: string // Frontend camel case
  staff_name?: string // Backend snake case
  department?: string
  sales_channel?: string
  store?: string
  notes?: string
}

/**
 * Bundle sale response
 */
export interface BundleSaleResponse {
  success: boolean
  bundleId?: string // Frontend camel case
  bundle_id?: string // Backend snake case
  quantity_sold?: number
  transaction?: any
  component_deductions?: ComponentDeduction[]
  deductedComponents?: Array<{
    itemId: string
    itemName: string
    quantityDeducted: number
    remainingStock: number
  }>
  new_available_stock?: number
  totalCost?: number
  totalRevenue?: number
  totalProfit?: number
  transaction_id?: string
  message?: string
}
