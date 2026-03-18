import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateExcelReport, generatePDFReport, generateEmailTemplate, ReportData } from '@/lib/email-reports'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/email-test
 * Test email report generation and sending
 * 
 * Body: { recipient_email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipient_email } = body

    if (!recipient_email || typeof recipient_email !== 'string') {
      return NextResponse.json(
        { error: 'recipient_email is required' },
        { status: 400 }
      )
    }

    console.log('[Email Test] Fetching orders from database...')

    // Fetch orders from orders table (new data source)
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('status', 'Packed')
      .order('created_at', { ascending: false })
      .limit(100)

    if (ordersError) {
      console.error('[Email Test] Error fetching orders:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders from database' },
        { status: 500 }
      )
    }

    console.log(`[Email Test] Found ${orders?.length || 0} orders`)

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { 
          success: true,
          message: 'No orders found to generate report',
          ordersCount: 0
        },
        { status: 200 }
      )
    }

    // Transform orders to match ReportData interface
    const transformedOrders = orders.map(order => ({
      id: order.id,
      waybill: order.waybill || order.id,
      trackingNumber: order.waybill || '-',
      orderDate: order.date || order.created_at,
      salesChannel: order.sales_channel || 'N/A',
      department: order.sales_channel || 'N/A',
      store: order.store || 'N/A',
      customerAddress: order.customer_address || 'N/A',
      itemName: order.product || 'N/A',
      quantity: order.qty || 0,
      totalAmount: order.total || 0,
      courier: order.courier || '-',
      paymentStatus: order.payment_status || 'pending',
      parcelStatus: order.parcel_status || 'PENDING'
    }))

    // Calculate totals
    const totalAmount = transformedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalCOGS = totalAmount * 0.6 // Assuming 60% COGS
    const totalProfit = totalAmount - totalCOGS

    // Calculate status breakdown
    const statusBreakdown = {
      pending: transformedOrders.filter(o => o.parcelStatus === 'PENDING').length,
      inTransit: transformedOrders.filter(o => o.parcelStatus === 'IN TRANSIT').length,
      delivered: transformedOrders.filter(o => o.parcelStatus === 'DELIVERED').length,
      cancelled: transformedOrders.filter(o => o.parcelStatus === 'CANCELLED').length
    }

    const reportData: ReportData = {
      orders: transformedOrders,
      dateRange: 'All Time',
      totalOrders: transformedOrders.length,
      totalAmount,
      totalCOGS,
      totalProfit,
      statusBreakdown
    }

    console.log('[Email Test] Generating Excel report...')
    const excelBuffer = generateExcelReport(reportData)
    console.log(`[Email Test] Excel report generated: ${excelBuffer.length} bytes`)

    console.log('[Email Test] Generating PDF report...')
    const pdfBuffer = await generatePDFReport(reportData)
    console.log(`[Email Test] PDF report generated: ${pdfBuffer.length} bytes`)

    console.log('[Email Test] Generating email HTML...')
    const emailHTML = generateEmailTemplate(reportData)

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email Test] RESEND_API_KEY not configured')
      return NextResponse.json(
        {
          success: false,
          error: 'Email service not configured (RESEND_API_KEY missing)',
          ordersCount: transformedOrders.length,
          reportGenerated: true,
          excelSize: excelBuffer.length,
          pdfSize: pdfBuffer.length
        },
        { status: 500 }
      )
    }

    console.log('[Email Test] Sending email via Resend...')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: recipient_email,
      subject: `📊 Track Orders Report - ${new Date().toLocaleDateString()}`,
      html: emailHTML,
      attachments: [
        {
          filename: 'Track_Orders_Report.xlsx',
          content: excelBuffer
        },
        {
          filename: 'Track_Orders_Report.pdf',
          content: pdfBuffer
        }
      ]
    })

    if (emailError) {
      console.error('[Email Test] Error sending email:', emailError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send email: ${emailError.message}`,
          ordersCount: transformedOrders.length,
          reportGenerated: true
        },
        { status: 500 }
      )
    }

    console.log('[Email Test] Email sent successfully:', emailData)

    return NextResponse.json(
      {
        success: true,
        message: 'Test email sent successfully',
        ordersCount: transformedOrders.length,
        emailId: emailData?.id,
        recipient: recipient_email
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[Email Test] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}
