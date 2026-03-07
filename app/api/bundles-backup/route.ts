import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const store = searchParams.get('store')
    const activeOnly = searchParams.get('activeOnly') !== 'false'
    
    let query = supabase.from('bundles').select('*').order('created_at', { ascending: false })
    
    if (activeOnly) query = query.eq('is_active', true)
    if (store) query = query.eq('store', store)
    
    const { data, error } = await query
    
    if (error) {
      console.error('[GET /api/bundles] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [], { status: 200 })
  } catch (error: any) {
    console.error('[GET /api/bundles] Exception:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[POST /api/bundles] Starting bundle creation...')
    
    const body = await request.json()
    console.log('[POST /api/bundles] Request body:', JSON.stringify(body, null, 2))
    
    const { name, description, category, store, salesChannel, bundlePrice, items, sku, badge } = body
    
    if (!name || !category || !store || !bundlePrice || !items?.length) {
      const missingFields = []
      if (!name) missingFields.push('name')
      if (!category) missingFields.push('category')
      if (!store) missingFields.push('store')
      if (!bundlePrice) missingFields.push('bundlePrice')
      if (!items?.length) missingFields.push('items')
      
      console.error('[POST /api/bundles] Missing fields:', missingFields)
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }
    
    const itemIds = items.map((i: any) => i.itemId)
    console.log('[POST /api/bundles] Fetching items:', itemIds)
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('inventory')
      .select('id, cost_price, selling_price')
      .in('id', itemIds)
    
    if (itemsError) {
      console.error('[POST /api/bundles] Error fetching items:', itemsError)
      return NextResponse.json({ 
        error: `Failed to fetch items: ${itemsError.message}` 
      }, { status: 500 })
    }
    
    if (!itemsData || itemsData.length === 0) {
      console.error('[POST /api/bundles] No items found')
      return NextResponse.json({ 
        error: 'No valid items found in inventory' 
      }, { status: 400 })
    }
    
    console.log('[POST /api/bundles] Found items:', itemsData.length)
    
    let bundleCost = 0
    let regularPrice = 0
    
    items.forEach((bundleItem: any) => {
      const item = itemsData?.find(i => i.id === bundleItem.itemId)
      if (item) {
        bundleCost += item.cost_price * bundleItem.quantity
        regularPrice += item.selling_price * bundleItem.quantity
      }
    })
    
    console.log('[POST /api/bundles] Calculated - Cost:', bundleCost, 'Regular:', regularPrice)
    
    if (bundlePrice < bundleCost) {
      console.error('[POST /api/bundles] Price below cost')
      return NextResponse.json({ 
        error: `Bundle price (₱${bundlePrice}) cannot be below cost (₱${bundleCost.toFixed(2)})` 
      }, { status: 400 })
    }
    
    const bundleId = `BUNDLE-${Date.now()}`
    console.log('[POST /api/bundles] Generated ID:', bundleId)
    
    const bundleData: any = {
      id: bundleId,
      name: name.trim(),
      category,
      store,
      bundle_price: bundlePrice,
      bundle_cost: bundleCost,
      regular_price: regularPrice,
      savings: regularPrice - bundlePrice,
      is_active: true,
      quantity: 0,
      reorder_level: 5
    }
    
    if (description && description.trim()) {
      bundleData.description = description.trim()
    }
    if (salesChannel) {
      bundleData.sales_channel = salesChannel
    }
    if (sku && sku.trim()) {
      bundleData.sku = sku.trim()
    }
    if (badge && badge.trim()) {
      bundleData.badge = badge.trim()
    }
    
    console.log('[POST /api/bundles] Inserting bundle:', bundleData)
    
    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .insert(bundleData)
      .select()
      .single()
    
    if (bundleError) {
      console.error('[POST /api/bundles] Error creating bundle:', bundleError)
      return NextResponse.json({ 
        error: `Failed to create bundle: ${bundleError.message}` 
      }, { status: 500 })
    }
    
    console.log('[POST /api/bundles] Bundle created:', bundle.id)
    
    const bundleItemsData = items.map((item: any, index: number) => ({
      id: `BITEM-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
      bundle_id: bundleId,
      item_id: item.itemId,
      quantity: item.quantity
    }))
    
    console.log('[POST /api/bundles] Inserting bundle items:', bundleItemsData.length)
    
    const { error: itemsInsertError } = await supabase
      .from('bundle_items')
      .insert(bundleItemsData)
    
    if (itemsInsertError) {
      console.error('[POST /api/bundles] Error inserting bundle items:', itemsInsertError)
      await supabase.from('bundles').delete().eq('id', bundleId)
      return NextResponse.json({ 
        error: `Failed to add items to bundle: ${itemsInsertError.message}` 
      }, { status: 500 })
    }
    
    console.log('[POST /api/bundles] Bundle created successfully!')
    
    return NextResponse.json(bundle, { status: 201 })
  } catch (error: any) {
    console.error('[POST /api/bundles] Exception:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to create bundle. Please try again.' 
    }, { status: 500 })
  }
}
