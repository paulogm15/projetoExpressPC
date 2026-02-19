"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User, Camera, Sparkles } from "lucide-react";
import CameraReconhecimento from "./components/CameraReconhecimento";
import ConfirmacaoModal from "./components/ConfirmacaoModal";
import axios from "axios";

type Props = {
  onSuccess: () => void;
};

export default function EmprestimoForm({ onSuccess }: Props) {
  const [patrimonio, setPatrimonio] = useState("");
  const [matricula, setMatricula] = useState("");
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  async function getAlunoId() {
    // via rosto
    if (fotoBase64) {
      const r = await fetch("/api/face/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: fotoBase64 }),
      });

      if (!r.ok) return null;
      const aluno = await r.json();
      return aluno.id;
    }

    // via matrícula
    if (matricula) {
      const r = await axios.get('/api/admin/alunos');
      const alunos = r.data; 
      const aluno = alunos.find((a: any) => a.matricula === matricula);
      return aluno?.id ?? null;
    }

    return null;
  }

  async function handleSubmit() {
    if (!patrimonio) {
      alert("Informe o patrimônio");
      return;
    }

    setLoading(true);

    try {
      const alunoId = await getAlunoId();

      if (!alunoId) {
        alert("Aluno não identificado");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alunoId,
          patrimonio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro no empréstimo");
        setLoading(false);
        return;
      }

      alert("Empréstimo registrado ✅");

      // reset
      setPatrimonio("");
      setMatricula("");
      setFotoBase64(null);
      setModalOpen(false);
      onSuccess();

    } catch (error) {
      alert("Erro inesperado no sistema");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COLUNA ESQUERDA */}
        <div className="space-y-4">

          {/* CARD NOTEBOOK */}
          <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Package className="w-5 h-5 text-slate-700" />
                Notebook
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Patrimônio
                </label>
                <Input
                  placeholder="Digite o patrimônio"
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value)}
                  className="h-11 bg-white border-slate-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* CARD IDENTIFICAÇÃO */}
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
                  Matrícula <span className="text-slate-400">(opcional)</span>
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

        </div>

        {/* COLUNA DIREITA - RECONHECIMENTO FACIAL */}
        <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Camera className="w-5 h-5 text-slate-700" />
              Reconhecimento Facial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <CameraReconhecimento onCapture={setFotoBase64} />
          </CardContent>
        </Card>
      </div>

      {/* BOTÃO DE AÇÃO */}
      <div className="flex justify-center gap-4 pt-4">
        <Button
          size="lg"
          disabled={loading}
          onClick={() => setModalOpen(true)}
          className="h-12 px-8 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 text-base font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? "Processando..." : "Registrar Empréstimo"}
        </Button>
      </div>

      <ConfirmacaoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSubmit}
        titulo="Confirmar empréstimo"
        descricao={`Confirmar retirada do notebook ${patrimonio}?`}
      />
    </>
  );
}