/**
 * Offline Storage Manager using IndexedDB
 * Provides offline-first capabilities for the inventory system
 */

import type { InventoryItem, Transaction, Customer } from "./types"

const DB_NAME = 'InventoryProDB'
const DB_VERSION = 1

interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'item' | 'transaction' | 'customer'
  data: any
  timestamp: number
  synced: boolean
  error?: string
}

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('items')) {
          db.createObjectStore('items', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          syncStore.createIndex('synced', 'synced', { unique: false })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
  }

  // Items
  async saveItems(items: InventoryItem[]): Promise<void> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['items'], 'readwrite')
    const store = transaction.objectStore('items')

    for (const item of items) {
      store.put(item)
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getItems(): Promise<InventoryItem[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['items'], 'readonly')
      const store = transaction.objectStore('items')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async saveItem(item: InventoryItem): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['items'], 'readwrite')
      const store = transaction.objectStore('items')
      const request = store.put(item)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteItem(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['items'], 'readwrite')
      const store = transaction.objectStore('items')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Transactions
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['transactions'], 'readwrite')
    const store = transaction.objectStore('transactions')

    for (const txn of transactions) {
      store.put(txn)
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getTransactions(): Promise<Transaction[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readonly')
      const store = transaction.objectStore('transactions')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Customers
  async saveCustomers(customers: Customer[]): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['customers'], 'readwrite')
    const store = transaction.objectStore('customers')

    for (const customer of customers) {
      store.put(customer)
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getCustomers(): Promise<Customer[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['customers'], 'readonly')
      const store = transaction.objectStore('customers')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Sync Queue
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    if (!this.db) await this.init()

    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      synced: false
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.add(queueItem)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const index = store.index('synced')
      const request = index.getAll(IDBKeyRange.only(false))

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.synced = true
          store.put(item)
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async clearSyncedItems(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const index = store.index('synced')
      const request = index.openCursor(true)

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  // Metadata
  async setMetadata(key: string, value: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite')
      const store = transaction.objectStore('metadata')
      const request = store.put({ key, value, timestamp: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getMetadata(key: string): Promise<any> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly')
      const store = transaction.objectStore('metadata')
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result?.value)
      request.onerror = () => reject(request.error)
    })
  }

  // Clear all data
  async clearAll(): Promise<void> {
    if (!this.db) await this.init()

    const stores = ['items', 'transactions', 'customers', 'syncQueue', 'metadata']
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite')

      for (const storeName of stores) {
        transaction.objectStore(storeName).clear()
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()

// Sync manager
export class SyncManager {
  private syncing = false

  async syncToServer(): Promise<{ success: number; failed: number }> {
    if (this.syncing) {
      console.log('Sync already in progress')
      return { success: 0, failed: 0 }
    }

    this.syncing = true
    let success = 0
    let failed = 0

    try {
      const queue = await offlineStorage.getSyncQueue()
      
      for (const item of queue) {
        try {
          await this.processSyncItem(item)
          await offlineStorage.markSynced(item.id)
          success++
        } catch (error) {
          console.error('Failed to sync item:', item, error)
          failed++
        }
      }

      // Clear synced items
      await offlineStorage.clearSyncedItems()

      // Update last sync time
      await offlineStorage.setMetadata('lastSync', Date.now())

    } finally {
      this.syncing = false
    }

    return { success, failed }
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    const endpoint = this.getEndpoint(item.entity)
    const method = this.getMethod(item.type)

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data)
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
  }

  private getEndpoint(entity: string): string {
    const endpoints = {
      item: '/api/items',
      transaction: '/api/sales',
      customer: '/api/customers'
    }
    return endpoints[entity] || '/api/items'
  }

  private getMethod(type: string): string {
    const methods = {
      create: 'POST',
      update: 'PUT',
      delete: 'DELETE'
    }
    return methods[type] || 'POST'
  }

  async getLastSyncTime(): Promise<number | null> {
    return await offlineStorage.getMetadata('lastSync')
  }
}

export const syncManager = new SyncManager()
