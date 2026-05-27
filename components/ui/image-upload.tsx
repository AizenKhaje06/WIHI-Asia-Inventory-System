"use client"

import { useState, useRef, useCallback } from "react"
import imageCompression from "browser-image-compression"
import { ImageIcon, Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ImageCropper } from "@/components/ui/image-cropper"

interface ImageUploadProps {
  currentImageUrl?: string | null
  value?: string | null  // Alternative to currentImageUrl
  itemId?: string
  onUploadComplete?: (url: string) => void
  onChange?: (url: string) => void  // Alternative to onUploadComplete
  onRemove?: () => void
  className?: string
  disabled?: boolean
  uploadType?: 'product' | 'profile'  // NEW: Specify upload type
}

export function ImageUpload({
  currentImageUrl,
  value,
  itemId,
  onUploadComplete,
  onChange,
  onRemove,
  className,
  disabled = false,
  uploadType = 'product',  // Default to product for backward compatibility
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || currentImageUrl || null)
  const [dragOver, setDragOver] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Support both onUploadComplete and onChange
  const handleUploadSuccess = useCallback((url: string) => {
    if (onUploadComplete) onUploadComplete(url)
    if (onChange) onChange(url)
  }, [onUploadComplete, onChange])

  const processAndUpload = useCallback(async (file: File | Blob) => {
    // Validate type (skip for Blob from cropper)
    if (file instanceof File) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Only JPG, PNG, WebP allowed.")
        return
      }
    }

    try {
      setUploading(true)

      // Auto-compress image
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,        // Max 300KB
        maxWidthOrHeight: 800, // Max 800px
        useWebWorker: true,
        fileType: "image/webp", // Convert to WebP for best compression
      })

      // Show preview immediately
      const previewUrl = URL.createObjectURL(compressed)
      setPreview(previewUrl)

      // Upload to API (use different endpoint based on uploadType)
      const uploadEndpoint = uploadType === 'profile' ? '/api/upload-profile' : '/api/upload'
      
      const formData = new FormData()
      formData.append("file", compressed, `${uploadType}.webp`)
      if (itemId) formData.append("itemId", itemId)

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          "x-user-username": localStorage.getItem("username") || "",
          "x-user-role": localStorage.getItem("userRole") || "",
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      handleUploadSuccess(data.url)
      toast.success("Image uploaded successfully")
    } catch (error: any) {
      console.error("[ImageUpload] Error:", error)
      toast.error(error.message || "Failed to upload image")
      setPreview(value || currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }, [itemId, value, currentImageUrl, handleUploadSuccess, uploadType])

  const handleFileSelect = (file: File) => {
    // For profile images, show cropper
    if (uploadType === 'profile') {
      const reader = new FileReader()
      reader.onload = () => {
        setImageToCrop(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    } else {
      // For product images, upload directly
      processAndUpload(file)
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false)
    setImageToCrop(null)
    await processAndUpload(croppedBlob)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setImageToCrop(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onRemove?.()
  }

  return (
    <>
      {/* Image Cropper Dialog */}
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropShape="round"
        />
      )}

      <div className={cn("relative", className)}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || uploading}
        />

      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative w-full h-40 rounded-lg border-2 border-dashed transition-all cursor-pointer overflow-hidden",
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500",
          (disabled || uploading) && "cursor-not-allowed opacity-60",
          preview ? "border-solid border-slate-200 dark:border-slate-700" : ""
        )}
      >
        {preview ? (
          <>
            {/* Image Preview */}
            <img
              src={preview.startsWith('blob:') || preview.startsWith('data:') 
                ? preview 
                : `/api/image-proxy?url=${encodeURIComponent(preview)}`}
              alt="Product"
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">
                <Upload className="h-3.5 w-3.5" />
                Change
              </div>
            </div>
            {/* Remove button */}
            {!disabled && onRemove && (
              <button
                onClick={handleRemove}
                type="button"
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all z-20 group flex items-center justify-center"
                title="Remove image"
              >
                <X className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Compressing & uploading...</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                  <ImageIcon className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Click or drag to upload
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    JPG, PNG, WebP • Max 300KB (auto-compressed)
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Upload progress overlay */}
        {uploading && preview && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
              <p className="text-white text-xs font-medium">Uploading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
