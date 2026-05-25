"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, Plus, Users, Building2, TrendingUp, Mail, Phone, 
  Download, Eye, Edit, Trash2, X, Briefcase, MapPin
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import type { BusinessContact } from "@/lib/types"
import { PremiumTableLoading } from "@/components/premium-loading"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"
import { BrandLoader } from '@/components/ui/brand-loader'

export default function BusinessContactsPage() {
  const { toast } = useToast()
  const [contacts, setContacts] = useState<BusinessContact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<BusinessContact[]>([])
  const [loading, setLoading] = useState(true)
  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'
  
  // Filter states
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name-asc")
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<BusinessContact | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    contactPerson: "",
    contactType: "supplier" as 'supplier' | 'distributor' | 'reseller',
    position: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [search, typeFilter, sortBy, contacts])

  async function fetchContacts() {
    try {
      const data = await apiGet<BusinessContact[]>("/api/business-contacts")
      setContacts(data)
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch contacts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...contacts]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.companyName?.toLowerCase().includes(searchLower) ||
          c.contactPerson?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.phone?.toLowerCase().includes(searchLower)
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((c) => c.contactType === typeFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "company-asc":
          return (a.companyName || "").localeCompare(b.companyName || "")
        case "type-asc":
          return a.contactType.localeCompare(b.contactType)
        default:
          return 0
      }
    })

    setFilteredContacts(filtered)
    setCurrentPage(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiPost("/api/business-contacts", formData)
      setAddDialogOpen(false)
      resetForm()
      fetchContacts()
      toast({
        title: "Success",
        description: "Business contact added successfully"
      })
    } catch (error) {
      console.error("Error adding contact:", error)
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive"
      })
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedContact) return
    try {
      await apiPut(`/api/business-contacts/${selectedContact.id}`, formData)
      setEditDialogOpen(false)
      setSelectedContact(null)
      resetForm()
      fetchContacts()
      toast({
        title: "Success",
        description: "Contact updated successfully"
      })
    } catch (error) {
      console.error("Error updating contact:", error)
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive"
      })
    }
  }

  async function handleDelete() {
    if (!selectedContact) return
    try {
      await apiDelete(`/api/business-contacts/${selectedContact.id}`)
      setDeleteDialogOpen(false)
      setSelectedContact(null)
      fetchContacts()
      toast({
        title: "Success",
        description: "Contact deleted successfully"
      })
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      })
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      companyName: "",
      contactPerson: "",
      contactType: "supplier",
      position: "",
      email: "",
      phone: "",
      address: "",
      notes: ""
    })
  }

  function openEditDialog(contact: BusinessContact) {
    setSelectedContact(contact)
    setFormData({
      name: contact.name,
      companyName: contact.companyName || "",
      contactPerson: contact.contactPerson || "",
      contactType: contact.contactType,
      position: contact.position || "",
      email: contact.email || "",
      phone: contact.phone || "",
      address: contact.address || "",
      notes: contact.notes || ""
    })
    setEditDialogOpen(true)
  }

  function openDetailsDialog(contact: BusinessContact) {
    setSelectedContact(contact)
    setDetailsDialogOpen(true)
  }

  function openDeleteDialog(contact: BusinessContact) {
    setSelectedContact(contact)
    setDeleteDialogOpen(true)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'supplier': 
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'distributor': 
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'reseller': 
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
      default: 
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }
  }

  const stats = {
    total: contacts.length,
    suppliers: contacts.filter(c => c.contactType === 'supplier').length,
    distributors: contacts.filter(c => c.contactType === 'distributor').length,
    resellers: contacts.filter(c => c.contactType === 'reseller').length,
  }

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
            Loading business contacts...
          </p>
        </div>
      </div>
    )
  }


  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header - Professional Style */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Business Contacts Overview</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage suppliers, distributors, and resellers</p>
      </div>

      {/* Stats Cards - Professional Corporate Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Contacts - Blue */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
              <Users className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Total Contacts</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 tabular-nums">{stats.total}</p>
            </div>
          </div>
        </Card>

        {/* Suppliers - Emerald */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/30">
              <Building2 className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Suppliers</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 tabular-nums">{stats.suppliers}</p>
            </div>
          </div>
        </Card>

        {/* Distributors - Green */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-600 shadow-lg shadow-green-500/30">
              <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Distributors</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 tabular-nums">{stats.distributors}</p>
            </div>
          </div>
        </Card>

        {/* Resellers - Purple */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 shadow-lg shadow-purple-500/30">
              <Briefcase className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Resellers</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 tabular-nums">{stats.resellers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters - Professional Design */}
      <Card className="mb-6 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-5">
            <Search className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Search & Filter Contacts</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Contact Type Filter */}
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                  <SelectItem value="distributor">Distributors</SelectItem>
                  <SelectItem value="reseller">Resellers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="company-asc">Company (A-Z)</SelectItem>
                  <SelectItem value="type-asc">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredContacts.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{contacts.length}</span> contacts
            </div>
            {(search || typeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setTypeFilter("all")
                }}
                className="h-8 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <X className="h-3 w-3" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Contact Button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 font-semibold"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add Contact
        </Button>
      </div>


      {/* Contacts Table - Professional Design */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Contacts Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                {search || typeFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Get started by adding your first business contact"}
              </p>
              {!search && typeFilter === "all" && (
                <Button onClick={() => setAddDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] lg:min-w-full text-sm table-fixed">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-black dark:bg-black">
                      <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[20%]">Name/Company</th>
                      <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[15%]">Contact Person</th>
                      <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[10%]">Type</th>
                      <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[20%]">Contact Info</th>
                      <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[20%]">Address</th>
                      <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[15%]">Notes</th>
                      {isAdmin && (
                        <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {paginatedContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{contact.name}</div>
                          {contact.companyName && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{contact.companyName}</div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            {contact.contactPerson || "-"}
                          </div>
                          {contact.position && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{contact.position}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge className={`${getTypeColor(contact.contactType)} border text-xs font-semibold px-2 py-0.5`}>
                            {contact.contactType.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            {contact.email && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            {!contact.email && !contact.phone && <span className="text-xs text-slate-400">-</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {contact.address || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {contact.notes || "-"}
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openDetailsDialog(contact)}
                                      className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                                      onClick={() => openEditDialog(contact)}
                                      className="h-8 w-8 p-0 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                      <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Contact</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openDeleteDialog(contact)}
                                      className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Contact</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Professional Design */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Showing <span className="font-bold text-slate-900 dark:text-white">{startIndex + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(endIndex, filteredContacts.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredContacts.length}</span> contacts
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-9 px-4 font-semibold"
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
                            className={`w-9 h-9 p-0 font-semibold ${currentPage === pageNum ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
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
                      className="h-9 px-4 font-semibold"
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


      {/* Add Contact Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Business Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name/Company Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ABC Corporation"
                />
              </div>
              <div>
                <Label htmlFor="contactType">Contact Type *</Label>
                <Select 
                  value={formData.contactType} 
                  onValueChange={(value: 'supplier' | 'distributor' | 'reseller') => 
                    setFormData({ ...formData, contactType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="reseller">Reseller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="position">Position/Title</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Sales Manager"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+63 912 345 6789"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Business St, Manila"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Contact</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name/Company Name *</Label>
                <Input
                  id="edit-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-contactType">Contact Type *</Label>
                <Select 
                  value={formData.contactType} 
                  onValueChange={(value: 'supplier' | 'distributor' | 'reseller') => 
                    setFormData({ ...formData, contactType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="reseller">Reseller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-contactPerson">Contact Person</Label>
                <Input
                  id="edit-contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-position">Position/Title</Label>
                <Input
                  id="edit-position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
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

      {/* Contact Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {selectedContact.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={`${getTypeColor(selectedContact.contactType)} border`}>
                      {selectedContact.contactType.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDetailsDialogOpen(false)
                    openEditDialog(selectedContact)
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">Business Information</h4>
                {selectedContact.companyName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{selectedContact.companyName}</span>
                  </div>
                )}
                {selectedContact.contactPerson && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {selectedContact.contactPerson}
                      {selectedContact.position && ` - ${selectedContact.position}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">Contact Information</h4>
                {selectedContact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{selectedContact.email}</span>
                  </div>
                )}
                {selectedContact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{selectedContact.phone}</span>
                  </div>
                )}
                {selectedContact.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{selectedContact.address}</span>
                  </div>
                )}
              </div>

              {selectedContact.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Notes</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {selectedContact.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Added on {new Date(selectedContact.createdAt || Date.now()).toLocaleDateString()}
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
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong>{selectedContact?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
