"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MoreHorizontal, Edit, Trash2, Search } from "lucide-react";

const materiaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  codigo: z.string().min(2, "Código deve ter pelo menos 2 caracteres"),
  professorId: z.string().min(1, "Selecione um professor"),
  turmaIds: z.array(z.number()), 
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Materia | null>(null);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MateriaFormData>({
    resolver: zodResolver(materiaSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      professorId: "",
      turmaIds: [],
    },
  });

  const selectedTurmaIds = watch("turmaIds");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resMaterias, resTurmas, resProfessores] = await Promise.all([
        axios.get("/admin/materias/api").catch(err => {
          console.error("Erro na rota MATERIAS:", err.config.url);
          return { data: [] };
        }),
        axios.get("/admin/turmas/api").catch(err => {
          console.error("Erro na rota TURMAS:", err.config.url);
          return { data: [] };
        }),
        axios.get("/api/users?role=PROFESSOR").catch(err => {
          console.error("Erro na rota PROFESSORES:", err.config.url);
          return { data: [] };
        }),
      ]);
      
      setMaterias(Array.isArray(resMaterias.data) ? resMaterias.data : []);
      setTurmasDisponiveis(Array.isArray(resTurmas.data) ? resTurmas.data : []);
      setProfessores(Array.isArray(resProfessores.data) ? resProfessores.data : []);

    } catch (error) {
      console.error("Erro fatal no loadData:", error);
      toast.error("Erro ao sincronizar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function onSubmit(data: MateriaFormData) {
    try {
      if (editing) {
        await axios.put("/admin/materias/api", { id: editing.id, ...data });
        toast.success("Matéria atualizada");
      } else {
        await axios.post("/admin/materias/api", data);
        toast.success("Matéria criada");
      }
      setDialogOpen(false);
      reset();
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
      loadData();
    } catch (err: any) {
      toast.error("Erro ao excluir matéria");
    }
  }

  const toggleTurma = (id: number) => {
    const current = [...selectedTurmaIds];
    const index = current.indexOf(id);
    if (index > -1) current.splice(index, 1);
    else current.push(id);
    setValue("turmaIds", current);
  };

  const filtered = Array.isArray(materias) 
    ? materias.filter(m =>
        m.nome?.toLowerCase().includes(search.toLowerCase()) ||
        m.codigo?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Matérias</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Matéria
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10" 
              placeholder="Buscar matéria..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Turmas</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell><Badge variant="secondary">{m.codigo}</Badge></TableCell>
                    <TableCell className="font-medium">{m.nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {m.turmas && m.turmas.length > 0 ? (
                          m.turmas.map(t => (
                            <Badge key={t.turma.id} variant="outline" className="text-[10px]">
                              {t.turma.codigo}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Sem turmas</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info("Edição em breve")}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(m.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova Matéria</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input {...register("codigo")} placeholder="Ex: MAT01" />
                {errors.codigo && <p className="text-[10px] text-red-500">{errors.codigo.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input {...register("nome")} placeholder="Ex: Cálculo I" />
                {errors.nome && <p className="text-[10px] text-red-500">{errors.nome.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Professor Responsável</Label>
              <select {...register("professorId")} className="w-full border rounded-md p-2 text-sm bg-background">
                <option value="">Selecione um professor...</option>
                {professores.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.professorId && <p className="text-[10px] text-red-500">{errors.professorId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Vincular Turmas</Label>
              <ScrollArea className="h-32 border rounded-md p-2 bg-slate-50/50">
                {turmasDisponiveis.length > 0 ? (
                  turmasDisponiveis.map((turma) => (
                    <div key={turma.id} className="flex items-center space-x-2 py-1">
                      <input 
                        type="checkbox"
                        checked={selectedTurmaIds.includes(turma.id)}
                        onChange={() => toggleTurma(turma.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                      />
                      <span className="text-xs">{turma.codigo} - {turma.nome}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic p-2 text-center">
                    Nenhuma turma encontrada.
                  </p>
                )}
              </ScrollArea>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : "Cadastrar Matéria"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}