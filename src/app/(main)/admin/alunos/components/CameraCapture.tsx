"use client";

import { useEffect, useRef } from "react";

interface CameraCaptureProps {
  onCapture: (fotoBase64: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function iniciarCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }

    iniciarCamera();
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
  }

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline width={300} />
      <br />
      <button type="button" onClick={capturarFoto}>
        Capturar Foto
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
