'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Camera, Keyboard } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onScan: (waybill: string) => void
}

interface ScanResult {
  code: string
  status: 'success' | 'error'
  message: string
  timestamp: number
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const [inputValue, setInputValue] = useState('')
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [cameraActive, setCameraActive] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const readerId = 'barcode-reader'

  // Initialize camera on modal open
  useEffect(() => {
    if (open && cameraActive) {
      setTimeout(() => {
        startCamera()
      }, 100)
    }

    return () => {
      stopCamera()
    }
  }, [open, cameraActive])

  // Auto-focus input when camera is disabled
  useEffect(() => {
    if (open && !cameraActive && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open, cameraActive])

  const startCamera = async () => {
    try {
      setCameraError(null)
      
      const element = document.getElementById(readerId)
      if (!element) return

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      stream.getTracks().forEach(track => track.stop())

      setScanning(true)

      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerId)
      }

      const cameras = await Html5Qrcode.getCameras()
      if (!cameras || cameras.length === 0) {
        throw new Error('No camera found')
      }

      const cameraId = cameras.find(cam => 
        cam.label.toLowerCase().includes('back') || 
        cam.label.toLowerCase().includes('rear')
      )?.id || cameras[0].id

      await scannerRef.current.start(
        cameraId,
        {
          fps: 20,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleScanResult(decodedText)
        },
        () => {
          // Ignore scan errors
        }
      )
    } catch (err: any) {
      console.error('Camera error:', err)
      setCameraError(err.message || 'Camera unavailable')
      setCameraActive(false)
      setScanning(false)
    }
  }

  const stopCamera = async () => {
    try {
      if (scannerRef.current && scanning) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      }
    } catch (err) {
      console.error('Error stopping camera:', err)
    } finally {
      setScanning(false)
    }
  }

  const handleScanResult = async (code: string) => {
    try {
      // Call the onScan callback and wait for it
      const result = await onScan(code)
      
      // If we get here without error, it's a success
      const scanResult: ScanResult = {
        code,
        status: 'success',
        message: 'Order packed successfully',
        timestamp: Date.now()
      }
      
      setLastResult(scanResult)
      playBeep(1000, 0.1)
      
      // Vibrate on success
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
      
    } catch (error: any) {
      // Error feedback
      const scanResult: ScanResult = {
        code,
        status: 'error',
        message: error.message || 'Order not found',
        timestamp: Date.now()
      }
      
      setLastResult(scanResult)
      playBeep(400, 0.2)
      
      // Vibrate on error (different pattern)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
    }
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const code = inputValue.trim()
    if (!code) return

    handleScanResult(code)
    setInputValue('')
    inputRef.current?.focus()
  }

  const playBeep = (frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      // Ignore audio errors
    }
  }

  const switchMode = () => {
    if (cameraActive) {
      stopCamera()
      setCameraActive(false)
    } else {
      setCameraActive(true)
      startCamera()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 border-2 border-slate-300 dark:border-slate-700">
        <VisuallyHidden>
          <DialogTitle>Barcode Scanner</DialogTitle>
        </VisuallyHidden>
        
        {/* Industrial Scanner Interface */}
        <div className="bg-white dark:bg-slate-950">
          {/* Header */}
          <div className="border-b-2 border-slate-900 dark:border-white bg-slate-900 dark:bg-white px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white dark:text-slate-900 uppercase tracking-wide">
              SCAN ITEM
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={switchMode}
              className="h-8 text-white dark:text-slate-900 hover:bg-white/20 dark:hover:bg-slate-900/20"
            >
              {cameraActive ? (
                <>
                  <Keyboard className="h-4 w-4 mr-2" />
                  Input Mode
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Camera Mode
                </>
              )}
            </Button>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Camera Scanner Section */}
            {cameraActive && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  CAMERA SCANNER
                </div>
                <div className="relative bg-slate-900 rounded-md overflow-hidden border-2 border-slate-700">
                  <div id={readerId} className="w-full min-h-[300px]" />
                  {!scanning && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <div className="text-center text-white">
                        <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm">Initializing camera...</p>
                      </div>
                    </div>
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <div className="text-center text-white p-4">
                        <XCircle className="h-12 w-12 mx-auto mb-2 text-red-500" />
                        <p className="text-sm mb-2">{cameraError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={switchMode}
                          className="text-white border-white hover:bg-white/20"
                        >
                          Switch to Input Mode
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Divider */}
            {cameraActive && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-400 font-bold">
                    OR SCAN MANUALLY
                  </span>
                </div>
              </div>
            )}

            {/* Input Field */}
            <form onSubmit={handleInputSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  WAYBILL NUMBER
                </label>
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Scan or type waybill..."
                  className="h-14 text-xl font-mono border-2 border-slate-300 dark:border-slate-700 focus:border-slate-900 dark:focus:border-white focus:ring-0 rounded-md bg-white dark:bg-slate-900"
                  autoComplete="off"
                  autoFocus={!cameraActive}
                />
              </div>
            </form>

            {/* Last Scanned Item Display */}
            {lastResult && (
              <div className={`border-2 rounded-md p-4 ${
                lastResult.status === 'success' 
                  ? 'border-green-600 bg-green-50 dark:bg-green-950/20' 
                  : 'border-red-600 bg-red-50 dark:bg-red-950/20'
              }`}>
                <div className="flex items-start gap-3">
                  {lastResult.status === 'success' ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      LAST SCAN
                    </div>
                    <div className="font-mono text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {lastResult.code}
                    </div>
                    <div className={`text-sm font-semibold ${
                      lastResult.status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                    }`}>
                      {lastResult.message}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Press ESC to close • Scanner auto-submits on Enter
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
