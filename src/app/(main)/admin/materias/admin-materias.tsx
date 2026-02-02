// app/(main)/admin/components/materias/admin-materias.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import AdminFormMateria from "./admin-form-materia";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  BookOpen,
} from "lucide-react";

/* =========================
   Schema
========================= */
const materiaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  codigo: z.string().min(2, "Código deve ter pelo menos 2 caracteres"),
});

type MateriaFormData = z.infer<typeof materiaSchema>;

type Materia = {
  id: number;
  nome: string;
  codigo: string;
  createdAt: string;
  turmas?: any[];
};

export default function AdminMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Materia | null>(null);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MateriaFormData>({
    resolver: zodResolver(materiaSchema),
  });

  async function loadMaterias() {
    try {
      setLoading(true);
      const { data } = await axios.get("/admin/materias");
      setMaterias(data);
    } catch {
      toast.error("Erro ao carregar matérias");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterias();
  }, []);

  async function onSubmit(data: MateriaFormData) {
    try {
      if (editing) {
        await axios.put("/admin/materias/api", {
          id: editing.id,
          ...data,
        });
        toast.success("Matéria atualizada");
      } else {
        await axios.post("/admin/materias/api", data);
        toast.success("Matéria criada");
      }

      setDialogOpen(false);
      setEditing(null);
      reset();
      loadMaterias();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao salvar");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir esta matéria?")) return;

    try {
      await axios.delete("/admin/materias/api", {
        data: { id },
      });
      toast.success("Matéria excluída");
      loadMaterias();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao excluir");
    }
  }

  function handleEdit(materia: Materia) {
    setEditing(materia);
    setValue("nome", materia.nome);
    setValue("codigo", materia.codigo);
    setDialogOpen(true);
  }

  const filtered = materias.filter(
    (m) =>
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Matérias</h2>
          <p className="text-muted-foreground">
            Cadastro base de disciplinas
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Matéria
        </Button>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar por nome ou código"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Matérias</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma matéria encontrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Turmas</TableHead>
                  <TableHead>Criação</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge variant="secondary">{m.codigo}</Badge>
                    </TableCell>
                    <TableCell>{m.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {m.turmas?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(m)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(m.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
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

      {/* Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Matéria" : "Nova Matéria"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Código</Label>
              <Input {...register("codigo")} />
              {errors.codigo && (
                <p className="text-sm text-red-500">
                  {errors.codigo.message}
                </p>
              )}
            </div>

            <div>
              <Label>Nome</Label>
              <Input {...register("nome")} />
              {errors.nome && (
                <p className="text-sm text-red-500">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
  
}
[{
	"resource": "/c:/Users/anaje/Desktop/reconhecimento-facial/pcexpress/projetoExpressPC/src/app/(main)/admin/materias/admin-materias.tsx",
	"owner": "typescript",
	"code": "2322",
	"severity": 8,
	"message": "Type '{ materia: Materia | null; onSuccess: () => void; }' is not assignable to type 'IntrinsicAttributes'.\n  Property 'materia' does not exist on type 'IntrinsicAttributes'.",
	"source": "ts",
	"startLineNumber": 207,
	"startColumn": 13,
	"endLineNumber": 207,
	"endColumn": 20,
	"modelVersionId": 6,
	"origin": "extHost1"
}]