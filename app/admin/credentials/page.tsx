"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  UserCog, 
  Key, 
  Shield, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminCredentialsPage() {
  const [loginCredentials, setLoginCredentials] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  })
  const [settingsCode, setSettingsCode] = useState({
    currentCode: "",
    newCode: "",
    confirmCode: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
    currentCode: false,
    newCode: false,
    confirmCode: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load existing credentials and settings code
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // In a real app, this would fetch from your backend
      const savedCredentials = localStorage.getItem("adminCredentials")
      const savedCode = localStorage.getItem("adminSettingsCode")
      
      if (savedCredentials) {
        const creds = JSON.parse(savedCredentials)
        setLoginCredentials(prev => ({
          ...prev,
          username: creds.username || ""
        }))
      }
      
      if (savedCode) {
        setSettingsCode(prev => ({
          ...prev,
          currentCode: savedCode
        }))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const handleSaveCredentials = async () => {
    if (loginCredentials.password !== loginCredentials.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage (in real app, save to backend)
      localStorage.setItem("adminCredentials", JSON.stringify({
        username: loginCredentials.username,
        password: loginCredentials.password
      }))
      
      toast({
        title: "Success",
        description: "Login credentials updated successfully"
      })
      
      setLoginCredentials(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update credentials",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettingsCode = async () => {
    if (settingsCode.newCode !== settingsCode.confirmCode) {
      toast({
        title: "Error",
        description: "New codes do not match",
        variant: "destructive"
      })
      return
    }

    if (settingsCode.newCode.length < 4) {
      toast({
        title: "Error",
        description: "Settings code must be at least 4 characters",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage (in real app, save to backend)
      localStorage.setItem("adminSettingsCode", settingsCode.newCode)
      
      toast({
        title: "Success",
        description: "Settings code updated successfully"
      })
      
      setSettingsCode(prev => ({
        ...prev,
        currentCode: prev.newCode,
        newCode: "",
        confirmCode: ""
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings code",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-orange-500" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Admin Settings
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Login Credentials Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-orange-500" />
              Login Credentials
            </CardTitle>
            <CardDescription>
              Manage admin login username and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={loginCredentials.username}
                onChange={(e) => setLoginCredentials(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                placeholder="Enter admin username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPasswords.password ? "text" : "password"}
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("password")}
                >
                  {showPasswords.password ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  value={loginCredentials.confirmPassword}
                  onChange={(e) => setLoginCredentials(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  {showPasswords.confirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleSaveCredentials}
              disabled={isLoading || !loginCredentials.username || !loginCredentials.password}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Credentials
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Settings Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-500" />
              Settings Access Code
            </CardTitle>
            <CardDescription>
              Manage the code required to access admin settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentCode">Current Code</Label>
              <div className="relative">
                <Input
                  id="currentCode"
                  type={showPasswords.currentCode ? "text" : "password"}
                  value={settingsCode.currentCode}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("currentCode")}
                >
                  {showPasswords.currentCode ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newCode">New Code</Label>
              <div className="relative">
                <Input
                  id="newCode"
                  type={showPasswords.newCode ? "text" : "password"}
                  value={settingsCode.newCode}
                  onChange={(e) => setSettingsCode(prev => ({
                    ...prev,
                    newCode: e.target.value
                  }))}
                  placeholder="Enter new settings code"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("newCode")}
                >
                  {showPasswords.newCode ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmCode">Confirm New Code</Label>
              <div className="relative">
                <Input
                  id="confirmCode"
                  type={showPasswords.confirmCode ? "text" : "password"}
                  value={settingsCode.confirmCode}
                  onChange={(e) => setSettingsCode(prev => ({
                    ...prev,
                    confirmCode: e.target.value
                  }))}
                  placeholder="Confirm new settings code"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("confirmCode")}
                >
                  {showPasswords.confirmCode ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleSaveSettingsCode}
              disabled={isLoading || !settingsCode.newCode}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Settings Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Note:</strong> These settings control access to the admin panel. 
          Make sure to use strong passwords and codes. Changes are saved locally for demo purposes.
        </AlertDescription>
      </Alert>
    </div>
  )
}
