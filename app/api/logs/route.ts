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
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
})
