'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Search, Package, Truck, CheckCircle, Clock, XCircle, RefreshCw, 
  User, Phone, Mail, MapPin, AlertCircle, PackageCheck, Ban, AlertTriangle, RotateCcw,
  FileSpreadsheet, FileText, Download
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { apiGet } from '@/lib/api-client'
import { BrandLoader } from '@/components/ui/brand-loader'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress: string
  itemName: string
  quantity: number
  totalAmount: number
  orderStatus: 'Pending' | 'Packed'
  parcelStatus: 'PENDING' | 'DELIVERED' | 'ON DELIVERY' | 'PICKUP' | 'IN TRANSIT' | 'CANCELLED' | 'DETAINED' | 'PROBLEMATIC' | 'RETURNED'
  paymentStatus: 'pending' | 'paid' | 'cod' | 'refunded'
  courier?: string
  trackingNumber?: string
  orderDate: string
  estimatedDelivery?: string
  deliveryDate?: string
  notes?: string
  department?: string // Sales channel (Shopee, Lazada, Flash, etc.)
}

export default function TrackOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [salesChannelFilter, setSalesChannelFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, salesChannelFilter, orders])

  const fetchOrders = async () => {
    try {
      // Fetch only packed orders (ready for tracking)
      const data = await apiGet<any[]>('/api/orders?status=Packed')
      
      // Transform data to match Order interface
      const transformedOrders: Order[] = data.map(order => ({
        id: order.id,
        orderNumber: order.id,
        customerName: 'N/A', // Not tracked yet
        customerPhone: 'N/A',
        customerEmail: undefined,
        customerAddress: order.store || 'N/A',
        itemName: order.product ? order.product.replace(/\s*\(\d+\)$/, '') : 'N/A',
        quantity: order.qty,
        totalAmount: order.total,
        orderStatus: order.status as 'Pending' | 'Packed',
        parcelStatus: (order.parcel_status || 'PENDING') as any,
        paymentStatus: (order.payment_status || 'pending') as any,
        courier: order.courier,
        trackingNumber: order.waybill,
        orderDate: order.date,
        estimatedDelivery: undefined,
        deliveryDate: order.status === 'Delivered' ? order.updated_at : undefined,
        notes: JSON.stringify({
          dispatchedBy: order.dispatched_by,
          dispatchedAt: order.created_at,
          packedBy: order.packed_by,
          packedAt: order.packed_at
        }),
        department: order.sales_channel
      }))
      
      setOrders(transformedOrders)
      setFilteredOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status?: string, parcelStatus?: string, paymentStatus?: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          parcel_status: parcelStatus,
          payment_status: paymentStatus
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success('Status updated successfully')
      fetchOrders() // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const exportToExcel = () => {
    try {
      // Calculate financial totals
      const totalQuantity = filteredOrders.reduce((sum, order) => sum + order.quantity, 0)
      const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      const totalCOGS = filteredOrders.reduce((sum, order) => sum + (order.totalAmount * 0.6), 0)
      const totalProfit = totalAmount - totalCOGS
      const totalProfitMargin = totalAmount > 0 ? ((totalProfit / totalAmount) * 100) : 0

      // Calculate per-status financials
      const getStatusFinancials = (statusOrders: Order[]) => {
        const qty = statusOrders.reduce((sum, o) => sum + o.quantity, 0)
        const amt = statusOrders.reduce((sum, o) => sum + o.totalAmount, 0)
        const cogs = amt * 0.6
        const profit = amt - cogs
        const margin = amt > 0 ? ((profit / amt) * 100) : 0
        return { qty, amt, cogs, profit, margin }
      }

      const pendingFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'PENDING'))
      const inTransitFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'IN TRANSIT'))
      const onDeliveryFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'ON DELIVERY'))
      const pickupFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'PICKUP'))
      const deliveredFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'DELIVERED'))
      const cancelledFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'CANCELLED'))
      const detainedFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'DETAINED'))
      const problematicFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'PROBLEMATIC'))
      const returnedFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'RETURNED'))

      // Build comprehensive CSV content
      let csvContent = ''
      
      // Header Section
      csvContent += 'TRACK ORDERS REPORT - COMPREHENSIVE DATA\n'
      csvContent += `Generated: ${new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}\n`
      csvContent += `Total Orders: ${filteredOrders.length}\n`
      csvContent += '\n'

      // Financial Summary Section
      csvContent += 'FINANCIAL SUMMARY\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Total Quantity,${totalQuantity}\n`
      csvContent += `Total Amount,₱${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`
      csvContent += `Total COGS,₱${totalCOGS.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`
      csvContent += `Total Profit,₱${totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`
      csvContent += `Profit Margin,${totalProfitMargin.toFixed(2)}%\n`
      csvContent += '\n'

      // Per-Status Breakdown Section
      csvContent += 'STATUS BREAKDOWN\n'
      csvContent += 'Status,Orders,Quantity,Amount,COGS,Profit,Margin\n'
      csvContent += `Total Orders,${filteredOrders.length},${totalQuantity},₱${totalAmount.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${totalCOGS.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${totalProfit.toLocaleString(undefined, {maximumFractionDigits: 2})},${totalProfitMargin.toFixed(2)}%\n`
      csvContent += `Pending,${filteredOrders.filter(o => o.parcelStatus === 'PENDING').length},${pendingFinancials.qty},₱${pendingFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${pendingFinancials.cogs.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${pendingFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 2})},${pendingFinancials.margin.toFixed(2)}%\n`
      csvContent += `In Transit,${filteredOrders.filter(o => o.parcelStatus === 'IN TRANSIT').length},${inTransitFinancials.qty},₱${inTransitFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${inTransitFinancials.cogs.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${inTransitFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 2})},${inTransitFinancials.margin.toFixed(2)}%\n`
      csvContent += `On Delivery,${filteredOrders.filter(o => o.parcelStatus === 'ON DELIVERY').length},${onDeliveryFinancials.qty},₱${onDeliveryFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${onDeliveryFinancials.cogs.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${onDeliveryFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 2})},${onDeliveryFinancials.margin.toFixed(2)}%\n`
      csvContent += `Pickup,${filteredOrders.filter(o => o.parcelStatus === 'PICKUP').length},${pickupFinancials.qty},₱${pickupFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${pickupFinancials.cogs.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${pickupFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 2})},${pickupFinancials.margin.toFixed(2)}%\n`
      csvContent += `Delivered,${filteredOrders.filter(o => o.parcelStatus === 'DELIVERED').length},${deliveredFinancials.qty},₱${deliveredFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${deliveredFinancials.cogs.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${deliveredFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 2})},${deliveredFinancials.margin.toFixed(2)}%\n`
      csvContent += `Cancelled,${filteredOrders.filter(o => o.parcelStatus === 'CANCELLED').length},${cancelledFinancials.qty},₱${cancelledFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${cancelledFinancials.cogs.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${cancelledFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 2})},${cancelledFinancials.margin.toFixed(2)}%\n`
      csvContent += `Detained,${filteredOrders.filter(o => o.parcelStatus === 'DETAINED').length},${detainedFinancials.qty},₱${detainedFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${detainedFinancials.cogs.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${detainedFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 2})},${detainedFinancials.margin.toFixed(2)}%\n`
      csvContent += `Problematic,${filteredOrders.filter(o => o.parcelStatus === 'PROBLEMATIC').length},${problematicFinancials.qty},₱${problematicFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${problematicFinancials.cogs.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${problematicFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 2})},${problematicFinancials.margin.toFixed(2)}%\n`
      csvContent += `Returned,${filteredOrders.filter(o => o.parcelStatus === 'RETURNED').length},${returnedFinancials.qty},₱${returnedFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${returnedFinancials.cogs.toLocaleString(undefined, {maximumFractionDigits: 2})},₱${returnedFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 2})},${returnedFinancials.margin.toFixed(2)}%\n`
      csvContent += '\n'

      // Detailed Orders Section
      csvContent += 'DETAILED ORDERS\n'
      csvContent += 'No.,Order #,Date,Sales Channel,Store,Product,Qty,Amount,COGS,Profit,Margin,Courier,Waybill,Payment Status,Parcel Status\n'
      
      filteredOrders.forEach((order, index) => {
        const cogs = order.totalAmount * 0.6
        const profit = order.totalAmount - cogs
        const margin = order.totalAmount > 0 ? ((profit / order.totalAmount) * 100) : 0
        
        csvContent += `${index + 1},`
        csvContent += `#${order.id.slice(-6)},`
        csvContent += `"${new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}",`
        csvContent += `"${order.department || 'N/A'}",`
        csvContent += `"${order.customerAddress || 'N/A'}",`
        csvContent += `"${order.itemName}",`
        csvContent += `${order.quantity},`
        csvContent += `₱${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})},`
        csvContent += `₱${cogs.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})},`
        csvContent += `₱${profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})},`
        csvContent += `${margin.toFixed(2)}%,`
        csvContent += `"${order.courier || '-'}",`
        csvContent += `"${order.trackingNumber || '-'}",`
        csvContent += `${order.paymentStatus.toUpperCase()},`
        csvContent += `${order.parcelStatus}\n`
      })

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `Track_Orders_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Comprehensive Excel report downloaded successfully')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Failed to export Excel report')
    }
  }

  const exportToPDF = () => {
    try {
      // Calculate financial totals
      const totalQuantity = filteredOrders.reduce((sum, order) => sum + order.quantity, 0)
      const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      const totalCOGS = filteredOrders.reduce((sum, order) => sum + (order.totalAmount * 0.6), 0)
      const totalProfit = totalAmount - totalCOGS
      const totalProfitMargin = totalAmount > 0 ? ((totalProfit / totalAmount) * 100) : 0

      // Calculate per-status financials
      const getStatusFinancials = (statusOrders: Order[]) => {
        const qty = statusOrders.reduce((sum, o) => sum + o.quantity, 0)
        const amt = statusOrders.reduce((sum, o) => sum + o.totalAmount, 0)
        const profit = amt - (amt * 0.6)
        const margin = amt > 0 ? ((profit / amt) * 100) : 0
        return { qty, amt, profit, margin }
      }

      const pendingFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'PENDING'))
      const inTransitFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'IN TRANSIT'))
      const onDeliveryFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'ON DELIVERY'))
      const pickupFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'PICKUP'))
      const deliveredFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'DELIVERED'))
      const cancelledFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'CANCELLED'))
      const detainedFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'DETAINED'))
      const problematicFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'PROBLEMATIC'))
      const returnedFinancials = getStatusFinancials(filteredOrders.filter(o => o.parcelStatus === 'RETURNED'))

      // Create a comprehensive printable HTML content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Track Orders Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page {
              margin: 0;
              size: auto;
            }
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
              border-bottom: 4px solid #ec540e;
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
              background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
              border-radius: 12px;
              border: 3px solid #f59e0b;
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
            .financial-card.profit .value {
              color: #059669;
            }
            .financial-card.margin .value {
              color: #0284c7;
            }
            
            .summary { 
              display: grid; 
              grid-template-columns: repeat(5, 1fr); 
              gap: 12px; 
              margin-bottom: 35px; 
            }
            .summary-card { 
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 18px 12px;
              border-radius: 10px;
              text-align: center;
              border: 2px solid #e2e8f0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .summary-card .number { 
              font-size: 32px; 
              font-weight: 800; 
              color: #1e293b;
              margin-bottom: 8px;
            }
            .summary-card .label { 
              font-size: 11px; 
              color: #64748b; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
            }
            .summary-card .mini-stats {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 4px;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
            }
            .summary-card .mini-stat {
              font-size: 8px;
              color: #94a3b8;
              font-weight: 600;
            }
            .summary-card .mini-stat .mini-value {
              font-size: 10px;
              color: #475569;
              font-weight: 700;
              display: block;
              margin-top: 2px;
            }
            
            .summary-row-2 {
              display: grid; 
              grid-template-columns: repeat(5, 1fr); 
              gap: 12px; 
              margin-bottom: 35px;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            thead {
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            }
            th { 
              color: white; 
              padding: 14px 10px; 
              text-align: left; 
              font-size: 9px; 
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-right: 1px solid rgba(255,255,255,0.1);
            }
            th:last-child { border-right: none; }
            td { 
              padding: 12px 10px; 
              border-bottom: 1px solid #e2e8f0;
              font-size: 10px;
            }
            tr:nth-child(even) { background-color: #f8fafc; }
            tr:hover { background-color: #f1f5f9; }
            
            .badge { 
              display: inline-block; 
              padding: 4px 10px; 
              border-radius: 6px; 
              font-size: 8px; 
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .badge-pending { background: #fef3c7; color: #92400e; }
            .badge-paid { background: #d1fae5; color: #065f46; }
            .badge-cod { background: #dbeafe; color: #1e40af; }
            .badge-refunded { background: #f3f4f6; color: #374151; }
            .badge-packed { background: #d1fae5; color: #065f46; }
            .badge-delivered { background: #d1fae5; color: #065f46; }
            .badge-transit { background: #dbeafe; color: #1e40af; }
            .badge-on-delivery { background: #dbeafe; color: #1e40af; }
            .badge-pickup { background: #e9d5ff; color: #6b21a8; }
            .badge-cancelled { background: #fee2e2; color: #991b1b; }
            .badge-detained { background: #fed7aa; color: #9a3412; }
            .badge-problematic { background: #fce7f3; color: #9f1239; }
            .badge-returned { background: #f1f5f9; color: #475569; }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #94a3b8;
              font-size: 11px;
            }
            .footer strong {
              color: #1e293b;
              font-size: 13px;
            }
            
            @media print {
              body { padding: 15px; }
              .page-title { font-size: 28px; }
              .summary { gap: 8px; }
              .summary-card { padding: 12px 8px; }
              .summary-card .number { font-size: 24px; }
              .financial-summary { gap: 10px; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="page-title">Track Orders Report</h1>
            <div class="meta">
              <strong>Generated:</strong> ${new Date().toLocaleString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}<br>
              <strong>Total Orders:</strong> ${filteredOrders.length} | 
              <strong>Report Type:</strong> Comprehensive Track Orders
            </div>
          </div>

          <div class="financial-summary">
            <div class="financial-card">
              <div class="label">Total Quantity</div>
              <div class="value">${totalQuantity}</div>
            </div>
            <div class="financial-card">
              <div class="label">Total Amount</div>
              <div class="value">₱${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="financial-card">
              <div class="label">Total COGS</div>
              <div class="value">₱${totalCOGS.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="financial-card profit">
              <div class="label">Total Profit</div>
              <div class="value">₱${totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="financial-card margin">
              <div class="label">Profit Margin</div>
              <div class="value">${totalProfitMargin.toFixed(2)}%</div>
            </div>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <div class="number">${totalOrders}</div>
              <div class="label">Total Orders</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${totalQuantity}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${totalAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${totalProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${totalProfitMargin.toFixed(1)}%</span></div>
              </div>
            </div>
            <div class="summary-card">
              <div class="number">${pendingOrders}</div>
              <div class="label">Pending</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${pendingFinancials.qty}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${pendingFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${pendingFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${pendingFinancials.margin.toFixed(1)}%</span></div>
              </div>
            </div>
            <div class="summary-card">
              <div class="number">${inTransitOrders}</div>
              <div class="label">In Transit</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${inTransitFinancials.qty}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${inTransitFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${inTransitFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${inTransitFinancials.margin.toFixed(1)}%</span></div>
              </div>
            </div>
            <div class="summary-card">
              <div class="number">${onDeliveryOrders}</div>
              <div class="label">On Delivery</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${onDeliveryFinancials.qty}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${onDeliveryFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${onDeliveryFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${onDeliveryFinancials.margin.toFixed(1)}%</span></div>
              </div>
            </div>
            <div class="summary-card">
              <div class="number">${pickupOrders}</div>
              <div class="label">Pickup</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${pickupFinancials.qty}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${pickupFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${pickupFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${pickupFinancials.margin.toFixed(1)}%</span></div>
              </div>
            </div>
          </div>

          <div class="summary-row-2">
            <div class="summary-card">
              <div class="number">${deliveredOrders}</div>
              <div class="label">Delivered</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${deliveredFinancials.qty}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${deliveredFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${deliveredFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${deliveredFinancials.margin.toFixed(1)}%</span></div>
              </div>
            </div>
            <div class="summary-card">
              <div class="number">${cancelledOrders}</div>
              <div class="label">Cancelled</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${cancelledFinancials.qty}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${cancelledFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${cancelledFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${cancelledFinancials.margin.toFixed(1)}%</span></div>
              </div>
            </div>
            <div class="summary-card">
              <div class="number">${detainedOrders}</div>
              <div class="label">Detained</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${detainedFinancials.qty}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${detainedFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${detainedFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${detainedFinancials.margin.toFixed(1)}%</span></div>
              </div>
            </div>
            <div class="summary-card">
              <div class="number">${problematicOrders}</div>
              <div class="label">Problematic</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${problematicFinancials.qty}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${problematicFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${problematicFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${problematicFinancials.margin.toFixed(1)}%</span></div>
              </div>
            </div>
            <div class="summary-card">
              <div class="number">${returnedOrders}</div>
              <div class="label">Returned</div>
              <div class="mini-stats">
                <div class="mini-stat">Qty: <span class="mini-value">${returnedFinancials.qty}</span></div>
                <div class="mini-stat">Amt: <span class="mini-value">₱${returnedFinancials.amt.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Profit: <span class="mini-value">₱${returnedFinancials.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                <div class="mini-stat">Margin: <span class="mini-value">${returnedFinancials.margin.toFixed(1)}%</span></div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 70px;">Order #</th>
                <th style="width: 75px;">Date</th>
                <th style="width: 80px;">Channel</th>
                <th style="width: 85px;">Store</th>
                <th>Product</th>
                <th style="width: 35px;">Qty</th>
                <th style="width: 70px;">Amount</th>
                <th style="width: 65px;">COGS</th>
                <th style="width: 70px;">Courier</th>
                <th style="width: 90px;">Waybill</th>
                <th style="width: 65px;">Payment</th>
                <th style="width: 60px;">Status</th>
                <th style="width: 75px;">Parcel</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => `
                <tr>
                  <td style="font-weight: 700; font-family: monospace;">#${order.id.slice(-6)}</td>
                  <td>${new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td><span class="badge" style="background: linear-gradient(135deg, #ec540e, #d6361f); color: white;">${order.department || 'N/A'}</span></td>
                  <td style="font-weight: 600;">${order.customerAddress || 'N/A'}</td>
                  <td style="font-weight: 500;">${order.itemName}</td>
                  <td style="text-align: center; font-weight: 700;">${order.quantity}</td>
                  <td style="font-weight: 700; color: #059669;">₱${order.totalAmount.toLocaleString()}</td>
                  <td style="font-weight: 600; color: #64748b;">₱${(order.totalAmount * 0.6).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td>${order.courier || '-'}</td>
                  <td style="font-family: monospace; font-size: 9px;">${order.trackingNumber || '-'}</td>
                  <td><span class="badge badge-${order.paymentStatus}">${order.paymentStatus.toUpperCase()}</span></td>
                  <td><span class="badge badge-${order.orderStatus.toLowerCase()}">${order.orderStatus.toUpperCase()}</span></td>
                  <td><span class="badge badge-${order.parcelStatus.toLowerCase().replace(' ', '-')}">${order.parcelStatus}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Vertex Professional Inventory Management System</strong></p>
            <p>Track Orders Report - Confidential Document</p>
          </div>
        </body>
        </html>
      `

      // Open print dialog
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          toast.success('PDF report ready for printing')
        }, 250)
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast.error('Failed to export PDF report')
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.parcelStatus === statusFilter)
    }
    
    if (salesChannelFilter !== 'all') {
      filtered = filtered.filter(order => order.department === salesChannelFilter)
    }
    
    setFilteredOrders(filtered)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Packed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }
    
    const icons = {
      Pending: Clock,
      Packed: PackageCheck,
    }
    
    const Icon = icons[status as keyof typeof icons] || Clock
    const style = styles[status as keyof typeof styles] || styles.Pending
    
    return (
      <Badge className={`${style} border-0 text-[10px] px-1.5 py-0.5`}>
        <Icon className="h-2.5 w-2.5 mr-1" />
        {status}
      </Badge>
    )
  }

  const getParcelStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'ON DELIVERY': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      PICKUP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'IN TRANSIT': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      DETAINED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      PROBLEMATIC: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      RETURNED: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    }
    
    const icons = {
      PENDING: Clock,
      DELIVERED: CheckCircle,
      'ON DELIVERY': Truck,
      PICKUP: Package,
      'IN TRANSIT': Truck,
      CANCELLED: XCircle,
      DETAINED: AlertCircle,
      PROBLEMATIC: AlertTriangle,
      RETURNED: RotateCcw,
    }
    
    const Icon = icons[status as keyof typeof icons] || Clock
    const style = styles[status as keyof typeof styles] || styles.PENDING
    
    return (
      <Badge className={`${style} border-0 text-[10px] px-1.5 py-0.5`}>
        <Icon className="h-2.5 w-2.5 mr-1" />
        {status}
      </Badge>
    )
  }

  const getPaymentBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cod: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    }
    
    const style = styles[status as keyof typeof styles] || styles.pending
    
    return (
      <Badge className={`${style} text-[10px] px-1.5 py-0.5 border-0`}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  const totalOrders = filteredOrders.length
  const pendingOrders = filteredOrders.filter(o => o.parcelStatus === 'PENDING').length
  const inTransitOrders = filteredOrders.filter(o => o.parcelStatus === 'IN TRANSIT').length
  const onDeliveryOrders = filteredOrders.filter(o => o.parcelStatus === 'ON DELIVERY').length
  const pickupOrders = filteredOrders.filter(o => o.parcelStatus === 'PICKUP').length
  const deliveredOrders = filteredOrders.filter(o => o.parcelStatus === 'DELIVERED').length
  const cancelledOrders = filteredOrders.filter(o => o.parcelStatus === 'CANCELLED').length
  const detainedOrders = filteredOrders.filter(o => o.parcelStatus === 'DETAINED').length
  const problematicOrders = filteredOrders.filter(o => o.parcelStatus === 'PROBLEMATIC').length
  const returnedOrders = filteredOrders.filter(o => o.parcelStatus === 'RETURNED').length

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Track Orders</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Manage customer orders and delivery tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="relative overflow-hidden rounded-lg border-2 border-transparent px-6 py-2.5 text-white font-medium text-sm transition-all duration-300 hover:opacity-80 hover:shadow-none"
            style={{
              background: 'linear-gradient(140.14deg, #ec540e 15.05%, #d6361f 114.99%) padding-box, linear-gradient(142.51deg, #ff9465 8.65%, #af1905 88.82%) border-box',
              textShadow: '1px 1px 1px rgba(0, 0, 0, 0.25)',
              boxShadow: '8px 8px 20px 0px rgba(69, 9, 0, 0.35)',
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 inline" />
            Excel Report
          </button>
          <button
            onClick={exportToPDF}
            className="relative overflow-hidden rounded-lg border-2 border-transparent px-6 py-2.5 text-white font-medium text-sm transition-all duration-300 hover:opacity-80 hover:shadow-none"
            style={{
              background: 'linear-gradient(140.14deg, #ec540e 15.05%, #d6361f 114.99%) padding-box, linear-gradient(142.51deg, #ff9465 8.65%, #af1905 88.82%) border-box',
              textShadow: '1px 1px 1px rgba(0, 0, 0, 0.25)',
              boxShadow: '8px 8px 20px 0px rgba(69, 9, 0, 0.35)',
            }}
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            PDF Report
          </button>
        </div>
      </div>

      {/* Statistics Cards - 2 Rows x 5 Columns Enterprise Grade */}
      <div className="grid gap-3 grid-cols-5">
        {/* Row 1 */}
        {/* Total Orders */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-slate-100 dark:bg-slate-800">
                <Package className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {totalOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Total Orders</div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {pendingOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Pending</div>
          </CardContent>
        </Card>

        {/* In Transit */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-indigo-100 dark:bg-indigo-900/30">
                <Truck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {inTransitOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">In Transit</div>
          </CardContent>
        </Card>

        {/* On Delivery */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-blue-100 dark:bg-blue-900/30">
                <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {onDeliveryOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">On Delivery</div>
          </CardContent>
        </Card>

        {/* Pickup */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-purple-100 dark:bg-purple-900/30">
                <Package className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {pickupOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Pickup</div>
          </CardContent>
        </Card>

        {/* Row 2 */}
        {/* Delivered */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {deliveredOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Delivered</div>
          </CardContent>
        </Card>

        {/* Cancelled */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {cancelledOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Cancelled</div>
          </CardContent>
        </Card>

        {/* Detained */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-orange-100 dark:bg-orange-900/30">
                <AlertCircle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {detainedOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Detained</div>
          </CardContent>
        </Card>

        {/* Problematic */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-pink-100 dark:bg-pink-900/30">
                <AlertTriangle className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {problematicOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Problematic</div>
          </CardContent>
        </Card>

        {/* Returned */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-slate-100 dark:bg-slate-800">
                <RotateCcw className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              {returnedOrders}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Returned</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by order no. or waybill no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>
        
        <div className="w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="DELIVERED">DELIVERED</SelectItem>
              <SelectItem value="ON DELIVERY">ON DELIVERY</SelectItem>
              <SelectItem value="PICKUP">PICKUP</SelectItem>
              <SelectItem value="IN TRANSIT">IN TRANSIT</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              <SelectItem value="DETAINED">DETAINED</SelectItem>
              <SelectItem value="PROBLEMATIC">PROBLEMATIC</SelectItem>
              <SelectItem value="RETURNED">RETURNED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select value={salesChannelFilter} onValueChange={setSalesChannelFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Sales Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="Shopee">Shopee</SelectItem>
              <SelectItem value="Lazada">Lazada</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="Physical Store">Physical Store</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table - Enterprise Grade 10/10 */}
      <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                <Package className="h-12 w-12 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">No orders found</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Orders will appear here when packed from Transaction History
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black">
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[100px]">Order #</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[110px]">Date</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[120px]">Channel</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[100px]">Store</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50">Product</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[100px]">Courier</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[130px]">Waybill</th>
                    <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[100px]">Payment</th>
                    <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[90px]">Status</th>
                    <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[130px]">Parcel Status</th>
                    <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className="group hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                    >
                      <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          #{order.id.slice(-6)}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[9px] font-semibold px-2 py-0.5 shadow-sm whitespace-nowrap">
                          {order.department || 'FLASH'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate">{order.customerAddress || 'N/A'}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={order.itemName}>
                          {order.itemName}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate">{order.courier || '-'}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] font-mono text-slate-900 dark:text-white font-semibold truncate">{order.trackingNumber || '-'}</div>
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                        <Select 
                          value={order.paymentStatus} 
                          onValueChange={(value) => updateOrderStatus(order.id, undefined, undefined, value)}
                        >
                          <SelectTrigger className="h-auto w-auto mx-auto border-0 bg-transparent text-[9px] shadow-none hover:bg-slate-50 dark:hover:bg-slate-800 p-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <span className="text-[9px]">PENDING</span>
                            </SelectItem>
                            <SelectItem value="paid">
                              <span className="text-[9px]">PAID</span>
                            </SelectItem>
                            <SelectItem value="cod">
                              <span className="text-[9px]">COD</span>
                            </SelectItem>
                            <SelectItem value="refunded">
                              <span className="text-[9px]">REFUNDED</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-[9px] px-1.5 py-0.5 font-semibold">
                          <PackageCheck className="h-2 w-2 mr-0.5 inline" />
                          Packed
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
                        <Select 
                          value={order.parcelStatus} 
                          onValueChange={(value) => updateOrderStatus(order.id, undefined, value)}
                        >
                          <SelectTrigger className="h-auto w-auto mx-auto border-0 bg-transparent text-[9px] shadow-none hover:bg-slate-50 dark:hover:bg-slate-800 p-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">
                              <div className="flex items-center gap-1">
                                <Clock className="h-2 w-2 text-yellow-600" />
                                <span className="text-[9px]">PENDING</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="DELIVERED">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-2 w-2 text-green-600" />
                                <span className="text-[9px]">DELIVERED</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="ON DELIVERY">
                              <div className="flex items-center gap-1">
                                <Truck className="h-2 w-2 text-blue-600" />
                                <span className="text-[9px]">ON DELIVERY</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="PICKUP">
                              <div className="flex items-center gap-1">
                                <Package className="h-2 w-2 text-purple-600" />
                                <span className="text-[9px]">PICKUP</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="IN TRANSIT">
                              <div className="flex items-center gap-1">
                                <Truck className="h-2 w-2 text-indigo-600" />
                                <span className="text-[9px]">IN TRANSIT</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="CANCELLED">
                              <div className="flex items-center gap-1">
                                <XCircle className="h-2 w-2 text-red-600" />
                                <span className="text-[9px]">CANCELLED</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="DETAINED">
                              <div className="flex items-center gap-1">
                                <AlertCircle className="h-2 w-2 text-orange-600" />
                                <span className="text-[9px]">DETAINED</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="PROBLEMATIC">
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-2 w-2 text-pink-600" />
                                <span className="text-[9px]">PROBLEMATIC</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="RETURNED">
                              <div className="flex items-center gap-1">
                                <RotateCcw className="h-2 w-2 text-slate-600" />
                                <span className="text-[9px]">RETURNED</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsModal(order)}
                          className="h-6 px-2 text-[9px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 transition-colors whitespace-nowrap"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal - Enterprise Grade */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 pt-2">
              {/* Order Header - Centered */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Order #{selectedOrder.orderNumber.slice(-8)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(selectedOrder.orderDate).toLocaleString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {/* Order Summary Grid */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Item</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedOrder.itemName}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Quantity</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedOrder.quantity}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">COGS</p>
                    <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(selectedOrder.totalAmount * 0.6)}
                    </p>
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Store</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {selectedOrder.customerAddress || 'N/A'}
                    </p>
                    {selectedOrder.department && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs font-semibold px-2 py-1">
                        {selectedOrder.department}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Parcel Status</p>
                    <div className="flex flex-col gap-2 mt-1">
                      {getParcelStatusBadge(selectedOrder.parcelStatus)}
                      <div className="flex gap-2">
                        {getStatusBadge(selectedOrder.orderStatus)}
                        {getPaymentBadge(selectedOrder.paymentStatus)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information - Enterprise Style */}
              {(selectedOrder.courier || selectedOrder.trackingNumber) && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      Delivery Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedOrder.courier && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Courier</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {selectedOrder.courier}
                        </p>
                      </div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Tracking Number</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white font-mono">
                          {selectedOrder.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes - Enterprise Style with Timestamps */}
              {selectedOrder.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 mt-0.5">
                      <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-3">Timeline</p>
                      {(() => {
                        try {
                          const notesData = JSON.parse(selectedOrder.notes)
                          return (
                            <div className="grid grid-cols-2 gap-4">
                              {/* Dispatched */}
                              <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Dispatched</p>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{notesData.dispatchedBy}</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {new Date(notesData.dispatchedAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Packed */}
                              {notesData.packedBy && (
                                <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Packed</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{notesData.packedBy}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                      {new Date(notesData.packedAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        } catch (e) {
                          // Fallback for old format
                          return <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedOrder.notes}</p>
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
