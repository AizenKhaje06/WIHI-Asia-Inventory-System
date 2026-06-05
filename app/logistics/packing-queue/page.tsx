/**
 * Logistics Admin - Packing Queue
 * Reuses the shared packing queue page used by Admin.
 * The underlying API (/api/orders?status=Pending) returns all pending orders
 * which Logistics Admin has full access to pack, edit, cancel, and delete.
 */
export { default } from '@/app/dashboard/packing-queue/page'
