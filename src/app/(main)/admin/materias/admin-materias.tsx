"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Trash2, 
  Search, 
  BookOpen, 
  User as UserIcon, 
  Loader2,
  Pencil,
  X,
  Undo2
} from "lucide-react";

/* =========================
    Schema & Types
========================= */
const materiaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  codigo: z.string().min(2, "Código deve ter pelo menos 2 caracteres"),
  professorId: z.string().min(1, "Selecione um professor"),
  turmaIds: z.array(z.number()).min(1, "Vincule ao menos uma turma"), 
});

type MateriaFormData = z.infer<typeof materiaSchema>;

type Materia = {
  id: number;
  nome: string;
  codigo: string;
  professorId: string;
  professor?: { name: string };
  createdAt: string;
  turmas?: { turma: { id: number; nome: string; codigo: string } }[];
};

export default function AdminMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [buscaTurma, setBuscaTurma] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MateriaFormData>({
    resolver: zodResolver(materiaSchema),
    defaultValues: { nome: "", codigo: "", professorId: "", turmaIds: [] },
  });

  const selectedTurmaIds = watch("turmaIds");

  // Filtra sugestões de turmas (remove as que já estão nos chips)
  const sugestoesTurmas = useMemo(() => {
    return turmasDisponiveis.filter(t => 
      (t.nome.toLowerCase().includes(buscaTurma.toLowerCase()) || 
       t.codigo.toLowerCase().includes(buscaTurma.toLowerCase())) &&
      !selectedTurmaIds.includes(t.id)
    );
  }, [buscaTurma, turmasDisponiveis, selectedTurmaIds]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resMaterias, resTurmas, resProfessores] = await Promise.all([
        axios.get("/admin/materias/api").catch(() => ({ data: [] })),
        axios.get("/admin/turmas/api").catch(() => ({ data: [] })),
        axios.get("/api/users?role=PROFESSOR").catch(() => ({ data: [] })),
      ]);
      setMaterias(Array.isArray(resMaterias.data) ? resMaterias.data : []);
      setTurmasDisponiveis(Array.isArray(resTurmas.data) ? resTurmas.data : []);
      setProfessores(Array.isArray(resProfessores.data) ? resProfessores.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // CORREÇÃO: Função toggle que agora permite desvincular (remover do array)
  const toggleTurma = (id: number) => {
    const current = [...selectedTurmaIds];
    const index = current.indexOf(id);
    
    if (index > -1) {
      // Se já existe, remove (desvincula)
      current.splice(index, 1);
    } else {
      // Se não existe, adiciona (vincula)
      current.push(id);
    }
    setValue("turmaIds", current, { shouldValidate: true });
  };

  const handleEdit = (materia: Materia) => {
    setEditingId(materia.id);
    setValue("nome", materia.nome);
    setValue("codigo", materia.codigo);
    setValue("professorId", materia.professorId);
    const ids = materia.turmas?.map(t => t.turma.id) || [];
    setValue("turmaIds", ids);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({ nome: "", codigo: "", professorId: "", turmaIds: [] });
    setBuscaTurma("");
  };

  async function onSubmit(data: MateriaFormData) {
    try {
      if (editingId) {
        await axios.put("/admin/materias/api", { id: editingId, ...data });
        toast.success("Matéria atualizada!");
      } else {
        await axios.post("/admin/materias/api", data);
        toast.success("Matéria cadastrada!");
      }
      cancelEdit();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao salvar");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir esta matéria?")) return;
    try {
      await axios.delete("/admin/materias/api", { data: { id } });
      toast.success("Matéria excluída");
      if (editingId === id) cancelEdit();
      loadData();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  const filtered = materias.filter(m =>
    m.nome?.toLowerCase().includes(search.toLowerCase()) ||
    m.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-2">
      
      {/* COLUNA ESQUERDA: FORMULÁRIO */}
      <div className="lg:col-span-4">
        <Card className={`shadow-sm border-2 transition-all ${editingId ? "border-blue-400 bg-blue-50/10" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {editingId ? <Pencil className="h-5 w-5 text-blue-500" /> : <Plus className="h-5 w-5 text-primary" />}
              {editingId ? "Editar Matéria" : "Cadastrar Matéria"}
            </CardTitle>
            <CardDescription>
              {editingId ? "Ajuste os vínculos e informações da disciplina." : "Adicione novas disciplinas ao sistema."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Código</Label>
                  <Input {...register("codigo")} placeholder="Ex: MAT01" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input {...register("nome")} placeholder="Ex: Cálculo I" className="h-9" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Professor Responsável</Label>
                <select 
                  {...register("professorId")} 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Selecione um professor...</option>
                  {professores.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* VÍNCULO DE TURMAS COM CHIPS E BUSCA */}
              <div className="space-y-2">
                <Label className="text-xs">Vincular Turmas</Label>
                
                {/* Chips das Turmas Selecionadas */}
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 border rounded-md bg-white shadow-sm">
                  {selectedTurmaIds.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">Nenhuma turma vinculada</span>
                  )}
                  {selectedTurmaIds.map(id => {
                    const turma = turmasDisponiveis.find(t => t.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-[10px] font-medium animate-in fade-in zoom-in duration-200">
                        {turma?.codigo || id}
                        <button 
                          type="button"
                          onClick={() => toggleTurma(id)}
                          className="rounded-full hover:bg-red-100 hover:text-red-600 p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>

                {/* Input de Pesquisa */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Pesquisar turma..." 
                    className="pl-8 h-8 text-xs"
                    value={buscaTurma}
                    onChange={(e) => setBuscaTurma(e.target.value)}
                  />
                </div>

                {/* Área de Seleção */}
                <ScrollArea className="h-[120px] border rounded-md mt-1 bg-white shadow-inner">
                  <div className="p-1">
                    {sugestoesTurmas.length > 0 ? (
                      sugestoesTurmas.map((turma) => (
                        <div 
                          key={turma.id} 
                          onClick={() => toggleTurma(turma.id)}
                          className="flex items-center justify-between px-3 py-2 text-[11px] hover:bg-slate-50 rounded cursor-pointer transition-colors border-b last:border-0"
                        >
                          <span className="font-medium">{turma.codigo} — {turma.nome}</span>
                          <Plus className="h-3 w-3 text-primary opacity-50" />
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-center text-muted-foreground py-6 italic">
                        {buscaTurma ? "Nenhuma turma encontrada" : "Busque e clique para vincular"}
                      </p>
                    )}
                  </div>
                </ScrollArea>
                {errors.turmaIds && <p className="text-[10px] text-red-500 font-medium">{errors.turmaIds.message}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <Button type="button" variant="outline" className="flex-1 h-9 text-xs" onClick={cancelEdit}>
                    <Undo2 className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                )}
                <Button type="submit" className="flex-[2] h-9 text-xs" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : editingId ? "Salvar Alterações" : "Salvar Matéria"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* COLUNA DIREITA: LISTAGEM */}
      <div className="lg:col-span-8">
        <Card className="shadow-sm border-none bg-transparent lg:bg-card lg:border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-bold">Matérias Cadastradas</CardTitle>
            <div className="relative w-full max-w-sm ml-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou código..."
                className="pl-8 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                {filtered.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed rounded-xl">
                    <BookOpen className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground italic">Nenhuma matéria encontrada.</p>
                  </div>
                ) : (
                  filtered.map((m) => (
                    <div 
                      key={m.id} 
                      className={`flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all border-l-4 ${editingId === m.id ? "border-l-blue-500 bg-blue-50/40" : "border-l-primary/40 bg-white"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded border text-slate-700 uppercase tracking-tight">
                              {m.codigo}
                            </span>
                            <p className="font-semibold text-sm text-slate-800">{m.nome}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                             <UserIcon className="h-3 w-3" />
                             <span>Prof: {professores.find(p => p.id === m.professorId)?.name || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Lista resumida de turmas */}
                        <div className="hidden md:flex flex-wrap gap-1 max-w-[150px] justify-end">
                          {m.turmas?.slice(0, 3).map(t => (
                            <Badge key={t.turma.id} variant="outline" className="text-[8px] h-4 leading-none px-1.5 border-slate-200 text-slate-500">
                              {t.turma.codigo}
                            </Badge>
                          ))}
                          {m.turmas && m.turmas.length > 3 && (
                            <span className="text-[9px] text-muted-foreground font-medium">+{m.turmas.length - 3}</span>
                          )}
                        </div>

                        <div className="flex gap-1 border-l pl-3 border-slate-100">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleEdit(m)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(m.id)}
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