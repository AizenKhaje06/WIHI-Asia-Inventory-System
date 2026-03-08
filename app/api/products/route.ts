import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase"
import { withAuth } from "@/lib/api-helpers"

// GET - Fetch all products (inventory + bundles)
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const store = searchParams.get("store")
    const category = searchParams.get("category")
    const productType = searchParams.get("productType") // 'regular', 'bundle', or 'all'

    let query = supabase
      .from('products_unified')
      .select('*')
      .order('name', { ascending: true })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,sku.ilike.%${search}%`)
    }
    
    if (store && store !== 'all') {
      query = query.eq('store', store)
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (productType && productType !== 'all') {
      query = query.eq('productType', productType)
    }

    const { data, error } = await query

    if (error) {
      console.error('[Products API] Error fetching products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[Products API] Sample item:', data?.[0])

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[Products API] Exception:', error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
})
