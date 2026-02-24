"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type Aluno = {
  id: string;
  nome: string;
  matricula: string;
  ativo: boolean;
  createdAt: string;
};

export default function AlunoList() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlunos = async () => {
    try {
      const response = await fetch("/api/admin/alunos");
      const data = await response.json();
      setAlunos(data);
    } catch (error) {
      console.error("Erro ao buscar alunos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  if (loading) {
    return <p>Carregando alunos...</p>;
  }

  if (alunos.length === 0) {
    return <p>Nenhum aluno cadastrado.</p>;
  }

  return (
    <div className="space-y-4">
      {alunos.map((aluno) => (
        <Card key={aluno.id}>
          <CardContent className="p-4 space-y-1">
            <p><strong>Nome:</strong> {aluno.nome}</p>
            <p><strong>Matrícula:</strong> {aluno.matricula}</p>
            <p>
              <strong>Status:</strong>{" "}
              {aluno.ativo ? "Ativo" : "Inativo"}
            </p>
            <p className="text-sm text-muted-foreground">
              Cadastrado em{" "}
              {new Date(aluno.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
