"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type StatusCalculado = "ATIVO" | "DEVOLVIDO" | "ATRASADO";

type Emprestimo = {
  id: number;
  status: StatusCalculado;
  dataRetirada: string;
  dataDevolucao?: string;

  aluno: {
    nome: string;
    matricula: string;
  };

  notebook: {
    patrimonio: string;
    modelo: string;
  };

  reserva: {
    professor: {
      name: string;
    };
    turma: {
      codigo: string; // ← campo adicionado
      nome: string;
      turno: "MANHA" | "NOITE";
    };
  };
};

export default function HistoricoEmprestimos() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("TODOS");

  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 60000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await axios.get("/api/emprestimos");
        setEmprestimos(res.data);
      } catch (error) {
        console.error("Erro ao carregar empréstimos:", error);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  function calcularTempoUso(e: Emprestimo) {
    const inicio = new Date(e.dataRetirada);
    const fim = e.dataDevolucao ? new Date(e.dataDevolucao) : agora;
    const diffMs = fim.getTime() - inicio.getTime();
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}min`;
  }

  const emprestimosFiltrados = useMemo(() => {
    return emprestimos.filter((e) => {
      const matchBusca =
        e.aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
        e.aluno.matricula.toLowerCase().includes(busca.toLowerCase()) ||
        e.notebook.patrimonio.toLowerCase().includes(busca.toLowerCase()) ||
        e.reserva.turma.codigo.toLowerCase().includes(busca.toLowerCase()); // ← busca por código também

      const matchFiltro = filtro === "TODOS" ? true : e.status === filtro;

      return matchBusca && matchFiltro;
    });
  }, [emprestimos, busca, filtro]);

  const total = emprestimos.length;
  const ativos = emprestimos.filter((e) => e.status === "ATIVO").length;
  const devolvidos = emprestimos.filter((e) => e.status === "DEVOLVIDO").length;
  const atrasados = emprestimos.filter((e) => e.status === "ATRASADO").length;

  const statusLabel: Record<StatusCalculado, string> = {
    ATIVO: "Ativo",
    DEVOLVIDO: "Devolvido",
    ATRASADO: "Atrasado",
  };

  const statusStyle: Record<StatusCalculado, string> = {
    ATIVO: "bg-orange-100 text-orange-600",
    DEVOLVIDO: "bg-green-100 text-green-600",
    ATRASADO: "bg-red-600 text-white animate-pulse shadow-lg shadow-red-400/40",
  };

  if (loading) {
    return <div className="p-10 text-center">Carregando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 space-y-6">
      <h1 className="text-2xl font-semibold">Histórico de Empréstimos</h1>

      {/* CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 text-sm">Ativos</p>
          <p className="text-2xl font-bold text-orange-500">{ativos}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 text-sm">Devolvidos</p>
          <p className="text-2xl font-bold text-green-600">{devolvidos}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 text-sm">Atrasados</p>
          <p className="text-2xl font-bold text-red-600">{atrasados}</p>
        </div>
      </div>

      {/* BUSCA + FILTRO */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por nome, matrícula, patrimônio ou turma..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
        />
        {["TODOS", "ATIVO", "DEVOLVIDO", "ATRASADO"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              filtro === tipo
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {tipo === "TODOS"
              ? "Todos"
              : tipo === "ATIVO"
              ? "Ativos"
              : tipo === "DEVOLVIDO"
              ? "Devolvidos"
              : "Atrasados"}
          </button>
        ))}
      </div>

      {/* TABELA */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Patrimônio</th>
              <th className="p-3 text-left">Aluno</th>
              <th className="p-3 text-left">Professor</th>
              <th className="p-3 text-left">Turma</th>
              <th className="p-3 text-left">Data Empréstimo</th>
              <th className="p-3 text-left">Tempo de Uso</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {emprestimosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Nenhum empréstimo encontrado.
                </td>
              </tr>
            ) : (
              emprestimosFiltrados.map((e) => (
                <tr
                  key={e.id}
                  className={`border-t hover:bg-gray-50 ${
                    e.status === "ATRASADO" ? "bg-red-50" : ""
                  }`}
                >
                  <td className="p-3">{e.notebook.patrimonio}</td>
                  <td className="p-3">
                    <div>{e.aluno.nome}</div>
                    <div className="text-xs text-gray-400">{e.aluno.matricula}</div>
                  </td>
                  <td className="p-3">{e.reserva.professor.name}</td>

                  {/* ← TURMA: código em destaque + nome abaixo */}
                  <td className="p-3">
                    <div className="font-medium">{e.reserva.turma.codigo}</div>
                    <div className="text-xs text-gray-400">{e.reserva.turma.nome}</div>
                  </td>

                  <td className="p-3">
                    {new Date(e.dataRetirada).toLocaleString("pt-BR")}
                  </td>
                  <td className="p-3 font-medium">{calcularTempoUso(e)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[e.status]}`}
                    >
                      {statusLabel[e.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}