'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getTeamLeaderSession, getAuthHeaders } from '@/lib/team-leader-auth'
import { BrandLoader } from '@/components/ui/brand-loader'

/**
 * Team Leader Account Settings Page
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export default function SettingsPage() {
  const session = getTeamLeaderSession()
  const [loading, setLoading] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const headers = getAuthHeaders()

      const response = await fetch('/api/auth/team-leader-change-password', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: session?.userId,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ submit: data.error || 'Failed to change password' })
        toast.error(data.error || 'Failed to change password')
        return
      }

      setSuccess(true)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setErrors({})
      toast.success('Password changed successfully')

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error('Error changing password:', error)
      setErrors({ submit: 'An error occurred' })
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 pt-2 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-1.5">Account Settings</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Manage your account and security settings
        </p>
      </div>

      {/* Account Information */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-white">Name</label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{session?.displayName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-white">Email</label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{session?.email || 'Not set'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-white">Assigned Channel</label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{session?.assignedChannel}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-white">Role</label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 capitalize">{session?.role}</p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600 dark:text-green-400 text-sm">
                  Password changed successfully
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {errors.submit && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 dark:text-red-400 text-sm">
                  {errors.submit}
                </AlertDescription>
              </Alert>
            )}

            {/* Current Password */}
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="Enter your current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className={errors.currentPassword ? 'border-red-500 mt-1' : 'mt-1'}
                disabled={loading}
              />
              {errors.currentPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter your new password (minimum 8 characters)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className={errors.newPassword ? 'border-red-500 mt-1' : 'mt-1'}
                disabled={loading}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm your new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className={errors.confirmPassword ? 'border-red-500 mt-1' : 'mt-1'}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <BrandLoader size="sm" />
                  <span className="ml-2">Updating...</span>
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-0 shadow-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <p>• Use a strong password with a mix of uppercase, lowercase, numbers, and symbols</p>
          <p>• Never share your password with anyone</p>
          <p>• Change your password regularly for better security</p>
          <p>• Log out when using shared computers</p>
        </CardContent>
      </Card>
    </div>
  )
}
