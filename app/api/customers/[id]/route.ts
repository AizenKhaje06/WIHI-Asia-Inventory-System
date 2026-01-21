import { type NextRequest, NextResponse } from "next/server"
import { updateCustomer, getCustomers, calculateCustomerTier } from "@/lib/customer-management"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    // If totalSpent is being updated, recalculate tier
    if (body.totalSpent !== undefined) {
      body.tier = await calculateCustomerTier(body.totalSpent)
    }

    await updateCustomer(id, body)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
}
