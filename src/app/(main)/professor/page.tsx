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

  if (!user || !user.email) redirect("/sign-in");
  if (user.role !== "PROFESSOR") redirect("/unauthorized");

  const professor = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!professor) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-12">
        <h1 className="text-xl font-bold text-red-600">Perfil não encontrado</h1>
        <p className="text-muted-foreground">O e-mail {user.email} não está vinculado a um professor.</p>
      </main>
    );
  }

  // Busca das Turmas formatadas
  const turmasRaw = await prisma.turma.findMany({
    where: {
      materias: { some: { materia: { professorId: professor.id } } },
    },
    include: {
      materias: { include: { materia: true } },
    },
    orderBy: { nome: "asc" },
  });

  const turmasFormatadas = turmasRaw.map((t) => ({
    ...t,
    materias: t.materias.map((tm) => tm.materia),
  }));

  // Busca das Reservas formatadas
  const reservasRaw = await prisma.reserva.findMany({
    where: { professorId: professor.id },
    include: {
      turma: {
        include: { materias: { include: { materia: true } } }
      },
      materia: true,
    },
    orderBy: { dataAula: "desc" },
  });

  const reservasFormatadas = reservasRaw.map((r) => ({
    ...r,
    turma: {
      ...r.turma,
      materias: r.turma.materias.map((tm) => tm.materia),
    },
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="space-y-8">
        <div className="flex flex-col space-y-2 border-b pb-6">
          <h1 className="text-3xl font-bold">Painel do Professor</h1>
          <p className="text-muted-foreground">Olá, {user.name}.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="sticky top-6 rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Nova Reserva</h2>
              <FormularioReserva turmas={turmasFormatadas} />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Minhas Reservas</h2>
              <ListaReservas reservas={reservasFormatadas} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}