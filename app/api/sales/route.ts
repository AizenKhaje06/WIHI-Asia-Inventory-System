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
    const transactionType = department.startsWith('Demo/Display') 
      ? 'demo' 
      : department.startsWith('Internal Use')
      ? 'internal'
      : department.startsWith('Warehouse')
      ? 'transfer'
      : 'sale'

    // Extract destination storage room for warehouse transfers
    const destinationStorage = transactionType === 'transfer' && department.includes(' / ')
      ? department.split(' / ')[1]
      : null

    const allItems = await getInventoryItems()
    const transactions = []

    // Process items sequentially to avoid race conditions
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

      // Handle warehouse transfer differently
      if (transactionType === 'transfer' && destinationStorage) {
        // Find if item already exists in destination storage
        const destinationItem = allItems.find(
          (item) => item.name === inventoryItem.name && 
                    item.storageRoom === destinationStorage &&
                    item.id !== inventoryItem.id
        )

        if (destinationItem) {
          // Item exists in destination - add quantity
          await Promise.all([
            // Subtract from source
            updateInventoryItem(inventoryItem.id, {
              quantity: inventoryItem.quantity - saleItem.quantity,
            }),
            // Add to destination
            updateInventoryItem(destinationItem.id, {
              quantity: destinationItem.quantity + saleItem.quantity,
            }),
            // Log the transfer
            addLog({
              operation: 'warehouse',
              itemId: inventoryItem.id,
              itemName: inventoryItem.name,
              details: `Transferred "${inventoryItem.name}" from ${inventoryItem.storageRoom} to ${destinationStorage} - Qty: ${saleItem.quantity}, Staff: ${staffName || 'N/A'}`
            }),
            // Record transaction
            addTransaction({
              itemId: inventoryItem.id,
              itemName: inventoryItem.name,
              quantity: saleItem.quantity,
              costPrice: inventoryItem.costPrice,
              sellingPrice: inventoryItem.sellingPrice,
              totalCost,
              totalRevenue: 0,
              profit: 0,
              type: "sale",
              transactionType: 'transfer',
              department,
              staffName,
              notes: `Transfer from ${inventoryItem.storageRoom} to ${destinationStorage}`,
            })
          ])
        } else {
          // Item doesn't exist in destination - create new entry
          const { addInventoryItem } = await import('@/lib/supabase-db')
          
          await Promise.all([
            // Subtract from source
            updateInventoryItem(inventoryItem.id, {
              quantity: inventoryItem.quantity - saleItem.quantity,
            }),
            // Create in destination
            addInventoryItem({
              name: inventoryItem.name,
              category: inventoryItem.category,
              storageRoom: destinationStorage,
              quantity: saleItem.quantity,
              totalCOGS: totalCost,
              costPrice: inventoryItem.costPrice,
              sellingPrice: inventoryItem.sellingPrice,
              reorderLevel: inventoryItem.reorderLevel,
            }),
            // Log the transfer
            addLog({
              operation: 'warehouse',
              itemId: inventoryItem.id,
              itemName: inventoryItem.name,
              details: `Transferred "${inventoryItem.name}" from ${inventoryItem.storageRoom} to ${destinationStorage} (new entry) - Qty: ${saleItem.quantity}, Staff: ${staffName || 'N/A'}`
            }),
            // Record transaction
            addTransaction({
              itemId: inventoryItem.id,
              itemName: inventoryItem.name,
              quantity: saleItem.quantity,
              costPrice: inventoryItem.costPrice,
              sellingPrice: inventoryItem.sellingPrice,
              totalCost,
              totalRevenue: 0,
              profit: 0,
              type: "sale",
              transactionType: 'transfer',
              department,
              staffName,
              notes: `Transfer from ${inventoryItem.storageRoom} to ${destinationStorage} (new entry)`,
            })
          ])
        }
      } else {
        // Regular sale/demo/internal use - just subtract from inventory
        const [transaction] = await Promise.all([
          addTransaction({
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
          }),
          updateInventoryItem(inventoryItem.id, {
            quantity: inventoryItem.quantity - saleItem.quantity,
          }),
          addLog({
            operation: transactionType === 'sale' ? 'sale' : transactionType === 'demo' ? 'demo-display' : transactionType === 'internal' ? 'internal-usage' : 'warehouse',
            itemId: inventoryItem.id,
            itemName: inventoryItem.name,
            details: `${transactionType === 'sale' ? 'Dispatched' : transactionType === 'demo' ? 'Demo/Display' : transactionType === 'internal' ? 'Internal Use' : 'Transferred'} "${inventoryItem.name}" - Qty: ${saleItem.quantity}, ${transactionType === 'sale' ? `Total: ₱${totalRevenue.toFixed(2)}, ` : ''}Department: ${department}, Staff: ${staffName || 'N/A'}`
          })
        ])

        transactions.push(transaction)
      }
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
