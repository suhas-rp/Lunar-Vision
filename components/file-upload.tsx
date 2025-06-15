"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        const previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)
        onFileUpload(file)
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".tiff", ".bmp"],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-purple-400 bg-purple-400/10"
              : "border-slate-600 hover:border-slate-500 bg-slate-800/30"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-slate-400" />
          </div>

          {isDragActive ? (
            <div className="text-purple-400">
              <p className="text-lg font-medium">Drop your lunar image here</p>
            </div>
          ) : (
            <div className="text-slate-300">
              <p className="text-lg font-medium mb-2">Drag & drop your lunar image here</p>
              <p className="text-sm text-slate-400 mb-4">or click to browse files</p>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </div>
          )}

          <p className="text-xs text-slate-500">Supports: JPEG, PNG, TIFF, BMP (Max 50MB)</p>
        </div>
      </div>

      {preview && (
        <div className="relative">
          <img
            src={preview || "/placeholder.svg"}
            alt="Preview"
            className="w-full max-w-md mx-auto rounded-lg border border-slate-600"
          />
          <Button onClick={clearPreview} size="sm" variant="destructive" className="absolute top-2 right-2">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
