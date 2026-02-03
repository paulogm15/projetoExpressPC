"use client";

import type { Reserva, Turma, Materia } from "@/generated/prisma";
import React, { useTransition, useState, useEffect } from "react"; // Importe useEffect aqui
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// CORREÇÃO DOS IMPORTS DE AÇÕES
import { cancelarReserva, editarReserva, type State } from "../actions";

// Tipo estrito para os dados que chegam formatados da página
export type ReservaComRelacoes = Reserva & {
  turma: Turma & {
    materias: Materia[];
  };
  materia: Materia;
};

interface ListaReservasProps {
  reservas: ReservaComRelacoes[];
}

export function ListaReservas({ reservas }: ListaReservasProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedReserva, setSelectedReserva] = useState<ReservaComRelacoes | null>(null);

  const formatarData = (data: Date | string) =>
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeZone: "UTC",
    }).format(new Date(data));

  const handleCancelar = (id: number) => {
    if (!confirm("Deseja realmente cancelar esta reserva?")) return;
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Turma / Matéria</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhuma reserva encontrada.
                </TableCell>
              </TableRow>
            ) : (
              reservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell>{formatarData(reserva.dataAula)}</TableCell>
                  <TableCell>{reserva.horario} ({reserva.turno})</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{reserva.turma.nome}</div>
                    <div className="text-xs text-muted-foreground">{reserva.materia.nome}</div>
                  </TableCell>
                  <TableCell>{reserva.qtdNotebooks}</TableCell>
                  <TableCell>
                    <Badge variant={reserva.status === "ATIVA" ? "default" : "secondary"}>
                      {reserva.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {reserva.status === "ATIVA" && (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedReserva(reserva)}>
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleCancelar(reserva.id)}
                          disabled={isPending}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedReserva} onOpenChange={() => setSelectedReserva(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Reserva</DialogTitle></DialogHeader>
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

function FormularioEdicao({ reserva, onClose, onCancel }: { 
  reserva: ReservaComRelacoes; 
  onClose: () => void; 
  onCancel: (id: number) => void 
}) {
  const initialState: State = { message: null, errors: {} };
  const editarReservaComId = editarReserva.bind(null, String(reserva.id));
  const [state, dispatch] = React.useActionState(editarReservaComId, initialState);

  useEffect(() => {
    if (state.message && Object.keys(state.errors ?? {}).length === 0) {
      toast.success(state.message);
      onClose();
    }
  }, [state, onClose]);

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="turmaId" value={reserva.turmaId} />
      {/* CORREÇÃO: Adicionados campos ocultos que o actions.ts espera para validar o schema */}
      <input type="hidden" name="horario" value={reserva.horario} />
      <input type="hidden" name="turno" value={reserva.turno} />

      <div>
        <label className="text-sm font-medium">Data da Aula</label>
        <Input 
          name="dataAula" 
          type="date" 
          defaultValue={new Date(reserva.dataAula).toISOString().split('T')[0]} 
        />
        {state.errors?.dataAula && <p className="text-xs text-red-500 mt-1">{state.errors.dataAula[0]}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Matéria</label>
        <Select name="materiaId" defaultValue={String(reserva.materiaId)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {reserva.turma.materias.map((mat) => (
              <SelectItem key={mat.id} value={String(mat.id)}>{mat.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.materiaId && <p className="text-xs text-red-500 mt-1">{state.errors.materiaId[0]}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Quantidade de Notebooks</label>
        <Input name="qtdNotebooks" type="number" defaultValue={reserva.qtdNotebooks} />
        {state.errors?.qtdNotebooks && <p className="text-xs text-red-500 mt-1">{state.errors.qtdNotebooks[0]}</p>}
      </div>

      {state.errors?.geral && <p className="text-sm text-red-500">{state.errors.geral[0]}</p>}

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>Voltar</Button>
        <Button type="submit">Salvar Alterações</Button>
      </DialogFooter>
    </form>
  );
}