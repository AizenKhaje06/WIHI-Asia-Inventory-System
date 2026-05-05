import { type NextRequest, NextResponse } from "next/server"
import { getBusinessContacts, addBusinessContact } from "@/lib/business-contacts"
import { getCachedData, invalidateCachePattern } from "@/lib/cache"
import { withAuth, withAdmin } from "@/lib/api-helpers"

export const GET = withAuth(async (request, { user }) => {
  try {
    const contacts = await getCachedData(
      'business-contacts',
      () => getBusinessContacts(),
      2 * 60 * 1000 // 2 minutes
    )
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("[API] Error fetching business contacts:", error)
    return NextResponse.json({ error: "Failed to fetch business contacts" }, { status: 500 })
  }
})

export const POST = withAdmin(async (request, { user }) => {
  try {
    const body = await request.json()
    
    const contact = await addBusinessContact({
      name: body.name,
      companyName: body.companyName,
      contactPerson: body.contactPerson,
      contactType: body.contactType || 'supplier',
      position: body.position,
      email: body.email,
      phone: body.phone,
      address: body.address,
      notes: body.notes
    })
    
    invalidateCachePattern('business-contacts')
    
    return NextResponse.json(contact)
  } catch (error) {
    console.error("[API] Error creating business contact:", error)
    return NextResponse.json({ error: "Failed to create business contact" }, { status: 500 })
  }
})
