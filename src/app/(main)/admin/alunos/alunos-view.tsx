"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, User, Search } from "lucide-react";
import AlunoForm from "./aluno-form";
import { Aluno } from "./types/aluno"; // Importe o tipo Aluno do arquivo de tipos

export default function AlunosView({ onBack }: { onBack: () => void }) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoParaEditar, setAlunoParaEditar] = useState<Aluno | null>(null);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);

  const carregarAlunos = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/alunos");

      if (!res.ok) {
        throw new Error("Erro ao buscar alunos");
      }

      const data = await res.json();
      setAlunos(data);
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
      alert("Erro ao carregar alunos.");
    } finally {
      setLoading(false);
    }
  };

  const excluirAluno = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) return;

    try {
      const res = await fetch(`/api/admin/alunos?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erro ao excluir aluno");
      }

      carregarAlunos();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir aluno.");
    }
  };

  useEffect(() => {
    carregarAlunos();
  }, []);

  const alunosFiltrados = alunos.filter((aluno) => {
    const termo = busca.toLowerCase();
    return (
      aluno.nome.toLowerCase().includes(termo) ||
      aluno.matricula.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* FORMULÁRIO */}
      <div className="md:col-span-4">
        <AlunoForm
          alunoInicial={alunoParaEditar}
          onSuccess={() => {
            carregarAlunos();
            setAlunoParaEditar(null);
          }}
        />
      </div>

      {/* LISTAGEM */}
      <div className="md:col-span-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
            <CardTitle className="text-lg font-bold">
              Alunos Cadastrados
            </CardTitle>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar por nome ou matrícula..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Carregando alunos...
              </p>
            ) : alunosFiltrados.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {busca
                  ? "Nenhum aluno encontrado para esta busca."
                  : "Nenhum aluno cadastrado."}
              </p>
            ) : (
              alunosFiltrados.map((a) => (
                <div
                  key={a.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="text-slate-500 h-6 w-6" />
                      </div>

                      <div>
                        <p className="font-semibold">{a.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Matrícula: {a.matricula}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {a.ativo ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAlunoParaEditar(a)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => excluirAluno(a.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* MATÉRIAS VINCULADAS */}
                  {a.materias.length > 0 && (
                    <div className="mt-3 pl-14">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Matérias:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {a.materias.map((m) => (
                          <span
                            key={m.materia.id}
                            className="text-xs bg-slate-100 px-2 py-1 rounded-md border"
                          >
                            {m.materia.nome} ({m.materia.codigo})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}