import { NextResponse } from "next/server"
// Using Supabase as primary database
import { updateCategory, deleteCategory } from "@/lib/supabase-db"
import { withRoles } from "@/lib/api-helpers"

export const PUT = withRoles(['admin', 'dept-manager'], async (request, { params }) => {
  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    await updateCategory(params.id, name.trim())
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
})

export const DELETE = withRoles(['admin', 'dept-manager'], async (request, { params }) => {
  try {
    await deleteCategory(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
})
