import { NextResponse } from 'next/server'
import { getLogs } from '@/lib/supabase-db'
import { getCachedData } from '@/lib/cache'
import { withAuth } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export const GET = withAuth(async (request, { user }) => {
  try {
    const logs = await getCachedData(
      'logs',
      () => getLogs(),
      1 * 60 * 1000 // 1 minute cache
    )

    // DEPARTMENT FILTERING: Operations users only see logs for their department's items
    let filteredLogs = logs
    if (user.role === 'operations' && user.assignedChannel) {
      // Get inventory items for this department
      const { getInventoryItems } = await import('@/lib/supabase-db')
      const allItems = await getInventoryItems()
      const departmentItems = allItems.filter(item => item.salesChannel === user.assignedChannel)
      const departmentItemNames = new Set(departmentItems.map(item => item.name))

      // Filter logs to only show logs for items in this department
      filteredLogs = logs.filter(log => {
        // If log has an itemName, check if it belongs to this department
        if (log.itemName) {
          return departmentItemNames.has(log.itemName)
        }
        // If no itemName, include the log (system logs, etc.)
        return true
      })
    }
    // Admin sees all logs

    return NextResponse.json(filteredLogs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
})
