/**
 * =====================================================
 * BUNDLE PRODUCT API - Individual Bundle Operations
 * Enterprise-Grade REST API Endpoint
 * =====================================================
 */

import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { supabase } from '@/lib/supabase'
import { calculateVirtualStock } from '@/lib/bundle-utils'

/**
 * GET /api/bundles/[id]
 * Retrieve a specific bundle with full details
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const authResult = requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  
  try {
    const bundleId = context.params.id
    
    // Fetch bundle
    const { data: bundle, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', bundleId)
      .eq('product_type', 'bundle')
      .single()
    
    if (error || !bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }
    
    // Fetch component details
    if (bundle.bundle_components) {
      const componentIds = bundle.bundle_components.map((c: any) => c.item_id)
      
      const { data: componentItems } = await supabase
        .from('inventory')
        .select('id, name, cost_price, selling_price, quantity, sku')
        .in('id', componentIds)
      
      // Enrich components
      bundle.bundle_components = bundle.bundle_components.map((comp: any) => {
        const item = componentItems?.find(i => i.id === comp.item_id)
        return {
          ...comp,
          item_name: item?.name,
          item_sku: item?.sku,
          item_cost: item?.cost_price,
          item_price: item?.selling_price,
          available_stock: item?.quantity
        }
      })
      
      // Calculate virtual stock
      if (bundle.is_virtual_stock && componentItems) {
        const virtualStock = calculateVirtualStock(
          bundle.bundle_components,
          componentItems as any
        )
        bundle.available_stock = virtualStock.available_bundles
        bundle.virtual_stock_details = virtualStock
      }
    }
    
    // Fetch bundle transaction history
    const { data: transactions } = await supabase
      .from('bundle_transactions')
      .select('*')
      .eq('bundle_id', bundleId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    return NextResponse.json({
      bundle,
      transactions: transactions || []
    })
    
  } catch (error) {
    console.error('[Bundle API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/bundles/[id]
 * Update a bundle product
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const authResult = requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  
  try {
    const bundleId = context.params.id
    const body = await request.json()
    
    // Fetch existing bundle
    const { data: existingBundle } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', bundleId)
      .eq('product_type', 'bundle')
      .single()
    
    if (!existingBundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }
    
    // Prepare update data
    const updateData: any = {
      last_updated: new Date().toISOString()
    }
    
    if (body.name) updateData.name = body.name
    if (body.selling_price) updateData.selling_price = body.selling_price
    if (body.reorder_level !== undefined) updateData.reorder_level = body.reorder_level
    if (body.sales_channel) updateData.sales_channel = body.sales_channel
    if (body.store) updateData.store = body.store
    
    // Update bundle
    const { data: updatedBundle, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', bundleId)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update bundle' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      bundle: updatedBundle,
      message: 'Bundle updated successfully'
    })
    
  } catch (error) {
    console.error('[Bundle API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bundles/[id]
 * Delete a bundle product
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const authResult = requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  
  try {
    const bundleId = context.params.id
    
    // Check if bundle exists
    const { data: bundle } = await supabase
      .from('inventory')
      .select('name')
      .eq('id', bundleId)
      .eq('product_type', 'bundle')
      .single()
    
    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }
    
    // Delete bundle (cascade will handle bundle_transactions)
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', bundleId)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete bundle' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Bundle "${bundle.name}" deleted successfully`
    })
    
  } catch (error) {
    console.error('[Bundle API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
