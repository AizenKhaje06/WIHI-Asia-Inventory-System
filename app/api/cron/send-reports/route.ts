import { type NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'
import { generateExcelReport, generatePDFReport, generateEmailTemplate, type ReportData } from '@/lib/email-reports'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional for testing)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    // Log for debugging
    console.log('[Cron] Auth header:', authHeader ? 'Present' : 'Missing')
    console.log('[Cron] Expected auth:', expectedAuth)
    
    // Skip auth check if CRON_SECRET not set (for testing)
    if (process.env.CRON_SECRET && authHeader !== expectedAuth) {
      console.error('[Cron] Unauthorized - auth mismatch')
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

    // Fetch ALL active schedules first for debugging
    const { data: allSchedules, error: allSchedulesError } = await supabaseAdmin
      .from('email_report_schedules')
      .select('*')
      .eq('is_active', true)

    console.log('[Cron] All active schedules:', allSchedules?.length || 0)
    if (allSchedules && allSchedules.length > 0) {
      allSchedules.forEach(s => {
        console.log(`[Cron] Schedule: ${s.id} - Time: ${s.schedule_time} - Email: ${s.recipient_email}`)
      })
    }

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

    console.log('[Cron] Schedules matching current time:', schedules?.length || 0)

    if (!schedules || schedules.length === 0) {
      console.log('[Cron] No schedules to process at this time')
      return NextResponse.json({ 
        message: 'No schedules to process', 
        currentTime,
        allActiveSchedules: allSchedules?.length || 0,
        processed: 0 
      })
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

        // Fetch orders data
        const reportData = await fetchTrackOrdersData(schedule.filters || {})

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

async function fetchTrackOrdersData(_filters: any): Promise<ReportData> {
  // Fetch from orders table (track orders) - only packed orders
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('status', 'Packed')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Cron] Error fetching orders:', error)
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  console.log('[Cron] Fetched orders:', orders?.length || 0)

  // Transform data to match Track Orders page format EXACTLY
  const transformedOrders = (orders || []).map(order => {
    // Debug log to see actual data
    console.log('[Cron] Order data:', {
      id: order.id,
      product: order.product,
      sales_channel: order.sales_channel,
      parcel_status: order.parcel_status,
      waybill: order.waybill
    })
    
    return {
      id: order.id,
      orderNumber: `#${order.id.slice(-6)}`,
      customerName: order.customer_name || 'N/A',
      customerPhone: order.customer_contact || 'N/A',
      customerAddress: order.customer_address || 'N/A',
      storeName: order.store || 'N/A',
      itemName: order.product || order.item_name || 'N/A', // Product name
      quantity: order.qty || order.quantity || 0,
      totalAmount: order.total || order.amount || 0,
      orderStatus: order.status as 'Pending' | 'Packed',
      parcelStatus: (order.parcel_status || order.status || 'PENDING') as any,
      paymentStatus: (order.payment_status || 'pending') as any,
      courier: order.courier || '-',
      trackingNumber: order.waybill || order.tracking_number || '-',
      waybill: order.waybill || order.tracking_number || '-',
      orderDate: order.date || order.created_at,
      department: order.sales_channel || order.department || 'N/A',
      salesChannel: order.sales_channel || order.department || 'N/A',
      store: order.store || 'N/A'
    }
  })

  const totalOrders = transformedOrders.length
  const totalAmount = transformedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalCOGS = totalAmount * 0.6
  const totalProfit = totalAmount - totalCOGS

  return {
    orders: transformedOrders,
    dateRange: `As of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
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
