"use client";

import { useState } from "react";
import { Camera, Package, LayoutGrid, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmprestimoForm from "./emprestimo-form";
import DevolucaoForm from "./devolucao-form";
import ListaEmprestimos from "./components/lista-emprestimos";
import HistoricoEmprestimos from "./components/historico-emprestimos";

export default function EmprestimosView() {
  const [modo, setModo] = useState<"emprestimo" | "devolucao" | "historico">("emprestimo");
  const [refresh, setRefresh] = useState(0);

  function carregar() {
    setRefresh(r => r + 1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid className="w-6 h-6 text-slate-700" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Sistema de Empréstimos
              </h1>
            </div>
            <p className="text-slate-600">Gerenciamento de Notebooks</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 w-fit">

          {/* EMPRÉSTIMO */}
          <button
            onClick={() => setModo("emprestimo")}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition
              ${modo === "emprestimo"
                ? "bg-slate-900 text-white shadow-lg"
                : "text-slate-600 hover:bg-slate-50"}
            `}
          >
            <Package className="w-4 h-4" />
            Empréstimo
          </button>

          {/* DEVOLUÇÃO */}
          <button
            onClick={() => setModo("devolucao")}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition
              ${modo === "devolucao"
                ? "bg-slate-900 text-white shadow-lg"
                : "text-slate-600 hover:bg-slate-50"}
            `}
          >
            <Camera className="w-4 h-4" />
            Devolução
          </button>

          {/* HISTÓRICO */}
          <button
            onClick={() => setModo("historico")}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition
              ${modo === "historico"
                ? "bg-slate-900 text-white shadow-lg"
                : "text-slate-600 hover:bg-slate-50"}
            `}
          >
            <History className="w-4 h-4" />
            Histórico
          </button>

        </div>

        {/* CONTEÚDO */}
        <div className="space-y-6">

          {modo === "emprestimo" && (
            <>
              <EmprestimoForm onSuccess={carregar} key={"e"+refresh} />
              <ListaEmprestimos refresh={refresh} />
            </>
          )}

          {modo === "devolucao" && (
            <>
              <DevolucaoForm onSuccess={carregar} key={"d"+refresh} />
              <ListaEmprestimos refresh={refresh} />
            </>
          )}

          {modo === "historico" && (
            <HistoricoEmprestimos />
          )}

        </div>
      </div>
    </div>
  );
}
