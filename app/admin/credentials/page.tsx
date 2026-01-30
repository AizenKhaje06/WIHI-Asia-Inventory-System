"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Users, Lock, Eye, EyeOff, Loader2, CheckCircle2, User, Shield } from "lucide-react"
import { showSuccess, showError } from "@/lib/toast-utils"
import { Badge } from "@/components/ui/badge"

interface Account {
  id: string
  username: string
  role: 'admin' | 'operations'
  displayName: string
  createdAt: string
}

export default function CredentialsManagementPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    try {
      setLoading(true)
      const response = await fetch("/api/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
      showError("Failed to load accounts")
    } finally {
      setLoading(false)
    }
  }

  function openChangePassword(account: Account) {
    setSelectedAccount(account)
    setNewPassword("")
    setConfirmPassword("")
    setChangePasswordOpen(true)
  }

  async function handleChangePassword() {
    if (!selectedAccount) return

    if (!newPassword || !confirmPassword) {
      showError("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      showError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      showError("Password must be at least 6 characters")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updatePassword",
          username: selectedAccount.username,
          password: newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        showSuccess("Password updated successfully", `Password for ${selectedAccount.username} has been changed`)
        setChangePasswordOpen(false)
        setNewPassword("")
        setConfirmPassword("")
        setSelectedAccount(null)
      } else {
        showError(data.error || "Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      showError("Failed to update password")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetToDefault(account: Account) {
    const defaultPassword = account.role === 'admin' ? 'admin123' : 'ops456'
    
    setSubmitting(true)
    try {
      const response = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updatePassword",
          username: account.username,
          password: defaultPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        showSuccess("Password reset to default", `${account.username}: ${defaultPassword}`)
      } else {
        showError(data.error || "Failed to reset password")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      showError("Failed to reset password")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          User Credentials Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Manage all user accounts and passwords (Admin Only)
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            All User Accounts
            <Badge className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
            </Badge>
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
            View and manage credentials for all users. Changes are saved to Google Sheets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No accounts found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        account.role === 'admin' 
                          ? 'bg-purple-100 dark:bg-purple-900/30' 
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {account.role === 'admin' ? (
                          <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg text-slate-900 dark:text-white">{account.displayName}</p>
                          <Badge className={
                            account.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }>
                            {account.role === 'admin' ? 'Administrator' : 'Operations Staff'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Username: <span className="font-semibold">{account.username}</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Created: {account.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openChangePassword(account)}
                        className="h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button
                        onClick={() => handleResetToDefault(account)}
                        className="h-10 rounded-full border-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                        disabled={submitting}
                      >
                        Reset to Default
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              Change Password for {selectedAccount?.username}
            </DialogTitle>
            <DialogDescription>
              Set a new password for this user account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Account Info */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">Changing password for:</p>
              <p className="font-bold text-slate-900 dark:text-white">{selectedAccount?.displayName}</p>
              <p className="text-xs text-slate-500">Username: {selectedAccount?.username}</p>
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
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-sm"
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
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-sm"
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
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setChangePasswordOpen(false)
                setNewPassword("")
                setConfirmPassword("")
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                submitting ||
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
                  Update Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
