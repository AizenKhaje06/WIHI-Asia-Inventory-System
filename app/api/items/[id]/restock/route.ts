import { type NextRequest, NextResponse } from "next/server"
// Using Supabase as primary database
import { updateInventoryItem, getInventoryItems, addRestock, addLog } from "@/lib/supabase-db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, reason } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 })
    }

    const items = await getInventoryItems()
    const item = items.find((i) => i.id === id)

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const newQuantity = item.quantity + amount

    await updateInventoryItem(id, {
      quantity: newQuantity,
    })

    // Record as restock
    await addRestock({
      itemId: id,
      itemName: item.name,
      quantity: amount,
      costPrice: item.costPrice,
      totalCost: item.costPrice * amount,
      reason,
    })

    // Log the operation with reason
    await addLog({
      operation: "restock",
      itemId: id,
      itemName: item.name,
      details: `Added ${amount} units (total cost: ₱${(item.costPrice * amount).toFixed(2)}) - Reason: ${reason}`,
    })

    return NextResponse.json({ 
      success: true, 
      item: { 
        ...item, 
        quantity: newQuantity 
      } 
    })
  } catch (error) {
    console.error("[v0] Error restocking item:", error)
    return NextResponse.json({ error: "Failed to restock item" }, { status: 500 })
  }
}
