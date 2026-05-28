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
  const [processing, setProcessing] = useState(false)
  
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
      console.log('[Scanner] Starting camera initialization...')
      
      const element = document.getElementById(readerId)
      if (!element) {
        console.error('[Scanner] Element not found:', readerId)
        return
      }

      console.log('[Scanner] Requesting camera permission...')
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      console.log('[Scanner] Camera permission granted')
      stream.getTracks().forEach(track => track.stop())

      setScanning(true)

      // Initialize scanner
      if (!scannerRef.current) {
        console.log('[Scanner] Creating new Html5Qrcode instance')
        scannerRef.current = new Html5Qrcode(readerId)
      }

      console.log('[Scanner] Getting available cameras...')
      const cameras = await Html5Qrcode.getCameras()
      console.log('[Scanner] Cameras found:', cameras.length, cameras)
      
      if (!cameras || cameras.length === 0) {
        throw new Error('No camera found')
      }

      const cameraId = cameras.find(cam => 
        cam.label.toLowerCase().includes('back') || 
        cam.label.toLowerCase().includes('rear')
      )?.id || cameras[0].id

      console.log('[Scanner] Using camera ID:', cameraId)
      console.log('[Scanner] Starting Html5Qrcode.start()...')

      await scannerRef.current.start(
        cameraId,
        {
          fps: 20,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          console.log('[Scanner] SUCCESS CALLBACK - Barcode detected:', decodedText)
          handleScanResult(decodedText)
        },
        (errorMessage) => {
          // Ignore scan errors (happens frequently during scanning)
          // console.log('[Scanner] Scan error (normal):', errorMessage)
        }
      )
      
      console.log('[Scanner] Scanner started successfully')
    } catch (err: any) {
      console.error('[Scanner] Camera error:', err)
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
    // Prevent multiple scans while processing
    if (processing) {
      console.log('[Scanner] Already processing, ignoring scan')
      return
    }
    
    console.log('[Scanner] Barcode detected:', code)
    setProcessing(true)
    
    // Haptic feedback (vibration)
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }
    
    // Play success sound
    playBeep(1000, 0.1)
    
    // Show processing feedback
    const processingResult: ScanResult = {
      code,
      status: 'success',
      message: 'Processing order...',
      timestamp: Date.now()
    }
    setLastResult(processingResult)
    
    try {
      // Call the onScan callback and wait for it to complete
      await onScan(code)
      
      // Update to success after processing
      const successResult: ScanResult = {
        code,
        status: 'success',
        message: 'Order packed successfully!',
        timestamp: Date.now()
      }
      setLastResult(successResult)
      
      // Voice feedback for success
      speakMessage('Order scanned successfully')
      
    } catch (error: any) {
      // Show error feedback
      const errorResult: ScanResult = {
        code,
        status: 'error',
        message: error.message || 'Failed to process order',
        timestamp: Date.now()
      }
      setLastResult(errorResult)
      playBeep(400, 0.2)
      
      // Voice feedback for error
      if (error.message?.toLowerCase().includes('cancelled')) {
        speakMessage('Order cancelled')
      } else if (error.message?.toLowerCase().includes('not found')) {
        speakMessage('Order not found')
      } else {
        speakMessage('Scan failed')
      }
      
      // Vibrate on error (different pattern)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
    } finally {
      setProcessing(false)
      
      // Clear input and refocus for next scan
      setInputValue('')
      if (!cameraActive && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const code = inputValue.trim()
    if (!code) return

    await handleScanResult(code)
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

  const speakMessage = (message: string) => {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.0 // Normal speed
      utterance.pitch = 1.0 // Normal pitch
      utterance.volume = 1.0 // Full volume
      utterance.lang = 'en-US' // English
      
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Speech synthesis error:', error)
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
      <DialogContent className="max-w-3xl p-0 gap-0 border-2 border-slate-300 dark:border-slate-700 [&>button]:hidden">
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
            <div className="flex items-center gap-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-white dark:text-slate-900 hover:bg-white/20 dark:hover:bg-slate-900/20"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
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
                  disabled={processing}
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
