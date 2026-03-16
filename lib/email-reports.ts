/**
 * Email Reports Library
 * Handles generation and sending of automated email reports
 */

import * as XLSX from 'xlsx'
import { formatCurrency, formatNumber } from './utils'

export interface ReportData {
  orders: any[]
  dateRange: string
  totalOrders: number
  totalAmount: number
  totalCOGS: number
  totalProfit: number
  statusBreakdown: {
    pending: number
    inTransit: number
    delivered: number
    cancelled: number
  }
}

export interface EmailAttachment {
  filename: string
  content: Buffer
}

/**
 * Generate Excel report buffer - EXACT COPY from Track Orders Page
 */
export function generateExcelReport(data: ReportData): Buffer {
  const wb = XLSX.utils.book_new()
  const wsData: any[][] = []

  // Calculate financial totals
  const totalQuantity = data.orders.reduce((sum, order) => sum + order.quantity, 0)
  const totalAmount = data.totalAmount
  const totalCOGS = data.totalCOGS
  const totalProfit = data.totalProfit
  const totalProfitMargin = totalAmount > 0 ? ((totalProfit / totalAmount) * 100) : 0

  // Calculate per-status financials
  const getStatusFinancials = (statusOrders: any[]) => {
    const qty = statusOrders.reduce((sum, o) => sum + o.quantity, 0)
    const amt = statusOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const cogs = amt * 0.6
    const profit = amt - cogs
    const margin = amt > 0 ? ((profit / amt) * 100) : 0
    return { qty, amt, cogs, profit, margin }
  }

  const pendingFinancials = getStatusFinancials(data.orders.filter(o => o.parcelStatus === 'PENDING'))
  const inTransitFinancials = getStatusFinancials(data.orders.filter(o => o.parcelStatus === 'IN TRANSIT'))
  const onDeliveryFinancials = getStatusFinancials(data.orders.filter(o => o.parcelStatus === 'ON DELIVERY'))
  const pickupFinancials = getStatusFinancials(data.orders.filter(o => o.parcelStatus === 'PICKUP'))
  const deliveredFinancials = getStatusFinancials(data.orders.filter(o => o.parcelStatus === 'DELIVERED'))
  const cancelledFinancials = getStatusFinancials(data.orders.filter(o => o.parcelStatus === 'CANCELLED'))
  const detainedFinancials = getStatusFinancials(data.orders.filter(o => o.parcelStatus === 'DETAINED'))
  const problematicFinancials = getStatusFinancials(data.orders.filter(o => o.parcelStatus === 'PROBLEMATIC'))
  const returnedFinancials = getStatusFinancials(data.orders.filter(o => o.parcelStatus === 'RETURNED'))

  // Header Section
  wsData.push(['TRACK ORDERS REPORT - COMPREHENSIVE DATA'])
  wsData.push([`Generated: ${new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`])
  wsData.push([`Total Orders: ${data.totalOrders}`])
  wsData.push([]) // Empty row

  // Financial Summary Section
  wsData.push(['FINANCIAL SUMMARY'])
  wsData.push(['Metric', 'Value'])
  wsData.push(['Total Quantity', totalQuantity])
  wsData.push(['Total Amount', totalAmount.toFixed(2)])
  wsData.push(['Total COGS', totalCOGS.toFixed(2)])
  wsData.push(['Total Profit', totalProfit.toFixed(2)])
  wsData.push(['Profit Margin', `${totalProfitMargin.toFixed(2)}%`])
  wsData.push([]) // Empty row

  // Status Breakdown Section
  wsData.push(['STATUS BREAKDOWN'])
  wsData.push(['Status', 'Orders', 'Quantity', 'Amount', 'COGS', 'Profit', '% of Total'])
  
  // Calculate percentage of total orders for each status
  const totalOrdersCount = data.totalOrders
  const pendingCount = data.orders.filter(o => o.parcelStatus === 'PENDING').length
  const inTransitCount = data.orders.filter(o => o.parcelStatus === 'IN TRANSIT').length
  const onDeliveryCount = data.orders.filter(o => o.parcelStatus === 'ON DELIVERY').length
  const pickupCount = data.orders.filter(o => o.parcelStatus === 'PICKUP').length
  const deliveredCount = data.orders.filter(o => o.parcelStatus === 'DELIVERED').length
  const cancelledCount = data.orders.filter(o => o.parcelStatus === 'CANCELLED').length
  const detainedCount = data.orders.filter(o => o.parcelStatus === 'DETAINED').length
  const problematicCount = data.orders.filter(o => o.parcelStatus === 'PROBLEMATIC').length
  const returnedCount = data.orders.filter(o => o.parcelStatus === 'RETURNED').length
  
  wsData.push(['Total Orders', totalOrdersCount, totalQuantity, totalAmount.toFixed(2), totalCOGS.toFixed(2), totalProfit.toFixed(2), '100.00%'])
  wsData.push(['Pending', pendingCount, pendingFinancials.qty, pendingFinancials.amt.toFixed(2), pendingFinancials.cogs.toFixed(2), pendingFinancials.profit.toFixed(2), `${totalOrdersCount > 0 ? ((pendingCount / totalOrdersCount) * 100).toFixed(2) : '0.00'}%`])
  wsData.push(['In Transit', inTransitCount, inTransitFinancials.qty, inTransitFinancials.amt.toFixed(2), inTransitFinancials.cogs.toFixed(2), inTransitFinancials.profit.toFixed(2), `${totalOrdersCount > 0 ? ((inTransitCount / totalOrdersCount) * 100).toFixed(2) : '0.00'}%`])
  wsData.push(['On Delivery', onDeliveryCount, onDeliveryFinancials.qty, onDeliveryFinancials.amt.toFixed(2), onDeliveryFinancials.cogs.toFixed(2), onDeliveryFinancials.profit.toFixed(2), `${totalOrdersCount > 0 ? ((onDeliveryCount / totalOrdersCount) * 100).toFixed(2) : '0.00'}%`])
  wsData.push(['Pickup', pickupCount, pickupFinancials.qty, pickupFinancials.amt.toFixed(2), pickupFinancials.cogs.toFixed(2), pickupFinancials.profit.toFixed(2), `${totalOrdersCount > 0 ? ((pickupCount / totalOrdersCount) * 100).toFixed(2) : '0.00'}%`])
  wsData.push(['Delivered', deliveredCount, deliveredFinancials.qty, deliveredFinancials.amt.toFixed(2), deliveredFinancials.cogs.toFixed(2), deliveredFinancials.profit.toFixed(2), `${totalOrdersCount > 0 ? ((deliveredCount / totalOrdersCount) * 100).toFixed(2) : '0.00'}%`])
  wsData.push(['Cancelled', cancelledCount, cancelledFinancials.qty, cancelledFinancials.amt.toFixed(2), cancelledFinancials.cogs.toFixed(2), cancelledFinancials.profit.toFixed(2), `${totalOrdersCount > 0 ? ((cancelledCount / totalOrdersCount) * 100).toFixed(2) : '0.00'}%`])
  wsData.push(['Detained', detainedCount, detainedFinancials.qty, detainedFinancials.amt.toFixed(2), detainedFinancials.cogs.toFixed(2), detainedFinancials.profit.toFixed(2), `${totalOrdersCount > 0 ? ((detainedCount / totalOrdersCount) * 100).toFixed(2) : '0.00'}%`])
  wsData.push(['Problematic', problematicCount, problematicFinancials.qty, problematicFinancials.amt.toFixed(2), problematicFinancials.cogs.toFixed(2), problematicFinancials.profit.toFixed(2), `${totalOrdersCount > 0 ? ((problematicCount / totalOrdersCount) * 100).toFixed(2) : '0.00'}%`])
  wsData.push(['Returned', returnedCount, returnedFinancials.qty, returnedFinancials.amt.toFixed(2), returnedFinancials.cogs.toFixed(2), returnedFinancials.profit.toFixed(2), `${totalOrdersCount > 0 ? ((returnedCount / totalOrdersCount) * 100).toFixed(2) : '0.00'}%`])
  wsData.push([]) // Empty row

  // Detailed Orders Section
  wsData.push(['DETAILED ORDERS'])
  wsData.push(['No.', 'Order #', 'Date', 'Sales Channel', 'Store', 'Product', 'Qty', 'Amount', 'COGS', 'Profit', 'Margin', 'Courier', 'Waybill', 'Payment Status', 'Parcel Status'])
  
  data.orders.forEach((order, index) => {
    const cogs = order.totalAmount * 0.6
    const profit = order.totalAmount - cogs
    const margin = order.totalAmount > 0 ? ((profit / order.totalAmount) * 100) : 0
    
    wsData.push([
      index + 1,
      `#${order.id.slice(-6)}`,
      new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      order.department || 'N/A',
      order.customerAddress || 'N/A',
      order.itemName,
      order.quantity,
      order.totalAmount.toFixed(2),
      cogs.toFixed(2),
      profit.toFixed(2),
      `${margin.toFixed(2)}%`,
      order.courier || '-',
      order.trackingNumber || '-',
      order.paymentStatus.toUpperCase(),
      order.parcelStatus
    ])
  })

  // Create worksheet from data
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Apply number formatting to currency cells
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  
  // Format Financial Summary amounts (rows 8-10, column B)
  for (let row = 7; row <= 9; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 })
    if (ws[cellAddress] && typeof ws[cellAddress].v === 'string') {
      const numValue = parseFloat(ws[cellAddress].v)
      if (!isNaN(numValue)) {
        ws[cellAddress].t = 'n'
        ws[cellAddress].v = numValue
        ws[cellAddress].z = '"₱"#,##0.00'
      }
    }
  }

  // Format Status Breakdown amounts (starting from row 15, columns D, E, F)
  const statusStartRow = 14 // Row 15 in 0-indexed
  for (let row = statusStartRow; row <= statusStartRow + 9; row++) {
    for (let col = 3; col <= 5; col++) { // Columns D, E, F (Amount, COGS, Profit)
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (ws[cellAddress] && typeof ws[cellAddress].v === 'string') {
        const numValue = parseFloat(ws[cellAddress].v)
        if (!isNaN(numValue)) {
          ws[cellAddress].t = 'n'
          ws[cellAddress].v = numValue
          ws[cellAddress].z = '"₱"#,##0.00'
        }
      }
    }
  }

  // Format Detailed Orders amounts (starting from detailed orders section, columns H, I, J)
  const detailedStartRow = statusStartRow + 13 // After status breakdown + empty rows + headers
  for (let row = detailedStartRow; row <= range.e.r; row++) {
    for (let col = 7; col <= 9; col++) { // Columns H, I, J (Amount, COGS, Profit)
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (ws[cellAddress] && typeof ws[cellAddress].v === 'string') {
        const numValue = parseFloat(ws[cellAddress].v)
        if (!isNaN(numValue)) {
          ws[cellAddress].t = 'n'
          ws[cellAddress].v = numValue
          ws[cellAddress].z = '"₱"#,##0.00'
        }
      }
    }
  }

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // No./Metric/Status
    { wch: 12 }, // Order #/Value
    { wch: 15 }, // Date/Quantity
    { wch: 15 }, // Sales Channel/Amount
    { wch: 20 }, // Store/COGS
    { wch: 30 }, // Product/Profit
    { wch: 8 },  // Qty/Margin
    { wch: 15 }, // Amount
    { wch: 15 }, // COGS
    { wch: 15 }, // Profit
    { wch: 10 }, // Margin
    { wch: 12 }, // Courier
    { wch: 20 }, // Waybill
    { wch: 15 }, // Payment Status
    { wch: 15 }  // Parcel Status
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Track Orders Report')

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

/**
 * Generate PDF report as HTML (for email or print)
 */
export function generatePDFReportHTML(data: ReportData): string {
  const totalQuantity = data.orders.reduce((sum, order) => sum + order.quantity, 0)
  const totalProfitMargin = data.totalAmount > 0 ? ((data.totalProfit / data.totalAmount) * 100) : 0

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Track Orders Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { margin: 0; size: auto; }
        @media print {
          @page { margin: 0; }
          body { margin: 1.6cm; }
        }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 30px; 
          background: white;
          color: #1e293b;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 25px;
          border-bottom: 4px solid #3b82f6;
        }
        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .meta { 
          color: #64748b; 
          font-size: 15px;
          line-height: 1.8;
        }
        .meta strong { color: #1e293b; font-weight: 700; }
        
        .financial-summary {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          margin-bottom: 35px;
          padding: 25px;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-radius: 12px;
          border: 3px solid #3b82f6;
        }
        .financial-card {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .financial-card .label {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .financial-card .value {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
        }
        .financial-card.profit .value { color: #059669; }
        .financial-card.margin .value { color: #0284c7; }
        
        .status-breakdown {
          margin-bottom: 35px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        .status-card {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        .status-card .status-name {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .status-card .status-count {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
        }
        .status-card .status-percent {
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 12px;
        }
        th {
          background: #3b82f6;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:hover { background: #f8fafc; }
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-delivered { background: #d1fae5; color: #065f46; }
        .badge-in.transit { background: #dbeafe; color: #1e40af; }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="page-title">Track Orders Report</h1>
        <div class="meta">
          <p><strong>Generated:</strong> ${new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p><strong>Period:</strong> ${data.dateRange}</p>
          <p><strong>Total Orders:</strong> ${data.totalOrders}</p>
        </div>
      </div>

      <div class="financial-summary">
        <div class="financial-card">
          <div class="label">Total Quantity</div>
          <div class="value">${formatNumber(totalQuantity)}</div>
        </div>
        <div class="financial-card">
          <div class="label">Total Amount</div>
          <div class="value">${formatCurrency(data.totalAmount)}</div>
        </div>
        <div class="financial-card">
          <div class="label">Total COGS</div>
          <div class="value">${formatCurrency(data.totalCOGS)}</div>
        </div>
        <div class="financial-card profit">
          <div class="label">Total Profit</div>
          <div class="value">${formatCurrency(data.totalProfit)}</div>
        </div>
        <div class="financial-card margin">
          <div class="label">Profit Margin</div>
          <div class="value">${totalProfitMargin.toFixed(2)}%</div>
        </div>
      </div>

      <div class="status-breakdown">
        <h2 class="section-title">Status Breakdown</h2>
        <div class="status-grid">
          <div class="status-card">
            <div class="status-name">Total</div>
            <div class="status-count">${data.totalOrders}</div>
            <div class="status-percent">100%</div>
          </div>
          <div class="status-card">
            <div class="status-name">Pending</div>
            <div class="status-count">${data.statusBreakdown.pending}</div>
            <div class="status-percent">${data.totalOrders > 0 ? ((data.statusBreakdown.pending / data.totalOrders) * 100).toFixed(1) : '0.0'}%</div>
          </div>
          <div class="status-card">
            <div class="status-name">In Transit</div>
            <div class="status-count">${data.statusBreakdown.inTransit}</div>
            <div class="status-percent">${data.totalOrders > 0 ? ((data.statusBreakdown.inTransit / data.totalOrders) * 100).toFixed(1) : '0.0'}%</div>
          </div>
          <div class="status-card">
            <div class="status-name">Delivered</div>
            <div class="status-count">${data.statusBreakdown.delivered}</div>
            <div class="status-percent">${data.totalOrders > 0 ? ((data.statusBreakdown.delivered / data.totalOrders) * 100).toFixed(1) : '0.0'}%</div>
          </div>
          <div class="status-card">
            <div class="status-name">Cancelled</div>
            <div class="status-count">${data.statusBreakdown.cancelled}</div>
            <div class="status-percent">${data.totalOrders > 0 ? ((data.statusBreakdown.cancelled / data.totalOrders) * 100).toFixed(1) : '0.0'}%</div>
          </div>
        </div>
      </div>

      <h2 class="section-title">Detailed Orders</h2>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Order #</th>
            <th>Date</th>
            <th>Sales Channel</th>
            <th>Store</th>
            <th>Product</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Amount</th>
            <th class="text-right">COGS</th>
            <th class="text-right">Profit</th>
            <th class="text-right">Margin</th>
            <th>Courier</th>
            <th>Waybill</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.orders.map((order, index) => {
            const cogs = order.totalAmount * 0.6
            const profit = order.totalAmount - cogs
            const margin = order.totalAmount > 0 ? ((profit / order.totalAmount) * 100) : 0
            const statusClass = order.parcelStatus.toLowerCase().replace(' ', '.')
            
            return `
              <tr>
                <td>${index + 1}</td>
                <td>#${order.id.slice(-6)}</td>
                <td>${new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>${order.department || 'N/A'}</td>
                <td>${order.customerAddress || 'N/A'}</td>
                <td>${order.itemName}</td>
                <td class="text-right">${order.quantity}</td>
                <td class="text-right">${formatCurrency(order.totalAmount)}</td>
                <td class="text-right">${formatCurrency(cogs)}</td>
                <td class="text-right">${formatCurrency(profit)}</td>
                <td class="text-right">${margin.toFixed(2)}%</td>
                <td>${order.courier || '-'}</td>
                <td>${order.trackingNumber || '-'}</td>
                <td>${order.paymentStatus.toUpperCase()}</td>
                <td><span class="badge badge-${statusClass}">${order.parcelStatus}</span></td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `
}

/**
 * Generate email HTML template
 */
export function generateEmailTemplate(data: ReportData): string {
  const deliveryRate = data.totalOrders > 0 
    ? ((data.statusBreakdown.delivered / data.totalOrders) * 100).toFixed(1)
    : '0.0'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stat { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .stat:last-child { border-bottom: none; }
        .stat-label { color: #64748b; font-weight: 600; }
        .stat-value { color: #1e293b; font-weight: bold; }
        .insights { background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📊 Track Orders Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.dateRange}</p>
        </div>
        
        <div class="content">
          <p>Good day!</p>
          <p>Here's your automated Track Orders report with comprehensive data and insights.</p>
          
          <div class="summary">
            <h3 style="margin-top: 0; color: #1e293b;">📦 Summary</h3>
            <div class="stat">
              <span class="stat-label">Total Orders</span>
              <span class="stat-value">${data.totalOrders}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Total Amount</span>
              <span class="stat-value">${formatCurrency(data.totalAmount)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Total Profit</span>
              <span class="stat-value">${formatCurrency(data.totalProfit)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Delivered</span>
              <span class="stat-value">${data.statusBreakdown.delivered} (${deliveryRate}%)</span>
            </div>
            <div class="stat">
              <span class="stat-label">In Transit</span>
              <span class="stat-value">${data.statusBreakdown.inTransit}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Pending</span>
              <span class="stat-value">${data.statusBreakdown.pending}</span>
            </div>
          </div>

          <div class="insights">
            <h4 style="margin-top: 0; color: #1e40af;">💡 Key Insights</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Delivery rate: ${deliveryRate}%</li>
              <li>${data.statusBreakdown.cancelled > 0 ? `${data.statusBreakdown.cancelled} cancelled orders` : 'No cancelled orders'}</li>
              <li>Total revenue: ${formatCurrency(data.totalAmount)}</li>
            </ul>
          </div>

          <p><strong>📎 Attachments:</strong></p>
          <ul>
            <li>Track_Orders_Report.xlsx - Detailed Excel report</li>
            <li>Track_Orders_Report.pdf - Printable PDF report</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/track-orders" class="button">
              View Online Dashboard
            </a>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated report from your Track Orders system.</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
