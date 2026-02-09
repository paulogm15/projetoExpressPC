"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CameraCapture from "./components/CameraCapture";

type Props = {
  onSuccess: () => void;
};

export default function AlunoForm({ onSuccess }: Props) {
  const [nome, setNome] = useState<string>("");
  const [matricula, setMatricula] = useState<string>("");
  const [fotoBase64, setFotoBase64] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!nome || !matricula || !fotoBase64) {
      alert("Preencha todos os campos e capture a foto.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          matricula,
          fotoBase64,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar aluno");
      }

      setNome("");
      setMatricula("");
      setFotoBase64("");
      onSuccess();
    } catch (error) {
      alert("Erro ao cadastrar aluno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Input
          placeholder="Nome do aluno"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <Input
          placeholder="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
        />

        {/* Câmera */}
        <CameraCapture
          onCapture={(foto: string) => setFotoBase64(foto)}
        />

        {fotoBase64 && (
          <p className="text-sm text-green-600">
            Foto capturada com sucesso ✔
          </p>
        )}

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Cadastrar Aluno"}
        </Button>
      </CardContent>
    </Card>
  );
}
