import { NextResponse } from "next/server"
import { getCategories, addCategory } from "@/lib/google-sheets"

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const category = await addCategory(name.trim())
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error adding category:", error)
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 })
  }
}
