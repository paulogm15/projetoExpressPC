// app/(main)/professor/page.tsx

import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import prisma from "@/lib/prisma";
import { FormularioReserva } from "./components/FormularioReserva";
import { ListaReservas } from "./components/ListaReservas";

export const metadata: Metadata = {
  title: "Painel do Professor",
};

export default async function ProfessorPage() {
  const session = await getServerSession();
  const user = session?.user;

  // Proteção básica
  if (!user || !user.email) {
    redirect("/sign-in");
  }

  // Garantia de papel
  if (user.role !== "PROFESSOR") {
    redirect("/unauthorized");
  }

  // Busca do professor por email
  const professor = await prisma.user.findUnique({
    where: { email: user.email },
  });

  // Caso o professor não exista no banco
  if (!professor) {
    console.error(
      `Usuário autenticado (${user.email}) não existe na tabela 'User'.`
    );

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-red-600">Erro</h1>
        <p className="text-muted-foreground">
          O seu usuário ({user.email}) não está cadastrado como professor no
          sistema. Solicite assistência ao administrador.
        </p>
      </main>
    );
  }

  // --------------------------
  // BUSCA DAS TURMAS
  // --------------------------
  const turmas = await prisma.turma.findMany({
    where: { professorId: professor.id }, // agora é string
    orderBy: { nome: "asc" },
  });

  // --------------------------
  // BUSCA DAS RESERVAS
  // --------------------------
  const reservas = await prisma.reserva.findMany({
    where: { professorId: professor.id },
    include: {
      turma: true,
    },
    orderBy: { dataAula: "desc" },
  });

  // --------------------------
  // RENDERIZAÇÃO DA PÁGINA
  // --------------------------
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Painel do Professor</h1>
          <p className="text-muted-foreground">Bem-vindo, {user.name}!</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Formulário */}
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm md:col-span-1">
            <h2 className="text-lg font-semibold">Nova Reserva</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Solicite notebooks para sua aula.
            </p>
            <FormularioReserva turmas={turmas} />
          </div>

          {/* Lista de reservas */}
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold">Minhas Reservas</h2>
            <ListaReservas reservas={reservas} />
          </div>
        </div>
      </div>
    </main>
  );
}
