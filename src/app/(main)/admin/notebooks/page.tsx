"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  Laptop, 
  Plus, 
  Trash2, 
  Loader2, 
  Search, 
  Wrench, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Notebook = {
  id: number;
  patrimonio: string;
  modelo: string;
  status: "DISPONIVEL" | "EM_USO" | "MANUTENCAO";
};

export default function AdminNotebooksPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  // Estados do formulário
  const [patrimonio, setPatrimonio] = useState("");
  const [modelo, setModelo] = useState("");

  const loadNotebooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/notebooks");
      setNotebooks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar lista de notebooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotebooks();
  }, [loadNotebooks]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post("/api/notebooks", { patrimonio, modelo });
      toast.success("Notebook cadastrado com sucesso!");
      setPatrimonio("");
      setModelo("");
      loadNotebooks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao cadastrar notebook");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este notebook?")) return;
    try {
      await axios.delete("/api/notebooks", { data: { id } });
      toast.success("Notebook removido");
      loadNotebooks();
    } catch (error) {
      toast.error("Erro ao excluir equipamento");
    }
  }

  const filteredNotebooks = notebooks.filter(nb => 
    nb.patrimonio.toLowerCase().includes(search.toLowerCase()) ||
    nb.modelo.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISPONIVEL":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Disponível
          </Badge>
        );
      case "EM_USO":
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Em Uso
          </Badge>
        );
      case "MANUTENCAO":
        return (
          <Badge variant="destructive" className="gap-1">
            <Wrench className="h-3 w-3" /> Manutenção
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Laptop className="h-8 w-8 text-primary" />
          Gestão de Equipamentos
        </h1>
        <p className="text-muted-foreground text-lg">
          Cadastre e controle o status dos notebooks disponíveis para reserva.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário de Cadastro */}
        <div className="lg:col-span-4">
          <Card className="sticky top-6 shadow-sm border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> Adicionar Notebook
              </CardTitle>
              <CardDescription>Insira os dados do novo patrimônio.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="patrimonio">Código de Patrimônio</Label>
                  <Input 
                    id="patrimonio" 
                    placeholder="Ex: NB-2026-001" 
                    value={patrimonio}
                    onChange={(e) => setPatrimonio(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo / Configuração</Label>
                  <Input 
                    id="modelo" 
                    placeholder="Ex: Lenovo ThinkPad i5 16GB" 
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                  ) : (
                    "Cadastrar Equipamento"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Listagem */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <CardTitle>Inventário Atual</CardTitle>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por patrimônio..." 
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground animate-pulse">Sincronizando banco de dados...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="w-[150px]">Patrimônio</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotebooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                            Nenhum notebook encontrado no sistema.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNotebooks.map((nb) => (
                          <TableRow key={nb.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-bold">{nb.patrimonio}</TableCell>
                            <TableCell className="text-sm text-slate-600">{nb.modelo}</TableCell>
                            <TableCell>{getStatusBadge(nb.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(nb.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}