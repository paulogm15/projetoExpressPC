"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CameraCapture from "./components/CameraCapture";
import { Aluno } from "./types/aluno";
import { Materia } from "./types/aluno"; // Importe o tipo Materia do arquivo de tipos

type Props = {
  onSuccess: () => void;
  alunoInicial?: Aluno | null;
};

export default function AlunoForm({ onSuccess, alunoInicial }: Props) {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [cpf, setCpf] = useState("");
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiasSelecionadas, setMateriasSelecionadas] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);

  /* =========================
     BUSCAR MATÉRIAS
  ========================= */
  useEffect(() => {
    async function fetchMaterias() {
      try {
        const res = await fetch("/api/admin/materias");
        const data = await res.json();
        setMaterias(data);
      } catch (error) {
        console.error("Erro ao buscar matérias", error);
      }
    }

    fetchMaterias();
  }, []);

  /* =========================
     PREENCHER MODO EDIÇÃO
  ========================= */
  useEffect(() => {
    if (alunoInicial) {
      setNome(alunoInicial.nome);
      setMatricula(alunoInicial.matricula);
      setCpf(alunoInicial.cpf ?? "");

      setMateriasSelecionadas(
        alunoInicial.materias?.map((m) => m.materiaId) ?? []
      );

      setFotoBase64(null);
    } else {
      resetForm();
    }
  }, [alunoInicial]);

  const resetForm = () => {
    setNome("");
    setMatricula("");
    setCpf("");
    setMateriasSelecionadas([]);
    setFotoBase64(null);
  };

  const toggleMateria = (id: number) => {
    setMateriasSelecionadas((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };

  /* =========================
     SUBMIT (POST + PUT)
  ========================= */
  const handleSubmit = async () => {
    if (!nome || !matricula || !cpf) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    if (!alunoInicial && !fotoBase64) {
      alert("Capture a foto do aluno.");
      return;
    }

    setLoading(true);

    const method = alunoInicial ? "PUT" : "POST";

    try {
      const response = await fetch("/api/admin/alunos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: alunoInicial?.id,
          nome,
          matricula,
          cpf,
          fotoBase64: fotoBase64 || undefined,
          materiasIds: materiasSelecionadas,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao salvar aluno.");
        return;
      }

      resetForm();
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar aluno.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async () => {
    if (!alunoInicial) return;

    const confirmar = confirm(
      `Deseja realmente excluir o aluno ${alunoInicial.nome}?`
    );

    if (!confirmar) return;

    try {
      const response = await fetch("/api/admin/alunos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: alunoInicial.id }),
      });

      if (!response.ok) throw new Error();

      resetForm();
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir aluno.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {alunoInicial
            ? `Editando: ${alunoInicial.nome}`
            : "Cadastrar Aluno"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="Nome do aluno"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <Input
          placeholder="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
        />

        <Input
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />

        <CameraCapture onCapture={(foto) => setFotoBase64(foto)} />

        {fotoBase64 && (
          <p className="text-sm text-green-600 font-medium">
            Foto capturada ✔
          </p>
        )}

        {/* =========================
           MATÉRIAS (N:N)
        ========================= */}
        <div>
          <p className="text-sm font-semibold mb-2">
            Matérias que o aluno participa
          </p>

          <div className="grid grid-cols-2 gap-2">
            {materias.map((materia) => (
              <label
                key={materia.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={materiasSelecionadas.includes(materia.id)}
                  onChange={() => toggleMateria(materia.id)}
                />
                {materia.nome}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading
              ? "Salvando..."
              : alunoInicial
              ? "Atualizar Informações"
              : "Cadastrar Aluno"}
          </Button>

          {alunoInicial && (
            <>
              <Button variant="ghost" onClick={onSuccess}>
                Cancelar
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Excluir
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}