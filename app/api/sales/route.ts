import { type NextRequest, NextResponse } from "next/server"
import { addTransaction, updateInventoryItem, getInventoryItems, addLog } from "@/lib/google-sheets"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, department } = body

    if (!department) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 })
    }

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
        department,
      })

      await updateInventoryItem(inventoryItem.id, {
        quantity: inventoryItem.quantity - saleItem.quantity,
      })

      await addLog({
        operation: "sale",
        itemId: inventoryItem.id,
        itemName: inventoryItem.name,
        details: `Sold "${inventoryItem.name}" - Qty: ${saleItem.quantity}, Total: ₱${totalRevenue.toFixed(2)}, Department: ${department}`
      })

      transactions.push(transaction)
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Error processing sale:", error)
    return NextResponse.json({ error: "Failed to process sale" }, { status: 500 })
  }
}
