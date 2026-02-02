/**
 * Supabase Database Layer
 * 
 * This file provides the same interface as google-sheets.ts but uses Supabase as the backend.
 * All functions return the same data structures for seamless migration.
 */

import { supabaseAdmin } from './supabase'
import type { InventoryItem, Transaction, Log, Restock } from './types'

// ==================== HELPER FUNCTIONS ====================

const formatTimestamp = (date: Date = new Date()) => {
  // Use Taipei timezone (UTC+8) for accurate local time
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  const formatted = date.toLocaleString('en-US', options)
  const [datePart, timePart] = formatted.split(', ')
  const [month, day, year] = datePart.split('/')
  const [hour, minute] = timePart.split(':')
  const hour24 = parseInt(hour)
  const ampm = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 || 12
  return `${year}-${month}-${day} / ${hour12}:${minute} ${ampm}`
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}`

// ==================== INVENTORY ====================

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching inventory:', error)
    throw new Error(`Failed to fetch inventory: ${error.message}`)
  }

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    storageRoom: item.storage_room,
    quantity: item.quantity,
    totalCOGS: item.total_cogs,
    costPrice: item.cost_price,
    sellingPrice: item.selling_price,
    reorderLevel: item.reorder_level,
    lastUpdated: item.last_updated,
  }))
}

export async function addInventoryItem(item: Omit<InventoryItem, "id" | "lastUpdated">): Promise<InventoryItem> {
  const id = generateId('ITEM')
  const lastUpdated = formatTimestamp()
  const totalCOGS = item.quantity * item.costPrice

  const { data, error } = await supabaseAdmin
    .from('inventory')
    .insert({
      id,
      name: item.name,
      category: item.category,
      storage_room: item.storageRoom,
      quantity: item.quantity,
      total_cogs: totalCOGS,
      cost_price: item.costPrice,
      selling_price: item.sellingPrice,
      reorder_level: item.reorderLevel,
      last_updated: lastUpdated,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding inventory item:', error)
    throw new Error(`Failed to add inventory item: ${error.message}`)
  }

  return { ...item, id, lastUpdated, totalCOGS }
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
  const lastUpdated = formatTimestamp()
  
  // Build update object with snake_case keys
  const updateData: any = {
    last_updated: lastUpdated
  }

  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.storageRoom !== undefined) updateData.storage_room = updates.storageRoom
  if (updates.quantity !== undefined) updateData.quantity = updates.quantity
  if (updates.costPrice !== undefined) updateData.cost_price = updates.costPrice
  if (updates.sellingPrice !== undefined) updateData.selling_price = updates.sellingPrice
  if (updates.reorderLevel !== undefined) updateData.reorder_level = updates.reorderLevel

  // Recalculate totalCOGS if quantity or costPrice changed
  if (updates.quantity !== undefined || updates.costPrice !== undefined) {
    const { data: currentItem } = await supabaseAdmin
      .from('inventory')
      .select('quantity, cost_price')
      .eq('id', id)
      .single()

    if (currentItem) {
      const newQuantity = updates.quantity ?? currentItem.quantity
      const newCostPrice = updates.costPrice ?? currentItem.cost_price
      updateData.total_cogs = newQuantity * newCostPrice
    }
  }

  const { error } = await supabaseAdmin
    .from('inventory')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating inventory item:', error)
    throw new Error(`Failed to update inventory item: ${error.message}`)
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('inventory')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting inventory item:', error)
    throw new Error(`Failed to delete inventory item: ${error.message}`)
  }
}

// ==================== TRANSACTIONS ====================

export async function addTransaction(transaction: Omit<Transaction, "id" | "timestamp">): Promise<Transaction> {
  const id = generateId('TXN')
  const timestamp = formatTimestamp()

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert({
      id,
      item_id: transaction.itemId,
      item_name: transaction.itemName,
      quantity: transaction.quantity,
      cost_price: transaction.costPrice,
      selling_price: transaction.sellingPrice,
      total_cost: transaction.totalCost,
      profit: transaction.profit,
      timestamp,
      department: transaction.department || '',
      staff_name: transaction.staffName || '',
      notes: transaction.notes || '',
      transaction_type: transaction.transactionType || 'sale',
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding transaction:', error)
    throw new Error(`Failed to add transaction: ${error.message}`)
  }

  return { ...transaction, id, timestamp }
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return (data || []).map(row => {
    const quantity = row.quantity
    const sellingPrice = row.selling_price
    const transactionType = row.transaction_type as 'sale' | 'demo' | 'internal' | 'transfer'
    const totalRevenue = transactionType === 'sale' ? quantity * sellingPrice : 0

    return {
      id: row.id,
      itemId: row.item_id,
      itemName: row.item_name,
      quantity,
      costPrice: row.cost_price,
      sellingPrice,
      totalCost: row.total_cost,
      totalRevenue,
      profit: row.profit,
      timestamp: row.timestamp,
      type: 'sale' as 'sale' | 'restock',
      transactionType,
      department: row.department,
      staffName: row.staff_name,
      notes: row.notes,
    }
  })
}

// ==================== LOGS ====================

export async function addLog(log: Omit<Log, "id" | "timestamp">): Promise<Log> {
  const id = generateId('LOG')
  const timestamp = formatTimestamp()

  const { data, error } = await supabaseAdmin
    .from('logs')
    .insert({
      id,
      operation: log.operation,
      item_id: log.itemId || '',
      item_name: log.itemName || '',
      details: log.details,
      timestamp,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding log:', error)
    throw new Error(`Failed to add log: ${error.message}`)
  }

  return { ...log, id, timestamp }
}

export async function getLogs(): Promise<Log[]> {
  const { data, error } = await supabaseAdmin
    .from('logs')
    .select('*')
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching logs:', error)
    throw new Error(`Failed to fetch logs: ${error.message}`)
  }

  return (data || []).map(row => ({
    id: row.id,
    operation: row.operation,
    itemId: row.item_id,
    itemName: row.item_name,
    details: row.details,
    timestamp: row.timestamp,
  }))
}

// ==================== RESTOCKS ====================

export async function addRestock(restock: Omit<Restock, "id" | "timestamp">): Promise<Restock> {
  const id = generateId('RSTK')
  const timestamp = formatTimestamp()

  const { data, error } = await supabaseAdmin
    .from('restocks')
    .insert({
      id,
      item_id: restock.itemId,
      item_name: restock.itemName,
      quantity: restock.quantity,
      cost_price: restock.costPrice,
      total_cost: restock.totalCost,
      timestamp,
      reason: restock.reason,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding restock:', error)
    throw new Error(`Failed to add restock: ${error.message}`)
  }

  return { ...restock, id, timestamp }
}

export async function getRestocks(): Promise<Restock[]> {
  const { data, error } = await supabaseAdmin
    .from('restocks')
    .select('*')
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching restocks:', error)
    throw new Error(`Failed to fetch restocks: ${error.message}`)
  }

  return (data || []).map(row => ({
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name,
    quantity: row.quantity,
    costPrice: row.cost_price,
    totalCost: row.total_cost,
    timestamp: row.timestamp,
    reason: row.reason,
  }))
}

// ==================== STORAGE ROOMS ====================

export interface StorageRoom {
  id: string
  name: string
  createdAt: string
}

export async function getStorageRooms(): Promise<StorageRoom[]> {
  const { data, error } = await supabaseAdmin
    .from('storage_rooms')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching storage rooms:', error)
    throw new Error(`Failed to fetch storage rooms: ${error.message}`)
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }))
}

export async function addStorageRoom(name: string): Promise<StorageRoom> {
  const id = generateId('ROOM')
  const createdAt = formatTimestamp()

  const { data, error } = await supabaseAdmin
    .from('storage_rooms')
    .insert({
      id,
      name,
      created_at: createdAt,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding storage room:', error)
    throw new Error(`Failed to add storage room: ${error.message}`)
  }

  return { id, name, createdAt }
}

export async function updateStorageRoom(id: string, name: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('storage_rooms')
    .update({ name })
    .eq('id', id)

  if (error) {
    console.error('Error updating storage room:', error)
    throw new Error(`Failed to update storage room: ${error.message}`)
  }
}

export async function deleteStorageRoom(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('storage_rooms')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting storage room:', error)
    throw new Error(`Failed to delete storage room: ${error.message}`)
  }
}

// ==================== CATEGORIES ====================

export interface Category {
  id: string
  name: string
  createdAt: string
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }))
}

export async function addCategory(name: string): Promise<Category> {
  const id = generateId('CAT')
  const createdAt = formatTimestamp()

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      id,
      name,
      created_at: createdAt,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding category:', error)
    throw new Error(`Failed to add category: ${error.message}`)
  }

  return { id, name, createdAt }
}

export async function updateCategory(id: string, name: string): Promise<void> {
  const { error} = await supabaseAdmin
    .from('categories')
    .update({ name })
    .eq('id', id)

  if (error) {
    console.error('Error updating category:', error)
    throw new Error(`Failed to update category: ${error.message}`)
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    throw new Error(`Failed to delete category: ${error.message}`)
  }
}

// ==================== ACCOUNTS/USERS ====================

export interface Account {
  id: string
  username: string
  password: string
  role: 'admin' | 'operations'
  displayName: string
  createdAt: string
}

export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('username', { ascending: true })

  if (error) {
    console.error('Error fetching accounts:', error)
    throw new Error(`Failed to fetch accounts: ${error.message}`)
  }

  return (data || []).map(row => ({
    id: row.id,
    username: row.username,
    password: row.password,
    role: row.role as 'admin' | 'operations',
    displayName: row.display_name,
    createdAt: row.created_at,
  }))
}

export async function getAccountByUsername(username: string): Promise<Account | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    username: data.username,
    password: data.password,
    role: data.role as 'admin' | 'operations',
    displayName: data.display_name,
    createdAt: data.created_at,
  }
}

export async function validateCredentials(username: string, password: string): Promise<Account | null> {
  const account = await getAccountByUsername(username)
  if (account && account.password === password) {
    return account
  }
  return null
}

export async function updateAccount(username: string, updates: { password?: string; displayName?: string }): Promise<void> {
  const updateData: any = {}
  if (updates.password !== undefined) updateData.password = updates.password
  if (updates.displayName !== undefined) updateData.display_name = updates.displayName

  const { error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('username', username)

  if (error) {
    console.error('Error updating account:', error)
    throw new Error(`Failed to update account: ${error.message}`)
  }
}

export async function updateUsername(oldUsername: string, newUsername: string): Promise<void> {
  // Check if new username already exists
  const existing = await getAccountByUsername(newUsername)
  if (existing) {
    throw new Error('Username already exists')
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ username: newUsername })
    .eq('username', oldUsername)

  if (error) {
    console.error('Error updating username:', error)
    throw new Error(`Failed to update username: ${error.message}`)
  }
}

export async function addAccount(account: Omit<Account, "id" | "createdAt">): Promise<Account> {
  // Check if username already exists
  const existing = await getAccountByUsername(account.username)
  if (existing) {
    throw new Error('Username already exists')
  }

  const id = generateId('USER')
  const createdAt = formatTimestamp()

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      id,
      username: account.username,
      password: account.password,
      role: account.role,
      display_name: account.displayName,
      created_at: createdAt,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding account:', error)
    throw new Error(`Failed to add account: ${error.message}`)
  }

  return {
    id,
    username: account.username,
    password: account.password,
    role: account.role,
    displayName: account.displayName,
    createdAt,
  }
}
