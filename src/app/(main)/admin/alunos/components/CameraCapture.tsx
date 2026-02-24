"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (fotoBase64: string | null) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Função para iniciar a câmera
  async function iniciarCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera", err);
    }
  }

  useEffect(() => {
    iniciarCamera();
    // Cleanup: Para a câmera quando o componente for destruído
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  function capturarFoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg");
    
    onCapture(base64);
    setHasPhoto(true);
    
    // Opcional: Para o vídeo para economizar recursos após capturar
    // stream?.getTracks().forEach(track => track.stop());
  }

  function resetarCaptura() {
    setHasPhoto(false);
    onCapture(null); // Avisa o formulário que a foto foi removida
    iniciarCamera(); // Reativa a câmera se ela tiver sido parada
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg bg-slate-50">
      {/* Container da Câmera com largura fixa máxima */}
      <div className="relative overflow-hidden rounded-md bg-black w-full max-w-[320px] aspect-video shadow-inner">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover ${hasPhoto ? 'hidden' : 'block'}`} 
        />
        <canvas 
          ref={canvasRef} 
          className={`w-full h-full object-cover ${hasPhoto ? 'block' : 'hidden'}`} 
        />
      </div>
      
      {/* Removido 'w-full' para o botão não esticar */}
      {!hasPhoto ? (
        <Button 
          type="button" 
          onClick={capturarFoto}
          className="gap-2 px-8" // Adicionei 'px-8' para um tamanho confortável, mas sem w-full
        >
          <Camera className="h-4 w-4" />
          Capturar Foto
        </Button>
      ) : (
        <Button 
          type="button" 
          variant="outline" 
          onClick={resetarCaptura}
          className="gap-2 px-8 border-blue-200 hover:bg-blue-50"
        >
          <RefreshCw className="h-4 w-4" />
          Capturar Novamente
        </Button>
      )}
    </div>
  );
}
