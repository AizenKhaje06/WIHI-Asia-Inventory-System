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

export function exportSalesReportPDF(reportData: {
  transactions: any[]
  startDate?: string
  endDate?: string
  totalRevenue: number
  totalCost: number
  totalProfit: number
  totalOrders: number
}) {
  const { transactions, startDate, endDate, totalRevenue, totalCost, totalProfit, totalOrders } = reportData
  
  // Format date range for subtitle
  let dateRange = 'All Time'
  if (startDate && endDate) {
    dateRange = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
  } else if (startDate) {
    dateRange = `From ${new Date(startDate).toLocaleDateString()}`
  } else if (endDate) {
    dateRange = `Until ${new Date(endDate).toLocaleDateString()}`
  }
  
  exportToPDF({
    title: 'Comprehensive Sales Report',
    subtitle: `Period: ${dateRange}`,
    filename: 'comprehensive-sales-report',
    orientation: 'landscape',
    summary: [
      { label: 'Total Orders', value: totalOrders },
      { label: 'Total Transactions', value: transactions.length },
      { label: 'Total Revenue', value: `PHP ${totalRevenue.toLocaleString('en-US')}` },
      { label: 'Total Cost', value: `PHP ${totalCost.toLocaleString('en-US')}` },
      { label: 'Total Profit', value: `PHP ${totalProfit.toLocaleString('en-US')}` },
      { label: 'Profit Margin', value: `${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0}%` },
      { label: 'Average Order Value', value: `PHP ${totalOrders > 0 ? (totalRevenue / totalOrders).toLocaleString('en-US') : 0}` },
      { label: 'Items Sold', value: transactions.reduce((sum, t) => sum + (t.quantity || 0), 0) }
    ],
    columns: [
      { header: 'Date', dataKey: 'timestamp' },
      { header: 'Item', dataKey: 'itemName' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Revenue', dataKey: 'totalRevenue' },
      { header: 'Cost', dataKey: 'totalCost' },
      { header: 'Profit', dataKey: 'profit' }
    ],
    data: transactions.map(t => ({
      ...t,
      timestamp: new Date(t.timestamp).toLocaleString()
    }))
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

// Comprehensive Business Insights PDF - ALL TABS IN ONE
export function exportComprehensiveBusinessInsightsPDF(allData: {
  abcAnalysis: any[]
  turnover: any[]
  forecasts: any[]
  profitMargin: any[]
  deadStock: any[]
  returnAnalytics: any[]
}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Helper function to add section header
  const addSectionHeader = (title: string, subtitle: string, yPos: number) => {
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'bold')
    doc.text(title, pageWidth / 2, yPos, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitle, pageWidth / 2, yPos + 7, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos + 13, { align: 'center' })
    
    return yPos + 20
  }

  // Filter data by status
  const fastMovingItems = allData.turnover.filter(t => t.status === 'fast-moving')
  const slowMovingItems = allData.turnover.filter(t => t.status === 'slow-moving')

  // 1. ABC ANALYSIS
  let yPosition = addSectionHeader('ABC Analysis Report', 'Business Intelligence Analysis', 20)

  // Summary
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, yPosition)
  yPosition += 8

  const abcSummary = [
    ['Total Products Analyzed', allData.abcAnalysis.length.toString()],
    ['Class A Products', allData.abcAnalysis.filter(d => d.classification === 'A').length.toString()],
    ['Class B Products', allData.abcAnalysis.filter(d => d.classification === 'B').length.toString()],
    ['Class C Products', allData.abcAnalysis.filter(d => d.classification === 'C').length.toString()]
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: abcSummary,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', fontSize: 11 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // Detailed Report
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Report', 14, yPosition)
  yPosition += 8

  autoTable(doc, {
    startY: yPosition,
    head: [['Product', 'Category', 'Revenue %', 'Classification', 'Recommendation']],
    body: allData.abcAnalysis.map(item => [
      item.itemName || 'N/A',
      item.category || 'N/A',
      `${(item.revenueContribution || 0).toFixed(2)}%`,
      item.classification || 'N/A',
      item.recommendation || 'N/A'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: 14, right: 14 }
  })

  // 2. INVENTORY TURNOVER
  doc.addPage()
  yPosition = addSectionHeader('Inventory Turnover Report', 'Business Intelligence Analysis', 20)

  // Summary
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, yPosition)
  yPosition += 8

  const turnoverSummary = [
    ['Total Products', allData.turnover.length.toString()],
    ['Fast Moving', allData.turnover.filter(d => d.status === 'fast-moving').length.toString()],
    ['Slow Moving', allData.turnover.filter(d => d.status === 'slow-moving').length.toString()],
    ['Average Turnover Ratio', (allData.turnover.reduce((sum, d) => sum + d.turnoverRatio, 0) / allData.turnover.length).toFixed(2)]
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: turnoverSummary,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', fontSize: 11 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // Detailed Report
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Report', 14, yPosition)
  yPosition += 8

  autoTable(doc, {
    startY: yPosition,
    head: [['Product', 'Turnover Ratio', 'Days to Sell', 'Status']],
    body: allData.turnover.map(item => [
      item.itemName || 'N/A',
      (item.turnoverRatio || 0).toFixed(2),
      (item.daysToSell || 0).toString(),
      item.status || 'N/A'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: 14, right: 14 }
  })

  // 3. SALES FORECAST
  doc.addPage()
  yPosition = addSectionHeader('Sales Forecast Report', 'Business Intelligence Analysis', 20)

  // Summary
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, yPosition)
  yPosition += 8

  const forecastSummary = [
    ['Total Products', allData.forecasts.length.toString()],
    ['Total Predicted Demand', allData.forecasts.reduce((sum, d) => sum + (d.predictedDemand || 0), 0).toString()],
    ['Total Recommended Reorder', allData.forecasts.reduce((sum, d) => sum + (d.recommendedReorderQty || 0), 0).toString()],
    ['Average Confidence', `${(allData.forecasts.reduce((sum, d) => sum + d.confidence, 0) / allData.forecasts.length).toFixed(2)}%`]
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: forecastSummary,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', fontSize: 11 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // Detailed Report
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Report', 14, yPosition)
  yPosition += 8

  autoTable(doc, {
    startY: yPosition,
    head: [['Product', 'Predicted Demand', 'Recommended Reorder', 'Trend', 'Confidence %']],
    body: allData.forecasts.map(item => [
      item.itemName || 'N/A',
      (item.predictedDemand || 0).toString(),
      (item.recommendedReorderQty || 0).toString(),
      item.trend || 'N/A',
      `${(item.confidence || 0).toFixed(2)}%`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: 14, right: 14 }
  })

  // 4. FAST MOVING ITEMS
  doc.addPage()
  yPosition = addSectionHeader('Fast Moving Items Report', 'Business Intelligence Analysis', 20)

  // Summary
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, yPosition)
  yPosition += 8

  const fastMovingSummary = [
    ['Total Fast Moving Items', fastMovingItems.length.toString()],
    ['Average Turnover Ratio', fastMovingItems.length > 0 ? (fastMovingItems.reduce((sum, d) => sum + (d.turnoverRatio || 0), 0) / fastMovingItems.length).toFixed(2) : '0'],
    ['Average Days to Sell', fastMovingItems.length > 0 ? (fastMovingItems.reduce((sum, d) => sum + (d.daysToSell || 0), 0) / fastMovingItems.length).toFixed(0) : '0'],
    ['Status', 'High Demand - Quick Turnover']
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: fastMovingSummary,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', fontSize: 11 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // Detailed Report
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Report', 14, yPosition)
  yPosition += 8

  if (fastMovingItems.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Product', 'Turnover Ratio', 'Days to Sell', 'Status']],
      body: fastMovingItems.map(item => [
        item.itemName || 'N/A',
        (item.turnoverRatio || 0).toFixed(2),
        (item.daysToSell || 0).toString(),
        'Fast Moving'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      margin: { left: 14, right: 14 }
    })
  } else {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('No fast moving items found', 14, yPosition)
  }

  // 5. SLOW MOVING ITEMS
  doc.addPage()
  yPosition = addSectionHeader('Slow Moving Items Report', 'Business Intelligence Analysis', 20)

  // Summary
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, yPosition)
  yPosition += 8

  const slowMovingSummary = [
    ['Total Slow Moving Items', slowMovingItems.length.toString()],
    ['Average Turnover Ratio', slowMovingItems.length > 0 ? (slowMovingItems.reduce((sum, d) => sum + (d.turnoverRatio || 0), 0) / slowMovingItems.length).toFixed(2) : '0'],
    ['Average Days to Sell', slowMovingItems.length > 0 ? (slowMovingItems.reduce((sum, d) => sum + (d.daysToSell || 0), 0) / slowMovingItems.length).toFixed(0) : '0'],
    ['Status', 'Low Demand - Needs Promotion']
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: slowMovingSummary,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', fontSize: 11 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // Detailed Report
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Report', 14, yPosition)
  yPosition += 8

  if (slowMovingItems.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Product', 'Turnover Ratio', 'Days to Sell', 'Status']],
      body: slowMovingItems.map(item => [
        item.itemName || 'N/A',
        (item.turnoverRatio || 0).toFixed(2),
        (item.daysToSell || 0).toString(),
        'Slow Moving'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      margin: { left: 14, right: 14 }
    })
  } else {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('No slow moving items found', 14, yPosition)
  }

  // 6. PROFIT MARGIN
  doc.addPage()
  yPosition = addSectionHeader('Profit Margin Report', 'Business Intelligence Analysis', 20)

  // Summary
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, yPosition)
  yPosition += 8

  const profitSummary = [
    ['Total Categories', allData.profitMargin.length.toString()],
    ['Total Revenue', `PHP ${allData.profitMargin.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString('en-US')}`],
    ['Total Profit', `PHP ${allData.profitMargin.reduce((sum, d) => sum + (d.profit || 0), 0).toLocaleString('en-US')}`],
    ['Average Margin', `${(allData.profitMargin.reduce((sum, d) => sum + d.margin, 0) / allData.profitMargin.length).toFixed(2)}%`]
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: profitSummary,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', fontSize: 11 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // Detailed Report
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Report', 14, yPosition)
  yPosition += 8

  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Revenue', 'Profit', 'Margin %']],
    body: allData.profitMargin.map(item => [
      item.category || 'N/A',
      `PHP ${(item.revenue || 0).toLocaleString('en-US')}`,
      `PHP ${(item.profit || 0).toLocaleString('en-US')}`,
      `${(item.margin || 0).toFixed(2)}%`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: 14, right: 14 }
  })

  // 7. DEAD STOCK
  doc.addPage()
  yPosition = addSectionHeader('Dead Stock Report', 'Business Intelligence Analysis', 20)

  // Summary
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, yPosition)
  yPosition += 8

  const deadStockSummary = [
    ['Total Dead Stock Items', allData.deadStock.length.toString()],
    ['Total Quantity', allData.deadStock.reduce((sum, d) => sum + (d.quantity || 0), 0).toString()],
    ['Total Value Locked', `PHP ${allData.deadStock.reduce((sum, d) => sum + ((d.quantity || 0) * (d.costPrice || 0)), 0).toLocaleString('en-US')}`],
    ['Average Days to Sell', (allData.deadStock.reduce((sum, d) => sum + (d.daysToSell || 0), 0) / allData.deadStock.length).toFixed(0)]
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: deadStockSummary,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', fontSize: 11 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // Detailed Report
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Report', 14, yPosition)
  yPosition += 8

  autoTable(doc, {
    startY: yPosition,
    head: [['Product', 'Category', 'Quantity', 'Days to Sell', 'Value']],
    body: allData.deadStock.map(item => [
      item.name || 'N/A',
      item.category || 'N/A',
      (item.quantity || 0).toString(),
      (item.daysToSell || 0).toString(),
      `PHP ${((item.quantity || 0) * (item.costPrice || 0)).toLocaleString('en-US')}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: 14, right: 14 }
  })

  // 8. RETURNS ANALYSIS
  if (allData.returnAnalytics && allData.returnAnalytics.length > 0) {
    doc.addPage()
    yPosition = addSectionHeader('Returns Analysis Report', 'Business Intelligence Analysis', 20)

    // Summary
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 14, yPosition)
    yPosition += 8

    const returnsSummary = [
      ['Total Products with Returns', allData.returnAnalytics.length.toString()],
      ['Total Returns', allData.returnAnalytics.reduce((sum: number, d: any) => sum + (d.quantity || 0), 0).toString()],
      ['Total Return Value', `PHP ${allData.returnAnalytics.reduce((sum: number, d: any) => sum + (d.value || 0), 0).toLocaleString('en-US')}`],
      ['Average Return Rate', `${(allData.returnAnalytics.reduce((sum: number, d: any) => sum + (d.returnRate || 0), 0) / allData.returnAnalytics.length).toFixed(2)}%`]
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: returnsSummary,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', fontSize: 11 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 14, right: 14 }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

    // Detailed Report
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'bold')
    doc.text('Detailed Report', 14, yPosition)
    yPosition += 8

    autoTable(doc, {
      startY: yPosition,
      head: [['Product', 'Quantity Returned', 'Return Value', 'Return Rate %']],
      body: allData.returnAnalytics.map((item: any) => [
        item.itemName || 'N/A',
        (item.quantity || 0).toString(),
        `PHP ${(item.value || 0).toLocaleString('en-US')}`,
        `${(item.returnRate || 0).toFixed(2)}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      margin: { left: 14, right: 14 }
    })
  }

  // Save
  doc.save(`comprehensive-business-insights-${new Date().toISOString().split('T')[0]}.pdf`)
}
