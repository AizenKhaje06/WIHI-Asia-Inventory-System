"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, User } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Default credentials (can be changed via settings later)
  const DEFAULT_USERNAME = "admin"
  const DEFAULT_PASSWORD = "password123"

  useEffect(() => {
    // Clear any existing login state on login page load to force re-authentication
    localStorage.removeItem("isLoggedIn")
    // Note: We keep stored credentials for convenience, but clear login state
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Get stored credentials or use defaults
    const storedUsername = localStorage.getItem("adminUsername") || DEFAULT_USERNAME
    const storedPassword = localStorage.getItem("adminPassword") || DEFAULT_PASSWORD

    if (username === storedUsername && password === storedPassword) {
      localStorage.setItem("isLoggedIn", "true")
      router.push("/dashboard")
    } else {
      setError("Invalid username or password")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #2563EB 100%)' }}
          >
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>STOCKIFY</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Professional Inventory Management</p>
        </div>

        <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <CardHeader className="text-center">
            <CardTitle style={{ color: 'var(--foreground)' }}>Welcome Back</CardTitle>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-secondary)' }}>Please sign in to your account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border bg-destructive/10 border-destructive/30">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" style={{ color: 'var(--foreground)' }}>Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4" style={{ color: 'var(--foreground-tertiary)' }} />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    style={{
                      backgroundColor: 'var(--background-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: 'var(--foreground)' }}>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4" style={{ color: 'var(--foreground-tertiary)' }} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    style={{
                      backgroundColor: 'var(--background-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 transition-colors"
                    style={{ color: 'var(--foreground-tertiary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground-tertiary)'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, #2563EB 100%)',
                  color: 'white'
                }}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: 'var(--foreground-tertiary)' }}>
                Default credentials: <span className="font-semibold" style={{ color: 'var(--foreground-secondary)' }}>admin</span> / <span className="font-semibold" style={{ color: 'var(--foreground-secondary)' }}>password123</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
            © 2026 Stockify. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
