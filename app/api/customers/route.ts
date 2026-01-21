import { type NextRequest, NextResponse } from "next/server"
import { getCustomers, addCustomer, calculateCustomerTier } from "@/lib/customer-management"

export async function GET(request: NextRequest) {
  try {
    const customers = await getCustomers()
    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    
    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
