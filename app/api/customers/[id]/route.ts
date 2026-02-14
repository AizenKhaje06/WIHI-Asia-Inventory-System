import { type NextRequest, NextResponse } from "next/server"
import { updateCustomer, getCustomers, calculateCustomerTier, deleteCustomer } from "@/lib/customer-management"
import { invalidateCachePattern } from "@/lib/cache"
import { withAuth, withAdmin } from "@/lib/api-helpers"

export const PUT = withAdmin(async (request, { params, user }) => {
  try {
    const body = await request.json()
    const { id } = params

    console.log('PUT request received for customer:', id, body)

    // If totalSpent is being updated and tier is not provided, recalculate tier
    if (body.totalSpent !== undefined && body.tier === undefined) {
      body.tier = await calculateCustomerTier(body.totalSpent)
    }

    await updateCustomer(id, body)
    
    // Invalidate cache after update
    invalidateCachePattern('customers')
    
    console.log('Customer updated successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
})

export const GET = withAuth(async (request, { params, user }) => {
  try {
    const { id } = params
    const customers = await getCustomers()
    const customer = customers.find(c => c.id === id)

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
})

export const DELETE = withAdmin(async (request, { params, user }) => {
  try {
    const { id } = params
    await deleteCustomer(id)
    
    // Invalidate cache after delete
    invalidateCachePattern('customers')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
})
