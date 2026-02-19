"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Camera, RotateCcw, Sparkles } from "lucide-react";
import CameraCapture from "../alunos/components/CameraCapture";
import axios from "axios";

type Props = {
  onSuccess: () => void;
};

export default function DevolucaoForm({ onSuccess }: Props) {
  const [matricula, setMatricula] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function buscarAlunoPorMatricula() {
    if (!matricula) return null;

    const res = await axios.get('/api/admin/alunos')
    const alunos = res.data;

    return alunos.find((a: any) => a.matricula === matricula);
  }

  async function reconhecerPorFoto() {
    if (!foto) return null;

    const res = await fetch("/api/face/recognize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: foto }),
    });

    if (!res.ok) return null;
    return await res.json();
  }

  async function registrarDevolucao() {
    setLoading(true);

    let aluno = null;

    if (foto) {
      aluno = await reconhecerPorFoto();
    } else if (matricula) {
      aluno = await buscarAlunoPorMatricula();
    }

    if (!aluno) {
      alert("Aluno não identificado");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/emprestimos/devolver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoId: aluno.id }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro na devolução");
      setLoading(false);
      return;
    }

    alert("Devolução registrada com sucesso ✅");

    limpar();
    setLoading(false);
    onSuccess();
  }

  function limpar() {
    setMatricula("");
    setFoto(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* IDENTIFICAÇÃO */}
        <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <User className="w-5 h-5 text-slate-700" />
              Identificação do Aluno
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Matrícula
              </label>
              <Input
                placeholder="Digite a matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="h-11 bg-white border-slate-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* RECONHECIMENTO FACIAL */}
        <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Camera className="w-5 h-5 text-slate-700" />
              Reconhecimento Facial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <CameraCapture onCapture={setFoto} />

            {foto && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-green-700 font-medium">
                  Foto capturada com sucesso
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* BOTÕES */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={registrarDevolucao}
          disabled={loading}
          size="lg"
          className="h-12 px-8 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 text-base font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? "Processando..." : "Registrar Devolução"}
        </Button>

        <Button 
          variant="outline" 
          onClick={limpar}
          size="lg"
          className="h-12 px-6 border-slate-300"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </div>
    </div>
  );
}