"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, User, Loader2, ArrowRight, AlertCircle, Shield, Users, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

type LoginMode = "admin" | "staff"

export default function SlidingLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginMode, setLoginMode] = useState<LoginMode>("admin")
  const router = useRouter()

  // Default credentials
  const DEFAULT_ADMIN_USERNAME = "admin"
  const DEFAULT_ADMIN_PASSWORD = "password123"
  const DEFAULT_STAFF_USERNAME = "staff"
  const DEFAULT_STAFF_PASSWORD = "staff123"

  // Check if in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // Clear any existing login state
    localStorage.removeItem("isLoggedIn")
    
    // Load remembered username if exists
    const rememberedUsername = localStorage.getItem("rememberedUsername")
    if (rememberedUsername) {
      setUsername(rememberedUsername)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Get stored credentials or use defaults
    const storedAdminUsername = localStorage.getItem("adminUsername") || DEFAULT_ADMIN_USERNAME
    const storedAdminPassword = localStorage.getItem("adminPassword") || DEFAULT_ADMIN_PASSWORD
    const storedStaffUsername = localStorage.getItem("staffUsername") || DEFAULT_STAFF_USERNAME
    const storedStaffPassword = localStorage.getItem("staffPassword") || DEFAULT_STAFF_PASSWORD

    let isValid = false

    if (loginMode === "admin") {
      isValid = username === storedAdminUsername && password === storedAdminPassword
    } else {
      isValid = username === storedStaffUsername && password === storedStaffPassword
    }

    if (isValid) {
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username)
      } else {
        localStorage.removeItem("rememberedUsername")
      }
      
      // Map loginMode to correct userRole
      const userRole = loginMode === "admin" ? "admin" : "operations"
      
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("username", username)
      localStorage.setItem("userRole", userRole)
      localStorage.setItem("displayName", loginMode === "admin" ? "Administrator" : "Operations Staff")
      
      // Redirect to appropriate dashboard
      const redirectPath = loginMode === "admin" ? "/dashboard" : "/dashboard/operations"
      router.push(redirectPath)
    } else {
      setError("Invalid username or password. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Sliding Container */}
        <div className="relative w-full h-[600px] bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl overflow-hidden">
          
          {/* Login Form Panel - Slides Left/Right */}
          <div className={cn(
            "absolute top-0 w-1/2 h-full p-12 flex flex-col justify-center bg-white dark:bg-slate-900",
            "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "transform-gpu will-change-transform",
            loginMode === "admin" ? "left-0" : "left-1/2"
          )}>
            <div className="max-w-sm mx-auto w-full">
              {/* Logo/Brand */}
              <div className={cn(
                "mb-8 transition-all duration-700",
                "animate-in fade-in-0 duration-500",
                loginMode === "admin" ? "slide-in-from-left-4" : "slide-in-from-right-4"
              )}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[5px] bg-gradient-to-br from-blue-600 to-purple-600 dark:from-cyan-500 dark:to-blue-600 shadow-lg mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {loginMode === "admin" ? "Admin Login" : "Staff Login"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {loginMode === "admin" ? "Sign in to your admin account" : "Sign in as operation staff"}
                </p>
              </div>

              <form onSubmit={handleLogin} className={cn(
                "space-y-5 transition-all duration-500",
                "animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100"
              )}>
                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-700 dark:text-red-400 ml-2">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-200">
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-300">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-1 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-400">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label 
                      htmlFor="remember" 
                      className="text-slate-600 dark:text-slate-400 cursor-pointer font-normal"
                    >
                      Remember me
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500"
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
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              {isDevelopment && (
                <div className="mt-6 p-3 rounded-[5px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in fade-in-0 duration-500 delay-600">
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Dev Mode:</span>{" "}
                    {loginMode === "admin" ? "admin/password123" : "staff/staff123"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Colored Overlay Panel - Slides Right/Left */}
          <div className={cn(
            "absolute top-0 w-1/2 h-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 dark:from-cyan-600 dark:via-blue-600 dark:to-cyan-700 flex items-center justify-center p-12",
            "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "transform-gpu will-change-transform",
            loginMode === "admin" ? "left-1/2" : "left-0"
          )}>
            <div className={cn(
              "text-center text-white max-w-sm",
              "transition-all duration-700",
              "animate-in fade-in-0 zoom-in-95 duration-700"
            )}>
              {loginMode === "admin" ? (
                <>
                  <Users className="w-20 h-20 mx-auto mb-6 opacity-90" />
                  <h2 className="text-3xl font-bold mb-4">Operation Staff?</h2>
                  <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                    Login as operation staff to access warehouse dispatch and inventory management
                  </p>
                  <Button
                    onClick={() => {
                      setLoginMode("staff")
                      setUsername("")
                      setPassword("")
                      setError("")
                    }}
                    variant="outline"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 h-12 px-8 text-base font-semibold transition-all duration-300 rounded-[5px]"
                  >
                    <Briefcase className="mr-2 h-5 w-5" />
                    Login as Staff
                  </Button>
                </>
              ) : (
                <>
                  <Shield className="w-20 h-20 mx-auto mb-6 opacity-90" />
                  <h2 className="text-3xl font-bold mb-4">Administrator?</h2>
                  <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                    Login as administrator to access full system controls and settings
                  </p>
                  <Button
                    onClick={() => {
                      setLoginMode("admin")
                      setUsername("")
                      setPassword("")
                      setError("")
                    }}
                    variant="outline"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 h-12 px-8 text-base font-semibold transition-all duration-300 rounded-[5px]"
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Login as Admin
                  </Button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 text-center animate-in fade-in-0 duration-700 delay-200">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2026 StockSync. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
