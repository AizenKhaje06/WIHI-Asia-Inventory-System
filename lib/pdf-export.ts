import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PDFExportOptions {
  title: string
  subtitle?: string
  data: any[]
  columns: { header: string; dataKey: string }[]
  filename: string
  summary?: { label: string; value: string | number }[]
  orientation?: 'portrait' | 'landscape'
}

export function exportToPDF(options: PDFExportOptions) {
  const {
    title,
    subtitle,
    data,
    columns,
    filename,
    summary,
    orientation = 'portrait'
  } = options

  // Create new PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Add header with logo/title
  doc.setFontSize(20)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8
  }

  // Add generation date
  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  // Add summary section if provided
  if (summary && summary.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 14, yPosition)
    yPosition += 8

    // Create summary table
    const summaryData = summary.map(item => [item.label, item.value.toString()])
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [249, 115, 22], // Orange
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      margin: { left: 14, right: 14 }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // Add main data table
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Report', 14, yPosition)
  yPosition += 8

  // Prepare table data
  const tableData = data.map(row => 
    columns.map(col => {
      const value = row[col.dataKey]
      if (value === null || value === undefined) return '-'
      
      // Special handling for percentage fields
      if ((col.dataKey === 'revenueContribution' || col.dataKey === 'margin' || col.dataKey === 'returnRate' || col.dataKey === 'confidence') && typeof value === 'number') {
        return `${value.toFixed(2)}%`
      }
      
      if (typeof value === 'number') {
        // Format numbers with commas
        return value.toLocaleString('en-US')
      }
      // Replace peso sign with PHP for PDF compatibility
      return value.toString().replace(/₱/g, 'PHP ')
    })
  )

  // Create main table
  autoTable(doc, {
    startY: yPosition,
    head: [columns.map(col => col.header)],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [249, 115, 22], // Orange
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252]
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
      
      // Add company name/watermark
      doc.text(
        'StockSync Inventory System',
        14,
        pageHeight - 10
      )
    }
  })

  // Save the PDF
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`)
}

// Specific export functions for different pages

export function exportDashboardPDF(stats: any) {
  exportToPDF({
    title: 'Dashboard Report',
    subtitle: 'Comprehensive Business Overview',
    filename: 'dashboard-report',
    orientation: 'portrait',
    summary: [
      { label: 'Total Revenue', value: `PHP ${stats.totalRevenue?.toLocaleString('en-US') || 0}` },
      { label: 'Net Profit', value: `PHP ${((stats.totalRevenue || 0) - (stats.totalCost || 0)).toLocaleString('en-US')}` },
      { label: 'Profit Margin', value: `${stats.profitMargin?.toFixed(1) || 0}%` },
      { label: 'Items Sold Today', value: stats.itemsSoldToday || 0 },
      { label: 'Total Products', value: stats.totalItems || 0 },
      { label: 'Low Stock Items', value: stats.lowStockItems || 0 },
      { label: 'Out of Stock', value: stats.outOfStockCount || 0 },
      { label: 'Inventory Value', value: `PHP ${stats.totalValue?.toLocaleString('en-US') || 0}` }
    ],
    columns: [
      { header: 'Product', dataKey: 'name' },
      { header: 'Sales', dataKey: 'sales' },
      { header: 'Revenue', dataKey: 'revenue' }
    ],
    data: stats.topProducts || []
  })
}

export function exportSalesAnalyticsPDF(salesData: any) {
  exportToPDF({
    title: 'Sales Analytics Report',
    subtitle: 'Detailed Sales Performance Analysis',
    filename: 'sales-analytics-report',
    orientation: 'landscape',
    summary: [
      { label: 'Total Orders', value: salesData.totalOrders || 0 },
      { label: 'Total Revenue', value: `PHP ${salesData.totalRevenue?.toLocaleString('en-US') || 0}` },
      { label: 'Total Cost', value: `PHP ${salesData.totalCost?.toLocaleString('en-US') || 0}` },
      { label: 'Total Profit', value: `PHP ${salesData.totalProfit?.toLocaleString('en-US') || 0}` },
      { label: 'Profit Margin', value: `${salesData.profitMargin?.toFixed(1) || 0}%` },
      { label: 'Items Sold', value: salesData.itemsSold || 0 }
    ],
    columns: [
      { header: 'Date', dataKey: 'date' },
      { header: 'Revenue', dataKey: 'revenue' },
      { header: 'Items Sold', dataKey: 'itemsSold' },
      { header: 'Profit', dataKey: 'profit' }
    ],
    data: salesData.dailySales || []
  })
}

export function exportInventoryPDF(items: any[]) {
  exportToPDF({
    title: 'Inventory Report',
    subtitle: 'Complete Product Inventory',
    filename: 'inventory-report',
    orientation: 'landscape',
    summary: [
      { label: 'Total Products', value: items.length },
      { label: 'Total Value', value: `₱${items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0).toLocaleString()}` },
      { label: 'Total Quantity', value: items.reduce((sum, item) => sum + item.quantity, 0) }
    ],
    columns: [
      { header: 'Product', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Cost Price', dataKey: 'costPrice' },
      { header: 'Selling Price', dataKey: 'sellingPrice' },
      { header: 'Storage', dataKey: 'storageRoom' }
    ],
    data: items
  })
}

export function exportLowStockPDF(items: any[]) {
  exportToPDF({
    title: 'Low Stock Report',
    subtitle: 'Products Requiring Immediate Attention',
    filename: 'low-stock-report',
    orientation: 'portrait',
    summary: [
      { label: 'Low Stock Items', value: items.length },
      { label: 'Total Value at Risk', value: `₱${items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0).toLocaleString()}` }
    ],
    columns: [
      { header: 'Product', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Current Stock', dataKey: 'quantity' },
      { header: 'Reorder Level', dataKey: 'reorderLevel' },
      { header: 'Storage', dataKey: 'storageRoom' }
    ],
    data: items
  })
}

export function exportCustomersPDF(customers: any[]) {
  exportToPDF({
    title: 'Customers Report',
    subtitle: 'Customer Database',
    filename: 'customers-report',
    orientation: 'landscape',
    summary: [
      { label: 'Total Customers', value: customers.length },
      { label: 'Total Purchases', value: customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0) },
      { label: 'Total Revenue', value: `₱${customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}` }
    ],
    columns: [
      { header: 'Name', dataKey: 'name' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Tier', dataKey: 'tier' },
      { header: 'Points', dataKey: 'points' },
      { header: 'Purchases', dataKey: 'totalPurchases' },
      { header: 'Total Spent', dataKey: 'totalSpent' }
    ],
    data: customers
  })
}

export function exportTransactionsPDF(transactions: any[]) {
  exportToPDF({
    title: 'Transactions Report',
    subtitle: 'Sales Transaction History',
    filename: 'transactions-report',
    orientation: 'landscape',
    summary: [
      { label: 'Total Transactions', value: transactions.length },
      { label: 'Total Revenue', value: `PHP ${transactions.reduce((sum, t) => sum + (t.totalRevenue || 0), 0).toLocaleString('en-US')}` },
      { label: 'Total Profit', value: `PHP ${transactions.reduce((sum, t) => sum + (t.profit || 0), 0).toLocaleString('en-US')}` }
    ],
    columns: [
      { header: 'Date', dataKey: 'timestamp' },
      { header: 'Item', dataKey: 'itemName' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Revenue', dataKey: 'totalRevenue' },
      { header: 'Cost', dataKey: 'totalCost' },
      { header: 'Profit', dataKey: 'profit' }
    ],
    data: transactions
  })
}

export function exportBusinessInsightsPDF(data: any[], type: string, title: string) {
  let columns: { header: string; dataKey: string }[] = []
  let summary: { label: string; value: string | number }[] = []
  
  switch (type) {
    case 'abc':
      columns = [
        { header: 'Product', dataKey: 'itemName' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Revenue %', dataKey: 'revenueContribution' },
        { header: 'Classification', dataKey: 'classification' },
        { header: 'Recommendation', dataKey: 'recommendation' }
      ]
      summary = [
        { label: 'Total Products Analyzed', value: data.length },
        { label: 'Class A Products', value: data.filter(d => d.classification === 'A').length },
        { label: 'Class B Products', value: data.filter(d => d.classification === 'B').length },
        { label: 'Class C Products', value: data.filter(d => d.classification === 'C').length }
      ]
      break
    case 'turnover':
      columns = [
        { header: 'Product', dataKey: 'itemName' },
        { header: 'Turnover Ratio', dataKey: 'turnoverRatio' },
        { header: 'Days to Sell', dataKey: 'daysToSell' },
        { header: 'Status', dataKey: 'status' }
      ]
      summary = [
        { label: 'Total Products', value: data.length },
        { label: 'Fast Moving', value: data.filter(d => d.status === 'Fast Moving').length },
        { label: 'Slow Moving', value: data.filter(d => d.status === 'Slow Moving').length }
      ]
      break
    case 'forecast':
      columns = [
        { header: 'Product', dataKey: 'itemName' },
        { header: 'Predicted Demand', dataKey: 'predictedDemand' },
        { header: 'Recommended Reorder', dataKey: 'recommendedReorderQty' },
        { header: 'Trend', dataKey: 'trend' },
        { header: 'Confidence %', dataKey: 'confidence' }
      ]
      summary = [
        { label: 'Total Products', value: data.length },
        { label: 'Total Predicted Demand', value: data.reduce((sum, d) => sum + (d.predictedDemand || 0), 0) }
      ]
      break
    case 'profit':
      columns = [
        { header: 'Category', dataKey: 'category' },
        { header: 'Revenue', dataKey: 'revenue' },
        { header: 'Profit', dataKey: 'profit' },
        { header: 'Margin %', dataKey: 'margin' }
      ]
      summary = [
        { label: 'Total Categories', value: data.length },
        { label: 'Total Revenue', value: `PHP ${data.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString('en-US')}` },
        { label: 'Total Profit', value: `PHP ${data.reduce((sum, d) => sum + (d.profit || 0), 0).toLocaleString('en-US')}` }
      ]
      break
    case 'deadstock':
      // Calculate value for each item before creating columns
      const deadstockWithValue = data.map(item => ({
        ...item,
        value: item.quantity * item.costPrice
      }))
      
      columns = [
        { header: 'Product', dataKey: 'name' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Days to Sell', dataKey: 'daysToSell' },
        { header: 'Value', dataKey: 'value' }
      ]
      summary = [
        { label: 'Total Dead Stock Items', value: data.length },
        { label: 'Total Value Locked', value: `PHP ${data.reduce((sum, d) => sum + ((d.quantity || 0) * (d.costPrice || 0)), 0).toLocaleString('en-US')}` }
      ]
      // Use the modified data with calculated value
      data = deadstockWithValue
      break
    case 'returns':
      columns = [
        { header: 'Product', dataKey: 'itemName' },
        { header: 'Quantity Returned', dataKey: 'quantity' },
        { header: 'Return Value', dataKey: 'value' },
        { header: 'Return Rate %', dataKey: 'returnRate' }
      ]
      summary = [
        { label: 'Total Products with Returns', value: data.length },
        { label: 'Total Returns', value: data.reduce((sum, d) => sum + (d.quantity || 0), 0) },
        { label: 'Total Return Value', value: `PHP ${data.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString('en-US')}` }
      ]
      break
  }

  exportToPDF({
    title: title,
    subtitle: 'Business Intelligence Analysis',
    filename: `business-insights-${type}`,
    orientation: 'landscape',
    summary,
    columns,
    data
  })
}
