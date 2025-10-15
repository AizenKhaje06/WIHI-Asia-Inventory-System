import { type NextRequest, NextResponse } from "next/server"
import { getInventoryItems, addInventoryItem, addLog } from "@/lib/google-sheets"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    let items = await getInventoryItems()

    if (search) {
      const searchLower = search.toLowerCase()
    items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error("[v0] Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await addInventoryItem(body)
    await addLog({
      operation: "create",
      itemId: item.id,
      itemName: item.name,
      details: `Added "${item.name}" - Qty: ${item.quantity}, Cost: ₱${item.costPrice.toFixed(2)}, Sell: ₱${item.sellingPrice.toFixed(2)}`
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error("[v0] Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
