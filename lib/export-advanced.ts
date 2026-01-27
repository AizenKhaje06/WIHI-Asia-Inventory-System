/**
 * Advanced export utilities for CSV, Excel, and PDF
 */

export interface ExportColumn {
  key: string
  label: string
  format?: (value: any) => string
}

export interface ExportOptions {
  filename: string
  columns: ExportColumn[]
  data: any[]
  title?: string
  subtitle?: string
}

/**
 * Export data to CSV with custom formatting
 */
export function exportToCSV({ filename, columns, data }: ExportOptions) {
  const headers = columns.map(col => col.label)
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key]
      return col.format ? col.format(value) : value
    })
  )

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

/**
 * Export data to Excel (XLSX) format
 * Note: Requires xlsx library to be installed
 */
export async function exportToExcel({ filename, columns, data, title }: ExportOptions) {
  try {
    const XLSX = await import('xlsx')
    
    // Prepare data
    const headers = columns.map(col => col.label)
    const rows = data.map(item =>
      columns.map(col => {
        const value = item[col.key]
        return col.format ? col.format(value) : value
      })
    )

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      title ? [title] : [],
      [],
      headers,
      ...rows
    ])

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')

    // Generate file
    XLSX.writeFile(wb, `${filename}.xlsx`)
  } catch (error) {
    console.error('Excel export failed:', error)
    // Fallback to CSV
    exportToCSV({ filename, columns, data })
  }
}

/**
 * Export data to PDF format
 * Note: Requires jspdf and jspdf-autotable libraries
 */
export async function exportToPDF({ filename, columns, data, title, subtitle }: ExportOptions) {
  try {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()

    // Add title
    if (title) {
      doc.setFontSize(18)
      doc.text(title, 14, 20)
    }

    // Add subtitle
    if (subtitle) {
      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text(subtitle, 14, title ? 28 : 20)
    }

    // Prepare table data
    const headers = columns.map(col => col.label)
    const rows = data.map(item =>
      columns.map(col => {
        const value = item[col.key]
        return col.format ? col.format(value) : String(value)
      })
    )

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: title && subtitle ? 35 : title ? 28 : 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    // Save PDF
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    // Fallback to CSV
    exportToCSV({ filename, columns, data })
  }
}

/**
 * Helper function to download file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * Export chart as PNG image
 */
export function exportChartAsPNG(chartElement: HTMLElement, filename: string) {
  // This would require html2canvas or similar library
  // For now, we'll use a simple approach
  console.log('Chart export feature - requires html2canvas library')
}
