"use client";

import CameraCapture from "../../../admin/alunos/components/CameraCapture";

interface Props {
  onCapture: (fotoBase64: string | null) => void;
}

export default function CameraReconhecimento({ onCapture }: Props) {
  return <CameraCapture onCapture={onCapture} />;
}
