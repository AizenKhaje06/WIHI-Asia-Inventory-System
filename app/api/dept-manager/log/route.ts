import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { withAuth } from '@/lib/api-helpers'

/**
 * GET /api/dept-manager/log
 * Returns paginated order log for a dept-manager's assigned channel.
 * Supports filtering by agent, status, date range, and search.
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
    const agent = searchParams.get('agent') || ''
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    if (!channel) {
      return NextResponse.json({ error: 'No channel assigned' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        date,
        sales_channel,
        store,
        courier,
        waybill,
        qty,
        cogs,
        total,
        product,
        status,
        parcel_status,
        dispatched_by,
        agent_username,
        packed_by,
        packed_at,
        is_cancelled,
        cancellation_reason,
        customer_name,
        customer_address,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('sales_channel', channel)
      .is('deleted_at', null)

    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    if (agent) query = query.or(`agent_username.eq.${agent},dispatched_by.eq.${agent}`)

    if (status === 'cancelled') {
      query = query.eq('is_cancelled', true)
    } else if (status === 'active') {
      query = query.eq('is_cancelled', false)
    } else if (status === 'pending') {
      query = query.eq('status', 'Pending').eq('is_cancelled', false)
    } else if (status === 'packed') {
      query = query.in('status', ['Packed', 'Shipped', 'Delivered']).eq('is_cancelled', false)
    }

    if (search) {
      query = query.or(`id.ilike.%${search}%,waybill.ilike.%${search}%,customer_name.ilike.%${search}%,product.ilike.%${search}%`)
    }

    // Paginate
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data: orders, error, count } = await query

    if (error) {
      console.error('[DeptManager Log] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Get agents list for filter dropdown
    const { data: agents } = await supabaseAdmin
      .from('users')
      .select('username, display_name')
      .eq('assigned_channel', channel)
      .eq('role', 'operations')

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
      agents: agents || []
    })
  } catch (error) {
    console.error('[DeptManager Log] Exception:', error)
    return NextResponse.json({ error: 'Failed to fetch log' }, { status: 500 })
  }
})
