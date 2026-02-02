import { type NextRequest, NextResponse } from "next/server"
// Using Supabase as primary database
import { addTransaction, updateInventoryItem, getInventoryItems, addLog } from "@/lib/supabase-db"
import { invalidateCachePattern } from "@/lib/cache"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, department, staffName, notes } = body

    if (!department) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 })
    }

    // Determine transaction type based on destination
    const nonSalesDestinations = ['Demo/Display', 'Internal Use', 'Warehouse']
    const transactionType = nonSalesDestinations.includes(department) 
      ? (department === 'Demo/Display' ? 'demo' : department === 'Internal Use' ? 'internal' : 'transfer')
      : 'sale'

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
      // For non-sales movements, revenue = 0 (no actual sale)
      const totalRevenue = transactionType === 'sale' ? inventoryItem.sellingPrice * saleItem.quantity : 0
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
        transactionType,
        department,
        staffName,
        notes,
      })

      await updateInventoryItem(inventoryItem.id, {
        quantity: inventoryItem.quantity - saleItem.quantity,
      })

      const operationType = transactionType === 'sale' ? 'dispatch' : transactionType
      await addLog({
        operation: operationType,
        itemId: inventoryItem.id,
        itemName: inventoryItem.name,
        details: `${transactionType === 'sale' ? 'Dispatched' : transactionType === 'demo' ? 'Demo/Display' : transactionType === 'internal' ? 'Internal Use' : 'Transferred'} "${inventoryItem.name}" - Qty: ${saleItem.quantity}, ${transactionType === 'sale' ? `Total: ₱${totalRevenue.toFixed(2)}, ` : ''}Department: ${department}, Staff: ${staffName || 'N/A'}`
      })

      transactions.push(transaction)
    }

    // Invalidate all relevant caches after sale
    invalidateCachePattern('inventory')
    invalidateCachePattern('transactions')
    invalidateCachePattern('dashboard')

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[API] Error processing sale:", error)
    return NextResponse.json({ error: "Failed to process sale" }, { status: 500 })
  }
}
