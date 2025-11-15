// app/(main)/professor/components/ListaReservas.tsx

import type { Reserva, Turma } from "@/generated/prisma";

// Tipo da reserva já com a turma incluída
type ReservaComTurma = Reserva & {
  turma: Turma;
};

interface ListaReservasProps {
  reservas: ReservaComTurma[];
}

export function ListaReservas({ reservas }: ListaReservasProps) {
  if (reservas.length === 0) {
    return (
      <p className="mt-4 text-center text-muted-foreground">
        Você ainda não possui nenhuma reserva.
      </p>
    );
  }

  // Formatação tradicional, simples e elegante
  const formatarData = (data: Date | string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(data));
  };

  return (
    <div className="mt-6 space-y-4">
      {reservas.map((reserva) => (
        <div
          key={Number(reserva.id)} // garante que o React sempre recebe um number
          className="flex items-center justify-between rounded-md border p-4"
        >
          <div>
            <p className="font-semibold">
              {reserva.turma.nome} - {reserva.qtdNotebooks} notebooks
            </p>

            <p className="text-sm text-muted-foreground">
              {formatarData(reserva.dataAula)}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              reserva.status === "ATIVA"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {reserva.status}
          </span>
        </div>
      ))}
    </div>
  );
}
