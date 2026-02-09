<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Laptop, Trash2, PlusCircle, Loader2 } from "lucide-react";
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

  // Carregar notebooks do banco
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

  // Cadastrar novo notebook
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/notebooks", { patrimonio, modelo });
      toast.success("Notebook cadastrado com sucesso!");
      setPatrimonio("");
      setModelo("");
      loadNotebooks(); // Recarrega a lista
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  // Excluir notebook
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

  // Função auxiliar para cores do status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISPONIVEL": return <Badge className="bg-green-500">Disponível</Badge>;
      case "EM_USO": return <Badge variant="secondary">Em Uso</Badge>;
      case "MANUTENCAO": return <Badge variant="destructive">Manutenção</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Laptop className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gestão de Notebooks</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORMULÁRIO DE CADASTRO */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PlusCircle className="h-5 w-5" /> Novo Equipamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patrimonio">Patrimônio</Label>
                <Input
                  id="patrimonio"
                  placeholder="Ex: NB-001"
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  placeholder="Ex: Dell Latitude 3420"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cadastrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LISTAGEM DE NOTEBOOKS */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Equipamentos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                  {notebooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        Nenhum notebook encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    notebooks.map((nb) => (
                      <TableRow key={nb.id}>
                        <TableCell className="font-medium">{nb.patrimonio}</TableCell>
                        <TableCell>{nb.modelo}</TableCell>
                        <TableCell>{getStatusBadge(nb.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(nb.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
=======
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Laptop, Trash2, PlusCircle, Loader2, Pencil, Undo2 } from "lucide-react";
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
  
  // ESTADO DE EDIÇÃO
  const [editingId, setEditingId] = useState<number | null>(null);

  // Carregar notebooks do banco
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

  // Preencher formulário para edição
  const handleEditClick = (nb: Notebook) => {
    setEditingId(nb.id);
    setPatrimonio(nb.patrimonio);
    setModelo(nb.modelo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edição
  const cancelEdit = () => {
    setEditingId(null);
    setPatrimonio("");
    setModelo("");
  };

  // Cadastrar ou Atualizar notebook
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Lógica de Atualização (PUT)
        await axios.put("/api/notebooks", { id: editingId, patrimonio, modelo });
        toast.success("Notebook atualizado com sucesso!");
      } else {
        // Lógica de Criação (POST)
        await axios.post("/api/notebooks", { patrimonio, modelo });
        toast.success("Notebook cadastrado com sucesso!");
      }
      
      cancelEdit();
      loadNotebooks(); 
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  }

  // Excluir notebook
  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente remover este notebook?")) return;

    try {
      await axios.delete("/api/notebooks", { data: { id } });
      toast.success("Notebook removido");
      if (editingId === id) cancelEdit();
      loadNotebooks();
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  }

  // Função auxiliar para cores do status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISPONIVEL": return <Badge className="bg-green-500">Disponível</Badge>;
      case "EM_USO": return <Badge variant="secondary">Em Uso</Badge>;
      case "MANUTENCAO": return <Badge variant="destructive">Manutenção</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Laptop className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gestão de Notebooks</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORMULÁRIO (DINÂMICO PARA CADASTRO OU EDIÇÃO) */}
        <Card className={`md:col-span-1 h-fit border-2 transition-colors ${editingId ? "border-blue-500 bg-blue-50/10" : ""}`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {editingId ? <Pencil className="h-5 w-5 text-blue-500" /> : <PlusCircle className="h-5 w-5" />}
              {editingId ? "Editar Equipamento" : "Novo Equipamento"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patrimonio">Patrimônio</Label>
                <Input
                  id="patrimonio"
                  placeholder="Ex: NB-001"
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  placeholder="Ex: Dell Latitude 3420"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                {editingId && (
                  <Button type="button" variant="outline" className="flex-1" onClick={cancelEdit}>
                    <Undo2 className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                )}
                <Button type="submit" className="flex-[2]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingId ? "Salvar Alterações" : "Cadastrar")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* LISTAGEM DE NOTEBOOKS */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Equipamentos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                  {notebooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        Nenhum notebook encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    notebooks.map((nb) => (
                      <TableRow key={nb.id} className={editingId === nb.id ? "bg-blue-50/50" : ""}>
                        <TableCell className="font-medium">{nb.patrimonio}</TableCell>
                        <TableCell>{nb.modelo}</TableCell>
                        <TableCell>{getStatusBadge(nb.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(nb)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(nb.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
>>>>>>> origin/main
}