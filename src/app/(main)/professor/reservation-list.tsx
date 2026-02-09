"use client";

import { toast } from "sonner";
import type { Reserva, Turma } from "@/generated/prisma";
import { cancelarReserva } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

// O tipo da reserva com a turma incluída
type ReservaComTurma = Reserva & {
  turma: Turma;
};

interface ReservationListProps {
  reservas: ReservaComTurma[];
}

export function ReservationList({ reservas }: ReservationListProps) {
  
  const handleCancel = async (reservaId: number) => {
    if (confirm("Tem certeza que deseja cancelar esta reserva?")) {
      const result = await cancelarReserva(reservaId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  const ativas = reservas.filter(r => r.status === 'ATIVA');

  if (ativas.length === 0) {
    return (
      <p className="text-muted-foreground">
        Você não possui reservas ativas.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {ativas.map((reserva) => (
        <li
          key={reserva.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4"
        >
          <div className="mb-2 sm:mb-0">
            <p className="font-semibold">{reserva.turma.nome}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(reserva.dataAula).toLocaleDateString("pt-BR", {
                timeZone: "UTC", // Garante que a data não mude por fuso
              })}
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <Badge>{reserva.qtdNotebooks} notebooks</Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCancel(reserva.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}