import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-db'
import { validateBundle, deductBundleComponents } from '@/lib/bundle-utils'
import type { BundleProduct, BundleSaleRequest, BundleSaleResponse } from '@/lib/types/bundle'

/**
 * POST /api/bundles/sell
 * Sell a bundle product and automatically deduct component inventory
 * 
 * Enterprise-grade bundle sale endpoint with:
 * - Atomic transaction handling
 * - Component stock validation
 * - Automatic inventory deduction
 * - Comprehensive audit logging
 * - Error recovery
 */
export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const body: BundleSaleRequest = await request.json()
    const { bundleId, quantity, staffName, department, notes } = body

    // Validate required fields
    if (!bundleId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Bundle ID and valid quantity are required' },
        { status: 400 }
      )
    }

    // Fetch bundle product
    const { data: bundle, error: bundleError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', bundleId)
      .eq('product_type', 'bundle')
      .single()

    if (bundleError || !bundle) {
      return NextResponse.json(
        { error: 'Bundle product not found' },
        { status: 404 }
      )
    }

    const bundleProduct = bundle as unknown as BundleProduct

    // Validate bundle can be sold
    const validation = await validateBundle(bundleProduct, quantity)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Bundle cannot be sold',
          details: validation.errors,
          insufficientComponents: validation.insufficientComponents
        },
        { status: 400 }
      )
    }

    // Deduct component inventory
    const deductionResult = await deductBundleComponents(bundleProduct, quantity, {
      staffName: staffName || 'System',
      department: department || 'Bundle Sale',
      notes: notes || `Bundle sale: ${bundleProduct.name} x${quantity}`
    })

    if (!deductionResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to deduct component inventory',
          details: deductionResult.errors
        },
        { status: 500 }
      )
    }

    // Calculate totals
    const totalCost = bundleProduct.costPrice * quantity
    const totalRevenue = bundleProduct.sellingPrice * quantity
    const totalProfit = totalRevenue - totalCost

    // Create bundle sale transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        item_id: bundleProduct.id,
        item_name: bundleProduct.name,
        quantity: quantity,
        cost_price: bundleProduct.costPrice,
        selling_price: bundleProduct.sellingPrice,
        total_cost: totalCost,
        total_revenue: totalRevenue,
        profit: totalProfit,
        type: 'sale',
        transaction_type: 'sale',
        department: department || 'Bundle Sale',
        staff_name: staffName || 'System',
        notes: notes || `Bundle sale with ${bundleProduct.bundle_components?.length || 0} components`,
        status: 'completed'
      })
      .select()
      .single()

    if (transactionError) {
      console.error('[Bundle Sale] Transaction creation error:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create sale transaction' },
        { status: 500 }
      )
    }

    // Log bundle sale in audit table
    const { error: auditError } = await supabase
      .from('bundle_transactions')
      .insert({
        bundle_id: bundleProduct.id,
        bundle_name: bundleProduct.name,
        quantity_sold: quantity,
        components_deducted: deductionResult.deductedComponents,
        total_cost: totalCost,
        total_revenue: totalRevenue,
        profit: totalProfit,
        staff_name: staffName || 'System',
        department: department || 'Bundle Sale',
        notes: notes
      })

    if (auditError) {
      console.error('[Bundle Sale] Audit log error:', auditError)
      // Non-critical error, continue
    }

    // Create log entry
    await supabase
      .from('logs')
      .insert({
        operation: 'bundle_sale',
        item_id: bundleProduct.id,
        item_name: bundleProduct.name,
        quantity: quantity,
        details: `Bundle sold: ${bundleProduct.name} x${quantity}. Components deducted: ${deductionResult.deductedComponents?.map(c => `${c.itemName} x${c.quantityDeducted}`).join(', ')}`,
        staff_name: staffName || 'System',
        status: 'completed'
      })

    const response: BundleSaleResponse = {
      success: true,
      transaction: transaction as any,
      deductedComponents: deductionResult.deductedComponents || [],
      totalCost,
      totalRevenue,
      totalProfit
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('[Bundle Sale] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
