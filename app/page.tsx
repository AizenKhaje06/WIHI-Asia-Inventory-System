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
import { setTeamLeaderSession } from "@/lib/team-leader-auth"
import { RoleSelector, type UserRole } from "@/components/auth/role-selector"
import { LoginForm, type LoginFormData } from "@/components/auth/login-form"
import { SecurityIndicator } from "@/components/auth/security-indicator"

interface Channel {
  id: string
  name: string
  label: string
}

export default function EnterpriseLoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin")
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
    
    // Only run session check once on mount
    if (typeof window === 'undefined') return
    
    try {
      // IMPORTANT: When on login page, we should NOT have any active sessions
      // If we're here, it means user either logged out or session expired
      // So we need to be very strict about validation
      
      const isAdminLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      const teamLeaderSession = localStorage.getItem("teamLeaderSession")
      const teamLeaderRole = localStorage.getItem("x-team-leader-role")
      
      console.log('[Login Page] Checking existing session...')
      console.log('[Login Page] Admin logged in:', isAdminLoggedIn)
      console.log('[Login Page] Team leader session exists:', !!teamLeaderSession)
      console.log('[Login Page] Team leader role:', teamLeaderRole)
      
      let hasValidSession = false
      
      // Validate admin session
      if (isAdminLoggedIn) {
        const username = localStorage.getItem("username")
        const userRole = localStorage.getItem("userRole")
        
        // Only redirect if we have ALL required fields
        if (username && userRole && (userRole === 'admin' || userRole === 'operations' || userRole === 'packer')) {
          console.log('[Login Page] Valid admin session found, redirecting...')
          hasValidSession = true
          
          // Redirect based on role
          if (userRole === 'packer') {
            router.push('/packer/dashboard')
          } else {
            router.push('/dashboard')
          }
          return
        } else {
          // Invalid or incomplete session, clear it
          console.log('[Login Page] Invalid admin session, clearing...')
          localStorage.removeItem("isLoggedIn")
          localStorage.removeItem("username")
          localStorage.removeItem("userRole")
          localStorage.removeItem("displayName")
          localStorage.removeItem("currentUser")
        }
      }
      
      // Validate team leader session
      if (teamLeaderSession && teamLeaderRole === 'team_leader') {
        try {
          const session = JSON.parse(teamLeaderSession)
          
          // Strict validation: Check ALL required fields
          if (session.userId && session.assignedChannel && session.username && session.timestamp) {
            // Check session expiry (24 hours)
            const now = Date.now()
            const twentyFourHours = 24 * 60 * 60 * 1000
            
            if (now - session.timestamp > twentyFourHours) {
              console.log('[Login Page] Team leader session expired, clearing...')
              localStorage.removeItem('teamLeaderSession')
              localStorage.removeItem('x-team-leader-user-id')
              localStorage.removeItem('x-team-leader-channel')
              localStorage.removeItem('x-team-leader-role')
            } else {
              console.log('[Login Page] Valid team leader session found, redirecting to /team-leader/dashboard')
              hasValidSession = true
              router.push('/team-leader/dashboard')
              return
            }
          } else {
            // Invalid session structure, clear it
            console.log('[Login Page] Invalid team leader session structure, clearing...')
            localStorage.removeItem('teamLeaderSession')
            localStorage.removeItem('x-team-leader-user-id')
            localStorage.removeItem('x-team-leader-channel')
            localStorage.removeItem('x-team-leader-role')
          }
        } catch (error) {
          // Corrupted session data, clear it
          console.log('[Login Page] Corrupted team leader session, clearing...', error)
          localStorage.removeItem('teamLeaderSession')
          localStorage.removeItem('x-team-leader-user-id')
          localStorage.removeItem('x-team-leader-channel')
          localStorage.removeItem('x-team-leader-role')
        }
      }
      
      // If we reach here, no valid session was found
      // Clear any remaining session fragments
      if (!hasValidSession) {
        console.log('[Login Page] No valid session found, ensuring clean state...')
        
        // Clear any orphaned session data
        if (localStorage.getItem('teamLeaderSession') || localStorage.getItem('x-team-leader-role')) {
          console.log('[Login Page] Clearing orphaned team leader session data...')
          localStorage.removeItem('teamLeaderSession')
          localStorage.removeItem('x-team-leader-user-id')
          localStorage.removeItem('x-team-leader-channel')
          localStorage.removeItem('x-team-leader-role')
        }
        
        if (localStorage.getItem('isLoggedIn')) {
          console.log('[Login Page] Clearing orphaned admin session data...')
          localStorage.removeItem("isLoggedIn")
          localStorage.removeItem("username")
          localStorage.removeItem("userRole")
          localStorage.removeItem("displayName")
          localStorage.removeItem("currentUser")
        }
      }
    } catch (error) {
      console.error('[Login Page] Error accessing localStorage:', error)
      // Clear all sessions on error to prevent infinite loops
      console.log('[Login Page] Clearing all localStorage due to error...')
      localStorage.clear()
    }
  }, [router])

  // Fetch channels when staff role is selected
  useEffect(() => {
    if (selectedRole === 'staff') {
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
      // Packer login
      if (formData.role === 'packer') {
        const data = await apiPost("/api/accounts", {
          action: "validate",
          username: formData.username,
          password: formData.password
        })

        if (data.success && data.account && data.account.role === 'packer') {
          if (typeof window !== 'undefined') {
            localStorage.setItem("isLoggedIn", "true")
            localStorage.setItem("username", data.account.username)
            localStorage.setItem("userRole", "packer")
            localStorage.setItem("displayName", data.account.displayName)
            
            localStorage.setItem("currentUser", JSON.stringify({
              username: data.account.username,
              role: "packer",
              displayName: data.account.displayName
            }))

            if (formData.rememberDevice) {
              localStorage.setItem("rememberedUsername", formData.username)
            }
          }
          
          router.push('/packer/dashboard')
          return
        } else {
          throw new Error("Invalid packer credentials")
        }
      }

      // Staff/Team Leader login
      if (formData.role === 'staff') {
        if (!selectedChannel) {
          throw new Error("Please select a sales channel")
        }

        const response = await fetch('/api/auth/team-leader-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            channel: selectedChannel,
            password: formData.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Invalid channel or credentials')
        }

        const sessionWithTimestamp = {
          ...data.sessionData,
          timestamp: data.sessionData.timestamp || Date.now()
        }
        
        setTeamLeaderSession(sessionWithTimestamp)

        localStorage.setItem('x-team-leader-user-id', data.user.id)
        localStorage.setItem('x-team-leader-channel', data.user.assignedChannel)
        localStorage.setItem('x-team-leader-role', data.user.role)

        await new Promise(resolve => setTimeout(resolve, 100))
        
        router.push('/team-leader/dashboard')
        return
      }

      // Admin login
      const data = await apiPost("/api/accounts", {
        action: "validate",
        username: formData.username,
        password: formData.password
      })

      if (data.success && data.account) {
        if (typeof window !== 'undefined') {
          if (formData.rememberDevice) {
            localStorage.setItem("rememberedUsername", formData.username)
          } else {
            localStorage.removeItem("rememberedUsername")
          }
          
          localStorage.setItem("isLoggedIn", "true")
          localStorage.setItem("username", data.account.username)
          localStorage.setItem("userRole", data.account.role)
          localStorage.setItem("displayName", data.account.displayName)
          
          localStorage.setItem("currentUser", JSON.stringify({
            username: data.account.username,
            role: data.account.role,
            displayName: data.account.displayName,
            email: data.account.email || '',
            phone: data.account.phone || ''
          }))
        }
        
        const redirectPath = data.account.role === "admin" ? "/dashboard" : "/dashboard/operations"
        router.push(redirectPath)
      } else {
        throw new Error(data.error || "Invalid username or password. Please try again.")
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
