// app/(main)/admin/components/materias/admin-materias.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
  BookOpen
} from "lucide-react";

// Schema para criação/edição de matérias
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
  turmas: any[];
};

export default function AdminMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MateriaFormData>({
    resolver: zodResolver(materiaSchema),
  });

  // Carregar matérias
  const loadMaterias = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/admin/materias");
      setMaterias(response.data);
    } catch (error) {
      console.error("Erro ao carregar matérias:", error);
      toast.error("Erro ao carregar matérias.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterias();
  }, []);

  // Criar ou editar matéria
  const onSubmit = async (data: MateriaFormData) => {
    try {
      if (editingMateria) {
        // Editar matéria existente
        await axios.put(`/admin/materias/api`, {
          id: editingMateria.id,
          ...data
        });
        toast.success("Matéria atualizada com sucesso!");
      } else {
        // Criar nova matéria
        await axios.post("/admin/materias/api", data);
        toast.success("Matéria criada com sucesso!");
      }
      
      setIsDialogOpen(false);
      reset();
      setEditingMateria(null);
      loadMaterias();
    } catch (error: any) {
      console.error("Erro ao salvar matéria:", error);
      if (error.response?.data?.error) {
        toast.error(`Erro: ${error.response.data.error}`);
      } else {
        toast.error("Erro ao salvar matéria.");
      }
    }
  };

  // Excluir matéria
  const handleDelete = async (materiaId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta matéria?")) {
      return;
    }

    try {
      await axios.delete(`/admin/materias/api`, {
        data: { id: materiaId }
      });
      toast.success("Matéria excluída com sucesso!");
      loadMaterias();
    } catch (error: any) {
      console.error("Erro ao excluir matéria:", error);
      if (error.response?.data?.error) {
        toast.error(`Erro: ${error.response.data.error}`);
      } else {
        toast.error("Erro ao excluir matéria.");
      }
    }
  };

  // Editar matéria
  const handleEdit = (materia: Materia) => {
    setEditingMateria(materia);
    setValue("nome", materia.nome);
    setValue("codigo", materia.codigo);
    setIsDialogOpen(true);
  };

  // Novo matéria
  const handleNew = () => {
    setEditingMateria(null);
    reset();
    setIsDialogOpen(true);
  };

  // Filtro de matérias
  const filteredMaterias = materias.filter(materia =>
    materia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materia.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Matérias</h2>
          <p className="text-muted-foreground">
            Cadastre e gerencie as matérias do sistema
          </p>
        </div>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Matéria
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total de Matérias</p>
                <p className="text-2xl font-bold">{materias.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de pesquisa */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de matérias */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Matérias</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando matérias...</p>
            </div>
          ) : filteredMaterias.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhuma matéria encontrada" : "Nenhuma matéria cadastrada"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Turmas</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterias.map((materia) => (
                  <TableRow key={materia.id}>
                    <TableCell>
                      <Badge variant="secondary">{materia.codigo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{materia.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {materia.turmas?.length || 0} turmas
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(materia.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(materia)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(materia.id)}
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

      {/* Dialog para criar/editar matéria */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMateria ? "Editar Matéria" : "Nova Matéria"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                placeholder="EX: MAT001"
                {...register("codigo")}
              />
              {errors.codigo && (
                <p className="text-red-500 text-sm mt-1">{errors.codigo.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="nome">Nome da Matéria *</Label>
              <Input
                id="nome"
                placeholder="EX: Matemática Aplicada"
                {...register("nome")}
              />
              {errors.nome && (
                <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : editingMateria ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}