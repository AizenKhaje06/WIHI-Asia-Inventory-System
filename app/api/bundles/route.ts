/**
 * =====================================================
 * BUNDLE PRODUCTS API
 * Enterprise-Grade REST API Endpoint
 * =====================================================
 */

import { type NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-helpers'
import { supabase } from '@/lib/supabase'
import type {
  CreateBundleRequest,
  BundleProduct,
  BundleValidation
} from '@/lib/types/bundle'
import {
  validateBundleCreation,
  calculateBundleCost,
  calculateVirtualStock,
  generateBundleSKU
} from '@/lib/bundle-utils'

/**
 * GET /api/bundles
 * Retrieve all bundle products with optional filtering
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const salesChannel = searchParams.get('salesChannel')
    const store = searchParams.get('store')
    const includeComponents = searchParams.get('includeComponents') === 'true'
    
    // Build query
    let query = supabase
      .from('inventory')
      .select('*')
      .eq('product_type', 'bundle')
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (salesChannel) {
      query = query.eq('sales_channel', salesChannel)
    }
    
    if (store) {
      query = query.eq('store', store)
    }
    
    const { data: bundles, error } = await query
    
    if (error) {
      console.error('[Bundles API] Error fetching bundles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bundles' },
        { status: 500 }
      )
    }
    
    // If includeComponents, fetch component details
    if (includeComponents && bundles && bundles.length > 0) {
      // Get all unique component IDs
      const componentIds = new Set<string>()
      bundles.forEach(bundle => {
        if (bundle.bundle_components) {
          bundle.bundle_components.forEach((comp: any) => {
            componentIds.add(comp.item_id)
          })
        }
      })
      
      // Fetch component items
      const { data: componentItems } = await supabase
        .from('inventory')
        .select('id, name, cost_price, selling_price, quantity')
        .in('id', Array.from(componentIds))
      
      // Enrich bundles with component details
      bundles.forEach(bundle => {
        if (bundle.bundle_components) {
          bundle.bundle_components = bundle.bundle_components.map((comp: any) => {
            const item = componentItems?.find(i => i.id === comp.item_id)
            return {
              ...comp,
              item_name: item?.name,
              item_cost: item?.cost_price,
              item_price: item?.selling_price,
              available_stock: item?.quantity
            }
          })
        }
        
        // Calculate virtual stock if enabled
        if (bundle.is_virtual_stock && componentItems) {
          const enrichedComponents = bundle.bundle_components.map((comp: any) => {
            const item = componentItems.find((i: any) => i.id === comp.item_id)
            return {
              ...comp,
              itemId: comp.item_id,
              quantity: comp.quantity,
              currentStock: item?.quantity || 0
            }
          })
          const virtualStock = calculateVirtualStock(enrichedComponents)
          bundle.available_stock = virtualStock
        }
      })
    }
    
    return NextResponse.json({
      bundles,
      count: bundles?.length || 0
    })
  } catch (error) {
    console.error('[Bundles API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/bundles
 * Create a new bundle product
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const body: CreateBundleRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.components || !body.selling_price || !body.store) {
      return NextResponse.json(
        { error: 'Missing required fields: name, components, selling_price, store' },
        { status: 400 }
      )
    }
    
    // Fetch component items for validation
    const componentIds = body.components.map(c => c.item_id)
    const { data: componentItems, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .in('id', componentIds)
    
    if (fetchError || !componentItems) {
      return NextResponse.json(
        { error: 'Failed to fetch component items' },
        { status: 500 }
      )
    }
    
    // Validate bundle
    const validation = validateBundleCreation(
      body.name,
      body.components,
      body.selling_price,
      componentItems as any
    )
    
    if (!validation.is_valid) {
      return NextResponse.json(
        {
          error: 'Bundle validation failed',
          validation_errors: validation.errors,
          validation_warnings: validation.warnings
        },
        { status: 400 }
      )
    }
    
    // Calculate bundle cost from component items
    const componentsWithCost = body.components.map(c => {
      const item = componentItems.find((i: any) => i.id === c.item_id)
      return {
        ...c,
        itemId: c.item_id,
        costPrice: item?.cost_price || 0,
        currentStock: item?.quantity || 0
      }
    })
    
    const calculatedCost = calculateBundleCost(componentsWithCost)
    
    // Calculate profit margin
    const profitMargin = body.selling_price > 0 
      ? ((body.selling_price - calculatedCost) / body.selling_price) * 100 
      : 0
    
    // Generate SKU if not provided
    const sku = body.sku || generateBundleSKU(body.name, body.components)
    
    // Prepare bundle metadata
    const metadata = {
      ...body.metadata,
      profit_margin: profitMargin,
      created_by: user.username || user.displayName,
      created_at: new Date().toISOString()
    }
    
    // Calculate initial virtual stock
    const virtualStock = calculateVirtualStock(componentsWithCost)
    
    // Generate unique ID for bundle
    const bundleId = `BDL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Prepare insert data - minimal required fields only
    const insertData: any = {
      id: bundleId,  // ← ADD THIS!
      name: body.name,
      sku,
      cost_price: calculatedCost,
      selling_price: body.selling_price,
      quantity: virtualStock,
      reorder_level: body.reorder_level || 5,
      last_updated: new Date().toISOString(),
      category: body.category || 'Bundle'
    }
    
    // Add bundle-specific fields only if migration was run
    try {
      insertData.product_type = 'bundle'
      insertData.bundle_components = body.components
      insertData.is_virtual_stock = body.is_virtual_stock !== false
      insertData.bundle_metadata = metadata
    } catch (e) {
      console.warn('[Bundles API] Bundle fields not available, using basic fields only')
    }
    
    // Add store field (your schema uses 'store' not 'storage_room')
    insertData.store = body.store
    
    // Add sales_channel if provided
    if (body.sales_channel) {
      insertData.sales_channel = body.sales_channel
    }
    
    // Create bundle product
    const { data: bundle, error: createError } = await supabase
      .from('inventory')
      .insert(insertData)
      .select()
      .single()
    
    if (createError) {
      console.error('[Bundles API] Error creating bundle:', createError)
      return NextResponse.json(
        { error: 'Failed to create bundle', details: createError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      bundle,
      validation,
      message: `Bundle "${body.name}" created successfully`
    }, { status: 201 })
    
  } catch (error) {
    console.error('[Bundles API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
