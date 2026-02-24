<<<<<<< HEAD
=======
<<<<<<< HEAD
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CameraCapture from "./components/CameraCapture";

type Props = {
  onSuccess: () => void;
};

export default function AlunoForm({ onSuccess }: Props) {
  const [nome, setNome] = useState<string>("");
  const [matricula, setMatricula] = useState<string>("");
  const [fotoBase64, setFotoBase64] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!nome || !matricula || !fotoBase64) {
      alert("Preencha todos os campos e capture a foto.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          matricula,
          fotoBase64,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar aluno");
      }

      setNome("");
      setMatricula("");
      setFotoBase64("");
      onSuccess();
    } catch (error) {
      alert("Erro ao cadastrar aluno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
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

        {/* Câmera */}
        <CameraCapture
          onCapture={(foto: string) => setFotoBase64(foto)}
        />

        {fotoBase64 && (
          <p className="text-sm text-green-600">
            Foto capturada com sucesso ✔
          </p>
        )}

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Cadastrar Aluno"}
        </Button>
      </CardContent>
    </Card>
  );
}
=======
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CameraCapture from "./components/CameraCapture";
<<<<<<< HEAD
import { Aluno } from "./types/aluno";
import { Materia } from "./types/aluno"; // Importe o tipo Materia do arquivo de tipos
=======

type Aluno = {
  id: number;
  nome: string;
  matricula: string;
};
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a

type Props = {
  onSuccess: () => void;
  alunoInicial?: Aluno | null;
};

export default function AlunoForm({ onSuccess, alunoInicial }: Props) {
<<<<<<< HEAD
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
=======
  const [nome, setNome] = useState<string>("");
  const [matricula, setMatricula] = useState<string>("");
  
  // CORREÇÃO: Permitir que o estado seja string ou null
  const [fotoBase64, setFotoBase64] = useState<string | null>(""); 
  
  const [loading, setLoading] = useState<boolean>(false);

>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
  useEffect(() => {
    if (alunoInicial) {
      setNome(alunoInicial.nome);
      setMatricula(alunoInicial.matricula);
<<<<<<< HEAD
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
=======
      setFotoBase64(""); 
    } else {
      setNome("");
      setMatricula("");
      setFotoBase64("");
    }
  }, [alunoInicial]);

  const handleSubmit = async () => {
    if (!nome || !matricula || (!alunoInicial && !fotoBase64)) {
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
      alert("Preencha os campos obrigatórios.");
      return;
    }

<<<<<<< HEAD
    if (!alunoInicial && !fotoBase64) {
      alert("Capture a foto do aluno.");
      return;
    }

    setLoading(true);

    const method = alunoInicial ? "PUT" : "POST";

    try {
      const response = await fetch("/api/admin/alunos", {
        method,
=======
    setLoading(true);

    const url = "/api/admin/alunos";
    const method = alunoInicial ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: alunoInicial?.id,
          nome,
          matricula,
<<<<<<< HEAD
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
=======
          fotoBase64: fotoBase64 || undefined,
        }),
      });

      if (!response.ok) throw new Error("Erro na requisição");

      setNome("");
      setMatricula("");
      setFotoBase64("");
      onSuccess();
    } catch (error) {
      alert("Ocorreu um erro ao salvar o aluno.");
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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

=======
  return (
    <Card>
      <CardHeader>
        <CardTitle>{alunoInicial ? `Editando: ${alunoInicial.nome}` : "Cadastrar Aluno"}</CardTitle>
      </CardHeader>
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
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

<<<<<<< HEAD
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
=======
        {/* Agora o TypeScript aceita que 'foto' seja string | null */}
        <CameraCapture onCapture={(foto) => setFotoBase64(foto)} />

        {fotoBase64 && (
          <p className="text-sm text-green-600 font-medium">Foto capturada ✔</p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Salvando..." : alunoInicial ? "Atualizar Informações" : "Cadastrar Aluno"}
          </Button>
          
          {alunoInicial && (
            <Button variant="ghost" onClick={() => onSuccess()}>
              Cancelar
            </Button>
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
          )}
        </div>
      </CardContent>
    </Card>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/main
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
