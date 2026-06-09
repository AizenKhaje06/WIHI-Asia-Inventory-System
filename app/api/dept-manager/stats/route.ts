import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { withAuth } from '@/lib/api-helpers'

/**
 * GET /api/dept-manager/stats
 * Returns agent performance stats for a department manager's channel.
 * Only accessible by dept-manager and admin roles.
 */
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    if (user.role !== 'dept-manager' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const channel = searchParams.get('channel') || user.assignedChannel

    if (!channel) {
      // Fallback: return empty data instead of erroring — channel may not be set yet
      return NextResponse.json({
        totalOrders: 0,
        activeOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        agents: []
      })
    }

    console.log('[DeptManager Stats] Fetching for channel:', channel, 'user:', user.username)

    // Get all team members (operations + dept-manager) for this channel
    const { data: agents, error: agentsError } = await supabaseAdmin
      .from('users')
      .select('username, display_name, assigned_channel, role')
      .ilike('assigned_channel', channel)
      .in('role', ['operations', 'dept-manager'])

    console.log('[DeptManager Stats] Team members found:', agents?.length, agentsError)

    const agentList = agents || []

    // Build orders query — filter by channel OR directly dispatched by this manager
    let query = supabaseAdmin
      .from('orders')
      .select('id, dispatched_by, agent_username, total, is_cancelled, status, created_at, sales_channel')
      .is('deleted_at', null)

    // Include orders from the assigned channel OR dispatched by this manager directly
    if (user.role === 'dept-manager') {
      query = query.or(`sales_channel.ilike.${channel},agent_username.eq.${user.username}`)
    } else {
      query = query.ilike('sales_channel', channel)
    }

    if (startDate) {
      const startUTC = new Date(new Date(startDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) + 'T00:00:00+08:00').toISOString().replace('Z','').slice(0,19)
      query = query.gte('created_at', startUTC)
    }
    if (endDate) {
      const endUTC = new Date(new Date(endDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) + 'T23:59:59+08:00').toISOString().replace('Z','').slice(0,19)
      query = query.lte('created_at', endUTC)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('[DeptManager Stats] Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    const allOrders = orders || []
    console.log('[DeptManager Stats] Orders found:', allOrders.length)

    // Group orders by agent — declare map first
    const agentMap = new Map<string, {
      username: string
      displayName: string
      totalOrders: number
      activeOrders: number
      cancelledOrders: number
      revenue: number
      lastActivity: string | null
    }>()

    // Initialize with all known team members (even those with 0 orders)
    for (const agent of agentList) {
      const label = agent.role === 'dept-manager'
        ? `${agent.display_name || agent.username} (Manager)`
        : (agent.display_name || agent.username)
      agentMap.set(agent.username, {
        username: agent.username,
        displayName: label,
        totalOrders: 0,
        activeOrders: 0,
        cancelledOrders: 0,
        revenue: 0,
        lastActivity: null
      })
    }

    // Aggregate orders per agent/manager
    for (const order of allOrders) {
      // Use agent_username if available, fallback to dispatched_by
      const agentKey = order.agent_username || order.dispatched_by || 'Unknown'

      if (!agentMap.has(agentKey)) {
        agentMap.set(agentKey, {
          username: agentKey,
          displayName: agentKey,
          totalOrders: 0,
          activeOrders: 0,
          cancelledOrders: 0,
          revenue: 0,
          lastActivity: null
        })
      }

      const agent = agentMap.get(agentKey)!
      agent.totalOrders++

      if (order.is_cancelled) {
        agent.cancelledOrders++
      } else {
        agent.activeOrders++
        agent.revenue += parseFloat(order.total) || 0
      }

      // Track most recent activity
      if (!agent.lastActivity || order.created_at > agent.lastActivity) {
        agent.lastActivity = order.created_at
      }
    }

    // Sort agents by totalOrders descending
    const sortedAgents = Array.from(agentMap.values())
      .sort((a, b) => b.totalOrders - a.totalOrders)

    // Summary stats
    const totalOrders = allOrders.length
    const cancelledOrders = allOrders.filter(o => o.is_cancelled).length
    const activeOrders = totalOrders - cancelledOrders
    const totalRevenue = allOrders
      .filter(o => !o.is_cancelled)
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)

    return NextResponse.json({
      totalOrders,
      activeOrders,
      cancelledOrders,
      totalRevenue,
      agents: sortedAgents
    })
  } catch (error) {
    console.error('[DeptManager Stats] Exception:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
})
