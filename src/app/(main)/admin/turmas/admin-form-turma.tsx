"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Materia = {
  id: number;
  nome: string;
};

type TurmaFormProps = {
  materias?: Materia[];
};

export default function AdminFormTurma({ materias = [] }: TurmaFormProps) {
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [semestre, setSemestre] = useState(1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [materiaIds, setMateriaIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function toggleMateria(id: number) {
    setMateriaIds((current) =>
      current.includes(id)
        ? current.filter((m) => m !== id)
        : [...current, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/admin/turmas/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo,
          nome,
          semestre,
          ano,
          materiaIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar turma");
      }

      setSuccess("Turma criada com sucesso.");
      setCodigo("");
      setNome("");
      setSemestre(1);
      setAno(new Date().getFullYear());
      setMateriaIds([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border rounded-xl p-6 bg-white shadow-sm"
    >
      <h2 className="text-xl font-semibold">Cadastro de Turma</h2>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        </div>

        <div>
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div>
          <Label>Semestre</Label>
          <select
            value={semestre}
            onChange={(e) => setSemestre(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>

        <div>
          <Label>Ano</Label>
          <Input
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label>Matérias</Label>

        {materias.length === 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Nenhuma matéria cadastrada.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {materias.map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-2 border rounded-md p-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={materiaIds.includes(m.id)}
                onChange={() => toggleMateria(m.id)}
              />
              {m.nome}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Salvando..." : "Cadastrar Turma"}
      </Button>
    </form>
  );
}
