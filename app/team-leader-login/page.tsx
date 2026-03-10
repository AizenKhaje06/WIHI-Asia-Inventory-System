'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { setTeamLeaderSession } from '@/lib/team-leader-auth'
import { BrandLoader } from '@/components/ui/brand-loader'

interface Channel {
  id: string
  name: string
  label: string
}

/**
 * Team Leader Login Page
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export default function TeamLeaderLoginPage() {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [channelsLoading, setChannelsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch available channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/auth/channels')
        const data = await response.json()
        
        if (data.success) {
          setChannels(data.channels)
        }
      } catch (error) {
        console.error('Error fetching channels:', error)
        toast.error('Failed to load channels')
      } finally {
        setChannelsLoading(false)
      }
    }

    fetchChannels()
  }, [])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedChannel) {
      newErrors.channel = 'Please select a channel'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 1) {
      newErrors.password = 'Invalid password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/team-leader-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: selectedChannel,
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Login failed')
        setErrors({ submit: data.error || 'Invalid channel or credentials' })
        return
      }

      // Store session
      setTeamLeaderSession(data.sessionData)

      // Store auth headers for API requests
      localStorage.setItem('x-team-leader-user-id', data.user.id)
      localStorage.setItem('x-team-leader-channel', data.user.assignedChannel)
      localStorage.setItem('x-team-leader-role', data.user.role)

      toast.success('Login successful')

      // Redirect to dashboard
      router.push('/team-leader/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed')
      setErrors({ submit: 'An error occurred during login' })
    } finally {
      setLoading(false)
    }
  }

  if (channelsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-400 mt-6 text-sm font-medium">Loading channels...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold text-center gradient-text">
            Team Leader Login
          </CardTitle>
          <p className="text-xs text-center text-slate-600 dark:text-slate-400">
            Select your channel and enter your password
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Channel Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                Sales Channel
              </label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className={errors.channel ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.name}>
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.channel && (
                <p className="text-xs text-red-600">{errors.channel}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 dark:text-red-400 text-sm">
                  {errors.submit}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <BrandLoader size="sm" />
                  <span className="ml-2">Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-center text-slate-600 dark:text-slate-400">
              Need help? Contact your administrator
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
