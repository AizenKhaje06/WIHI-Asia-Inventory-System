/**
 * Migration Script: Google Sheets → Supabase
 * 
 * This script copies all data from Google Sheets to Supabase
 * Run with: npx tsx scripts/migrate-to-supabase.ts
 */

import * as googleSheets from '../lib/google-sheets'
import * as supabaseDb from '../lib/supabase-db'

async function migrateData() {
  console.log('🚀 Starting migration from Google Sheets to Supabase...\n')

  try {
    // 1. Migrate Storage Rooms
    console.log('📦 Migrating Storage Rooms...')
    const storageRooms = await googleSheets.getStorageRooms()
    console.log(`   Found ${storageRooms.length} storage rooms`)
    
    for (const room of storageRooms) {
      try {
        await supabaseDb.addStorageRoom(room.name)
        console.log(`   ✅ Migrated: ${room.name}`)
      } catch (error: any) {
        console.log(`   ⚠️  Skipped (may already exist): ${room.name}`)
      }
    }

    // 2. Migrate Categories
    console.log('\n📂 Migrating Categories...')
    const categories = await googleSheets.getCategories()
    console.log(`   Found ${categories.length} categories`)
    
    for (const category of categories) {
      try {
        await supabaseDb.addCategory(category.name)
        console.log(`   ✅ Migrated: ${category.name}`)
      } catch (error: any) {
        console.log(`   ⚠️  Skipped (may already exist): ${category.name}`)
      }
    }

    // 3. Migrate Users/Accounts
    console.log('\n👥 Migrating User Accounts...')
    const accounts = await googleSheets.getAccounts()
    console.log(`   Found ${accounts.length} accounts`)
    
    for (const account of accounts) {
      try {
        await supabaseDb.addAccount({
          username: account.username,
          password: account.password,
          role: account.role,
          displayName: account.displayName,
        })
        console.log(`   ✅ Migrated: ${account.username} (${account.role})`)
      } catch (error: any) {
        console.log(`   ⚠️  Skipped (may already exist): ${account.username}`)
      }
    }

    // 4. Migrate Inventory
    console.log('\n📊 Migrating Inventory Items...')
    const inventory = await googleSheets.getInventoryItems()
    console.log(`   Found ${inventory.length} inventory items`)
    
    for (const item of inventory) {
      try {
        await supabaseDb.addInventoryItem({
          name: item.name,
          category: item.category,
          storageRoom: item.storageRoom,
          quantity: item.quantity,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          reorderLevel: item.reorderLevel,
          totalCOGS: item.totalCOGS,
        })
        console.log(`   ✅ Migrated: ${item.name} (${item.quantity} units)`)
      } catch (error: any) {
        console.log(`   ❌ Error migrating ${item.name}:`, error.message)
      }
    }

    // 5. Migrate Transactions
    console.log('\n💰 Migrating Transactions...')
    const transactions = await googleSheets.getTransactions()
    console.log(`   Found ${transactions.length} transactions`)
    
    for (const txn of transactions) {
      try {
        await supabaseDb.addTransaction({
          itemId: txn.itemId,
          itemName: txn.itemName,
          quantity: txn.quantity,
          costPrice: txn.costPrice,
          sellingPrice: txn.sellingPrice,
          totalCost: txn.totalCost,
          profit: txn.profit,
          department: txn.department,
          staffName: txn.staffName,
          notes: txn.notes,
          transactionType: txn.transactionType,
          type: txn.type,
          totalRevenue: txn.totalRevenue,
        })
        console.log(`   ✅ Migrated: ${txn.itemName} - ${txn.transactionType}`)
      } catch (error: any) {
        console.log(`   ❌ Error migrating transaction:`, error.message)
      }
    }

    // 6. Migrate Restocks
    console.log('\n📥 Migrating Restocks...')
    const restocks = await googleSheets.getRestocks()
    console.log(`   Found ${restocks.length} restocks`)
    
    for (const restock of restocks) {
      try {
        await supabaseDb.addRestock({
          itemId: restock.itemId,
          itemName: restock.itemName,
          quantity: restock.quantity,
          costPrice: restock.costPrice,
          totalCost: restock.totalCost,
          reason: restock.reason,
        })
        console.log(`   ✅ Migrated: ${restock.itemName} (+${restock.quantity})`)
      } catch (error: any) {
        console.log(`   ❌ Error migrating restock:`, error.message)
      }
    }

    // 7. Migrate Logs
    console.log('\n📝 Migrating Logs...')
    const logs = await googleSheets.getLogs()
    console.log(`   Found ${logs.length} logs`)
    
    for (const log of logs) {
      try {
        await supabaseDb.addLog({
          operation: log.operation,
          itemId: log.itemId,
          itemName: log.itemName,
          details: log.details,
        })
        console.log(`   ✅ Migrated: ${log.operation}`)
      } catch (error: any) {
        console.log(`   ❌ Error migrating log:`, error.message)
      }
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   Storage Rooms: ${storageRooms.length}`)
    console.log(`   Categories: ${categories.length}`)
    console.log(`   Users: ${accounts.length}`)
    console.log(`   Inventory Items: ${inventory.length}`)
    console.log(`   Transactions: ${transactions.length}`)
    console.log(`   Restocks: ${restocks.length}`)
    console.log(`   Logs: ${logs.length}`)

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('\n🎉 All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
