'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, X, AlertCircle, Keyboard, Search } from 'lucide-react'
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

  // Success sound function
  const playSuccessSound = () => {
    try {
      // Create audio context for beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Configure beep sound
      oscillator.frequency.value = 1000 // 1000 Hz frequency
      oscillator.type = 'sine'
      
      // Volume control
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      // Play beep
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.log('[Scanner] Could not play sound:', error)
    }
  }

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
          fps: 20, // Increased from 10 to 20 for faster scanning
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Successfully scanned
          console.log('[Scanner] Barcode scanned:', decodedText)
          
          // Haptic feedback (vibration)
          if (navigator.vibrate) {
            navigator.vibrate(200) // Vibrate for 200ms
          }
          
          // Play success sound
          playSuccessSound()
          
          onScan(decodedText)
          stopScanning()
        },
        () => {
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
      <DialogContent className="sm:max-w-[600px] border-t-4 border-t-blue-600 p-0 gap-0 overflow-hidden">
        {/* Professional Header */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              {manualMode ? (
                <Keyboard className="h-6 w-6 text-white" strokeWidth={2.5} />
              ) : (
                <Camera className="h-6 w-6 text-white" strokeWidth={2.5} />
              )}
            </div>
            <div>
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {manualMode ? 'Manual Input' : 'Barcode Scanner'}
              </div>
              <p className="text-xs font-normal text-slate-600 dark:text-slate-400 mt-1">
                {manualMode ? 'Type or scan waybill number' : 'Scan order waybill barcode'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {error && (
            <Alert variant="destructive" className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="flex items-center justify-between">
                <span className="font-medium">{error}</span>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-2 h-auto p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                  onClick={switchToManualMode}
                >
                  Switch to manual →
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {manualMode ? (
            // Professional Manual Input Mode
            <div className="space-y-5">
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-slate-900/30 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/30 mb-4">
                  <Keyboard className="h-10 w-10 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-base text-slate-800 dark:text-slate-200 font-bold mb-2">
                  Enter Waybill Number
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Type manually or use USB barcode scanner for instant input
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Type or scan waybill number..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    autoFocus
                    className="text-center font-mono text-xl h-14 border-2 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl shadow-sm"
                  />
                  {manualInput && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                    onClick={() => {
                      setManualMode(false)
                      setManualInput('')
                      startScanning()
                    }}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Use Camera
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-lg shadow-blue-500/30 font-semibold"
                    disabled={!manualInput.trim()}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search Order
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            // Professional Camera Scanning Mode
            <>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
                <div id={readerId} className="w-full min-h-[350px]" />
                {!scanning && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="text-center text-white">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/50 mb-4 animate-pulse">
                        <Camera className="h-10 w-10 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-base font-bold mb-2">Initializing Camera</p>
                      <p className="text-sm text-slate-400">Please wait a moment...</p>
                      <div className="flex items-center justify-center gap-1 mt-4">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-lg">📦</span>
                  </div>
                  <p className="text-base text-blue-900 dark:text-blue-100 font-bold">
                    Position Barcode Within Frame
                  </p>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Scanner will detect and process automatically
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 border-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                onClick={switchToManualMode}
              >
                <Keyboard className="h-5 w-5 mr-2" />
                Switch to Manual Input
              </Button>
            </>
          )}
        </div>

        {/* Professional Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t">
          <Button
            variant="ghost"
            className="w-full h-12 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
            onClick={handleClose}
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
