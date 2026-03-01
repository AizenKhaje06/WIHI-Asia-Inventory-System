'use client'

import { useState, useEffect } from 'react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { 
  Search, Download, AlertCircle, User, Phone, MapPin, TrendingUp, XCircle, Mail, ChevronRight, RefreshCw, BarChart3
} from 'lucide-react'
import { Transaction } from '@/lib/types'
import { toast } from 'sonner'

export default function CancelledOrdersPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReason, setSelectedReason] = useState<string>('all')
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    fetchCancelledOrders()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [searchTerm, selectedReason, selectedStaff, transactions])

  const fetchCancelledOrders = async () => {
    try {
      const response = await fetch('/api/reports')
      const data = await response.json()
      const allTransactions = Array.isArray(data) ? data : (data.transactions || [])
      const cancelled = allTransactions.filter((t: Transaction) => t.status === 'cancelled')
      setTransactions(cancelled)
      setFilteredTransactions(cancelled)
    } catch (error) {
      console.error('Error fetching cancelled orders:', error)
      toast.error('Failed to load cancelled orders')
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedReason !== 'all') {
      filtered = filtered.filter(t => t.cancellationReason === selectedReason)
    }
    if (selectedStaff !== 'all') {
      filtered = filtered.filter(t => t.cancelledBy === selectedStaff)
    }
    setFilteredTransactions(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Item', 'Customer', 'Phone', 'Email', 'Amount', 'Reason', 'Cancelled By']
    const rows = filteredTransactions.map(t => [
      t.id, format(new Date(t.cancelledAt || t.timestamp), 'yyyy-MM-dd HH:mm'), t.itemName,
      t.customerName || 'N/A', t.customerPhone || 'N/A', t.customerEmail || 'N/A',
      `₱${t.totalRevenue?.toFixed(2)}`, t.cancellationReason || 'N/A', t.cancelledBy || 'N/A'
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cancelled-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    toast.success('Exported successfully')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedReason('all')
    setSelectedStaff('all')
    toast.success('Filters cleared')
  }

  const totalCancelled = filteredTransactions.length
  const totalValue = filteredTransactions.reduce((sum, t) => sum + (t.totalRevenue || 0), 0)
  const uniqueReasons = Array.from(new Set(transactions.map(t => t.cancellationReason).filter(Boolean)))
  const uniqueStaff = Array.from(new Set(transactions.map(t => t.cancelledBy).filter(Boolean)))
  const reasonStats = uniqueReasons.map(reason => ({
    reason, count: transactions.filter(t => t.cancellationReason === reason).length
  })).sort((a, b) => b.count - a.count)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
            Loading cancelled orders...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Cancelled Orders</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Track and analyze cancelled transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCancelledOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                Total
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {totalCancelled}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {((totalCancelled / (transactions.length || 1)) * 100).toFixed(1)}% cancellation rate
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                Lost Revenue
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱{(totalValue/1000).toFixed(1)}k
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Revenue impact</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                Top Reason
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {reasonStats[0]?.count || 0}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{reasonStats[0]?.reason || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-green-100 dark:bg-green-900/30">
                <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                Average
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱{(totalValue / (totalCancelled || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Per order</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Filters</CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">Refine your search</CardDescription>
            </div>
            <Button onClick={clearFilters} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10" />
            </div>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="h-10"><SelectValue placeholder="All Reasons" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                {uniqueReasons.map(reason => <SelectItem key={reason} value={reason!}>{reason}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="h-10"><SelectValue placeholder="All Staff" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {uniqueStaff.map(staff => <SelectItem key={staff} value={staff!}>{staff}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="default" className="h-10">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Transactions ({filteredTransactions.length})</CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400">All cancelled orders</CardDescription>
          </CardHeader>
          <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <XCircle className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">No cancelled orders found</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                          <TableRow>
                            <TableHead className="font-semibold">Transaction</TableHead>
                            <TableHead className="font-semibold">Customer</TableHead>
                            <TableHead className="font-semibold">Amount</TableHead>
                            <TableHead className="font-semibold">Reason</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.map((transaction) => (
                            <TableRow key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{transaction.itemName}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{transaction.id}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {format(new Date(transaction.cancelledAt || transaction.timestamp), 'MMM dd, yyyy HH:mm')}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{transaction.customerName || 'Walk-in'}</p>
                                  {transaction.customerPhone && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{transaction.customerPhone}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  ₱{transaction.totalRevenue?.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.cancellationReason || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                                      View Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader className="border-b pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 -m-6 mb-0 p-4">
                                      <div className="flex items-start gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                          <DialogTitle className="text-xl font-bold">Cancelled Order Details</DialogTitle>
                                          <DialogDescription className="mt-0.5 text-xs">
                                            Complete transaction and customer information
                                          </DialogDescription>
                                        </div>
                                      </div>
                                    </DialogHeader>
                                    {selectedTransaction && (
                                      <div className="space-y-4 py-4">
                                        {/* Transaction Summary Card */}
                                        <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                          <div className="flex items-start justify-between mb-3">
                                            <div>
                                              <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedTransaction.itemName}</h3>
                                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{selectedTransaction.id}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                                Cancelled
                                              </Badge>
                                              {selectedTransaction.department && (
                                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                                                  {selectedTransaction.department}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                            <div>
                                              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quantity</p>
                                              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedTransaction.quantity}</p>
                                            </div>
                                            <div>
                                              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount</p>
                                              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">₱{selectedTransaction.totalRevenue?.toFixed(2)}</p>
                                            </div>
                                            <div>
                                              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</p>
                                              <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                                                {format(new Date(selectedTransaction.cancelledAt || selectedTransaction.timestamp), 'MMM dd, yyyy')}
                                              </p>
                                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                {format(new Date(selectedTransaction.cancelledAt || selectedTransaction.timestamp), 'HH:mm')}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Customer Information Section */}
                                        <div className="space-y-2.5">
                                          <div className="flex items-center gap-2 pb-2 border-b">
                                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                                              <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Customer Information</h4>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2.5">
                                            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Full Name</p>
                                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{selectedTransaction.customerName || 'Walk-in Customer'}</p>
                                            </div>
                                            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Contact Number</p>
                                              <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center">
                                                <Phone className="mr-1.5 h-3 w-3 text-slate-400" />
                                                {selectedTransaction.customerPhone || 'N/A'}
                                              </p>
                                            </div>
                                            {selectedTransaction.customerEmail && (
                                              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Email Address</p>
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center">
                                                  <Mail className="mr-1.5 h-3 w-3 text-slate-400" />
                                                  {selectedTransaction.customerEmail}
                                                </p>
                                              </div>
                                            )}
                                            {selectedTransaction.customerAddress && (
                                              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 col-span-2">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Address</p>
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-start">
                                                  <MapPin className="mr-1.5 h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                                                  {selectedTransaction.customerAddress}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Cancellation Information Section */}
                                        <div className="space-y-2.5">
                                          <div className="flex items-center gap-2 pb-2 border-b">
                                            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-md">
                                              <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cancellation Information</h4>
                                          </div>
                                          <div className="space-y-2.5">
                                            <div className="p-2.5 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-200 dark:border-red-800">
                                              <p className="text-[10px] text-red-700 dark:text-red-400 uppercase tracking-wide mb-1.5 font-semibold">Reason</p>
                                              <Badge variant="destructive" className="text-xs px-2.5 py-1">
                                                {selectedTransaction.cancellationReason || 'N/A'}
                                              </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2.5">
                                              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Cancelled By</p>
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white">{selectedTransaction.cancelledBy || 'N/A'}</p>
                                              </div>
                                              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Cancelled At</p>
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                                  {format(new Date(selectedTransaction.cancelledAt || selectedTransaction.timestamp), 'PPpp')}
                                                </p>
                                              </div>
                                            </div>
                                            {selectedTransaction.cancellation_notes && (
                                              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Additional Notes</p>
                                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{selectedTransaction.cancellation_notes}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {filteredTransactions.map((transaction) => (
                      <div key={transaction.id} className="border-b last:border-0 pb-3 last:pb-0">
                        <Dialog>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-white truncate">{transaction.itemName}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{transaction.id}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-sm font-medium">{transaction.customerName || 'Walk-in'}</span>
                                <span className="text-sm font-bold">₱{transaction.totalRevenue?.toFixed(2)}</span>
                              </div>
                              <Badge variant="outline" className="text-xs mt-2">{transaction.cancellationReason || 'N/A'}</Badge>
                            </div>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(transaction)}>View</Button>
                            </DialogTrigger>
                          </div>
                        <DialogContent className="max-w-[92vw] md:max-w-3xl max-h-[85vh] overflow-y-auto mx-4">
                          <DialogHeader className="border-b pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 -m-6 mb-0 p-4">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="flex-1">
                                <DialogTitle className="text-base font-bold">Cancelled Order Details</DialogTitle>
                                <DialogDescription className="mt-0.5 text-xs">
                                  Complete transaction and customer information
                                </DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>
                          {selectedTransaction && (
                            <div className="space-y-3 py-3">
                              {/* Transaction Summary Card */}
                              <div className="p-2.5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start justify-between mb-2.5">
                                  <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedTransaction.itemName}</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{selectedTransaction.id}</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                                      Cancelled
                                    </Badge>
                                    {selectedTransaction.department && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                                        {selectedTransaction.department}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                                  <div>
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qty</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedTransaction.quantity}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₱{selectedTransaction.totalRevenue?.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</p>
                                    <p className="text-[10px] font-semibold text-slate-900 dark:text-white mt-0.5">
                                      {format(new Date(selectedTransaction.cancelledAt || selectedTransaction.timestamp), 'MMM dd')}
                                    </p>
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400">
                                      {format(new Date(selectedTransaction.cancelledAt || selectedTransaction.timestamp), 'HH:mm')}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Customer Information Section */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 pb-1.5 border-b">
                                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                                    <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Customer Information</h4>
                                </div>
                                <div className="space-y-2">
                                  <div className="p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Full Name</p>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{selectedTransaction.customerName || 'Walk-in Customer'}</p>
                                  </div>
                                  <div className="p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Contact Number</p>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center">
                                      <Phone className="mr-1.5 h-2.5 w-2.5 text-slate-400" />
                                      {selectedTransaction.customerPhone || 'N/A'}
                                    </p>
                                  </div>
                                  {selectedTransaction.customerEmail && (
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                      <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Email Address</p>
                                      <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center break-all">
                                        <Mail className="mr-1.5 h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
                                        {selectedTransaction.customerEmail}
                                      </p>
                                    </div>
                                  )}
                                  {selectedTransaction.customerAddress && (
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                      <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Address</p>
                                      <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-start">
                                        <MapPin className="mr-1.5 h-2.5 w-2.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                        {selectedTransaction.customerAddress}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Cancellation Information Section */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 pb-1.5 border-b">
                                  <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded">
                                    <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cancellation Information</h4>
                                </div>
                                <div className="space-y-2">
                                  <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-200 dark:border-red-800">
                                    <p className="text-[9px] text-red-700 dark:text-red-400 uppercase tracking-wide mb-1.5 font-semibold">Reason</p>
                                    <Badge variant="destructive" className="text-xs px-2 py-1">
                                      {selectedTransaction.cancellationReason || 'N/A'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                      <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Cancelled By</p>
                                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{selectedTransaction.cancelledBy || 'N/A'}</p>
                                    </div>
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                      <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Cancelled At</p>
                                      <p className="text-[10px] font-semibold text-slate-900 dark:text-white">
                                        {format(new Date(selectedTransaction.cancelledAt || selectedTransaction.timestamp), 'MMM dd, yyyy')}
                                      </p>
                                      <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        {format(new Date(selectedTransaction.cancelledAt || selectedTransaction.timestamp), 'HH:mm')}
                                      </p>
                                    </div>
                                  </div>
                                  {selectedTransaction.cancellation_notes && (
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                                      <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Additional Notes</p>
                                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{selectedTransaction.cancellation_notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              </>
            )}
            </CardContent>
          </Card>

        <div className="space-y-4 md:space-y-6">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Top Reasons</CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">Most common</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reasonStats.slice(0, 5).map((stat, index) => (
                  <div key={stat.reason} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold shadow-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium truncate text-slate-900 dark:text-white">{stat.reason}</span>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge variant="secondary" className="text-xs">{stat.count}</Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{((stat.count / totalCancelled) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Insights</CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">Key observations</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                  <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm">Rate</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {((totalCancelled / (transactions.length || 1)) * 100).toFixed(1)}% cancelled
                        </p>
                      </div>
                    </div>
                  </div>
                  {reasonStats[0] && (
                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm">Top Issue</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            "{reasonStats[0].reason}" - {reasonStats[0].count} cases
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
}
