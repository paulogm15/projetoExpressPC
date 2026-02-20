"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User, Camera, Sparkles, CheckCircle2 } from "lucide-react";
import CameraReconhecimento from "./components/CameraReconhecimento";
import ConfirmacaoModal from "./components/ConfirmacaoModal";
import axios from "axios";

type Props = {
  onSuccess: () => void;
};

export default function EmprestimoForm({ onSuccess }: Props) {
  const [patrimonio, setPatrimonio] = useState("");
  const [matricula, setMatricula] = useState("");
  const [nomeAluno, setNomeAluno] = useState<string | null>(null);
  const [alunoIdIdentificado, setAlunoIdIdentificado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Corrigido: Aceita string | null para bater com a Prop do CameraReconhecimento
  const handleFaceCapture = async (foto: string | null) => {
    if (!foto) return;

    setRecognizing(true);
    setNomeAluno(null);

    try {
      const res = await fetch("/api/face/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: foto }),
      });

      if (!res.ok) throw new Error("Não reconhecido");

      const aluno = await res.json();
      setMatricula(aluno.matricula);
      setNomeAluno(aluno.nome);
      setAlunoIdIdentificado(aluno.id);
      
    } catch (error) {
      console.error("Erro no reconhecimento:", error);
    } finally {
      setRecognizing(false);
    }
  };

  async function getAlunoId() {
    if (alunoIdIdentificado) return alunoIdIdentificado;

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
        body: JSON.stringify({ alunoId, patrimonio }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro no empréstimo");
        setLoading(false);
        return;
      }

      alert("Empréstimo registrado ✅");
      setPatrimonio("");
      setMatricula("");
      setNomeAluno(null);
      setAlunoIdIdentificado(null);
      setModalOpen(false);
      onSuccess();

    } catch (error) {
      alert("Erro inesperado no sistema");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur">
            {/* ✅ Atualizado para bg-linear-to-r */}
            <CardHeader className="bg-linear-to-r from-slate-50 to-blue-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Package className="w-5 h-5 text-slate-700" />
                Notebook
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Patrimônio</label>
                <Input
                  placeholder="Digite o patrimônio"
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value)}
                  className="h-11 bg-white border-slate-300"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur">
            {/* ✅ Atualizado para bg-linear-to-r */}
            <CardHeader className="bg-linear-to-r from-slate-50 to-blue-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <User className="w-5 h-5 text-slate-700" />
                Identificação do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Matrícula</label>
                  <Input
                    placeholder="Digite a matrícula"
                    value={matricula}
                    onChange={(e) => {
                      setMatricula(e.target.value);
                      setNomeAluno(null);
                      setAlunoIdIdentificado(null);
                    }}
                    className="h-11 bg-white border-slate-300"
                  />
                </div>

                {recognizing && (
                  <div className="text-sm text-blue-600 animate-pulse flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Buscando biometria...
                  </div>
                )}
                
                {nomeAluno && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Aluno Identificado</p>
                      <p className="text-sm text-emerald-900 font-medium">{nomeAluno}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur">
          {/* ✅ Atualizado para bg-linear-to-r */}
          <CardHeader className="bg-linear-to-r from-blue-50 to-slate-50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Camera className="w-5 h-5 text-slate-700" />
              Reconhecimento Facial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <CameraReconhecimento onCapture={handleFaceCapture} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button
          size="lg"
          disabled={loading || recognizing}
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
        descricao={nomeAluno 
          ? `Confirmar retirada do notebook ${patrimonio} para ${nomeAluno}?` 
          : `Confirmar retirada do notebook ${patrimonio}?`}
      />
    </>
  );
}