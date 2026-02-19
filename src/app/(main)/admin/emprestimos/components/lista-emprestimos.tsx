"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, User, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import axios from "axios";

type Emprestimo = {
  id: number;
  status: string;
  dataRetirada: string;
  dataDevolucao: string | null;
  aluno: {
    nome: string;
    matricula: string;
  };
  notebook: {
    patrimonio: string;
    modelo: string;
  };
};

export default function ListaEmprestimos({ refresh }: { refresh: number }) {
  const [lista, setLista] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    try {
      setLoading(true);
      const response = await axios.get('/api/emprestimos');
      setLista(response.data);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
      setLista([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [refresh]);

  const getStatusIcon = (status: string) => {
    if (status === "ATIVO") return <Clock className="w-3.5 h-3.5" />;
    if (status === "DEVOLVIDO") return <CheckCircle2 className="w-3.5 h-3.5" />;
    return <XCircle className="w-3.5 h-3.5" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "ATIVO") return "bg-blue-50 text-blue-700 border-blue-200";
    if (status === "DEVOLVIDO") return "bg-green-50 text-green-700 border-green-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900 mx-auto"></div>
          <p className="text-slate-500 text-sm mt-4">Carregando empréstimos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Empréstimos
          <Badge variant="secondary" className="ml-2">
            {lista.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {lista.map((emp) => (
          <div
            key={emp.id}
            className="border rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold">{emp.aluno.nome}</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Matrícula: {emp.aluno.matricula}
                </p>
              </div>

              <Badge className={`flex items-center gap-1 ${getStatusColor(emp.status)}`}>
                {getStatusIcon(emp.status)}
                {emp.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                {emp.notebook.patrimonio} • {emp.notebook.modelo}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Retirada:{" "}
                {new Date(emp.dataRetirada).toLocaleString("pt-BR")}
              </div>

              {emp.dataDevolucao && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Devolvido:{" "}
                  {new Date(emp.dataDevolucao).toLocaleString("pt-BR")}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
