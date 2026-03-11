'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Camera, X, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onScan: (waybill: string) => void
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      setScanning(true)

      // Check if element exists
      const element = document.getElementById(readerId)
      if (!element) {
        throw new Error('Scanner element not found. Please try again.')
      }

      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerId)
      }

      // Get cameras
      const cameras = await Html5Qrcode.getCameras()
      if (!cameras || cameras.length === 0) {
        throw new Error('No cameras found on this device')
      }

      // Use back camera if available, otherwise use first camera
      const cameraId = cameras.find(cam => 
        cam.label.toLowerCase().includes('back') || 
        cam.label.toLowerCase().includes('rear')
      )?.id || cameras[0].id

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
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Scanning error (ignore, happens frequently)
        }
      )
    } catch (err: any) {
      console.error('Scanner error:', err)
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
    onClose()
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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
