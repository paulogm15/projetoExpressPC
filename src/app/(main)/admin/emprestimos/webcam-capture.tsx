"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, Check, X } from "lucide-react"

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void
  onCancel?: () => void
  capturedImage?: string | null
}

export function WebcamCapture({ onCapture, onCancel, capturedImage }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(capturedImage || null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
      }
    } catch {
      setError("Nao foi possivel acessar a camera. Verifique as permissoes.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setPreviewImage(imageData)
        stopCamera()
      }
    }
  }, [stopCamera])

  const confirmCapture = useCallback(() => {
    if (previewImage) {
      onCapture(previewImage)
    }
  }, [previewImage, onCapture])

  const retakePhoto = useCallback(() => {
    setPreviewImage(null)
    startCamera()
  }, [startCamera])

  const cancelCapture = useCallback(() => {
    setPreviewImage(null)
    stopCamera()
    onCancel?.()
  }, [stopCamera, onCancel])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  useEffect(() => {
    if (capturedImage) {
      setPreviewImage(capturedImage)
    }
  }, [capturedImage])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-[4/3] bg-muted rounded-lg overflow-hidden border-2 border-border">
        {previewImage ? (
          <img 
            src={previewImage || "/placeholder.svg"} 
            alt="Foto capturada" 
            className="w-full h-full object-cover"
          />
        ) : isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Camera className="w-16 h-16" />
            <p className="text-sm text-center px-4">
              {error || "Clique para iniciar a camera"}
            </p>
          </div>
        )}
        
        {isStreaming && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-full opacity-50" />
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="flex gap-2">
        {!isStreaming && !previewImage && (
          <Button onClick={startCamera} className="gap-2">
            <Camera className="w-4 h-4" />
            Iniciar Camera
          </Button>
        )}
        
        {isStreaming && (
          <>
            <Button onClick={capturePhoto} className="gap-2">
              <Camera className="w-4 h-4" />
              Capturar Foto
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
        
        {previewImage && (
          <>
            <Button onClick={confirmCapture} className="gap-2 bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-[hsl(var(--success-foreground))]">
              <Check className="w-4 h-4" />
              Confirmar
            </Button>
            <Button variant="outline" onClick={retakePhoto} className="gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Tirar Outra
            </Button>
            <Button variant="ghost" onClick={cancelCapture}>
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
