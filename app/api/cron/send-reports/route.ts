import { type NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'
import { generateExcelReport, generatePDFReport, generateEmailTemplate, type ReportData } from '@/lib/email-reports'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] Starting email reports job...')

    // Check if Resend is configured
    if (!resend) {
      console.error('[Cron] Resend API not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Get current day and time
    const now = new Date()
    const currentHour = now.getHours().toString().padStart(2, '0')
    const currentMinute = now.getMinutes().toString().padStart(2, '0')
    const currentTime = `${currentHour}:${currentMinute}`
    const currentDay = now.getDay() // 0-6 (Sunday-Saturday)
    const currentDate = now.getDate() // 1-31

    console.log('[Cron] Current time:', currentTime, 'Day:', currentDay, 'Date:', currentDate)

    // Fetch active schedules that should run now
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from('email_report_schedules')
      .select('*')
      .eq('is_active', true)
      .eq('schedule_time', currentTime)

    if (schedulesError) {
      console.error('[Cron] Error fetching schedules:', schedulesError)
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
    }

    if (!schedules || schedules.length === 0) {
      console.log('[Cron] No schedules to process at this time')
      return NextResponse.json({ message: 'No schedules to process', processed: 0 })
    }

    console.log('[Cron] Found', schedules.length, 'schedule(s) to process')

    // Filter schedules based on frequency
    const schedulesToProcess = schedules.filter(schedule => {
      if (schedule.frequency === 'daily') return true
      if (schedule.frequency === 'weekly' && schedule.schedule_day === currentDay.toString()) return true
      if (schedule.frequency === 'monthly' && schedule.schedule_day === currentDate.toString()) return true
      return false
    })

    console.log('[Cron] Processing', schedulesToProcess.length, 'schedule(s)')

    let successCount = 0
    let failCount = 0

    // Process each schedule
    for (const schedule of schedulesToProcess) {
      const startTime = Date.now()
      
      try {
        console.log(`[Cron] Processing schedule ${schedule.id} for ${schedule.recipient_email}`)

        // Fetch orders data with date range filtering
        const reportData = await fetchTrackOrdersData(schedule)

        // Generate reports
        const excelBuffer = generateExcelReport(reportData)
        const pdfBuffer = await generatePDFReport(reportData)
        const emailHTML = generateEmailTemplate(reportData)

        // Send email with attachments
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        await resend.emails.send({
          from: fromEmail,
          to: schedule.recipient_email,
          subject: `📊 Track Orders Report - ${reportData.dateRange}`,
          html: emailHTML,
          attachments: [
            {
              filename: `Track_Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`,
              content: excelBuffer
            },
            {
              filename: `Track_Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`,
              content: pdfBuffer
            }
          ]
        })

        const generationTime = Date.now() - startTime

        // Log success
        await supabaseAdmin.from('email_report_logs').insert({
          id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          schedule_id: schedule.id,
          recipient_email: schedule.recipient_email,
          report_type: schedule.report_type,
          status: 'success',
          report_date_range: reportData.dateRange,
          orders_count: reportData.totalOrders,
          total_amount: reportData.totalAmount,
          file_size_bytes: excelBuffer.length + pdfBuffer.length,
          generation_time_ms: generationTime
        })

        // Update last_sent_at
        await supabaseAdmin
          .from('email_report_schedules')
          .update({ last_sent_at: new Date().toISOString() })
          .eq('id', schedule.id)

        successCount++
        console.log(`[Cron] ✅ Successfully sent report to ${schedule.recipient_email}`)

      } catch (error) {
        failCount++
        console.error(`[Cron] ❌ Failed to send report to ${schedule.recipient_email}:`, error)

        // Log failure
        await supabaseAdmin.from('email_report_logs').insert({
          id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          schedule_id: schedule.id,
          recipient_email: schedule.recipient_email,
          report_type: schedule.report_type,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          generation_time_ms: Date.now() - startTime
        })
      }
    }

    console.log(`[Cron] Job complete. Success: ${successCount}, Failed: ${failCount}`)

    return NextResponse.json({
      message: 'Email reports processed',
      processed: schedulesToProcess.length,
      success: successCount,
      failed: failCount
    })

  } catch (error) {
    console.error('[Cron] Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function fetchTrackOrdersData(schedule: any): Promise<ReportData> {
  // Build query with optional date range filtering
  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .eq('status', 'Packed')
    .order('created_at', { ascending: false })

  // Apply date range filter if specified in schedule
  if (schedule.start_date) {
    query = query.gte('date', schedule.start_date)
  }
  if (schedule.end_date) {
    query = query.lte('date', schedule.end_date)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('[Cron] Error fetching orders:', error)
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  console.log('[Cron] Fetched orders:', orders?.length || 0)

  // Transform data EXACTLY like track orders page
  const transformedOrders = (orders || []).map(order => ({
    id: order.id,
    orderNumber: order.id,
    customerName: order.customer_name || 'N/A',
    customerPhone: order.customer_contact || 'N/A',
    customerEmail: undefined,
    customerAddress: order.customer_address || 'N/A',
    storeName: order.store || 'N/A',
    itemName: order.product || 'N/A', // Product name (keep full text with quantities)
    quantity: order.qty || 0,
    totalAmount: order.total || 0,
    orderStatus: order.status as 'Pending' | 'Packed',
    parcelStatus: (order.parcel_status || 'PENDING') as any,
    paymentStatus: (order.payment_status || 'pending') as any,
    courier: order.courier || '-',
    trackingNumber: order.waybill || '-',
    waybill: order.waybill || '-',
    orderDate: order.date,
    estimatedDelivery: undefined,
    deliveryDate: order.status === 'Delivered' ? order.updated_at : undefined,
    notes: JSON.stringify({
      dispatchedBy: order.dispatched_by,
      dispatchedAt: order.created_at,
      packedBy: order.packed_by,
      packedAt: order.packed_at,
      store: order.store
    }),
    dispatchNotes: order.dispatch_notes || '',
    department: order.sales_channel || 'N/A',
    salesChannel: order.sales_channel || 'N/A',
    store: order.store || 'N/A'
  }))

  const totalOrders = transformedOrders.length
  const totalAmount = transformedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalCOGS = totalAmount * 0.6
  const totalProfit = totalAmount - totalCOGS

  // Format date range for report
  let dateRange = `As of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  if (schedule.start_date && schedule.end_date) {
    const start = new Date(schedule.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const end = new Date(schedule.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    dateRange = `${start} - ${end}`
  } else if (schedule.start_date) {
    const start = new Date(schedule.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    dateRange = `From ${start}`
  } else if (schedule.end_date) {
    const end = new Date(schedule.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    dateRange = `Until ${end}`
  }

  return {
    orders: transformedOrders,
    dateRange,
    totalOrders,
    totalAmount,
    totalCOGS,
    totalProfit,
    statusBreakdown: {
      pending: transformedOrders.filter(o => o.parcelStatus === 'PENDING').length,
      inTransit: transformedOrders.filter(o => o.parcelStatus === 'IN TRANSIT').length,
      delivered: transformedOrders.filter(o => o.parcelStatus === 'DELIVERED').length,
      cancelled: transformedOrders.filter(o => o.parcelStatus === 'CANCELLED').length
    }
  }
}
