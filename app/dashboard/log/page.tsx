"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Database, 
  Download, 
  Search, 
  Filter, 
  X, 
  Activity,
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Package,
  ShoppingCart,
  RefreshCw,
  Trash2,
  Plus,
  Edit
} from "lucide-react"
import type { Log } from "@/lib/types"
import { toast } from "sonner"
import { apiGet } from "@/lib/api-client"

const ITEMS_PER_PAGE = 50

// Operation type configuration
const OPERATION_CONFIG = {
  create: { label: "Create", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800", icon: Plus },
  update: { label: "Update", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800", icon: Edit },
  delete: { label: "Delete", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800", icon: Trash2 },
  restock: { label: "Restock", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800", icon: RefreshCw },
  sale: { label: "Sale", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800", icon: ShoppingCart },
  'transaction-cancelled': { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800", icon: X },
  'internal-usage': { label: "Internal Usage", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800", icon: Package },
  'demo-display': { label: "Demo/Display", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800", icon: Activity },
  warehouse: { label: "Warehouse", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800", icon: Database },
  other: { label: "Sale", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800", icon: ShoppingCart }
}

export default function LogPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [operationFilter, setOperationFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        const data = await apiGet<Log[]>('/api/logs')
        setLogs(data)
      } catch (error) {
        console.error('Error fetching logs:', error)
        toast.error('Failed to load logs')
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs)) return []
    
    let filtered = [...logs]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log => 
        log.itemName?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query) ||
        log.operation?.toLowerCase().includes(query)
      )
    }

    // Operation filter
    if (operationFilter !== "all") {
      filtered = filtered.filter(log => {
        const logOp = log.operation?.toLowerCase().replace(/\s+/g, '-')
        // Handle both 'transaction-cancelled' and 'transaction_cancelled' formats
        if (operationFilter === 'transaction-cancelled') {
          return logOp === 'transaction-cancelled' || logOp === 'transaction_cancelled' || log.operation?.toLowerCase().includes('cancelled')
        }
        return logOp === operationFilter
      })
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortBy === "newest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [logs, searchQuery, operationFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, operationFilter, sortBy])

  // Statistics
  const stats = useMemo(() => {
    if (!Array.isArray(logs)) return { total: 0, today: 0, creates: 0, updates: 0, deletes: 0, cancelled: 0 }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return {
      total: logs.length,
      today: logs.filter(log => new Date(log.timestamp) >= today).length,
      creates: logs.filter(log => log.operation?.toLowerCase() === 'create').length,
      updates: logs.filter(log => log.operation?.toLowerCase() === 'update').length,
      deletes: logs.filter(log => log.operation?.toLowerCase() === 'delete').length,
      cancelled: logs.filter(log => log.operation?.toLowerCase().includes('cancelled')).length
    }
  }, [logs])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setOperationFilter("all")
    setSortBy("newest")
    setCurrentPage(1)
  }

  // Get operation badge
  const getOperationBadge = (operation: string, details: string) => {
    // Normalize operation: convert to lowercase, replace spaces and underscores with dashes
    let actualOperation = operation?.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-') || 'other'
    
    // Check if it's a cancellation operation
    if (actualOperation.includes('cancelled') || details?.toLowerCase().includes('transaction') && details?.toLowerCase().includes('cancelled')) {
      actualOperation = 'transaction-cancelled'
    }
    
    // Only override based on details if operation is still unclear
    const explicitOperations = ['create', 'update', 'delete', 'restock', 'transaction-cancelled']
    const isExplicitOperation = explicitOperations.includes(actualOperation)
    
    if (!isExplicitOperation) {
      // Override based on details content for backward compatibility
      const detailsLower = details?.toLowerCase() || ''
      if (detailsLower.includes('demo/display') || detailsLower.includes('demo / display')) {
        actualOperation = 'demo-display'
      } else if (detailsLower.includes('internal use') || detailsLower.includes('internal-use')) {
        actualOperation = 'internal-usage'
      } else if (detailsLower.includes('warehouse') || detailsLower.includes('transferred')) {
        actualOperation = 'warehouse'
      } else if (detailsLower.includes('dispatched') && !detailsLower.includes('demo') && !detailsLower.includes('internal')) {
        actualOperation = 'sale'
      }
    }
    
    const config = OPERATION_CONFIG[actualOperation as keyof typeof OPERATION_CONFIG] || OPERATION_CONFIG.other
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} font-medium px-2.5 py-0.5 flex items-center gap-1.5 w-fit`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const hasActiveFilters = searchQuery || operationFilter !== "all" || sortBy !== "newest"

  if (loading) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-4xl font-bold gradient-text mb-2">Operation History</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base">View all system operations and changes</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading logs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-2">
      {/* Page Header */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Operation History
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          View all system operations and changes
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Logs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[5px] bg-green-100 dark:bg-green-900/30">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.today}</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[5px] bg-purple-100 dark:bg-purple-900/30">
              <Plus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Creates</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.creates}</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[5px] bg-orange-100 dark:bg-orange-900/30">
              <Edit className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Updates</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.updates}</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[5px] bg-red-100 dark:bg-red-900/30">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Deletes</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.deletes}</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[5px] bg-amber-100 dark:bg-amber-900/30">
              <X className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Cancelled</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.cancelled}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 mb-4 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Operation Filter */}
          <Select value={operationFilter} onValueChange={setOperationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Operations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operations</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="restock">Restock</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="transaction-cancelled">Cancelled Transactions</SelectItem>
              <SelectItem value="internal-usage">Internal Usage</SelectItem>
              <SelectItem value="demo-display">Demo/Display</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Showing {paginatedLogs.length} of {filteredLogs.length} logs
          {hasActiveFilters && ` (filtered from ${logs.length} total)`}
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
            <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">
                {logs.length === 0 ? 'No operations logged yet' : 'No logs match your filters'}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Clear filters to see all logs
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[180px]">Date & Time</th>
                      <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[140px]">Operation</th>
                      <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[220px]">Item</th>
                      <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(log.timestamp).toLocaleString('en-US', { 
                              month: 'short', 
                              day: '2-digit', 
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit',
                              hour12: false,
                              timeZone: 'Asia/Manila'
                            })}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {getOperationBadge(log.operation, log.details)}
                        </td>
                        <td className="py-2.5 px-3 text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          <div className="max-w-[220px] truncate" title={log.itemName || '-'}>
                            {log.itemName || '-'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400">
                          <div className="max-w-[600px] leading-relaxed">
                            {log.details}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
