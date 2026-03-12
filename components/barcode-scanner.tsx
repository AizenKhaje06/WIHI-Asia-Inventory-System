'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, X, AlertCircle, Keyboard } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onScan: (waybill: string) => void
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const readerId = 'barcode-reader'

  useEffect(() => {
    if (open && !scanning) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        startScanning()
      }, 100)
    }

    return () => {
      stopScanning()
    }
  }, [open])

  const startScanning = async () => {
    try {
      setError(null)

      // Check if element exists
      const element = document.getElementById(readerId)
      if (!element) {
        throw new Error('Scanner element not found. Please try again.')
      }

      console.log('[Scanner] Requesting camera permission...')

      // Request camera permission FIRST using getUserMedia
      // This will trigger the browser's permission prompt
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        })
        console.log('[Scanner] Camera permission granted')
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop())
      } catch (permError: any) {
        console.error('[Scanner] Permission error:', permError)
        if (permError.name === 'NotAllowedError') {
          throw new Error('Camera permission denied. Please allow camera access and try again.')
        } else if (permError.name === 'NotFoundError') {
          throw new Error('No camera found on this device.')
        } else if (permError.name === 'NotReadableError') {
          throw new Error('Camera is already in use by another application.')
        } else {
          throw new Error('Failed to access camera: ' + permError.message)
        }
      }

      setScanning(true)

      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerId)
      }

      // Get cameras
      console.log('[Scanner] Getting available cameras...')
      const cameras = await Html5Qrcode.getCameras()
      console.log('[Scanner] Cameras found:', cameras.length)
      
      if (!cameras || cameras.length === 0) {
        throw new Error('No cameras found on this device.')
      }

      // Use back camera if available, otherwise use first camera
      const cameraId = cameras.find(cam => 
        cam.label.toLowerCase().includes('back') || 
        cam.label.toLowerCase().includes('rear')
      )?.id || cameras[0].id

      console.log('[Scanner] Using camera:', cameraId)
      console.log('[Scanner] Starting scanner...')

      // Start scanning
      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Successfully scanned
          console.log('[Scanner] Barcode scanned:', decodedText)
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Scanning error (ignore, happens frequently)
        }
      )
      
      console.log('[Scanner] Scanner started successfully')
    } catch (err: any) {
      console.error('[Scanner] Error:', err)
      setError(err.message || 'Failed to start camera')
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current && scanning) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      }
    } catch (err) {
      console.error('Error stopping scanner:', err)
    } finally {
      setScanning(false)
    }
  }

  const handleClose = () => {
    stopScanning()
    setManualMode(false)
    setManualInput('')
    setError(null)
    onClose()
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      setManualInput('')
      handleClose()
    }
  }

  const switchToManualMode = () => {
    stopScanning()
    setManualMode(true)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Waybill Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="link"
                  size="sm"
                  className="ml-2 h-auto p-0 text-red-600 hover:text-red-700"
                  onClick={switchToManualMode}
                >
                  Switch to manual input
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {manualMode ? (
            // Manual Input Mode
            <div className="space-y-4">
              <div className="text-center py-8">
                <Keyboard className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Enter waybill number manually or use USB barcode scanner
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <Input
                  placeholder="Enter waybill number..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  autoFocus
                  className="text-center font-mono text-lg"
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setManualMode(false)
                      setManualInput('')
                      startScanning()
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Use Camera
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!manualInput.trim()}
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            // Camera Scanning Mode
            <>
              <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                <div id={readerId} className="w-full" />
                {!scanning && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="text-center text-white">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Initializing camera...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Position the barcode within the frame to scan
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={switchToManualMode}
              >
                <Keyboard className="h-4 w-4 mr-2" />
                Enter Manually
              </Button>
            </>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
