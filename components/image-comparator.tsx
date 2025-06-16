"use client"

import { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"

interface ImageComparatorProps {
  originalImage: string
  processedImage: string
}

export function ImageComparator({ originalImage, processedImage }: ImageComparatorProps) {
  const [sliderValue, setSliderValue] = useState([50])
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])



  const clipWidth = (sliderValue[0] / 100) * containerWidth

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Image Comparison</h3>
        <p className="text-slate-300 text-sm">Drag the slider to compare original and processed images</p>
      </div>

      <Card className="bg-slate-900/50 border-slate-700 p-4">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-lg bg-slate-800"
          style={{ aspectRatio: "16/9" }}
        >
          {/* Processed Image (Background) */}
          <img
            src={processedImage || "/placeholder.svg"}
            alt="Processed lunar surface with crater detection"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Original Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${containerWidth - clipWidth}px 0 0)` }}
          >
            <img
              src={originalImage || "/placeholder.svg"}
              alt="Original lunar surface"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Slider Line */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" style={{ left: `${clipWidth}px` }}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-1 h-4 bg-slate-400 rounded"></div>
              <div className="w-1 h-4 bg-slate-400 rounded ml-1"></div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            Original
          </div>
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            Crater Detection
          </div>
        </div>

        <div className="mt-6 px-4">
          <Slider value={sliderValue} onValueChange={setSliderValue} max={100} min={0} step={1} className="w-full" />
          <div className="flex justify-between text-sm text-slate-400 mt-2">
            <span>Original Image</span>
            <span>{sliderValue[0]}%</span>
            <span>Processed Image</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/30 border-slate-700 p-4">
          <h4 className="text-white font-medium mb-2">Original Image</h4>
          <p className="text-slate-300 text-sm">Raw lunar surface imagery ready for crater analysis</p>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700 p-4">
          <h4 className="text-white font-medium mb-2">Processed Image</h4>
          <p className="text-slate-300 text-sm">Image with detected craters highlighted</p>
        </Card>
      </div>
    </div>
  )
}
