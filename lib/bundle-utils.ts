/**
 * =====================================================
 * BUNDLE PRODUCT SYSTEM - UTILITY FUNCTIONS
 * Enterprise-Grade Business Logic
 * =====================================================
 */

import { supabaseAdmin } from './supabase'
import type {
  BundleComponent,
  BundleValidation,
  BundleProduct
} from './types/bundle'
import type { InventoryItem } from './types'

/**
 * Calculate total cost of bundle from components
 * Works with both camelCase and snake_case
 */
export function calculateBundleCost(components: BundleComponent[]): number {
  return components.reduce((total, component) => {
    const costPrice = component.costPrice || component.item_cost || 0
    return total + (costPrice * component.quantity)
  }, 0)
}

/**
 * Calculate virtual stock for bundle
 * Returns the maximum number of bundles that can be made
 */
export function calculateVirtualStock(components: BundleComponent[]): number {
  if (components.length === 0) return 0
  
  let minBundles = Infinity
  
  for (const component of components) {
    const currentStock = component.currentStock || 0
    const maxBundles = Math.floor(currentStock / component.quantity)
    
    if (maxBundles < minBundles) {
      minBundles = maxBundles
    }
  }
  
  return Math.max(0, minBundles === Infinity ? 0 : minBundles)
}

/**
 * Validate bundle configuration for creation
 * Synchronous validation for bundle creation
 */
export function validateBundleCreation(
  name: string,
  components: any[],
  sellingPrice: number,
  componentItems: any[]
): {
  is_valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate name
  if (!name || name.trim().length === 0) {
    errors.push('Bundle name is required')
  }
  
  if (name.length > 100) {
    errors.push('Bundle name must be less than 100 characters')
  }
  
  // Validate components
  if (!components || components.length === 0) {
    errors.push('Bundle must have at least one component')
  }
  
  if (components.length > 20) {
    warnings.push('Bundle has many components (>20), consider splitting')
  }
  
  // Validate component quantities
  components.forEach((component, index) => {
    if (component.quantity <= 0) {
      errors.push(`Component ${index + 1}: Quantity must be greater than 0`)
    }
    
    if (component.quantity > 100) {
      warnings.push(`Component ${index + 1}: Large quantity (${component.quantity})`)
    }
    
    const item = componentItems.find(i => i.id === component.item_id)
    if (!item) {
      errors.push(`Component ${index + 1}: Item not found`)
    }
  })
  
  // Validate pricing
  if (sellingPrice <= 0) {
    errors.push('Selling price must be greater than 0')
  }
  
  // Calculate cost
  const calculatedCost = components.reduce((total, component) => {
    const item = componentItems.find(i => i.id === component.item_id)
    if (!item) return total
    return total + (item.cost_price * component.quantity)
  }, 0)
  
  if (sellingPrice < calculatedCost) {
    warnings.push(`Selling price (₱${sellingPrice}) is less than cost (₱${calculatedCost.toFixed(2)}) - negative margin!`)
  }
  
  const profitMargin = calculatedCost > 0 
    ? ((sellingPrice - calculatedCost) / sellingPrice) * 100 
    : 0
  
  if (profitMargin < 10 && sellingPrice >= calculatedCost) {
    warnings.push(`Low profit margin (${profitMargin.toFixed(1)}%)`)
  }
  
  return {
    is_valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate bundle can be sold
 */
export async function validateBundle(
  bundle: BundleProduct,
  quantity: number
): Promise<BundleValidation> {
  const errors: string[] = []
  const warnings: string[] = []
  const insufficientComponents: Array<{
    itemId: string
    itemName: string
    required: number
    available: number
  }> = []

  // Validate bundle exists and has components
  if (!bundle.bundle_components || bundle.bundle_components.length === 0) {
    errors.push('Bundle has no components')
    return {
      isValid: false,
      errors,
      warnings,
      insufficientComponents
    }
  }

  // Check each component stock
  for (const component of bundle.bundle_components) {
    const itemId = component.itemId || component.item_id
    if (!itemId) {
      errors.push('Component missing item ID')
      continue
    }

    const { data: item, error } = await supabaseAdmin
      .from('inventory')
      .select('id, name, quantity')
      .eq('id', itemId)
      .single()

    if (error || !item) {
      errors.push(`Component item not found: ${itemId}`)
      continue
    }

    const requiredQuantity = component.quantity * quantity
    if (item.quantity < requiredQuantity) {
      errors.push(`Insufficient stock for ${item.name}`)
      insufficientComponents.push({
        itemId: item.id,
        itemName: item.name,
        required: requiredQuantity,
        available: item.quantity
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    insufficientComponents
  }
}

/**
 * Deduct component inventory when bundle is sold
 * Returns success status and deducted components
 */
export async function deductBundleComponents(
  bundle: BundleProduct,
  quantity: number,
  metadata: {
    staffName: string
    department: string
    notes: string
  }
): Promise<{
  success: boolean
  errors?: string[]
  deductedComponents?: Array<{
    itemId: string
    itemName: string
    quantityDeducted: number
    remainingStock: number
  }>
}> {
  const deductedComponents: Array<{
    itemId: string
    itemName: string
    quantityDeducted: number
    remainingStock: number
  }> = []
  const errors: string[] = []

  try {
    // Process each component
    for (const component of bundle.bundle_components) {
      const itemId = component.itemId || component.item_id
      if (!itemId) {
        errors.push('Component missing item ID')
        continue
      }

      const quantityToDeduct = component.quantity * quantity

      // Fetch current item
      const { data: item, error: fetchError } = await supabaseAdmin
        .from('inventory')
        .select('*')
        .eq('id', itemId)
        .single()

      if (fetchError || !item) {
        errors.push(`Failed to fetch component: ${itemId}`)
        continue
      }

      // Check stock
      if (item.quantity < quantityToDeduct) {
        errors.push(`Insufficient stock for ${item.name}`)
        continue
      }

      // Deduct inventory
      const newQuantity = item.quantity - quantityToDeduct
      const { error: updateError } = await supabaseAdmin
        .from('inventory')
        .update({ 
          quantity: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', itemId)

      if (updateError) {
        errors.push(`Failed to update ${item.name}: ${updateError.message}`)
        continue
      }

      // Create transaction record for component deduction
      await supabaseAdmin
        .from('transactions')
        .insert({
          item_id: itemId,
          item_name: item.name,
          quantity: quantityToDeduct,
          cost_price: item.cost_price || 0,
          selling_price: item.selling_price || 0,
          total_cost: (item.cost_price || 0) * quantityToDeduct,
          total_revenue: 0, // Component deduction, not a sale
          profit: 0,
          type: 'sale',
          transaction_type: 'internal',
          department: metadata.department,
          staff_name: metadata.staffName,
          notes: `Component deduction for bundle: ${bundle.name}. ${metadata.notes}`,
          status: 'completed'
        })

      // Create log entry
      await supabaseAdmin
        .from('logs')
        .insert({
          operation: 'bundle_component_deduction',
          item_id: itemId,
          item_name: item.name,
          quantity: quantityToDeduct,
          details: `Deducted ${quantityToDeduct} units for bundle sale: ${bundle.name} x${quantity}`,
          staff_name: metadata.staffName,
          status: 'completed'
        })

      deductedComponents.push({
        itemId: itemId,
        itemName: item.name,
        quantityDeducted: quantityToDeduct,
        remainingStock: newQuantity
      })
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors
      }
    }

    return {
      success: true,
      deductedComponents
    }

  } catch (error) {
    console.error('[Bundle Utils] Deduction error:', error)
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Generate SKU for bundle
 */
export function generateBundleSKU(
  bundleName: string,
  components: BundleComponent[]
): string {
  const prefix = 'BDL'
  const nameCode = bundleName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6)
  const componentCount = components.length
  const timestamp = Date.now().toString().slice(-4)
  
  return `${prefix}-${nameCode}-${componentCount}X-${timestamp}`
}

/**
 * Calculate profit margin for bundle
 */
export function calculateBundleMargin(
  sellingPrice: number,
  costPrice: number
): number {
  if (sellingPrice <= 0) return 0
  return ((sellingPrice - costPrice) / sellingPrice) * 100
}

/**
 * Format currency for display
 */
export function formatBundlePrice(price: number): string {
  return `₱${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * Get bundle status badge info
 */
export function getBundleStatus(
  availableStock: number,
  reorderLevel: number
): { status: 'in-stock' | 'low-stock' | 'out-of-stock'; label: string; color: string } {
  if (availableStock === 0) {
    return {
      status: 'out-of-stock',
      label: 'Out of Stock',
      color: 'red'
    }
  }
  
  if (availableStock <= reorderLevel) {
    return {
      status: 'low-stock',
      label: 'Low Stock',
      color: 'yellow'
    }
  }
  
  return {
    status: 'in-stock',
    label: 'In Stock',
    color: 'green'
  }
}
