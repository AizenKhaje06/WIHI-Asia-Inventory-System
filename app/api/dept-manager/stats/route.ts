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
      return NextResponse.json({ error: 'No channel assigned' }, { status: 400 })
    }

    // Build orders query for this channel
    let query = supabaseAdmin
      .from('orders')
      .select('id, dispatched_by, agent_username, total, is_cancelled, status, created_at, sales_channel')
      .eq('sales_channel', channel)
      .is('deleted_at', null)

    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    const { data: orders, error } = await query

    if (error) {
      console.error('[DeptManager Stats] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    const allOrders = orders || []

    // Get all agents (users) for this channel
    const { data: agents } = await supabaseAdmin
      .from('users')
      .select('username, display_name, assigned_channel')
      .eq('assigned_channel', channel)
      .eq('role', 'operations')

    const agentList = agents || []

    // Group orders by agent
    const agentMap = new Map<string, {
      username: string
      displayName: string
      totalOrders: number
      activeOrders: number
      cancelledOrders: number
      revenue: number
      lastActivity: string | null
    }>()

    // Initialize with all known agents (even those with 0 orders)
    for (const agent of agentList) {
      agentMap.set(agent.username, {
        username: agent.username,
        displayName: agent.display_name || agent.username,
        totalOrders: 0,
        activeOrders: 0,
        cancelledOrders: 0,
        revenue: 0,
        lastActivity: null
      })
    }

    // Aggregate orders per agent
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
