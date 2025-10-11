import { type NextRequest, NextResponse } from "next/server"
import { updateInventoryItem, getInventoryItems, addTransaction, addLog } from "@/lib/google-sheets"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    const items = await getInventoryItems()
    const item = items.find((i) => i.id === params.id)

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const newQuantity = item.quantity + amount

    await updateInventoryItem(params.id, {
      quantity: newQuantity,
    })

    // Record as transaction
    await addTransaction({
      itemId: params.id,
      itemName: item.name,
      quantity: amount,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      totalCost: item.costPrice * amount,
      totalRevenue: 0,
      profit: 0,
      type: "restock",
      paymentMethod: "",
      referenceNumber: "",
    })

    // Log the operation
    await addLog({
      operation: "restock",
      itemId: params.id,
      itemName: item.name,
      details: `Added ${amount} units (total cost: $${(item.costPrice * amount).toFixed(2)})`,
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
