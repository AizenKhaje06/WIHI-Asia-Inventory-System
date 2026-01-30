"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { User, Lock, Eye, EyeOff, Shield, CheckCircle2, Users, Loader2 } from "lucide-react"
import { showSuccess, showError } from "@/lib/toast-utils"
import { getCurrentUser, type UserRole } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  // User Management States
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [changeUsernameOpen, setChangeUsernameOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get current user only on client side to avoid hydration errors
    setCurrentUser(getCurrentUser())
  }, [])

  // User Management Functions
  function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      showError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      showError("Password must be at least 6 characters")
      return
    }

    // Update password in Google Sheets
    setSubmitting(true)
    fetch("/api/accounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updatePassword",
        username: currentUser?.username,
        password: newPassword
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showSuccess("Password changed successfully", "Please remember your new password")
          
          // Reset form
          setChangePasswordOpen(false)
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        } else {
          showError(data.error || "Failed to change password")
        }
      })
      .catch(error => {
        console.error("Error changing password:", error)
        showError("Failed to change password")
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  function handleChangeUsername() {
    if (!newUsername.trim()) {
      showError("Please enter a new username")
      return
    }

    if (newUsername.length < 3) {
      showError("Username must be at least 3 characters")
      return
    }

    // Update username in Google Sheets
    setSubmitting(true)
    fetch("/api/accounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateUsername",
        username: currentUser?.username,
        newUsername: newUsername.trim()
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update localStorage
          localStorage.setItem('username', newUsername.trim())
          localStorage.setItem('displayName', newUsername.trim())

          showSuccess("Username changed successfully", "Your new username is now active")

          // Reset form
          setChangeUsernameOpen(false)
          setNewUsername("")
          
          // Refresh page to update UI
          setTimeout(() => window.location.reload(), 1500)
        } else {
          showError(data.error || "Failed to change username")
        }
      })
      .catch(error => {
        console.error("Error changing username:", error)
        showError("Failed to change username")
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  function handleResetToDefault() {
    if (!currentUser) return

    // Reset password to default in Google Sheets
    const defaultPassword = currentUser.role === 'admin' ? 'admin123' : 'ops456'
    
    setSubmitting(true)
    fetch("/api/accounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updatePassword",
        username: currentUser.username,
        password: defaultPassword
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showSuccess("Password reset to default", `Default password: ${defaultPassword}`)
          
          // Reset form
          setChangePasswordOpen(false)
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        } else {
          showError(data.error || "Failed to reset password")
        }
      })
      .catch(error => {
        console.error("Error resetting password:", error)
        showError("Failed to reset password")
      })
      .finally(() => {
        setSubmitting(false)
      })
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
        {/* My Account Section */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              My Account
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your personal login credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current User Info */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-blue-500 text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Logged in as</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{currentUser?.displayName || currentUser?.username}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Username</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{currentUser?.username}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Role</p>
                    <p className="font-semibold text-slate-900 dark:text-white capitalize">{currentUser?.role}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Orange Rounded Style */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={() => setChangeUsernameOpen(true)}
                  className="h-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <User className="h-5 w-5 mr-2" />
                  Change Username
                </Button>

                <Button
                  onClick={() => setChangePasswordOpen(true)}
                  className="h-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </Button>
              </div>

              {/* Security Notice */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    <p className="font-semibold mb-1">Security Tip</p>
                    <p>Use a strong password with at least 6 characters. Change your password regularly for better security.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management Section - Admin Only */}
        {currentUser?.role === 'admin' && (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                User Management
                <Badge className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Admin Only</Badge>
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                Manage staff accounts and credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  As an administrator, you can manage all user accounts including staff credentials. All changes are saved to Google Sheets.
                </p>
                
                <Button
                  onClick={() => router.push('/admin/credentials')}
                  className="h-14 w-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Manage All User Accounts
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Change Username Dialog */}
      <Dialog open={changeUsernameOpen} onOpenChange={setChangeUsernameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Change Username
            </DialogTitle>
            <DialogDescription>
              Update your display name and login username
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-username">Current Username</Label>
              <Input
                id="current-username"
                value={currentUser?.username || ""}
                disabled
                className="bg-slate-100 dark:bg-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-username">New Username</Label>
              <Input
                id="new-username"
                placeholder="Enter new username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChangeUsername()}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Minimum 3 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangeUsernameOpen(false)
                setNewUsername("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeUsername}
              disabled={submitting || !newUsername.trim() || newUsername.length < 3}
              className="h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Update Username
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Update your login password for enhanced security
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {newPassword && confirmPassword && (
              <div className={`text-xs flex items-center gap-1 ${
                newPassword === confirmPassword 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    Passwords do not match
                  </>
                )}
              </div>
            )}

            {/* Reset to Default Option */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetToDefault}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Reset to default password
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangePasswordOpen(false)
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                submitting ||
                !currentPassword || 
                !newPassword || 
                !confirmPassword || 
                newPassword !== confirmPassword ||
                newPassword.length < 6
              }
              className="h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
