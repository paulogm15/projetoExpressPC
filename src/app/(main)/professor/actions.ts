"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ReservaSchema = z.object({
  turmaId: z.coerce.number().min(1, "Selecione uma turma"),
  materiaId: z.coerce.number().min(1, "Selecione uma matéria"),
  dataAula: z.coerce.date(),
  qtdNotebooks: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1"),
  horario: z.string().min(1, "O horário é obrigatório"),
  turno: z.enum(["MANHA", "TARDE", "NOITE"]),
});

export type State = {
  errors?: {
    turmaId?: string[];
    materiaId?: string[];
    dataAula?: string[];
    qtdNotebooks?: string[];
    horario?: string[];
    turno?: string[];
    geral?: string[];
  };
  message: string | null;
};

export async function criarReserva(
  prevState: State,
  formData: FormData
): Promise<State> {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { message: "Não autorizado", errors: { geral: ["Não autorizado"] } };
  }

  const professor = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!professor) {
    return {
      message: "Professor não encontrado",
      errors: { geral: ["Professor não vinculado"] },
    };
  }

  const validatedFields = ReservaSchema.safeParse({
    turmaId: formData.get("turmaId"),
    materiaId: formData.get("materiaId"),
    dataAula: formData.get("dataAula"),
    qtdNotebooks: formData.get("qtdNotebooks"),
    horario: formData.get("horario"),
    turno: formData.get("turno"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Verifique os campos.",
    };
  }

  const { materiaId, dataAula, qtdNotebooks, horario, turno } = validatedFields.data;

  try {
    // CORREÇÃO: Busca as turmas vinculadas à matéria através da tabela intermediária
    const materiaComTurmas = await prisma.materia.findUnique({
      where: { id: materiaId },
      include: {
        turmas: true, // Traz registros de TurmaMateria
      },
    });

    if (!materiaComTurmas || materiaComTurmas.turmas.length === 0) {
      return {
        message: "Matéria inválida ou sem turmas vinculadas",
        errors: { materiaId: ["Matéria não encontrada em nenhuma turma"] },
      };
    }

    // Como uma reserva é para 1 turma, pegamos o ID da primeira turma vinculada
    const turmaId = materiaComTurmas.turmas[0].turmaId;

    const totalNotebooks = await prisma.notebook.count({
      where: { status: { not: "MANUTENCAO" } },
    });

    const notebooksJaReservados = await prisma.reserva.aggregate({
      _sum: { qtdNotebooks: true },
      where: { dataAula, status: "ATIVA" },
    });

    const usados = notebooksJaReservados._sum.qtdNotebooks || 0;
    const disponiveis = totalNotebooks - usados;

    if (qtdNotebooks > disponiveis) {
      return {
        errors: { geral: [`Falha na reserva. Apenas ${disponiveis} notebooks disponíveis.`] },
        message: "Não há notebooks suficientes.",
      };
    }

    await prisma.reserva.create({
      data: {
        professorId: professor.id,
        materiaId,
        turmaId, 
        dataAula,
        qtdNotebooks,
        status: "ATIVA",
        horario,
        turno,
      },
    });

    revalidatePath("/professor");
    return { message: "Reserva criada com sucesso!", errors: {} };
  } catch (error) {
    console.error(error);
    return {
      errors: { geral: ["Erro no servidor. Tente novamente."] },
      message: "Falha ao criar reserva.",
    };
  }
}

export async function cancelarReserva(id: number) {
  if (typeof id !== "number" || id <= 0) {
    return { success: false, message: "ID de reserva inválido." };
  }
  try {
    await prisma.reserva.update({
      where: { id: id },
      data: { status: "CANCELADA" },
    });
    revalidatePath("/professor");
    return { success: true, message: "Reserva cancelada com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro no servidor ao cancelar." };
  }
}

export async function editarReserva(
  id: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  const session = await getServerSession();
  if (!session?.user?.email) return { message: "Não autorizado", errors: { geral: ["Não autorizado"] } };

  const professor = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!professor) return { message: "Professor não encontrado", errors: { geral: ["Professor não vinculado"] } };

  const validatedFields = ReservaSchema.safeParse({
    turmaId: formData.get("turmaId"),
    materiaId: formData.get("materiaId"),
    dataAula: formData.get("dataAula"),
    qtdNotebooks: formData.get("qtdNotebooks"),
    horario: formData.get("horario"),
    turno: formData.get("turno"),
  });

  if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors, message: "Erro de validação." };

  const { materiaId, dataAula, qtdNotebooks, horario, turno } = validatedFields.data;

  try {
    const reservaOriginal = await prisma.reserva.findUnique({ where: { id: Number(id) } });
    if (!reservaOriginal || reservaOriginal.professorId !== professor.id) {
      return { message: "Não permitido", errors: { geral: ["Reserva não encontrada ou sem permissão"] } };
    }

    // CORREÇÃO: Mesma lógica de busca de turmaId da criação
    const materiaComTurmas = await prisma.materia.findUnique({
      where: { id: materiaId },
      include: { turmas: true },
    });

    if (!materiaComTurmas || materiaComTurmas.turmas.length === 0) {
      return { message: "Matéria inválida", errors: { materiaId: ["Sem turmas"] } };
    }
    const turmaId = materiaComTurmas.turmas[0].turmaId;

    const totalNotebooks = await prisma.notebook.count({ where: { status: { not: "MANUTENCAO" } } });
    const notebooksJaReservados = await prisma.reserva.aggregate({
      _sum: { qtdNotebooks: true },
      where: { dataAula, status: "ATIVA", id: { not: Number(id) } },
    });

    const usadosPorOutros = notebooksJaReservados._sum.qtdNotebooks || 0;
    const disponiveis = totalNotebooks - usadosPorOutros;

    if (qtdNotebooks > disponiveis) return { errors: { geral: [`Apenas ${disponiveis} notebooks disponíveis.`] }, message: "Quantidade insuficiente." };

    await prisma.reserva.update({
      where: { id: Number(id) },
      data: { materiaId, turmaId, dataAula, qtdNotebooks, horario, turno },
    });

    revalidatePath("/professor");
    return { message: "Reserva atualizada!", errors: {} };
  } catch (error) {
    console.error(error);
    return { errors: { geral: ["Erro no servidor."] }, message: "Falha ao editar." };
  }
}