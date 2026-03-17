import { type NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'
import { generateExcelReport, generatePDFReportHTML, generateEmailTemplate, type ReportData } from '@/lib/email-reports'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipient_email } = body

    if (!recipient_email) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      )
    }

    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_API_KEY.' },
        { status: 500 }
      )
    }

    console.log('[Test Email] Generating report for:', recipient_email)

    // Fetch sample data from orders table (track orders) - only packed orders
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('status', 'Packed')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[Test Email] Error fetching orders:', error)
      throw new Error(`Failed to fetch orders: ${error.message}`)
    }

    console.log('[Test Email] Fetched orders:', orders?.length || 0)

    // Transform data EXACTLY like cron job and track orders page
    const transformedOrders = (orders || []).map(order => ({
      id: order.id,
      orderNumber: order.id,
      customerName: order.customer_name || 'N/A',
      customerPhone: order.customer_contact || 'N/A',
      customerEmail: undefined,
      customerAddress: order.customer_address || 'N/A',
      storeName: order.store || 'N/A',
      itemName: order.product || 'N/A', // Product name from database
      quantity: order.qty || 0,
      totalAmount: order.total || 0,
      orderStatus: order.status as 'Pending' | 'Packed',
      parcelStatus: (order.parcel_status || 'PENDING') as any, // Use parcel_status field
      paymentStatus: (order.payment_status || 'pending') as any,
      courier: order.courier || '-',
      trackingNumber: order.waybill || '-', // Use waybill field
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
      department: order.sales_channel || 'N/A', // Use sales_channel field
      salesChannel: order.sales_channel || 'N/A',
      store: order.store || 'N/A'
    }))

    const totalOrders = transformedOrders.length
    const totalAmount = transformedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalCOGS = totalAmount * 0.6
    const totalProfit = totalAmount - totalCOGS

    const reportData: ReportData = {
      orders: transformedOrders,
      dateRange: `Test Report - ${new Date().toLocaleDateString()}`,
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

    // Generate reports
    const excelBuffer = generateExcelReport(reportData)
    const pdfHTML = generatePDFReportHTML(reportData)
    const emailHTML = generateEmailTemplate(reportData)

    // Send email
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    await resend.emails.send({
      from: fromEmail,
      to: recipient_email,
      subject: `🧪 Test Report - Track Orders (${new Date().toLocaleDateString()})`,
      html: emailHTML,
      attachments: [
        {
          filename: `Test_Track_Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`,
          content: excelBuffer
        },
        {
          filename: `Test_Track_Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`,
          content: Buffer.from(pdfHTML)
        }
      ]
    })

    console.log('[Test Email] ✅ Successfully sent to:', recipient_email)

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${recipient_email}`,
      ordersCount: totalOrders
    })

  } catch (error) {
    console.error('[Test Email] ❌ Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
