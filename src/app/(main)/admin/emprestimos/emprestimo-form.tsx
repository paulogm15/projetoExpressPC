"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User, Camera, Sparkles, CheckCircle2 } from "lucide-react";
import CameraReconhecimento from "./components/CameraReconhecimento";
import ConfirmacaoModal from "./components/ConfirmacaoModal";

type Props = {
  onSuccess: () => void;
};

type AlunoReconhecido = {
  id: number;
  nome: string;
  matricula: string;
};

// Interface para os dados formatados vindos do backend
type ReservaInfo = {
  materia: string;
  professor: string;
  turma: string;
  horario: string;
};

type MateriaContexto = {
  id: number;
  nome: string;
  codigo: string;
  possuiReservaHoje: boolean;
  reserva: any | null;
};

type InfoEmprestimo = {
  aluno: {
    nome: string;
    cpf: string;
    matricula: string;
  };
  materias: MateriaContexto[];
  contextoReserva: ReservaInfo | null; // Campo consolidado no backend
};

export default function EmprestimoForm({ onSuccess }: Props) {
  const [patrimonio, setPatrimonio] = useState("");
  const [matricula, setMatricula] = useState("");
  const [nomeAluno, setNomeAluno] = useState<string | null>(null);
  const [alunoIdIdentificado, setAlunoIdIdentificado] = useState<number | null>(null);
  const [infoEmprestimo, setInfoEmprestimo] = useState<InfoEmprestimo | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  function mascararCpf(cpf: string) {
    if (!cpf) return "";
    return cpf.replace(/^(\d{3})\d{3}\d{3}(\d{2})$/, "***.***.***-$2");
  }

  // Define qual informação de reserva exibir no card azul
  const reservaExibicao = useMemo(() => {
    return infoEmprestimo?.contextoReserva ?? null;
  }, [infoEmprestimo]);

  const handleFaceCapture = async (foto: string | null) => {
    if (!foto) return;

    setRecognizing(true);
    setNomeAluno(null);
    setInfoEmprestimo(null);

    try {
      const res = await fetch("/api/face/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: foto }),
      });

      if (!res.ok) throw new Error("Aluno não reconhecido");

      const aluno: AlunoReconhecido = await res.json();

      setMatricula(aluno.matricula);
      setNomeAluno(aluno.nome);
      setAlunoIdIdentificado(aluno.id);

      // Busca o contexto acadêmico e reservas do dia
      const contexto = await fetch(
        `/api/emprestimos/contexto?alunoId=${aluno.id}`
      );

      if (contexto.ok) {
        const data: InfoEmprestimo = await contexto.json();
        setInfoEmprestimo(data);
      }
    } catch (error) {
      console.error("Erro no reconhecimento:", error);
      alert("Falha no reconhecimento facial");
    } finally {
      setRecognizing(false);
    }
  };

  async function getAlunoId(): Promise<number | null> {
    if (alunoIdIdentificado) return alunoIdIdentificado;
    if (!matricula) return null;

    try {
      const res = await fetch(`/api/admin/alunos/by-matricula?matricula=${matricula}`);
      if (!res.ok) return null;
      const aluno = await res.json();
      return aluno.id ?? null;
    } catch {
      return null;
    }
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
        return;
      }

      const res = await fetch("/api/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, patrimonio }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao registrar empréstimo");
        return;
      }

      alert("Empréstimo registrado com sucesso!");
      
      // Limpeza dos estados após sucesso
      setPatrimonio("");
      setMatricula("");
      setNomeAluno(null);
      setAlunoIdIdentificado(null);
      setInfoEmprestimo(null);
      setModalOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Notebook
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="text-sm font-medium">Patrimônio</label>
              <Input
                placeholder="Digite o patrimônio"
                value={patrimonio}
                onChange={(e) => setPatrimonio(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Identificação do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="text-sm font-medium">CPF ou Matrícula</label>
              <Input
                placeholder="Digite ou use reconhecimento facial"
                value={matricula}
                onChange={(e) => {
                  setMatricula(e.target.value);
                  setNomeAluno(null);
                  setAlunoIdIdentificado(null);
                  setInfoEmprestimo(null);
                }}
              />

              {recognizing && (
                <div className="text-sm text-blue-600 animate-pulse flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Buscando biometria...
                </div>
              )}

              {nomeAluno && (
                <div className="p-3 bg-emerald-50 border rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold uppercase">Aluno Identificado</p>
                    <p className="text-sm font-medium">{nomeAluno}</p>
                  </div>
                </div>
              )}

              {infoEmprestimo && (
                <div className="p-3 bg-blue-50 border rounded-lg space-y-2">
                  <p className="text-xs font-semibold uppercase text-blue-700">
                    Contexto da Reserva
                  </p>

                  <div className="grid grid-cols-1 gap-1 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">CPF:</span>{" "}
                      {mascararCpf(infoEmprestimo.aluno.cpf)}
                    </p>

                    <p>
                      <span className="font-semibold">Matéria:</span>{" "}
                      {reservaExibicao?.materia ?? "Sem reserva hoje"}
                    </p>

                    <p>
                      <span className="font-semibold">Professor:</span>{" "}
                      {reservaExibicao?.professor ?? "—"}
                    </p>

                    <p>
                      <span className="font-semibold">Turma:</span>{" "}
                      {reservaExibicao?.turma ?? "—"}
                    </p>
                    
                    {reservaExibicao?.horario && (
                      <p>
                        <span className="font-semibold">Horário:</span>{" "}
                        {reservaExibicao.horario}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Reconhecimento Facial
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CameraReconhecimento onCapture={handleFaceCapture} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button
          size="lg"
          className="px-8"
          disabled={loading || recognizing || !alunoIdIdentificado}
          onClick={() => setModalOpen(true)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? "Processando..." : "Registrar Empréstimo"}
        </Button>
      </div>

      <ConfirmacaoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSubmit}
        titulo="Confirmar Empréstimo"
        descricao={
          nomeAluno
            ? `Confirmar entrega do notebook ${patrimonio} para ${nomeAluno}?`
            : `Confirmar entrega do notebook ${patrimonio}?`
        }
      />
    </>
  );
}