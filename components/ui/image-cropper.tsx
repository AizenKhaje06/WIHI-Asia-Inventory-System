"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react"

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
  aspectRatio?: number
  cropShape?: "rect" | "round"
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  cropShape = "round",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropAreaChange = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      )
      onCropComplete(croppedImage)
    } catch (error) {
      console.error("Error cropping image:", error)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-white dark:bg-slate-900 border-0 shadow-2xl">
        {/* Header - Compact */}
        <DialogHeader className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600">
              <Maximize2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Crop Profile Image
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust your profile picture
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content - Compact */}
        <div className="p-5 space-y-4">
          {/* Cropper Area - Smaller */}
          <div className="relative h-[360px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              cropShape={cropShape}
              showGrid={false}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropAreaChange}
              style={{
                containerStyle: {
                  backgroundColor: '#020617',
                },
                cropAreaStyle: {
                  border: '2px solid #3b82f6',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                },
              }}
            />
          </div>

          {/* Controls - Compact */}
          <div className="space-y-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ZoomIn className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Zoom
                  </label>
                </div>
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                </button>
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={1}
                  max={3}
                  step={0.05}
                  className="cursor-pointer flex-1"
                />
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700"></div>

            {/* Rotation Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCw className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Rotation
                  </label>
                </div>
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {rotation}°
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRotation((rotation - 15 + 360) % 360)}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title="Rotate left"
                >
                  <RotateCw className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 transform -scale-x-100" />
                </button>
                <Slider
                  value={[rotation]}
                  onValueChange={(value) => setRotation(value[0])}
                  min={0}
                  max={360}
                  step={1}
                  className="cursor-pointer flex-1"
                />
                <button
                  onClick={() => setRotation((rotation + 15) % 360)}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title="Rotate right"
                >
                  <RotateCw className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <DialogFooter className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-end w-full gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="h-9 px-4 text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={createCroppedImage} 
              className="h-9 px-5 text-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Crop
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to create cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No 2d context")
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  )

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("Canvas is empty"))
      }
    }, "image/webp")
  })
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })
}
