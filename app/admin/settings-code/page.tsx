"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Key, 
  Shield, 
  Save, 
  Eye, 
  EyeOff, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsCodePage() {
  const [settingsCode, setSettingsCode] = useState({
    currentCode: "",
    newCode: "",
    confirmCode: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    currentCode: false,
    newCode: false,
    confirmCode: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadCurrentCode()
  }, [])

  const loadCurrentCode = async () => {
    try {
      const savedCode = localStorage.getItem("adminSettingsCode") || "ADMIN123"
      setSettingsCode(prev => ({
        ...prev,
        currentCode: savedCode
      }))
    } catch (error) {
      console.error("Error loading settings code:", error)
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
        <Key className="h-6 w-6 text-orange-500" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Settings Code Management
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Code Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Current Settings Code
            </CardTitle>
            <CardDescription>
              The code currently required to access admin settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentCode">Active Code</Label>
              <div className="relative">
                <Input
                  id="currentCode"
                  type={showPasswords.currentCode ? "text" : "password"}
                  value={settingsCode.currentCode}
                  readOnly
                  className="bg-gray-50 font-mono"
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

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This is the code users must enter to access the admin panel settings.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Update Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-500" />
              Update Settings Code
            </CardTitle>
            <CardDescription>
              Change the access code for admin settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  className="font-mono"
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
                  className="font-mono"
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

      {/* Security Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Security Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Recommended</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Use at least 8 characters</li>
                <li>• Include numbers and special characters</li>
                <li>• Avoid common words or patterns</li>
                <li>• Change code regularly</li>
                <li>• Keep code confidential</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">✗ Avoid</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Simple passwords like "1234"</li>
                <li>• Personal information</li>
                <li>• Dictionary words</li>
                <li>• Sharing with unauthorized users</li>
                <li>• Writing down in plain text</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> After updating the settings code, all users will need to use the new code to access admin settings.
          Make sure to communicate the new code securely to authorized personnel.
        </AlertDescription>
      </Alert>
    </div>
  )
}
