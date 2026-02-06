"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CameraCapture from "./components/CameraCapture";

type Aluno = {
  id: number;
  nome: string;
  matricula: string;
};

type Props = {
  onSuccess: () => void;
  alunoInicial?: Aluno | null;
};

export default function AlunoForm({ onSuccess, alunoInicial }: Props) {
  const [nome, setNome] = useState<string>("");
  const [matricula, setMatricula] = useState<string>("");
  
  // CORREÇÃO: Permitir que o estado seja string ou null
  const [fotoBase64, setFotoBase64] = useState<string | null>(""); 
  
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (alunoInicial) {
      setNome(alunoInicial.nome);
      setMatricula(alunoInicial.matricula);
      setFotoBase64(""); 
    } else {
      setNome("");
      setMatricula("");
      setFotoBase64("");
    }
  }, [alunoInicial]);

  const handleSubmit = async () => {
    if (!nome || !matricula || (!alunoInicial && !fotoBase64)) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);

    const url = "/api/admin/alunos";
    const method = alunoInicial ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: alunoInicial?.id,
          nome,
          matricula,
          fotoBase64: fotoBase64 || undefined,
        }),
      });

      if (!response.ok) throw new Error("Erro na requisição");

      setNome("");
      setMatricula("");
      setFotoBase64("");
      onSuccess();
    } catch (error) {
      alert("Ocorreu um erro ao salvar o aluno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{alunoInicial ? `Editando: ${alunoInicial.nome}` : "Cadastrar Aluno"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {/* Agora o TypeScript aceita que 'foto' seja string | null */}
        <CameraCapture onCapture={(foto) => setFotoBase64(foto)} />

        {fotoBase64 && (
          <p className="text-sm text-green-600 font-medium">Foto capturada ✔</p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Salvando..." : alunoInicial ? "Atualizar Informações" : "Cadastrar Aluno"}
          </Button>
          
          {alunoInicial && (
            <Button variant="ghost" onClick={() => onSuccess()}>
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}