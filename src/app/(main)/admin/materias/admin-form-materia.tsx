<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminFormMateriaProps {
  materia?: any;
  onSuccess?: () => void;
}

export default function AdminFormMateria({ materia, onSuccess }: AdminFormMateriaProps) {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [materiaTurmaIds, setMateriaTurmaIds] = useState<number[]>([]);
  
  const [professores, setProfessores] = useState<any[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Busca dados do banco ao carregar o componente
  useEffect(() => {
    async function fetchData() {
      try {
        // Importante: Verifique se estas rotas retornam um JSON (Array)
        const [resProf, resTurmas] = await Promise.all([
          fetch("/api/users?role=PROFESSOR"), 
          fetch("/admin/turmas/api")          
        ]);

        if (resProf.ok) {
          const dataProf = await resProf.json();
          setProfessores(Array.isArray(dataProf) ? dataProf : []);
        }

        if (resTurmas.ok) {
          const dataTurmas = await resTurmas.json();
          setTurmasDisponiveis(Array.isArray(dataTurmas) ? dataTurmas : []);
        }
      } catch (e) {
        console.error("Erro ao carregar dados iniciais", e);
      }
    }
    fetchData();
  }, []);

  const toggleTurma = (id: number) => {
    setMateriaTurmaIds(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!professorId) return setErro("Selecione um professor.");
    
    setErro(null);
    setLoading(true);

    try {
      const response = await fetch("/admin/materias/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nome, 
          codigo, 
          professorId, 
          turmaIds: materiaTurmaIds 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao cadastrar matéria");
      }

      // Limpar campos
      setNome("");
      setCodigo("");
      setProfessorId("");
      setMateriaTurmaIds([]);
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold">Nova Matéria</h2>
      {erro && <p className="text-sm text-red-600 p-2 bg-red-50 rounded">{erro}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Código</Label>
          <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: MAT01" required />
        </div>
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Cálculo I" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Professor</Label>
        <select 
          className="w-full border rounded-md p-2 text-sm bg-background"
          value={professorId}
          onChange={(e) => setProfessorId(e.target.value)}
          required
        >
          <option value="">Selecione um professor...</option>
          {professores.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Vincular Turmas</Label>
        <ScrollArea className="h-32 w-full border rounded-md p-3 bg-slate-50">
          {turmasDisponiveis.length > 0 ? (
            turmasDisponiveis.map(turma => (
              <div key={turma.id} className="flex items-center space-x-2 py-1.5 border-b last:border-0 border-slate-200">
                <Checkbox 
                  id={`t-${turma.id}`} 
                  checked={materiaTurmaIds.includes(turma.id)}
                  onCheckedChange={() => toggleTurma(turma.id)}
                />
                <label htmlFor={`t-${turma.id}`} className="text-xs font-medium cursor-pointer flex-1">
                  {turma.codigo} - {turma.nome}
                </label>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-4">
              Nenhuma turma encontrada no sistema.
            </p>
          )}
        </ScrollArea>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Salvando..." : "Salvar Matéria"}
      </Button>
    </form>
  );
=======
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminFormMateriaProps {
  materia?: any;
  onSuccess?: () => void;
}

export default function AdminFormMateria({ materia, onSuccess }: AdminFormMateriaProps) {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [materiaTurmaIds, setMateriaTurmaIds] = useState<number[]>([]);
  
  const [professores, setProfessores] = useState<any[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Busca dados do banco ao carregar o componente
  useEffect(() => {
    async function fetchData() {
      try {
        // Importante: Verifique se estas rotas retornam um JSON (Array)
        const [resProf, resTurmas] = await Promise.all([
          fetch("/api/users?role=PROFESSOR"), 
          fetch("/admin/turmas/api")          
        ]);

        if (resProf.ok) {
          const dataProf = await resProf.json();
          setProfessores(Array.isArray(dataProf) ? dataProf : []);
        }

        if (resTurmas.ok) {
          const dataTurmas = await resTurmas.json();
          setTurmasDisponiveis(Array.isArray(dataTurmas) ? dataTurmas : []);
        }
      } catch (e) {
        console.error("Erro ao carregar dados iniciais", e);
      }
    }
    fetchData();
  }, []);

  const toggleTurma = (id: number) => {
    setMateriaTurmaIds(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!professorId) return setErro("Selecione um professor.");
    
    setErro(null);
    setLoading(true);

    try {
      const response = await fetch("/admin/materias/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nome, 
          codigo, 
          professorId, 
          turmaIds: materiaTurmaIds 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao cadastrar matéria");
      }

      // Limpar campos
      setNome("");
      setCodigo("");
      setProfessorId("");
      setMateriaTurmaIds([]);
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold">Nova Matéria</h2>
      {erro && <p className="text-sm text-red-600 p-2 bg-red-50 rounded">{erro}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Código</Label>
          <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: MAT01" required />
        </div>
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Cálculo I" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Professor</Label>
        <select 
          className="w-full border rounded-md p-2 text-sm bg-background"
          value={professorId}
          onChange={(e) => setProfessorId(e.target.value)}
          required
        >
          <option value="">Selecione um professor...</option>
          {professores.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Vincular Turmas</Label>
        <ScrollArea className="h-32 w-full border rounded-md p-3 bg-slate-50">
          {turmasDisponiveis.length > 0 ? (
            turmasDisponiveis.map(turma => (
              <div key={turma.id} className="flex items-center space-x-2 py-1.5 border-b last:border-0 border-slate-200">
                <Checkbox 
                  id={`t-${turma.id}`} 
                  checked={materiaTurmaIds.includes(turma.id)}
                  onCheckedChange={() => toggleTurma(turma.id)}
                />
                <label htmlFor={`t-${turma.id}`} className="text-xs font-medium cursor-pointer flex-1">
                  {turma.codigo} - {turma.nome}
                </label>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-4">
              Nenhuma turma encontrada no sistema.
            </p>
          )}
        </ScrollArea>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Salvando..." : "Salvar Matéria"}
      </Button>
    </form>
  );
>>>>>>> origin/main
}