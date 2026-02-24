"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Search, 
  GraduationCap, 
  Loader2, 
  Pencil, 
  Undo2 
} from "lucide-react";

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
  materias: { materiaId: number; materia: Materia }[];
};

export default function AdminFormTurma() {
  // Estados do Banco
  const [turmasCadastradas, setTurmasCadastradas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário
  const [editingId, setEditingId] = useState<number | null>(null);
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [semestre, setSemestre] = useState(1);
  const [ano, setAno] = useState(new Date().getFullYear());
  
  // Estados de Busca
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/turmas/api").catch(() => ({ data: [] }));
      setTurmasCadastradas(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEdit = (turma: Turma) => {
    setEditingId(turma.id);
    setCodigo(turma.codigo);
    setNome(turma.nome);
    setSemestre(turma.semestre);
    setAno(turma.ano);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCodigo("");
    setNome("");
    setSemestre(1);
    setAno(new Date().getFullYear());
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo || !nome) return toast.error("Preencha os campos obrigatórios");

    try {
      const payload = { codigo, nome, semestre, ano };
      if (editingId) {
        await axios.put("/admin/turmas/api", { id: editingId, ...payload });
        toast.success("Turma atualizada!");
      } else {
        await axios.post("/admin/turmas/api", payload);
        toast.success("Turma criada!");
      }
      cancelEdit();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao salvar turma");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja excluir esta turma?")) return;
    try {
      await axios.delete("/admin/turmas/api", { data: { id } });
      toast.success("Turma excluída");
      loadData();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  const filteredTurmas = turmasCadastradas.filter(t =>
    t.nome.toLowerCase().includes(search.toLowerCase()) ||
    t.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-2">
      
      {/* COLUNA ESQUERDA: FORMULÁRIO */}
      <div className="lg:col-span-4">
        <Card className={`shadow-sm border-2 transition-all ${editingId ? "border-blue-400 bg-blue-50/10" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {editingId ? <Pencil className="h-5 w-5 text-blue-500" /> : <Plus className="h-5 w-5 text-primary" />}
              {editingId ? "Editar Turma" : "Nova Turma"}
            </CardTitle>
            <CardDescription>Configure as informações básicas da turma.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Código</Label>
                  <Input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ex: T01" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ano</Label>
                  <Input type="number" value={ano} onChange={e => setAno(Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Nome da Turma</Label>
                <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Engenharia de Software" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Semestre</Label>
                <select 
                  value={semestre} 
                  onChange={e => setSemestre(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  {[1, 2, 3, 4, 5].map(s => (
                    <option key={s} value={s}>{s}º Semestre</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <Button type="button" variant="outline" className="flex-1 h-9 text-xs" onClick={cancelEdit}>
                    <Undo2 className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                )}
                <Button type="submit" className="flex-[2] h-9 text-xs" disabled={loading}>
                  {editingId ? "Salvar Alterações" : "Cadastrar Turma"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* COLUNA DIREITA: LISTAGEM */}
      <div className="lg:col-span-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-bold">Turmas Cadastradas</CardTitle>
            <div className="relative w-full max-w-sm ml-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                className="pl-8"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Carregando dados...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTurmas.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed rounded-xl">
                    <GraduationCap className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground italic">Nenhuma turma encontrada.</p>
                  </div>
                ) : (
                  filteredTurmas.map((t) => (
                    <div 
                      key={t.id} 
                      className={`flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all border-l-4 ${editingId === t.id ? "border-l-blue-500 bg-blue-50/40" : "border-l-primary/40 bg-white"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <GraduationCap className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded border text-slate-700 uppercase tracking-tight">
                              {t.codigo}
                            </span>
                            <p className="font-semibold text-sm text-slate-800">{t.nome}</p>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {t.semestre}º Semestre • Ano {t.ano}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-wrap gap-1 max-w-[150px] justify-end">
                          {/* Exibe as matérias vinculadas (via Matéria -> Turma) */}
                          {t.materias?.slice(0, 3).map(tm => (
                            <Badge key={tm.materiaId} variant="outline" className="text-[8px] h-4 leading-none px-1.5 border-slate-200 text-slate-500">
                              {tm.materia?.nome}
                            </Badge>
                          ))}
                          {t.materias && t.materias.length > 3 && (
                            <span className="text-[9px] text-muted-foreground font-medium">+{t.materias.length - 3}</span>
                          )}
                        </div>

                        <div className="flex gap-1 border-l pl-3 border-slate-100">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                            onClick={() => handleEdit(t)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 hover:bg-red-50"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}