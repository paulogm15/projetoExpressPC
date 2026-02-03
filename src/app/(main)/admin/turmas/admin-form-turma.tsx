"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, BookOpen } from "lucide-react";

type Materia = {
  id: number;
  nome: string;
};

type Turma = {
  id: number;
  codigo: string;
  nome: string;
  semestre: number;
  ano: number;
  materias: any[]; // Depende de como seu backend retorna o include
};

export default function AdminFormTurma() {
  // Estados para o Formulário
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [semestre, setSemestre] = useState(1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [materiaIds, setMateriaIds] = useState<number[]>([]);
  
  // Estados para Dados do Banco
  const [materiasDisponiveis, setMateriasDisponiveis] = useState<Materia[]>([]);
  const [turmasCadastradas, setTurmasCadastradas] = useState<Turma[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Carregar Matérias e Turmas ao iniciar
  async function loadData() {
    try {
      const [resMaterias, resTurmas] = await Promise.all([
        fetch("/admin/materias/api"),
        fetch("/admin/turmas/api")
      ]);

      if (resMaterias.ok) setMateriasDisponiveis(await resMaterias.json());
      if (resTurmas.ok) setTurmasCadastradas(await resTurmas.json());
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function toggleMateria(id: number) {
    setMateriaIds((current) =>
      current.includes(id)
        ? current.filter((m) => m !== id)
        : [...current, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/admin/turmas/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, nome, semestre, ano, materiaIds }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao criar turma");

      setSuccess("Turma criada com sucesso.");
      setCodigo("");
      setNome("");
      setMateriaIds([]);
      loadData(); // Atualiza a lista de turmas automaticamente
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* SEÇÃO: FORMULÁRIO DE CADASTRO */}
      <form onSubmit={handleSubmit} className="space-y-6 border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold">Cadastro de Turma</h2>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Código</Label>
            <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: T01" />
          </div>
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Engenharia de Software" />
          </div>
          <div>
            <Label>Semestre</Label>
            <select
              value={semestre}
              onChange={(e) => setSemestre(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value={1}>1º Semestre</option>
              <option value={2}>2º Semestre</option>
            </select>
          </div>
          <div>
            <Label>Ano</Label>
            <Input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4" /> Matérias Disponíveis
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {materiasDisponiveis.map((m) => (
              <label key={m.id} className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer transition-colors ${materiaIds.includes(m.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"}`}>
                <input type="checkbox" checked={materiaIds.includes(m.id)} onChange={() => toggleMateria(m.id)} className="rounded border-gray-300" />
                <span className="text-xs font-medium">{m.nome}</span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Cadastrar Turma"}
        </Button>
      </form>

      {/* SEÇÃO: LISTAGEM DE TURMAS EXISTENTES */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Turmas Existentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {turmasCadastradas.map((turma) => (
            <Card key={turma.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{turma.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">{turma.codigo} • {turma.semestre}º Sem / {turma.ano}</p>
                  </div>
                  <Badge variant="secondary">ID: {turma.id}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {turma.materias && turma.materias.length > 0 ? (
                    turma.materias.map((tm: any) => (
                      <Badge key={tm.materiaId} variant="outline" className="text-[10px]">
                        {tm.materia?.nome || "Matéria"}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Sem matérias vinculadas</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}