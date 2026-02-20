/**
 * Professional Export Utilities for PDF and Excel
 * Provides complete, accurate, and well-formatted exports
 */

// Install required packages:
// npm install jspdf jspdf-autotable xlsx

interface ExportColumn {
  header: string
  key: string
  width?: number
  format?: (value: any, row?: any) => string
}

interface ExportOptions {
  filename: string
  title: string
  subtitle?: string
  columns: ExportColumn[]
  data: any[]
  summary?: { label: string; value: string | number }[]
  orientation?: 'portrait' | 'landscape'
  includeTimestamp?: boolean
  includeFilters?: { label: string; value: string }[]
}

/**
 * Export data to CSV with proper formatting
 */
export function exportToCSV(options: ExportOptions): void {
  const { filename, title, columns, data, summary, includeTimestamp = true, includeFilters } = options

  const lines: string[] = []

  // Add title
  lines.push(title)
  lines.push('') // Empty line

  // Add timestamp
  if (includeTimestamp) {
    lines.push(`Generated: ${new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })}`)
    lines.push('') // Empty line
  }

  // Add filters if provided
  if (includeFilters && includeFilters.length > 0) {
    lines.push('Applied Filters:')
    includeFilters.forEach(filter => {
      lines.push(`${filter.label}: ${filter.value}`)
    })
    lines.push('') // Empty line
  }

  // Add summary if provided
  if (summary && summary.length > 0) {
    lines.push('Summary:')
    summary.forEach(item => {
      lines.push(`${item.label},${item.value}`)
    })
    lines.push('') // Empty line
  }

  // Add headers
  const headers = columns.map(col => escapeCSV(col.header))
  lines.push(headers.join(','))

  // Add data rows
  data.forEach(row => {
    const values = columns.map(col => {
      const value = row[col.key]
      const formatted = col.format ? col.format(value) : value
      return escapeCSV(String(formatted ?? ''))
    })
    lines.push(values.join(','))
  })

  // Add footer
  lines.push('') // Empty line
  lines.push(`Total Records: ${data.length}`)

  // Create and download
  const csvContent = lines.join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }) // UTF-8 BOM for Excel
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${formatDateForFilename()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Export data to Excel with proper formatting
 * Requires: npm install xlsx
 */
export async function exportToExcel(options: ExportOptions): Promise<void> {
  try {
    // Dynamic import to avoid bundling if not used
    const XLSX = await import('xlsx')
    
    const { filename, title, columns, data, summary, includeTimestamp = true, includeFilters } = options

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Prepare data for Excel
    const excelData: any[][] = []

    // Add title (merged cell)
    excelData.push([title])
    excelData.push([]) // Empty row

    // Add timestamp
    if (includeTimestamp) {
      excelData.push(['Generated:', new Date().toLocaleString('en-US', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      })])
      excelData.push([]) // Empty row
    }

    // Add filters
    if (includeFilters && includeFilters.length > 0) {
      excelData.push(['Applied Filters:'])
      includeFilters.forEach(filter => {
        excelData.push([filter.label, filter.value])
      })
      excelData.push([]) // Empty row
    }

    // Add summary
    if (summary && summary.length > 0) {
      excelData.push(['Summary:'])
      summary.forEach(item => {
        excelData.push([item.label, item.value])
      })
      excelData.push([]) // Empty row
    }

    // Add headers
    const headers = columns.map(col => col.header)
    excelData.push(headers)

    // Add data rows
    data.forEach(row => {
      const values = columns.map(col => {
        const value = row[col.key]
        return col.format ? col.format(value, row) : value
      })
      excelData.push(values)
    })

    // Add footer
    excelData.push([]) // Empty row
    excelData.push(['Total Records:', data.length])

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData)

    // Set column widths
    const colWidths = columns.map(col => ({ wch: col.width || 15 }))
    ws['!cols'] = colWidths

    // Style header row (find the row with headers)
    const headerRowIndex = excelData.findIndex(row => 
      row.length > 0 && row[0] === headers[0]
    )

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data')

    // Write file
    XLSX.writeFile(wb, `${filename}-${formatDateForFilename()}.xlsx`)
  } catch (error) {
    console.error('Excel export failed:', error)
    // Fallback to CSV
    exportToCSV(options)
  }
}

/**
 * Export data to PDF with proper formatting
 * Requires: npm install jspdf jspdf-autotable
 */
export async function exportToPDF(options: ExportOptions): Promise<void> {
  try {
    // Dynamic import to avoid bundling if not used
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default

    const { 
      filename, 
      title, 
      subtitle,
      columns, 
      data, 
      summary, 
      orientation = 'portrait',
      includeTimestamp = true,
      includeFilters 
    } = options

    // Create PDF
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    }) as any

    let yPosition = 20

    // Add title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(title, 14, yPosition)
    yPosition += 10

    // Add subtitle
    if (subtitle) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(subtitle, 14, yPosition)
      yPosition += 8
    }

    // Add timestamp
    if (includeTimestamp) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated: ${new Date().toLocaleString('en-US', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      })}`, 14, yPosition)
      yPosition += 8
    }

    // Add filters
    if (includeFilters && includeFilters.length > 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Applied Filters:', 14, yPosition)
      yPosition += 5
      doc.setFont('helvetica', 'normal')
      includeFilters.forEach((filter: any) => {
        doc.text(`${filter.label}: ${filter.value}`, 14, yPosition)
        yPosition += 5
      })
      yPosition += 3
    }

    // Replace ₱ with empty string (remove currency) in summary values for PDF
    const pdfSummary = summary?.map(item => ({
      ...item,
      value: typeof item.value === 'string' ? item.value.replace(/₱/g, '') : item.value
    }))

    // Add summary
    if (pdfSummary && pdfSummary.length > 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary:', 14, yPosition)
      yPosition += 5
      doc.setFont('helvetica', 'normal')
      pdfSummary.forEach((item: any) => {
        doc.text(`${item.label}: ${item.value}`, 14, yPosition)
        yPosition += 5
      })
      yPosition += 3
    }

    // Prepare table data - Remove ₱ symbol for PDF
    const tableHeaders = columns.map(col => col.header)
    const tableData = data.map(row => 
      columns.map(col => {
        const value = row[col.key]
        const formatted = col.format ? col.format(value, row) : String(value ?? '')
        // Remove ₱ symbol for PDF
        return typeof formatted === 'string' ? formatted.replace(/₱/g, '') : formatted
      })
    )

    // Add table using autoTable
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray
      },
      didDrawPage: (data: any) => {
        // Footer
        const pageCount = doc.internal.getNumberOfPages()
        const pageSize = doc.internal.pageSize
        const pageHeight = pageSize.height || pageSize.getHeight()
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          14,
          pageHeight - 10
        )
        doc.text(
          `Total Records: ${tableData.length}`,
          pageSize.width - 50,
          pageHeight - 10
        )
      }
    })

    // Save PDF
    doc.save(`${filename}-${formatDateForFilename()}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    throw error
  }
}

/**
 * Helper: Escape CSV values
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Helper: Format date for filename
 */
function formatDateForFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}-${hours}${minutes}`
}

/**
 * Format currency for export
 * Uses ₱ symbol for display
 */
export function formatCurrencyForExport(value: number): string {
  return `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format currency for PDF export
 * Uses "P" prefix since jsPDF's default font doesn't support ₱ symbol well
 */
export function formatCurrencyForPDF(value: number): string {
  return `P ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format number for export
 */
export function formatNumberForExport(value: number): string {
  return value.toLocaleString('en-US')
}

/**
 * Format date for export
 */
export function formatDateForExport(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format percentage for export
 */
export function formatPercentageForExport(value: number): string {
  return `${value.toFixed(2)}%`
}
