import { NextResponse } from "next/server"
import { updateStore, deleteStore } from "@/lib/supabase-db"
import { invalidateCachePattern } from "@/lib/cache"
import { withAdmin } from "@/lib/api-helpers"

export const PUT = withAdmin(async (request, { params, user }) => {
  try {
    const { store_name, sales_channel } = await request.json()
    
    if (!store_name || typeof store_name !== 'string' || store_name.trim().length === 0) {
      return NextResponse.json({ error: "Store name is required" }, { status: 400 })
    }

    if (!sales_channel || typeof sales_channel !== 'string' || sales_channel.trim().length === 0) {
      return NextResponse.json({ error: "Sales channel is required" }, { status: 400 })
    }

    await updateStore(params.id, store_name.trim(), sales_channel.trim())
    invalidateCachePattern('stores')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating store:", error)
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 })
  }
})

export const DELETE = withAdmin(async (request, { params, user }) => {
  try {
    await deleteStore(params.id)
    invalidateCachePattern('stores')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting store:", error)
    return NextResponse.json({ error: "Failed to delete store" }, { status: 500 })
  }
})
