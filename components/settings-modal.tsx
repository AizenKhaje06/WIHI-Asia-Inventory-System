"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, AlertCircle } from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onCodeSubmit: (code: string) => void
}

export function SettingsModal({ isOpen, onClose, onCodeSubmit }: SettingsModalProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simulate code validation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (code === "ADMIN123" || code === "admin") {
        onCodeSubmit(code)
        setCode("")
        onClose()
      } else {
        setError("Invalid access code. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setCode("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Admin Access Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Enter your admin access code to proceed to settings.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Access Code</Label>
              <Input
                id="code"
                type="password"
                placeholder="Enter admin code..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? "Verifying..." : "Access Settings"}
              </Button>
            </div>
          </form>

          <div className="text-xs text-gray-500 text-center">
            <p>Default codes: <code className="bg-gray-100 px-1 rounded">ADMIN123</code> or <code className="bg-gray-100 px-1 rounded">admin</code></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
