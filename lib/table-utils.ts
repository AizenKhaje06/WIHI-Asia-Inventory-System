/**
 * Enterprise Data Table Utilities
 * Export, formatting, and helper functions
 */

import * as XLSX from 'xlsx'

/**
 * Export table data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  const headers = columns
    ? columns.map((col) => col.label)
    : Object.keys(data[0])

  const rows = data.map((row) => {
    if (columns) {
      return columns.map((col) => {
        const value = row[col.key]
        return formatCellValue(value)
      })
    }
    return Object.values(row).map(formatCellValue)
  })

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')

  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

/**
 * Export table data to Excel
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Prepare data
  const exportData = data.map((row) => {
    if (columns) {
      const formatted: Record<string, any> = {}
      columns.forEach((col) => {
        formatted[col.label] = row[col.key]
      })
      return formatted
    }
    return row
  })

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

  // Auto-size columns
  const maxWidth = 50
  const colWidths = Object.keys(exportData[0] || {}).map((key) => {
    const lengths = exportData.map((row) => {
      const value = row[key]
      return value ? String(value).length : 0
    })
    lengths.push(key.length)
    return { wch: Math.min(Math.max(...lengths) + 2, maxWidth) }
  })
  worksheet['!cols'] = colWidths

  // Export
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * Format cell value for export
 */
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value.toISOString()
    }
    return JSON.stringify(value)
  }
  return String(value).replace(/"/g, '""')
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Filter data by search term
 */
export function filterData<T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
): T[] {
  if (!searchTerm) return data

  const lowerSearch = searchTerm.toLowerCase()

  return data.filter((item) => {
    return searchKeys.some((key) => {
      const value = item[key]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(lowerSearch)
    })
  })
}

/**
 * Sort data by column
 */
export function sortData<T extends Record<string, any>>(
  data: T[],
  key: keyof T,
  direction: 'asc' | 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    // Handle null/undefined
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    // Compare
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }

    // Fallback
    return direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })
}

/**
 * Paginate data
 */
export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): {
  data: T[]
  totalPages: number
  totalItems: number
  currentPage: number
} {
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    data: data.slice(startIndex, endIndex),
    totalPages,
    totalItems,
    currentPage: page,
  }
}

/**
 * Format number with locale
 */
export function formatTableNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format currency for table
 */
export function formatTableCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Format currency value with peso sign (for logs and text)
 */
export function formatPeso(value: number): string {
  return `₱${value.toFixed(2)}`
}

/**
 * Format date for table
 */
export function formatTableDate(
  date: string | Date,
  format: 'short' | 'long' | 'datetime' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (format === 'short') {
    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj)
  }

  if (format === 'long') {
    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj)
  }

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Generate table row key
 */
export function generateRowKey(row: any, index: number): string {
  if (row.id) return String(row.id)
  if (row._id) return String(row._id)
  return `row-${index}`
}

/**
 * Calculate column statistics
 */
export function calculateColumnStats<T extends Record<string, any>>(
  data: T[],
  key: keyof T
): {
  sum: number
  avg: number
  min: number
  max: number
  count: number
} {
  const values = data
    .map((row) => row[key])
    .filter((val) => typeof val === 'number' && !isNaN(val))

  if (values.length === 0) {
    return { sum: 0, avg: 0, min: 0, max: 0, count: 0 }
  }

  const sum = values.reduce((acc, val) => acc + val, 0)
  const avg = sum / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)

  return { sum, avg, min, max, count: values.length }
}
