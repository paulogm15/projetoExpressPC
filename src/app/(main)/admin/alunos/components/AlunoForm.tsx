"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CameraCapture from "./CameraCapture";

type AlunoFormProps = {
  onSuccess: () => void;
};

export default function AlunoForm({ onSuccess }: AlunoFormProps) {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fotoBase64) {
      alert("Capture a foto do aluno");
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
      setFotoBase64(null);
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

        <CameraCapture onCapture={setFotoBase64} />

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Cadastrar Aluno"}
        </Button>
      </CardContent>
    </Card>
  );
}
