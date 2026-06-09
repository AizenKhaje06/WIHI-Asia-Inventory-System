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
import { SecurityIndicator } from "@/components/auth/security-indicator"

export default function EnterpriseLoginPage() {
  const [mounted, setMounted] = useState(false)
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberDevice, setRememberDevice] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
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
      
      // Load remembered username if exists
      const remembered = localStorage.getItem("rememberedUsername")
      if (remembered) {
        setUsername(remembered)
        setRememberDevice(true)
      }
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Call unified login API
      const response = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          rememberDevice
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials")
      }

      // Store user data in localStorage
      if (typeof window !== 'undefined') {
        const { user, redirectPath } = data

        // Handle remember device
        if (rememberDevice) {
          localStorage.setItem("rememberedUsername", username)
        } else {
          localStorage.removeItem("rememberedUsername")
        }

        // Store authentication data
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("username", user.username)
        localStorage.setItem("userRole", user.role)
        localStorage.setItem("displayName", user.displayName)

        // Store optional fields
        if (user.profileImage) {
          localStorage.setItem("profileImage", user.profileImage)
        }
        if (user.assignedChannel) {
          localStorage.setItem("assignedChannel", user.assignedChannel)
        }

        // Store complete user object
        localStorage.setItem("currentUser", JSON.stringify(user))

        // Redirect to appropriate dashboard
        router.push(redirectPath)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Login failed. Please try again.")
    } finally {
      setLoading(false)
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
              <p className="text-slate-400">Sign in to access dashboard</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-300">
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                    disabled={loading}
                  />
                  <span className="text-sm text-slate-400">Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordDialog(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign In</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </Button>
            </form>

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
