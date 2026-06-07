import { NextResponse } from 'next/server'
import { getLogs } from '@/lib/supabase-db'
import { getCachedData } from '@/lib/cache'
import { withAuth } from '@/lib/api-helpers'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export const GET = withAuth(async (request, { user }) => {
  try {
    // Fetch regular logs (cached)
    const regularLogs = await getCachedData(
      'logs',
      () => getLogs(),
      1 * 60 * 1000
    )

    // Fetch cancelled/restored orders from orders table to create synthetic log entries
    // Query 1: cancelled orders (is_cancelled = true)
    const { data: cancelledOrders } = await supabaseAdmin
      .from('orders')
      .select('id, product, qty, sales_channel, store, waybill, is_cancelled, cancellation_reason, cancelled_by, cancelled_at, restored_by, restored_at')
      .eq('is_cancelled', true)
      .not('cancelled_at', 'is', null)
      .is('deleted_at', null)
      .order('cancelled_at', { ascending: false })
      .limit(500)

    // Query 2: restored orders (was cancelled, now restored - is_cancelled = false but has restored_at)
    const { data: restoredOrders } = await supabaseAdmin
      .from('orders')
      .select('id, product, qty, sales_channel, store, waybill, is_cancelled, cancellation_reason, cancelled_by, cancelled_at, restored_by, restored_at')
      .eq('is_cancelled', false)
      .not('restored_at', 'is', null)
      .is('deleted_at', null)
      .order('restored_at', { ascending: false })
      .limit(500)

    const allOrders = [...(cancelledOrders || []), ...(restoredOrders || [])]

    // Build a set of order IDs already in logs (to avoid duplicates)
    const loggedOrderIds = new Set(
      regularLogs
        .filter(l => l.details?.includes('Waybill:'))
        .map(l => {
          // Extract waybill from details — format: "Waybill: XXXXX"
          const match = l.details?.match(/Waybill:\s*([^\s.]+)/)
          return match?.[1]
        })
        .filter(Boolean)
    )

    // Create synthetic log entries for cancelled/restored orders not already in logs
    const syntheticLogs: any[] = []
    for (const order of allOrders) {
      const waybill = order.waybill || 'N/A'
      
      // Add cancel log if this order is currently cancelled and not already logged
      if (order.is_cancelled && order.cancelled_at) {
        const alreadyLogged = regularLogs.some(l => 
          l.details?.includes(waybill) && 
          (l.operation?.toLowerCase() === 'cancel' || l.operation?.toLowerCase() === 'cancelled')
        )
        
        if (!alreadyLogged) {
          syntheticLogs.push({
            id: `synthetic-cancel-${order.id}`,
            operation: 'cancel',
            itemId: order.id,
            itemName: order.product || 'Unknown Product',
            quantity: order.qty || 0,
            details: `Order cancelled. Reason: ${order.cancellation_reason || 'N/A'}. Waybill: ${waybill}. Cancelled by: ${order.cancelled_by || 'Unknown'}. Sales Channel: ${order.sales_channel || 'N/A'}`,
            timestamp: order.cancelled_at,
          })
        }
      }

      // Add restore log if this order was restored (has restored_at, is_cancelled = false)
      if (!order.is_cancelled && order.restored_at) {
        const alreadyRestoredLogged = regularLogs.some(l => 
          l.details?.includes(waybill) && 
          (l.operation?.toLowerCase() === 'restore' || l.operation?.toLowerCase() === 'uncancel')
        )
        
        if (!alreadyRestoredLogged) {
          syntheticLogs.push({
            id: `synthetic-restore-${order.id}`,
            operation: 'restore',
            itemId: order.id,
            itemName: order.product || 'Unknown Product',
            quantity: order.qty || 0,
            details: `Order restored to packing queue. Waybill: ${waybill}. Restored by: ${order.restored_by || 'Unknown'}. Sales Channel: ${order.sales_channel || 'N/A'}`,
            timestamp: order.restored_at,
          })
        }
      }
    }

    // Merge and sort by timestamp descending
    const allLogs = [...regularLogs, ...syntheticLogs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    // DEPARTMENT FILTERING: Operations users only see logs for their assigned channel
    let filteredLogs = allLogs
    if (user.role === 'operations' && user.assignedChannel) {
      filteredLogs = allLogs.filter(log => {
        const detailsLower = log.details?.toLowerCase() || ''
        const channelLower = user.assignedChannel.toLowerCase()
        return detailsLower.includes(channelLower)
      })
    }

    return NextResponse.json(filteredLogs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
})
