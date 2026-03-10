import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireTeamLeaderRole } from '@/lib/team-leader-middleware'

/**
 * GET /api/team-leader/inventory-alerts
 * Get low stock alerts for team leader's channel
 * 
 * Requirements: 8.1, 8.2, 8.3
 */
export const GET = async (request: NextRequest) => {
  try {
    const authResult = requireTeamLeaderRole(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const context = authResult as any
    const channel = context.channel

    // Query inventory alerts for the channel
    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from('inventory_alerts')
      .select('*')
      .eq('channel', channel)
      .order('created_at', { ascending: false })

    if (alertsError) {
      console.error('[Inventory Alerts] Query error:', alertsError)
      return NextResponse.json(
        { error: 'Failed to fetch inventory alerts' },
        { status: 500 }
      )
    }

    // Get store information for each alert
    const storeIds = [...new Set(alerts?.map((a: any) => a.store_id) || [])]
    const { data: stores } = await supabaseAdmin
      .from('stores')
      .select('id, store_name')
      .in('id', storeIds)

    const storeMap = new Map(stores?.map((s: any) => [s.id, s.store_name]) || [])

    // Transform alerts
    const transformedAlerts = alerts?.map((alert: any) => ({
      id: alert.id,
      productId: alert.product_id,
      storeId: alert.store_id,
      storeName: storeMap.get(alert.store_id) || 'Unknown Store',
      currentStock: alert.current_stock,
      threshold: alert.threshold,
      channel: alert.channel,
      createdAt: alert.created_at,
      updatedAt: alert.updated_at
    })) || []

    return NextResponse.json({
      success: true,
      alerts: transformedAlerts,
      count: transformedAlerts.length
    }, { status: 200 })

  } catch (error) {
    console.error('[Inventory Alerts] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory alerts' },
      { status: 500 }
    )
  }
}
