"use client"

import { useState } from "react"
import axios from "axios"
import { FileUpload } from "./file-upload"
import { ImageComparator } from "./image-comparator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalysisResult {
  originalImage: string
  processedImage: string
  craterCount: number
  confidence: number
}

export function CraterAnalyzer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const { toast } = useToast()

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setAnalysisResult(null)
  }

  // ✅ Upload to RapidAPI host using base64 string
  const uploadImage = async (base64String: string): Promise<string> => {
    const encodedParams = new URLSearchParams()
    encodedParams.set("image", base64String)
    encodedParams.set("expiration", "1") // Optional: set higher if you want longer lifespan

    const options = {
      method: "POST",
      url: "https://upload-images-hosting-get-url.p.rapidapi.com/upload",
      headers: {
        "x-rapidapi-key": "33529728eamshcc73a23bbbd9290p16a292jsn209f8f04767b",
        "x-rapidapi-host": "upload-images-hosting-get-url.p.rapidapi.com",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: encodedParams,
    }

    const response = await axios.request(options)
    console.log("RapidAPI Upload Response:", response.data)

    return response.data.data.display_url
  }

  const analyzeImage = async () => {
    if (!uploadedFile) return
    setIsAnalyzing(true)

    try {
      // ✅ Convert file to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          resolve(result.split(",")[1]) // Remove "data:image/...;base64,"
        }
        reader.onerror = reject
        reader.readAsDataURL(uploadedFile)
      })

      // ✅ Upload to get a public URL
      const publicImageUrl = await uploadImage(base64String)

      // ✅ Call Roboflow API with that public URL
      const response = await fetch(
        "https://serverless.roboflow.com/infer/workflows/lunar-detector/detect-count-and-visualize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: "Oz7G7zMT4h784DdsQpGA",
            inputs: {
              image: { type: "url", value: publicImageUrl },
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Roboflow API Response:", result)

      // ✅ Extract processed image and crater count from Roboflow response
      const base64Image = result.outputs?.[0]?.output_image?.value || ""
      const processedImageUrl = `data:image/jpeg;base64,${base64Image}`
      const craterCount = result.outputs?.[0]?.count_objects || 0
      const confidence = 0.85 // Replace with actual value if your model returns it

      setAnalysisResult({
        originalImage: publicImageUrl,
        processedImage: processedImageUrl,
        craterCount,
        confidence,
      })

      toast({
        title: "Analysis Complete",
        description: `Detected ${craterCount} craters with ${Math.round(confidence * 100)}% confidence`,
      })
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setUploadedFile(null)
    setAnalysisResult(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {!analysisResult ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Upload Lunar Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUpload onFileUpload={handleFileUpload} />

            {uploadedFile && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-white">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-slate-300">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Craters"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-2xl">Analysis Results</CardTitle>
              <Button
                onClick={resetAnalysis}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </CardHeader>
            <CardContent>
              <div className="content-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-400">{analysisResult.craterCount}</p>
                  <p className="text-slate-300">Craters Detected</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-400">AI</p>
                  <p className="text-slate-300">Powered Analysis</p>
                </div>
              </div>
              </div>
              <ImageComparator
                originalImage={analysisResult.originalImage}
                processedImage={analysisResult.processedImage}
              />
              <div className="flex justify-end mt-4">
            <a
              href={analysisResult.processedImage}
              download="processed-lunar-image.jpg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Download Processed Image
              </a>
            </div>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
