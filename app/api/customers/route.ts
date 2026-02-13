import { type NextRequest, NextResponse } from "next/server"
import { getCustomers, addCustomer, calculateCustomerTier } from "@/lib/customer-management"
import { getCachedData, invalidateCachePattern } from "@/lib/cache"
import { withAuth, withAdmin } from "@/lib/api-helpers"

export const GET = withAuth(async (request, { user }) => {
  try {
    const customers = await getCachedData(
      'customers',
      () => getCustomers(),
      2 * 60 * 1000 // 2 minutes
    )
    return NextResponse.json(customers)
  } catch (error) {
    console.error("[API] Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
})

export const POST = withAdmin(async (request, { user }) => {
  try {
    const body = await request.json()
    
    // Calculate tier based on initial total spent
    const tier = await calculateCustomerTier(body.totalSpent || 0)
    
    const customer = await addCustomer({
      ...body,
      tier,
      loyaltyPoints: body.loyaltyPoints || 0,
      totalPurchases: body.totalPurchases || 0,
      totalSpent: body.totalSpent || 0
    })
    
    invalidateCachePattern('customers')
    
    return NextResponse.json(customer)
  } catch (error) {
    console.error("[API] Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
})
