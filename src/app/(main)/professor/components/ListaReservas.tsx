// app/(main)/professor/components/ListaReservas.tsx
"use client";

// 1. IMPORTAÇÕES ATUALIZADAS
import type { Reserva, Turma, Materia } from "@/generated/prisma";
import React, { useTransition, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// NOVOS IMPORTS DE TABELA (e Badge)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Usaremos para o Status

// Importar as ACTIONS e o tipo 'State'
import { cancelarReserva, editarReserva, type State } from "../actions";

// 2. O tipo de dados não muda
type ReservaComRelacoes = Reserva & {
  turma: Turma & {
    materias: Materia[];
  };
  materia: Materia;
};

interface ListaReservasProps {
  reservas: ReservaComRelacoes[];
}

// -----------------------------------------------------------------
// COMPONENTE PRINCIPAL (A LISTA)
// -----------------------------------------------------------------
export function ListaReservas({ reservas }: ListaReservasProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedReserva, setSelectedReserva] =
    useState<ReservaComRelacoes | null>(null);

  // Função para formatar a data (não muda)
  const formatarData = (data: Date | string) =>
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeZone: "America/Sao_Paulo", // Mantém o fuso
    }).format(new Date(data));

  // Função de cancelar (não muda)
  const handleCancelar = (id: number) => {
    startTransition(async () => {
      const result = await cancelarReserva(id);
      if (result.success) {
        toast.success(result.message);
        setSelectedReserva(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  // Função de abrir modal (não muda)
  const handleAbrirModal = (reserva: ReservaComRelacoes) => {
    setSelectedReserva(reserva);
  };

  // 3. O 'return' principal agora usa a <Table>
  return (
    <>
      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.length === 0 ? (
              // Caso de "Nenhuma reserva"
              <TableRow>
                <TableCell
                  colSpan={7} // Ocupa todas as 7 colunas
                  className="text-center text-muted-foreground"
                >
                  Nenhuma reserva encontrada.
                </TableCell>
              </TableRow>
            ) : (
              // Mapeia as reservas
              reservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell>{formatarData(reserva.dataAula)}</TableCell>
                  <TableCell>{reserva.horario}</TableCell>
                  <TableCell className="font-medium">
                    {reserva.turma.nome}
                    <div className="text-xs text-muted-foreground">
                      {reserva.materia.nome}
                    </div>
                  </TableCell>
                  <TableCell>{reserva.turno}</TableCell>
                  <TableCell>{reserva.qtdNotebooks}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        reserva.status === "ATIVA" ? "default" : "secondary"
                      }
                      className={
                        reserva.status === "ATIVA"
                          ? "bg-blue-600" // Um azul para 'ATIVA'
                          : ""
                      }
                    >
                      {reserva.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-3">
                    {reserva.status === "ATIVA" && (
                      <>
                        <button
                          onClick={() => handleAbrirModal(reserva)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleCancelar(reserva.id)}
                          disabled={isPending}
                          className="text-red-600 hover:underline text-sm font-medium"
                        >
                          {isPending ? "..." : "Cancelar"}
                        </button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* O MODAL E O FORMULÁRIO DE EDIÇÃO ABAIXO NÃO MUDAM.
        Eles já estão corretos e funcionarão perfeitamente.
      */}
      <Dialog
        open={!!selectedReserva}
        onOpenChange={() => setSelectedReserva(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
          </DialogHeader>
          {selectedReserva && (
            <FormularioEdicao
              reserva={selectedReserva}
              onClose={() => setSelectedReserva(null)}
              onCancel={handleCancelar}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// -----------------------------------------------------------------
// COMPONENTE DO FORMULÁRIO DE EDIÇÃO (NÃO MUDOU)
// -----------------------------------------------------------------
interface FormularioEdicaoProps {
  reserva: ReservaComRelacoes;
  onClose: () => void;
  onCancel: (id: number) => void;
}

function FormularioEdicao({
  reserva,
  onClose,
  onCancel,
}: FormularioEdicaoProps) {
  const initialState: State = { message: null, errors: {} };
  const editarReservaComId = editarReserva.bind(null, String(reserva.id));
  const [state, dispatch] = React.useActionState(editarReservaComId, initialState);

  React.useEffect(() => {
    if (state.message && !Object.keys(state.errors ?? {}).length) {
      toast.success(state.message);
      onClose();
    }
  }, [state, onClose]);

  return (
    <form action={dispatch} className="grid gap-4">
      {/* Campos ocultos necessários */}
      <input type="hidden" name="turmaId" value={reserva.turmaId} />
      <input type="hidden" name="horario" value={reserva.horario} />
      <input type="hidden" name="turno" value={reserva.turno} />

      {/* Data da Aula */}
      <div>
        <label className="block text-sm font-medium">Data da Aula</label>
        <Input
          name="dataAula"
          type="date"
          defaultValue={reserva.dataAula.toISOString().slice(0, 10)}
        />
        {state.errors?.dataAula && (
          <p className="text-sm text-red-500 mt-1">
            {state.errors.dataAula[0]}
          </p>
        )}
      </div>

      {/* Matéria */}
      <div>
        <label className="block text-sm font-medium">Matéria</label>
        <Select name="materiaId" defaultValue={String(reserva.materiaId)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a matéria" />
          </SelectTrigger>
          <SelectContent>
            {reserva.turma.materias.map((mat) => (
              <SelectItem key={mat.id} value={String(mat.id)}>
                {mat.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.materiaId && (
          <p className="text-sm text-red-500 mt-1">
            {state.errors.materiaId[0]}
          </p>
        )}
      </div>

      {/* Quantidade */}
      <div>
        <label className="block text-sm font-medium">
          Quantidade de Notebooks
        </label>
        <Input
          name="qtdNotebooks"
          type="number"
          min={1}
          defaultValue={reserva.qtdNotebooks}
        />
        {state.errors?.qtdNotebooks && (
          <p className="text-sm text-red-500 mt-1">
            {state.errors.qtdNotebooks[0]}
          </p>
        )}
      </div>

      {/* Erro Geral */}
      {state.errors?.geral && (
        <p className="text-sm text-red-500">{state.errors.geral[0]}</p>
      )}

      {/* Botões do Footer */}
      <DialogFooter className="flex justify-between">
        <Button
          variant="destructive"
          type="button"
          onClick={() => onCancel(reserva.id)}
        >
          Cancelar Reserva
        </Button>
        <Button type="submit">Salvar Alterações</Button>
      </DialogFooter>
    </form>
  );
}