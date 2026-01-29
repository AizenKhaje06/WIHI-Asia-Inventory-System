"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Warehouse, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { StorageRoom } from "@/lib/types"

export default function SettingsPage() {
  const [rooms, setRooms] = useState<StorageRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<StorageRoom | null>(null)
  const [roomName, setRoomName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  async function fetchRooms() {
    try {
      setLoading(true)
      const response = await fetch("/api/storage-rooms")
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error("Error fetching storage rooms:", error)
      toast.error("Failed to load storage rooms")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRoom() {
    if (!roomName.trim()) {
      toast.error("Please enter a room name")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch("/api/storage-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim() })
      })

      if (response.ok) {
        toast.success("Storage room added successfully")
        setAddDialogOpen(false)
        setRoomName("")
        fetchRooms()
      } else {
        toast.error("Failed to add storage room")
      }
    } catch (error) {
      console.error("Error adding storage room:", error)
      toast.error("Failed to add storage room")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditRoom() {
    if (!selectedRoom || !roomName.trim()) {
      toast.error("Please enter a room name")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/storage-rooms/${selectedRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim() })
      })

      if (response.ok) {
        toast.success("Storage room updated successfully")
        setEditDialogOpen(false)
        setSelectedRoom(null)
        setRoomName("")
        fetchRooms()
      } else {
        toast.error("Failed to update storage room")
      }
    } catch (error) {
      console.error("Error updating storage room:", error)
      toast.error("Failed to update storage room")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteRoom() {
    if (!selectedRoom) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/storage-rooms/${selectedRoom.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Storage room deleted successfully")
        setDeleteDialogOpen(false)
        setSelectedRoom(null)
        fetchRooms()
      } else {
        toast.error("Failed to delete storage room")
      }
    } catch (error) {
      console.error("Error deleting storage room:", error)
      toast.error("Failed to delete storage room")
    } finally {
      setSubmitting(false)
    }
  }

  function openEditDialog(room: StorageRoom) {
    setSelectedRoom(room)
    setRoomName(room.name)
    setEditDialogOpen(true)
  }

  function openDeleteDialog(room: StorageRoom) {
    setSelectedRoom(room)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Configure your inventory system
        </p>
      </div>

      <div className="space-y-6">
        {/* Storage Rooms Management */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <div className="p-2 rounded-[5px] bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  Storage Rooms
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                  Manage your warehouse storage locations
                </CardDescription>
              </div>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <Warehouse className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No storage rooms yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Add your first storage room to get started</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 rounded-[5px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-[5px] bg-orange-100 dark:bg-orange-900/30">
                        <Warehouse className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{room.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Created: {room.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(room)}
                        className="text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(room)}
                        className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Room Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Storage Room</DialogTitle>
            <DialogDescription>
              Create a new storage location for your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder="e.g., Warehouse B - Section 3"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRoom()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setRoomName("")
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRoom}
              disabled={submitting || !roomName.trim()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Storage Room</DialogTitle>
            <DialogDescription>
              Update the storage room name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-room-name">Room Name</Label>
              <Input
                id="edit-room-name"
                placeholder="e.g., Warehouse B - Section 3"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditRoom()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setSelectedRoom(null)
                setRoomName("")
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditRoom}
              disabled={submitting || !roomName.trim()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Update Room
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Storage Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedRoom?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
