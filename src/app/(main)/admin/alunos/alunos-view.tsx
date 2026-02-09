<<<<<<< HEAD
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import AlunoForm from "./aluno-form";

type Aluno = {
  id: number;
  nome: string;
  matricula: string;
  ativo: boolean;
};

export default function AlunosView({ onBack }: { onBack: () => void }) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  const carregarAlunos = async () => {
    const res = await fetch("/api/admin/alunos");
    const data = await res.json();
    setAlunos(data);
  };

  useEffect(() => {
    carregarAlunos();
  }, []);

  return (
    <div className="space-y-6">
      <AlunoForm onSuccess={carregarAlunos} />

      <Card>
        <CardContent className="p-6">
          {alunos.map((a) => (
            <p key={a.id}>
              {a.nome} — {a.matricula}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
=======
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Importe o Input
import { Pencil, Trash2, User, Search } from "lucide-react"; // Adicionei o ícone Search
import AlunoForm from "./aluno-form";

type Aluno = {
  id: number;
  nome: string;
  matricula: string;
  ativo: boolean;
};

export default function AlunosView({ onBack }: { onBack: () => void }) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoParaEditar, setAlunoParaEditar] = useState<Aluno | null>(null);
  const [busca, setBusca] = useState(""); // Novo estado para o termo de busca

  const carregarAlunos = async () => {
    const res = await fetch("/api/admin/alunos");
    const data = await res.json();
    setAlunos(data);
  };

  const excluirAluno = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) return;
    await fetch(`/api/admin/alunos?id=${id}`, { method: "DELETE" });
    carregarAlunos();
  };

  useEffect(() => {
    carregarAlunos();
  }, []);

  // Lógica de filtragem: filtra por nome ou matrícula
  const alunosFiltrados = alunos.filter((aluno) => {
    const termo = busca.toLowerCase();
    return (
      aluno.nome.toLowerCase().includes(termo) ||
      aluno.matricula.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-4">
        <AlunoForm 
          alunoInicial={alunoParaEditar} 
          onSuccess={() => {
            carregarAlunos();
            setAlunoParaEditar(null);
          }} 
        />
      </div>

      <div className="md:col-span-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-bold">Alunos Cadastrados</CardTitle>
            
            {/* Barra de Pesquisa */}
            <div className="relative w-full max-w-sm ml-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar por nome ou matrícula..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {alunosFiltrados.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {busca ? "Nenhum aluno encontrado para esta busca." : "Nenhum aluno cadastrado."}
              </p>
            ) : (
              alunosFiltrados.map((a) => (
                <div 
                  key={a.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="text-slate-500 h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{a.nome}</p>
                      <p className="text-sm text-muted-foreground">Matrícula: {a.matricula}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setAlunoParaEditar(a)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => excluirAluno(a.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
>>>>>>> origin/main
