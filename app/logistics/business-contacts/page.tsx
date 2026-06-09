"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, Users, Building2, TrendingUp, Mail, Phone, 
  X, Briefcase
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { BusinessContact } from "@/lib/types"
import { apiGet } from "@/lib/api-client"
import { BrandLoader } from '@/components/ui/brand-loader'

export default function LogisticsBusinessContactsPage() {
  const [contacts, setContacts] = useState<BusinessContact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<BusinessContact[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [search, typeFilter, contacts])

  async function fetchContacts() {
    try {
      const data = await apiGet<BusinessContact[]>("/api/business-contacts")
      setContacts(data)
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast.error(error instanceof Error ? error.message : "Failed to fetch contacts")
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

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name))

    setFilteredContacts(filtered)
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
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Business Contacts</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View suppliers, distributors, and resellers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Contacts */}
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

        {/* Suppliers */}
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

        {/* Distributors */}
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

        {/* Resellers */}
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

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-7 text-xs border-slate-300 dark:border-slate-700"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-7 w-[140px] text-xs bg-white dark:bg-slate-800">
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

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
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
            className="h-7 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <X className="h-3 w-3" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Contacts Table */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Contacts Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {search || typeFilter !== "all" ? "Try adjusting your filters" : "No contacts available"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-black dark:bg-black">
                  <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50">Name/Company</th>
                  <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50">Contact Person</th>
                  <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50">Type</th>
                  <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50">Contact Info</th>
                  <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50">Address</th>
                  <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {paginatedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{contact.name}</div>
                      {contact.companyName && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                          <span>{contact.companyName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                        {contact.contactPerson || "-"}
                      </div>
                      {contact.position && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Briefcase className="h-3 w-3 flex-shrink-0" />
                          <span>{contact.position}</span>
                        </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 py-4 shadow-lg">
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
    </div>
  )
}
