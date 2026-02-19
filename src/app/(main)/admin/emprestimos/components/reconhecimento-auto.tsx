"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onAlunoReconhecido: (aluno: any) => void;
};

export default function ReconhecimentoAuto({ onAlunoReconhecido }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  async function iniciarCamera() {
    const s = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(s);

    if (videoRef.current) {
      videoRef.current.srcObject = s;
    }
  }

  useEffect(() => {
    iniciarCamera();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function capturarReconhecer() {
    if (!videoRef.current) return;

    setLoading(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg");

    const res = await fetch("/api/face/recognize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64 }),
    });

    const data = await res.json();

    if (data?.aluno) {
      onAlunoReconhecido(data.aluno);
    } else {
      alert("Aluno não reconhecido");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-3">

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-48 bg-black rounded-lg object-cover"
      />

      <Button
        type="button"
        onClick={capturarReconhecer}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Reconhecendo..." : "Reconhecer por Rosto"}
      </Button>

    </div>
  );
}
