"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Loader2, Mail, CheckCircle2, AlertCircle
} from "lucide-react"
import { apiPost } from "@/lib/api-client"
import { RoleSelector, type UserRole, type LogisticsSubRole } from "@/components/auth/role-selector"
import { LoginForm, type LoginFormData } from "@/components/auth/login-form"
import { SecurityIndicator } from "@/components/auth/security-indicator"

interface Channel {
  id: string
  name: string
  label: string
}

export default function EnterpriseLoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin")
  const [logisticsSubRole, setLogisticsSubRole] = useState<LogisticsSubRole>("logistics-admin")
  const [mounted, setMounted] = useState(false)
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [error, setError] = useState("")
  
  // Staff/Team Leader specific states
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [channelsLoading, setChannelsLoading] = useState(false)
  
  const router = useRouter()

  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    setMounted(true)
    
    console.log('[Login Page] ========== MOUNT DEBUG ==========')
    console.log('[Login Page] Mounted')
    
    // CRITICAL: One-time cleanup of ALL team leader data
    if (typeof window !== 'undefined') {
      console.log('[Login Page] Performing one-time team leader cleanup...')
      
      // Remove ALL team leader keys
      const teamLeaderKeys = [
        'teamLeaderSession',
        'x-team-leader-role',
        'x-team-leader-user-id',
        'x-team-leader-channel'
      ]
      
      teamLeaderKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          console.log('[Login Page] Removing old team leader key:', key)
          localStorage.removeItem(key)
        }
      })
      
      // DEBUG: Check ALL localStorage keys
      const allKeys = Object.keys(localStorage)
      console.log('[Login Page] ALL localStorage keys on mount:', allKeys)
      
      // Check specific keys
      const remainingKeys = {
        teamLeaderSession: localStorage.getItem('teamLeaderSession'),
        'x-team-leader-role': localStorage.getItem('x-team-leader-role'),
        'x-team-leader-user-id': localStorage.getItem('x-team-leader-user-id'),
        'x-team-leader-channel': localStorage.getItem('x-team-leader-channel'),
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        username: localStorage.getItem('username'),
        userRole: localStorage.getItem('userRole')
      }
      console.log('[Login Page] Remaining keys after cleanup:', remainingKeys)
    }
    
    // Check for logout marker in cookie
    const hasLogoutMarker = document.cookie.includes('__logout_marker__=true')
    console.log('[Login Page] Logout marker in cookie:', hasLogoutMarker)
    
    // Check if user just logged out
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const logoutParam = urlParams.get('logout')
      
      if (logoutParam || hasLogoutMarker) {
        console.log('[Login Page] Logout detected (param or marker), clearing everything...')
        
        // Clear the logout marker cookie
        document.cookie = '__logout_marker__=; path=/; max-age=0'
        
        // AGGRESSIVE CLEARING
        try {
          // Clear localStorage
          const localKeys = Object.keys(localStorage)
          console.log('[Login Page] LocalStorage keys before clear:', localKeys)
          
          localKeys.forEach(key => {
            try {
              localStorage.removeItem(key)
              delete localStorage[key]
            } catch (e) {
              console.error('[Login Page] Error removing key:', key, e)
            }
          })
          
          try {
            localStorage.clear()
          } catch (e) {
            console.error('[Login Page] localStorage.clear() error:', e)
          }
          
          const remaining = Object.keys(localStorage)
          console.log('[Login Page] LocalStorage keys after clear:', remaining)
          
          if (remaining.length > 0) {
            console.error('[Login Page] WARNING: localStorage not fully cleared!', remaining)
          }
          
          // Clear sessionStorage
          sessionStorage.clear()
          console.log('[Login Page] SessionStorage cleared')
          
        } catch (error) {
          console.error('[Login Page] Error clearing storage:', error)
        }
        
        // Clean up URL
        if (logoutParam) {
          window.history.replaceState({}, '', '/')
          console.log('[Login Page] URL cleaned')
        }
      }
    }
  }, [])

  // Fetch channels when operations role is selected
  useEffect(() => {
    if (selectedRole === 'operations') {
      const fetchChannels = async () => {
        setChannelsLoading(true)
        try {
          const response = await fetch('/api/auth/channels')
          const data = await response.json()
          
          if (data.success) {
            setChannels(data.channels)
          }
        } catch (error) {
          console.error('Error fetching channels:', error)
        } finally {
          setChannelsLoading(false)
        }
      }

      fetchChannels()
    }
  }, [selectedRole])

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setError("Please enter your email address")
      return
    }

    setForgotPasswordLoading(true)
    setError("")

    try {
      const response = await apiPost("/api/auth/forgot-password", {
        email: forgotPasswordEmail
      })

      if (response.success) {
        setForgotPasswordSuccess(true)
      } else {
        setError(response.error || "Failed to send reset email. Please try again.")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      // Extract error message from the error
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email. Please try again."
      setError(errorMessage)
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const resetForgotPasswordDialog = () => {
    setShowForgotPasswordDialog(false)
    setForgotPasswordEmail("")
    setForgotPasswordSuccess(false)
    setForgotPasswordLoading(false)
    setError("")
  }

  const handleLogin = async (formData: LoginFormData) => {
    setError("")

    try {
      // Logistics login (Admin, Packer or Tracker)
      if (formData.role === 'logistics') {
        const actualRole = formData.logisticsSubRole || 'logistics-admin'
        
        const data = await apiPost("/api/accounts", {
          action: "validate",
          username: formData.username,
          password: formData.password
        })

        if (data.success && data.account && data.account.role === actualRole) {
          if (typeof window !== 'undefined') {
            localStorage.setItem("isLoggedIn", "true")
            localStorage.setItem("username", data.account.username)
            localStorage.setItem("userRole", actualRole)
            localStorage.setItem("displayName", data.account.displayName)
            
            localStorage.setItem("currentUser", JSON.stringify({
              username: data.account.username,
              role: actualRole,
              displayName: data.account.displayName
            }))

            if (formData.rememberDevice) {
              localStorage.setItem("rememberedUsername", formData.username)
            }
          }
          
          // Route based on sub-role
          if (actualRole === 'logistics-admin') {
            router.push('/logistics/dashboard')
          } else if (actualRole === 'tracker') {
            router.push('/tracker/dashboard')
          } else {
            router.push('/packer/dashboard')
          }
          return
        } else {
          throw new Error(`Invalid ${actualRole} credentials or account is not a ${actualRole}`)
        }
      }

      // Operations login - Use department authentication
      if (formData.role === 'operations') {
        const authResponse = await fetch('/api/departments/authenticate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: formData.username,
            password: formData.password
          })
        })

        const authData = await authResponse.json()

        console.log('[Operations Login] ===== AUTH RESPONSE DEBUG =====')
        console.log('[Operations Login] Auth data:', authData)
        console.log('[Operations Login] Department:', authData.department)
        console.log('[Operations Login] Assigned channel:', authData.department?.assigned_channel)
        console.log('[Operations Login] ===== END DEBUG =====')

        if (!authResponse.ok || !authData.success) {
          throw new Error(authData.error || "Invalid department credentials")
        }

        // Authentication successful - Store department channel for filtering
        if (typeof window !== 'undefined') {
          if (formData.rememberDevice) {
            localStorage.setItem("rememberedUsername", formData.username)
          } else {
            localStorage.removeItem("rememberedUsername")
          }
          
          const assignedChannel = authData.department.assigned_channel
          console.log('[Operations Login] Saving to localStorage:', {
            username: authData.department.name,
            displayName: authData.department.display_name,
            assignedChannel: assignedChannel
          })
          
          localStorage.setItem("isLoggedIn", "true")
          localStorage.setItem("username", authData.department.name)
          localStorage.setItem("userRole", "operations")
          localStorage.setItem("displayName", authData.department.display_name)
          localStorage.setItem("assignedChannel", assignedChannel || '') // Store even if null/undefined
          
          console.log('[Operations Login] Saved assignedChannel:', localStorage.getItem('assignedChannel'))
          
          localStorage.setItem("currentUser", JSON.stringify({
            username: authData.department.name,
            role: "operations",
            displayName: authData.department.display_name,
            assignedChannel: assignedChannel,
            email: '',
            phone: ''
          }))
        }
        
        router.push('/dashboard/operations')
        return
      }

      // Admin login
      const data = await apiPost("/api/accounts", {
        action: "validate",
        username: formData.username,
        password: formData.password
      })

      if (data.success && data.account && data.account.role === 'admin') {
        if (typeof window !== 'undefined') {
          if (formData.rememberDevice) {
            localStorage.setItem("rememberedUsername", formData.username)
          } else {
            localStorage.removeItem("rememberedUsername")
          }
          
          localStorage.setItem("isLoggedIn", "true")
          localStorage.setItem("username", data.account.username)
          localStorage.setItem("userRole", "admin")
          localStorage.setItem("displayName", data.account.displayName)
          
          localStorage.setItem("currentUser", JSON.stringify({
            username: data.account.username,
            role: "admin",
            displayName: data.account.displayName,
            email: data.account.email || '',
            phone: data.account.phone || ''
          }))
        }
        
        router.push('/dashboard')
      } else {
        throw new Error("Invalid admin credentials or account is not an admin")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-8 bg-white">
        <div className="relative z-10 w-full max-w-2xl space-y-4 animate-in fade-in-0 slide-in-from-left-10 duration-1000">
          {/* Logo Icon */}
          <div className="animate-in fade-in-0 zoom-in-95 duration-700">
            <img 
              src="/Vertex-icon.png" 
              alt="Vertex" 
              className="h-16 w-auto object-contain"
              loading="eager"
            />
          </div>

          {/* Build-up Text - ENHANCED TYPOGRAPHY */}
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-150">
            <h1 className="text-5xl font-bold leading-tight text-slate-900 tracking-tight">
              Manage your inventory<br />
              <span className="text-blue-600">with ease.</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Track stock, manage warehouses, and streamline fulfillment in one powerful platform.
            </p>
          </div>

          {/* Hero Image - EAGER LOADED */}
          <div className="relative animate-in fade-in-0 zoom-in-95 duration-1000 delay-300 mt-4">
            <img 
              src="/Log-in-Image.png" 
              alt="Inventory Management Dashboard" 
              className="w-full h-auto"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10 bg-white">
        <div className="w-full max-w-[440px] animate-in fade-in-0 slide-in-from-right-10 duration-1000">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center animate-in fade-in-0 zoom-in-95 duration-700">
            <div className="inline-flex items-center justify-center">
              <img 
                src="/Vertex-icon.png" 
                alt="Vertex" 
                className="h-16 w-auto object-contain"
                loading="eager"
              />
            </div>
          </div>

          {/* Login Card - ENHANCED */}
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 lg:p-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200 transition-all">
            {/* Role Selector */}
            <RoleSelector 
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
            />

            {/* Login Form */}
            <div className="mt-6">
              <LoginForm
                role={selectedRole}
                onSubmit={handleLogin}
                onForgotPassword={() => setShowForgotPasswordDialog(true)}
                channels={channels}
                selectedChannel={selectedChannel}
                onChannelChange={setSelectedChannel}
                channelsLoading={channelsLoading}
                logisticsSubRole={logisticsSubRole}
                onLogisticsSubRoleChange={setLogisticsSubRole}
              />
            </div>

            {/* Security Indicator */}
            <div className="mt-8">
              <SecurityIndicator />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-400 animate-in fade-in-0 duration-1000 delay-500">
            <p>© 2026 Vertex. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              {forgotPasswordSuccess 
                ? "Check your email for password reset instructions"
                : "Enter your email address and we'll send you a password reset link"}
            </DialogDescription>
          </DialogHeader>

          {forgotPasswordSuccess ? (
            <div className="py-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    Email Sent!
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    We've sent password reset instructions to <span className="font-medium">{forgotPasswordEmail}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {error && (
                <Alert className="border-red-800 bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400 ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="pl-10"
                    disabled={forgotPasswordLoading}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Make sure this email is registered in your profile settings
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {forgotPasswordSuccess ? (
              <Button onClick={resetForgotPasswordDialog} className="w-full">
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={resetForgotPasswordDialog}
                  disabled={forgotPasswordLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForgotPassword}
                  disabled={forgotPasswordLoading || !forgotPasswordEmail}
                >
                  {forgotPasswordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
