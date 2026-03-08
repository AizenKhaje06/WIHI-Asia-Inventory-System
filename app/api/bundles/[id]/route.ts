import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET single bundle
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    const { data: bundle, error } = await supabase
      .from('bundles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }
    
    // Get bundle items
    const { data: bundleItems, error: itemsError } = await supabase
      .from('bundle_items')
      .select('*')
      .eq('bundle_id', id)
    
    if (itemsError) {
      console.error('[Bundles API] Error fetching bundle items:', itemsError)
    }
    
    return NextResponse.json({
      ...bundle,
      bundle_components: bundleItems || []
    }, { status: 200 })
  } catch (error: any) {
    console.error('[Bundles API] GET exception:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update bundle
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    
    console.log('[Bundles API] PUT request for bundle:', id)
    console.log('[Bundles API] Update data:', body)
    
    // Check if bundle exists
    const { data: existingBundle, error: fetchError } = await supabase
      .from('bundles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingBundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }
    
    // Prepare update data
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.store !== undefined) updateData.store = body.store
    if (body.salesChannel !== undefined) updateData.sales_channel = body.salesChannel
    if (body.quantity !== undefined) updateData.quantity = body.quantity
    if (body.costPrice !== undefined) updateData.bundle_cost = body.costPrice
    if (body.sellingPrice !== undefined) updateData.bundle_price = body.sellingPrice
    if (body.reorderLevel !== undefined) updateData.reorder_level = body.reorderLevel
    
    // Update bundle
    const { data: updatedBundle, error: updateError } = await supabase
      .from('bundles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('[Bundles API] Error updating bundle:', updateError)
      return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 })
    }
    
    console.log('[Bundles API] Bundle updated successfully:', id)
    return NextResponse.json(updatedBundle, { status: 200 })
  } catch (error: any) {
    console.error('[Bundles API] PUT exception:', error)
    return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 })
  }
}

// DELETE bundle
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    console.log('[Bundles API DELETE] Attempting to delete bundle:', id)
    
    // Check if bundle exists
    const { data: existingBundle, error: fetchError } = await supabase
      .from('bundles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingBundle) {
      console.log('[Bundles API DELETE] Bundle not found:', id, fetchError)
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }
    
    console.log('[Bundles API DELETE] Found bundle:', existingBundle.name)
    
    // Delete bundle items first
    const { error: itemsDeleteError } = await supabase
      .from('bundle_items')
      .delete()
      .eq('bundle_id', id)
    
    if (itemsDeleteError) {
      console.error('[Bundles API DELETE] Error deleting bundle items:', itemsDeleteError)
      return NextResponse.json({ error: `Failed to delete bundle items: ${itemsDeleteError.message}` }, { status: 500 })
    }
    
    console.log('[Bundles API DELETE] Bundle items deleted')
    
    // Delete bundle
    const { error: deleteError } = await supabase
      .from('bundles')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('[Bundles API DELETE] Error deleting bundle:', deleteError)
      return NextResponse.json({ error: `Failed to delete bundle: ${deleteError.message}` }, { status: 500 })
    }
    
    console.log('[Bundles API DELETE] Bundle deleted successfully:', id)
    return NextResponse.json({ success: true, message: 'Bundle deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('[Bundles API DELETE] Exception:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete bundle'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
