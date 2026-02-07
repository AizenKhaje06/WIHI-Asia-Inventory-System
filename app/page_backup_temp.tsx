"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Lock, User, Loader2, ArrowRight, AlertCircle, Shield, UserCircle } from "lucide-react"
import { DEFAULT_PASSWORDS, ROLES, setCurrentUser, getDefaultRoute, type UserRole, validateRolePassword } from "@/lib/auth"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("admin")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Check if in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // Clear any existing login state on login page load to force re-authentication
    localStorage.removeItem("isLoggedIn")
    
    // Load remembered role if exists
    const rememberedRole = localStorage.getItem("rememberedRole") as UserRole
    if (rememberedRole) {
      setRole(rememberedRole)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))

    // Validate password for selected role
    const isValid = validateRolePassword(role, password)

    if (isValid) {
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberedRole", role)
      } else {
        localStorage.removeItem("rememberedRole")
      }
      
      // Set user session
      setCurrentUser({
        username: role, // Use role as username
        role: role,
        displayName: ROLES[role].name
      })
      
      // Redirect to appropriate dashboard
      const defaultRoute = getDefaultRoute(role)
      router.push(defaultRoute)
    } else {
      setError("Invalid password. Please try again.")
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
            "absolute top-0 w-1/2 h-full p-12 flex flex-col justify-center transition-all duration-700 ease-in-out",
            loginMode === "admin" ? "left-0" : "left-1/2"
          )}>
            <div className="max-w-sm mx-auto w-full">
              {/* Logo/Brand */}
              <div className="mb-8">
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

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 animate-in fade-in-0 slide-in-from-top-2 duration-300">
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

                <div className="space-y-2">
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

                <div className="flex items-center justify-between text-sm pt-1">
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
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
            </div>
          </div>

          {/* Colored Overlay Panel - Slides Right/Left */}
          <div className={cn(
            "absolute top-0 w-1/2 h-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 dark:from-cyan-600 dark:via-blue-600 dark:to-cyan-700 transition-all duration-700 ease-in-out flex items-center justify-center p-12",
            loginMode === "admin" ? "left-1/2" : "left-0"
          )}>
            <div className="text-center text-white max-w-sm">
              {loginMode === "admin" ? (
                <>
                  <Users className="w-20 h-20 mx-auto mb-6 opacity-90" />
                  <h2 className="text-3xl font-bold mb-4">Operation Staff?</h2>
                  <p className="text-blue-100 mb-8 text-lg">
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
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 h-12 px-8 text-base font-semibold transition-all duration-300"
                  >
                    <Briefcase className="mr-2 h-5 w-5" />
                    Login as Staff
                  </Button>
                </>
              ) : (
                <>
                  <Shield className="w-20 h-20 mx-auto mb-6 opacity-90" />
                  <h2 className="text-3xl font-bold mb-4">Administrator?</h2>
                  <p className="text-blue-100 mb-8 text-lg">
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
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 h-12 px-8 text-base font-semibold transition-all duration-300"
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
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2026 StockSync. All rights reserved.
          </p>
        </div>
      </div>

      {/* Old content removed */}
      <div className="w-full max-w-md relative z-10 hidden">
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[5px] bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl mb-4 animate-in zoom-in-50 duration-500">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">StockSync</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base">Professional Inventory Management</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Please sign in to your account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-400 ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-700 dark:text-slate-300 font-medium">
                  Login As
                </Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger className="h-12 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ROLES).map((roleOption) => (
                      <SelectItem key={roleOption.id} value={roleOption.id}>
                        <div className="flex items-center gap-3 py-1">
                          <span className="text-xl">{roleOption.icon}</span>
                          <div className="flex flex-col">
                            <span className="font-medium">{roleOption.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {roleOption.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
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
                    className="pl-10 pr-10 h-12 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800"
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

              <div className="flex items-center justify-between text-sm pt-1">
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
                <Link 
                  href="/dashboard/settings" 
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Change credentials
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
              <div className="mt-6 p-4 rounded-[5px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Development Mode - Test Passwords:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">👔 Administrator:</span>
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">admin123</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">📦 Operations Staff:</span>
                    <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">ops456</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center animate-in fade-in-0 duration-700 delay-200">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2026 StockSync. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
