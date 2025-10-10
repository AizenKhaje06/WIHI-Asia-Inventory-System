import { type NextRequest, NextResponse } from "next/server"
import { addTransaction, updateInventoryItem, getInventoryItems } from "@/lib/google-sheets"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    const allItems = await getInventoryItems()
    const transactions = []

    for (const saleItem of items) {
      const inventoryItem = allItems.find((item) => item.id === saleItem.itemId)

      if (!inventoryItem) {
        return NextResponse.json({ error: `Item ${saleItem.itemId} not found` }, { status: 404 })
      }

      if (inventoryItem.quantity < saleItem.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${inventoryItem.name}` }, { status: 400 })
      }

      const totalCost = inventoryItem.costPrice * saleItem.quantity
      const totalRevenue = inventoryItem.sellingPrice * saleItem.quantity
      const profit = totalRevenue - totalCost

      const transaction = await addTransaction({
        itemId: inventoryItem.id,
        itemName: inventoryItem.name,
        quantity: saleItem.quantity,
        costPrice: inventoryItem.costPrice,
        sellingPrice: inventoryItem.sellingPrice,
        totalCost,
        totalRevenue,
        profit,
        type: "sale",
      })

      await updateInventoryItem(inventoryItem.id, {
        quantity: inventoryItem.quantity - saleItem.quantity,
      })

      transactions.push(transaction)
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Error processing sale:", error)
    return NextResponse.json({ error: "Failed to process sale" }, { status: 500 })
  }
}
