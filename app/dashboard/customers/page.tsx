"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, Plus, Users, Award, TrendingUp, Mail, Phone, Package, 
  Download, Eye, Edit, Trash2, X, ShoppingBag, Calendar, DollarSign, Settings 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import type { Customer } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { PremiumTableLoading } from "@/components/premium-loading"

export default function CustomersPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name-asc")
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [tierSettingsOpen, setTierSettingsOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  // Adjustment states
  const [adjustmentType, setAdjustmentType] = useState<'points' | 'purchases' | 'spending'>('points')
  const [adjustmentValue, setAdjustmentValue] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  
  // Tier settings states
  const [tierSettings, setTierSettings] = useState({
    silver: 20000,
    gold: 50000,
    platinum: 100000,
    pointsPerHundred: 1
  })
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    fetchCustomers()
    loadTierSettings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [search, tierFilter, sortBy, customers])

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customers")
      const data = await res.json()
      setCustomers(data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadTierSettings() {
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem('tierSettings')
      if (saved) {
        setTierSettings(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Error loading tier settings:", error)
    }
  }

  async function saveTierSettings() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('tierSettings', JSON.stringify(tierSettings))
      
      toast({
        title: "Settings Saved",
        description: "Tier thresholds have been updated successfully",
      })
      
      setTierSettingsOpen(false)
      
      // Recalculate all customer tiers
      await recalculateAllTiers()
    } catch (error) {
      console.error("Error saving tier settings:", error)
      toast({
        title: "Error",
        description: "Failed to save tier settings",
        variant: "destructive"
      })
    }
  }

  async function recalculateAllTiers() {
    try {
      // This would update all customers' tiers based on new thresholds
      // For now, just refresh the customer list
      await fetchCustomers()
    } catch (error) {
      console.error("Error recalculating tiers:", error)
    }
  }

  function resetTierSettings() {
    setTierSettings({
      silver: 20000,
      gold: 50000,
      platinum: 100000,
      pointsPerHundred: 1
    })
  }

  function getTierFromSpending(spending: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (spending >= tierSettings.platinum) return 'platinum'
    if (spending >= tierSettings.gold) return 'gold'
    if (spending >= tierSettings.silver) return 'silver'
    return 'bronze'
  }

  function getTierPreview() {
    const bronze = customers.filter(c => getTierFromSpending(c.totalSpent) === 'bronze').length
    const silver = customers.filter(c => getTierFromSpending(c.totalSpent) === 'silver').length
    const gold = customers.filter(c => getTierFromSpending(c.totalSpent) === 'gold').length
    const platinum = customers.filter(c => getTierFromSpending(c.totalSpent) === 'platinum').length
    return { bronze, silver, gold, platinum }
  }

  function applyFilters() {
    let filtered = [...customers]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.phone?.toLowerCase().includes(searchLower)
      )
    }

    // Tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter((c) => c.tier === tierFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "spent-desc":
          return b.totalSpent - a.totalSpent
        case "spent-asc":
          return a.totalSpent - b.totalSpent
        case "purchases-desc":
          return b.totalPurchases - a.totalPurchases
        case "points-desc":
          return b.loyaltyPoints - a.loyaltyPoints
        default:
          return 0
      }
    })

    setFilteredCustomers(filtered)
    setCurrentPage(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setAddDialogOpen(false)
      setFormData({ name: "", email: "", phone: "", address: "" })
      fetchCustomers()
    } catch (error) {
      console.error("Error adding customer:", error)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomer) return
    try {
      await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setEditDialogOpen(false)
      setSelectedCustomer(null)
      setFormData({ name: "", email: "", phone: "", address: "" })
      fetchCustomers()
    } catch (error) {
      console.error("Error updating customer:", error)
    }
  }

  async function handleDelete() {
    if (!selectedCustomer) return
    try {
      await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "DELETE",
      })
      setDeleteDialogOpen(false)
      setSelectedCustomer(null)
      fetchCustomers()
    } catch (error) {
      console.error("Error deleting customer:", error)
    }
  }

  function openEditDialog(customer: Customer) {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || ""
    })
    setEditDialogOpen(true)
  }

  function openDetailsDialog(customer: Customer) {
    setSelectedCustomer(customer)
    setDetailsDialogOpen(true)
  }

  function openDeleteDialog(customer: Customer) {
    setSelectedCustomer(customer)
    setDeleteDialogOpen(true)
  }

  function openAdjustDialog(customer: Customer, type: 'points' | 'purchases' | 'spending') {
    setSelectedCustomer(customer)
    setAdjustmentType(type)
    setAdjustmentValue("")
    setAdjustmentReason("")
    setAdjustDialogOpen(true)
  }

  async function handleAdjustment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomer || !adjustmentValue) return

    try {
      const value = parseFloat(adjustmentValue)
      if (isNaN(value)) {
        toast({
          title: "Invalid Input",
          description: "Please enter a valid number",
          variant: "destructive"
        })
        return
      }

      const updatedCustomer = { ...selectedCustomer }
      
      switch (adjustmentType) {
        case 'points':
          updatedCustomer.loyaltyPoints = Math.max(0, updatedCustomer.loyaltyPoints + value)
          break
        case 'purchases':
          updatedCustomer.totalPurchases = Math.max(0, updatedCustomer.totalPurchases + value)
          break
        case 'spending':
          updatedCustomer.totalSpent = Math.max(0, updatedCustomer.totalSpent + value)
          // Recalculate tier based on new spending
          updatedCustomer.tier = getTierFromSpending(updatedCustomer.totalSpent)
          break
      }

      console.log('Updating customer:', selectedCustomer.id, updatedCustomer)

      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCustomer),
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (!response.ok) {
        console.error('Update failed:', result)
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update customer. Please try again.",
          variant: "destructive"
        })
        return
      }

      console.log('Update successful')
      
      toast({
        title: "Success",
        description: `Customer ${adjustmentType} updated successfully${adjustmentType === 'spending' && updatedCustomer.tier !== selectedCustomer.tier ? ` - Tier upgraded to ${updatedCustomer.tier.toUpperCase()}!` : ''}`,
      })
      
      // Close dialog first
      setAdjustDialogOpen(false)
      
      // Refresh customer data
      await fetchCustomers()
      
      // Update selected customer with new data
      const updatedCustomers = await fetch("/api/customers").then(r => r.json())
      const refreshedCustomer = updatedCustomers.find((c: Customer) => c.id === selectedCustomer.id)
      if (refreshedCustomer) {
        setSelectedCustomer(refreshedCustomer)
      }
      
      // Reset form
      setAdjustmentValue("")
      setAdjustmentReason("")
      
    } catch (error) {
      console.error("Error adjusting customer data:", error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      })
    }
  }

  function exportToCSV() {
    const headers = ["Name", "Email", "Phone", "Tier", "Points", "Purchases", "Total Spent"]
    const rows = filteredCustomers.map(c => [
      c.name,
      c.email || "",
      c.phone || "",
      c.tier || "bronze",
      c.loyaltyPoints,
      c.totalPurchases,
      c.totalSpent
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': 
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
      case 'gold': 
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'silver': 
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400 border-slate-200 dark:border-slate-700'
      default: 
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    }
  }

  const stats = {
    total: customers.length,
    newThisMonth: customers.filter(c => {
      const created = new Date(c.createdAt || Date.now())
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
    vip: customers.filter(c => c.tier === 'platinum' || c.tier === 'gold').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpent: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0,
    avgPurchases: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalPurchases, 0) / customers.length : 0
  }

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

  if (loading) {
    return <PremiumTableLoading />
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-6">
      {/* Page Header */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Customer Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Build lasting relationships with your customers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                Total
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.total}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Customers</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                New
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.newThisMonth}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">This Month</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-purple-100 dark:bg-purple-900/30">
                <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                VIP
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.vip}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">VIP Customers</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                Revenue
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Revenue</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-orange-100 dark:bg-orange-900/30">
                <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                Avg
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(stats.avgSpent)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Avg Spent</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-indigo-100 dark:bg-indigo-900/30">
                <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-0">
                Avg
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.avgPurchases.toFixed(1)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Avg Purchases</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-md bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Tier</Label>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="spent-desc">Total Spent (High to Low)</SelectItem>
                    <SelectItem value="spent-asc">Total Spent (Low to High)</SelectItem>
                    <SelectItem value="purchases-desc">Purchases (High to Low)</SelectItem>
                    <SelectItem value="points-desc">Points (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                onClick={() => setTierSettingsOpen(true)}
                variant="outline"
                size="sm"
                className="h-9 gap-2 w-full"
              >
                <Settings className="h-4 w-4" />
                <span>Tier Settings</span>
              </Button>
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="h-9 gap-2 w-full"
                disabled={filteredCustomers.length === 0}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button
                onClick={() => setAddDialogOpen(true)}
                size="sm"
                className="h-9 gap-2 w-full"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </div>
          </div>
          {(search || tierFilter !== "all") && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredCustomers.length} of {customers.length} customers
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setTierFilter("all")
                }}
                className="h-7 text-xs gap-1"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-slate-900 dark:text-white">Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Customers Found</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {search || tierFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Get started by adding your first customer"}
              </p>
              {!search && tierFilter === "all" && (
                <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Customer
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="min-w-full inline-block align-middle">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                        <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                        <th className="pb-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tier</th>
                        <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Points</th>
                        <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Purchases</th>
                        <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Spent</th>
                        <th className="pb-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                          <td className="py-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{customer.name}</div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                              {customer.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[200px]">{customer.email}</span>
                                </div>
                              )}
                              {customer.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <Badge className={`${getTierColor(customer.tier || 'bronze')} border`}>
                              {(customer.tier || 'bronze').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-4 text-right font-medium text-slate-800 dark:text-slate-200">
                            {customer.loyaltyPoints}
                          </td>
                          <td className="py-4 text-right text-slate-600 dark:text-slate-400">
                            {customer.totalPurchases}
                          </td>
                          <td className="py-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(customer.totalSpent)}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openDetailsDialog(customer)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditDialog(customer)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Customer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openDeleteDialog(customer)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Customer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Customer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={`${getTierColor(selectedCustomer.tier || 'bronze')} border`}>
                      {(selectedCustomer.tier || 'bronze').toUpperCase()} TIER
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Award className="h-3 w-3" />
                      {selectedCustomer.loyaltyPoints} Points
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDetailsDialogOpen(false)
                      openEditDialog(selectedCustomer)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Purchases</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedCustomer.totalPurchases}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Spent</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Manual Adjustment Buttons */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">Manual Adjustments</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAdjustDialog(selectedCustomer, 'points')}
                    className="gap-2"
                  >
                    <Award className="h-4 w-4" />
                    Adjust Points
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAdjustDialog(selectedCustomer, 'purchases')}
                    className="gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Adjust Purchases
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAdjustDialog(selectedCustomer, 'spending')}
                    className="gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Adjust Spending
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Use these buttons to manually add or subtract points, purchases, or spending amounts
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">Contact Information</h4>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <Package className="h-4 w-4 text-slate-400 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{selectedCustomer.address}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Customer since {new Date(selectedCustomer.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Adjustment Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adjust {adjustmentType === 'points' ? 'Loyalty Points' : adjustmentType === 'purchases' ? 'Total Purchases' : 'Total Spending'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjustment} className="space-y-4">
            <div>
              <Label htmlFor="adjustment-value">
                Amount {adjustmentType === 'spending' && '(₱)'}
              </Label>
              <Input
                id="adjustment-value"
                type="number"
                step={adjustmentType === 'spending' ? '0.01' : '1'}
                required
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(e.target.value)}
                placeholder={`Enter ${adjustmentType === 'points' ? 'points' : adjustmentType === 'purchases' ? 'number of purchases' : 'amount'} to add or subtract`}
              />
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Use positive numbers to add, negative numbers to subtract
              </p>
            </div>
            <div>
              <Label htmlFor="adjustment-reason">Reason (Optional)</Label>
              <Input
                id="adjustment-reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="e.g., Bonus points, Correction, Promotion"
              />
            </div>
            {selectedCustomer && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-[5px]">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Value</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {adjustmentType === 'points' && selectedCustomer.loyaltyPoints}
                  {adjustmentType === 'purchases' && selectedCustomer.totalPurchases}
                  {adjustmentType === 'spending' && formatCurrency(selectedCustomer.totalSpent)}
                </div>
                {adjustmentValue && !isNaN(parseFloat(adjustmentValue)) && (
                  <>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">New Value</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {adjustmentType === 'points' && Math.max(0, selectedCustomer.loyaltyPoints + parseFloat(adjustmentValue))}
                      {adjustmentType === 'purchases' && Math.max(0, selectedCustomer.totalPurchases + parseFloat(adjustmentValue))}
                      {adjustmentType === 'spending' && formatCurrency(Math.max(0, selectedCustomer.totalSpent + parseFloat(adjustmentValue)))}
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdjustDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Apply Adjustment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tier Settings Dialog */}
      <Dialog open={tierSettingsOpen} onOpenChange={setTierSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Tier Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure spending thresholds for each customer tier. Tiers are automatically assigned based on total spending.
            </p>

            {/* Tier Thresholds */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-[5px] border border-orange-200 dark:border-orange-800">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <span className="text-2xl">🥉</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Bronze Tier</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Default tier for new customers</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Spending</div>
                  <div className="font-semibold text-slate-900 dark:text-white">₱0+</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-[5px] border border-slate-200 dark:border-slate-700">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <span className="text-2xl">🥈</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Silver Tier</h4>
                  <Label htmlFor="silver-threshold" className="text-sm text-slate-600 dark:text-slate-400">Minimum Spending</Label>
                  <Input
                    id="silver-threshold"
                    type="number"
                    value={tierSettings.silver}
                    onChange={(e) => setTierSettings({...tierSettings, silver: parseInt(e.target.value) || 0})}
                    className="mt-1"
                    min="0"
                  />
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Customers</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{getTierPreview().silver}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-[5px] border border-yellow-200 dark:border-yellow-800">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <span className="text-2xl">🥇</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Gold Tier</h4>
                  <Label htmlFor="gold-threshold" className="text-sm text-slate-600 dark:text-slate-400">Minimum Spending</Label>
                  <Input
                    id="gold-threshold"
                    type="number"
                    value={tierSettings.gold}
                    onChange={(e) => setTierSettings({...tierSettings, gold: parseInt(e.target.value) || 0})}
                    className="mt-1"
                    min="0"
                  />
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Customers</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{getTierPreview().gold}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-[5px] border border-purple-200 dark:border-purple-800">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-2xl">💎</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Platinum Tier</h4>
                  <Label htmlFor="platinum-threshold" className="text-sm text-slate-600 dark:text-slate-400">Minimum Spending</Label>
                  <Input
                    id="platinum-threshold"
                    type="number"
                    value={tierSettings.platinum}
                    onChange={(e) => setTierSettings({...tierSettings, platinum: parseInt(e.target.value) || 0})}
                    className="mt-1"
                    min="0"
                  />
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Customers</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{getTierPreview().platinum}</div>
                </div>
              </div>
            </div>

            {/* Loyalty Points Settings */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-[5px] border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Loyalty Points
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="points-rate" className="text-sm text-slate-600 dark:text-slate-400">Points per ₱100 spent</Label>
                  <Input
                    id="points-rate"
                    type="number"
                    value={tierSettings.pointsPerHundred}
                    onChange={(e) => setTierSettings({...tierSettings, pointsPerHundred: parseInt(e.target.value) || 1})}
                    className="mt-1"
                    min="1"
                  />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Example: ₱1,000 = {tierSettings.pointsPerHundred * 10} points
                </div>
              </div>
            </div>

            {/* Preview Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[5px]">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Customer Distribution Preview</h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{getTierPreview().bronze}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Bronze</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-600">{getTierPreview().silver}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Silver</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{getTierPreview().gold}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Gold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{getTierPreview().platinum}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Platinum</div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetTierSettings}>
              Reset to Default
            </Button>
            <Button variant="outline" onClick={() => setTierSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTierSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
