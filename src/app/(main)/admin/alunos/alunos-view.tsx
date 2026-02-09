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
