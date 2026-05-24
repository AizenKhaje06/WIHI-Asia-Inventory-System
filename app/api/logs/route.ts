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

    // DEPARTMENT FILTERING: Operations users only see logs for their assigned channel
    let filteredLogs = logs
    if (user.role === 'operations' && user.assignedChannel) {
      // Filter logs by checking if the log details contain the assigned channel
      filteredLogs = logs.filter(log => {
        const detailsLower = log.details?.toLowerCase() || ''
        const channelLower = user.assignedChannel.toLowerCase()
        
        // Check if the log details mention the assigned channel
        return detailsLower.includes(channelLower)
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
