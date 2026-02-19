"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Laptop, 
  Trash2, 
  PlusCircle, 
  Loader2, 
  Pencil, 
  Undo2, 
  Wrench, 
  CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type Notebook = {
  id: number;
  patrimonio: string;
  modelo: string;
  status: "DISPONIVEL" | "EM_USO" | "MANUTENCAO";
};

export default function AdminNotebooks() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [patrimonio, setPatrimonio] = useState("");
  const [modelo, setModelo] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadNotebooks() {
    try {
      setFetching(true);
      const res = await axios.get("/api/notebooks");
      setNotebooks(res.data);
    } catch (error) {
      toast.error("Erro ao carregar notebooks");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadNotebooks();
  }, []);

  const handleEditClick = (nb: Notebook) => {
    setEditingId(nb.id);
    setPatrimonio(nb.patrimonio);
    setModelo(nb.modelo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPatrimonio("");
    setModelo("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await axios.put("/api/notebooks", {
          id: editingId,
          patrimonio,
          modelo,
        });
        toast.success("Notebook atualizado com sucesso!");
      } else {
        await axios.post("/api/notebooks", {
          patrimonio,
          modelo,
        });
        toast.success("Notebook cadastrado com sucesso!");
      }

      cancelEdit();
      loadNotebooks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao processar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente remover este notebook?")) return;

    try {
      await axios.delete("/api/notebooks", { data: { id } });
      toast.success("Notebook removido");
      loadNotebooks();
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  }

  async function enviarParaManutencao(id: number) {
    const observacao = prompt("Motivo da manutenção:");
    if (!observacao) return;

    try {
      await axios.post("/api/notebooks/manutencao", {
        id,
        observacao,
      });
      toast.success("Notebook enviado para manutenção");
      loadNotebooks();
    } catch {
      toast.error("Erro ao enviar para manutenção");
    }
  }

  async function liberarManutencao(id: number) {
    try {
      await axios.put("/api/notebooks/manutencao", {
        id,
      });
      toast.success("Notebook liberado da manutenção");
      loadNotebooks();
    } catch {
      toast.error("Erro ao liberar manutenção");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISPONIVEL":
        return <Badge className="bg-green-500">Disponível</Badge>;
      case "EM_USO":
        return <Badge variant="secondary">Em Uso</Badge>;
      case "MANUTENCAO":
        return <Badge variant="destructive">Manutenção</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Laptop className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gestão de Notebooks</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORMULÁRIO */}
        <Card className={`md:col-span-1 h-fit border-2 ${editingId ? "border-blue-500 bg-blue-50/10" : ""}`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {editingId ? <Pencil className="h-5 w-5 text-blue-500" /> : <PlusCircle className="h-5 w-5" />}
              {editingId ? "Editar Equipamento" : "Novo Equipamento"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Patrimônio</Label>
                <Input
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    <Undo2 className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    "Salvar Alterações"
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* LISTAGEM */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Equipamentos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patrimônio</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notebooks.map((nb) => (
                    <TableRow key={nb.id}>
                      <TableCell>{nb.patrimonio}</TableCell>
                      <TableCell>{nb.modelo}</TableCell>
                      <TableCell>{getStatusBadge(nb.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          
                          {/* EDITAR */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(nb)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* MANUTENÇÃO OU LIBERAR */}
                          {nb.status !== "MANUTENCAO" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => enviarParaManutencao(nb.id)}
                              className="text-yellow-600"
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => liberarManutencao(nb.id)}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}

                          {/* EXCLUIR */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(nb.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
