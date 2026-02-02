"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminFormMateria() {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setLoading(true);

    try {
      const response = await fetch("/admin/materias/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, codigo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cadastrar matéria");
      }

      setSucesso("Matéria cadastrada com sucesso");
      setNome("");
      setCodigo("");
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border rounded-xl p-6 bg-white shadow-sm"
    >
      <h2 className="text-xl font-semibold">Cadastro de Matéria</h2>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      {sucesso && <p className="text-sm text-green-600">{sucesso}</p>}

      <div>
        <Label>Nome da Matéria</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>

      <div>
        <Label>Código</Label>
        <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Salvando..." : "Cadastrar Matéria"}
      </Button>
    </form>
  );
}
