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
  observacao?: string;
};

export default function AdminNotebooks() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [patrimonio, setPatrimonio] = useState("");
  const [modelo, setModelo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [modoManutencao, setModoManutencao] = useState(false);
  const [manutencaoId, setManutencaoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadNotebooks() {
    try {
      setFetching(true);
      const res = await axios.get("/api/notebooks");
      setNotebooks(res.data);
    } catch {
      toast.error("Erro ao carregar notebooks");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadNotebooks();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setPatrimonio("");
    setModelo("");
    setObservacao("");
    setModoManutencao(false);
    setManutencaoId(null);
  };

  const handleEditClick = (nb: Notebook) => {
    setEditingId(nb.id);
    setPatrimonio(nb.patrimonio);
    setModelo(nb.modelo);
    setModoManutencao(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function enviarParaManutencao(id: number) {
    const notebook = notebooks.find(n => n.id === id);
    if (!notebook) return;

    setEditingId(id);
    setPatrimonio(notebook.patrimonio);
    setModelo(notebook.modelo);
    setModoManutencao(true);
    setManutencaoId(id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function liberarManutencao(id: number) {
    try {
      await axios.put("/api/notebooks/manutencao", { id });
      toast.success("Notebook liberado da manutenção");
      loadNotebooks();
    } catch {
      toast.error("Erro ao liberar manutenção");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (modoManutencao && manutencaoId) {
        await axios.post("/api/notebooks/manutencao", {
          id: manutencaoId,
          observacao,
        });
        toast.success("Notebook enviado para manutenção!");
      } 
      else if (editingId) {
        await axios.put("/api/notebooks", {
          id: editingId,
          patrimonio,
          modelo,
        });
        toast.success("Notebook atualizado com sucesso!");
      } 
      else {
        await axios.post("/api/notebooks", {
          patrimonio,
          modelo,
        });
        toast.success("Notebook cadastrado com sucesso!");
      }

      resetForm();
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
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISPONIVEL":
        return <Badge className="bg-green-500">Disponível</Badge>;
      case "EM_USO":
        return <Badge variant="secondary">Em Uso</Badge>;
      case "MANUTENCAO":
        return (
          <Badge className="bg-yellow-500 flex items-center gap-1">
            <Wrench className="h-3 w-3" />
            Manutenção
          </Badge>
        );
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
        <Card className="md:col-span-1 h-fit border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {modoManutencao
                ? "Enviar para Manutenção"
                : editingId
                ? "Editar Equipamento"
                : "Novo Equipamento"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label>Patrimônio</Label>
                <Input
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value)}
                  disabled={modoManutencao}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  disabled={modoManutencao}
                  required
                />
              </div>

              {modoManutencao && (
                <div className="space-y-2">
                  <Label>Motivo da Manutenção</Label>
                  <Input
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <Undo2 className="mr-2 h-4 w-4" /> Cancelar
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Salvar"
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

                      <TableCell>
                        {nb.modelo}
                        {nb.status === "MANUTENCAO" && nb.observacao && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Motivo: {nb.observacao}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>{getStatusBadge(nb.status)}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(nb)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {nb.status === "DISPONIVEL" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => enviarParaManutencao(nb.id)}
                              className="text-yellow-600"
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                          )}

                          {nb.status === "MANUTENCAO" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => liberarManutencao(nb.id)}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}

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