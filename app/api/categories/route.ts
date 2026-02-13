import { type NextRequest, NextResponse } from "next/server"
import { getCategories, addCategory, addLog } from "@/lib/supabase-db"
import { getCachedData, invalidateCachePattern } from "@/lib/cache"
import { withAuth, withAdmin } from "@/lib/api-helpers"

export const GET = withAuth(async (request, { user }) => {
  try {
    const categories = await getCachedData(
      'categories',
      () => getCategories(),
      5 * 60 * 1000 // 5 minutes
    )
    return NextResponse.json(categories)
  } catch (error) {
    console.error("[API] Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
})

export const POST = withAdmin(async (request, { user }) => {
  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const category = await addCategory(name.trim())
    invalidateCachePattern('categories')
    
    await addLog({
      operation: "create",
      itemId: category.id,
      itemName: name.trim(),
      details: `Created category "${name.trim()}" by ${user.displayName}`
    })
    
    return NextResponse.json(category)
  } catch (error) {
    console.error("[API] Error adding category:", error)
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 })
  }
})
