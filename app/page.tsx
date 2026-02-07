"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Eye, EyeOff, Lock, User, Loader2, ArrowRight, AlertCircle, 
  Shield, Building2, KeyRound, CheckCircle2, Info, ChevronsRight 
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

type LoginMode = "admin" | "staff"

export default function EnterpriseLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginMode, setLoginMode] = useState<LoginMode>("admin")
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()

  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem("isLoggedIn")
        const rememberedUsername = localStorage.getItem("rememberedUsername")
        if (rememberedUsername) {
          setUsername(rememberedUsername)
          setRememberMe(true)
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
      }
    }
  }, [])

  // Password strength calculator
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10
    setPasswordStrength(Math.min(strength, 100))
  }, [password])

  // Caps lock detection
  const handleKeyPress = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate",
          username,
          password
        })
      })

      const data = await response.json()

      if (data.success && data.account) {
        if (typeof window !== 'undefined') {
          try {
            if (rememberMe) {
              localStorage.setItem("rememberedUsername", username)
            } else {
              localStorage.removeItem("rememberedUsername")
            }
            
            localStorage.setItem("isLoggedIn", "true")
            localStorage.setItem("username", data.account.username)
            localStorage.setItem("userRole", data.account.role)
            localStorage.setItem("displayName", data.account.displayName)
          } catch (error) {
            console.error('Error saving to localStorage:', error)
          }
        }
        
        const redirectPath = data.account.role === "admin" ? "/dashboard" : "/dashboard/operations"
        router.push(redirectPath)
      } else {
        setError("Invalid username or password. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 70) return "bg-amber-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Weak"
    if (passwordStrength < 70) return "Medium"
    return "Strong"
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Left Panel - Live Inventory Preview */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 dark:from-orange-900 dark:via-orange-950 dark:to-red-950">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative z-10 max-w-2xl w-full text-white space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold leading-tight">
              All-in-One Inventory Platform
            </h1>
            <p className="text-orange-100 text-lg">
              Simplify your daily operations and grow your business — Easily manage inventory, sales, analytics, and operations — everything you need in one smart system.
            </p>
          </div>

          {/* Dashboard Preview Card */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-6 border border-white/20">
            {/* Overview Stats */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Overview</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Income</div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">₱12,153.80</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-3 border border-green-200 dark:border-green-800">
                  <div className="text-xs text-green-600 dark:text-green-400 mb-1">Expense</div>
                  <div className="text-lg font-bold text-green-900 dark:text-green-100">₱2,153.80</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Total Amount</div>
                  <div className="text-lg font-bold text-purple-900 dark:text-purple-100">₱12,153.80</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-3 border border-amber-200 dark:border-amber-800 relative overflow-hidden">
                  <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">This Month</div>
                  <div className="text-lg font-bold text-amber-900 dark:text-amber-100">₱25K</div>
                  <div className="absolute -right-2 -bottom-2">
                    <svg width="60" height="60" viewBox="0 0 100 100" className="text-amber-300 dark:text-amber-700">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="75 25" transform="rotate(-90 50 50)" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Revenue Analytics</h3>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">₱79,556.65</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">Total revenue from inventory turnover</div>
                {/* Mini Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-20">
                  <div className="flex-1 bg-orange-200 dark:bg-orange-800 rounded-t" style={{ height: '40%' }}></div>
                  <div className="flex-1 bg-orange-200 dark:bg-orange-800 rounded-t" style={{ height: '30%' }}></div>
                  <div className="flex-1 bg-orange-300 dark:bg-orange-700 rounded-t" style={{ height: '55%' }}></div>
                  <div className="flex-1 bg-orange-400 dark:bg-orange-600 rounded-t" style={{ height: '75%' }}></div>
                  <div className="flex-1 bg-orange-500 dark:bg-orange-500 rounded-t" style={{ height: '90%' }}></div>
                  <div className="flex-1 bg-orange-400 dark:bg-orange-600 rounded-t" style={{ height: '70%' }}></div>
                  <div className="flex-1 bg-orange-300 dark:bg-orange-700 rounded-t" style={{ height: '50%' }}></div>
                </div>
              </div>
            </div>

            {/* Cost Analytics with Pie Chart */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Today Transaction</h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Outbound</span>
                    <span className="font-semibold text-slate-900 dark:text-white">125</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Inbound</span>
                    <span className="font-semibold text-slate-900 dark:text-white">89</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">High</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">₱892</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Low</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">₱245</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Cost Analytics</h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="75 25" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="50 50" strokeDashoffset="-75" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="25 75" strokeDashoffset="-125" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">₱79K</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Salary</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">35%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Transport</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Others</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Balance</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">₱25,80.80</span>
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="flex items-center justify-center gap-8 text-white/60 text-sm">
            <span>StockSync</span>
            <span>•</span>
            <span>Silver Gym</span>
            <span>•</span>
            <span>Silver Gym</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">StockSync</h1>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-8 lg:p-10">
            {/* Mode Selector */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-8">
              <button
                type="button"
                onClick={() => {
                  setLoginMode("admin")
                  setUsername("")
                  setPassword("")
                  setError("")
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  loginMode === "admin"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode("staff")
                  setUsername("")
                  setPassword("")
                  setError("")
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  loginMode === "staff"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <User className="w-4 h-4" />
                <span>Staff</span>
              </button>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {loginMode === "admin" 
                  ? "Sign in to access admin dashboard" 
                  : "Sign in to access warehouse operations"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-400 ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onKeyUp={handleKeyPress}
                    className="pl-12 pr-12 h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Password strength</span>
                      <span className={cn(
                        "font-medium",
                        passwordStrength < 40 && "text-red-600",
                        passwordStrength >= 40 && passwordStrength < 70 && "text-amber-600",
                        passwordStrength >= 70 && "text-green-600"
                      )}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-300 rounded-full", getPasswordStrengthColor())}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Caps Lock Warning */}
                {capsLockOn && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <Info className="h-3.5 w-3.5" />
                    <span>Caps Lock is on</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-normal"
                  >
                    Remember me
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {isDevelopment && (
              <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">Development Mode:</span>
                    <div className="mt-1 space-y-0.5">
                      <div>Admin: admin / password123</div>
                      <div>Staff: staff / staff123</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>© 2026 StockSync. All rights reserved.</p>
            <p className="mt-1">Secured by 256-bit SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  )
}
