// app/(main)/professor/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session"; // Para segurança
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Schema de validação dos dados do formulário
const ReservaSchema = z.object({
  turmaId: z.coerce.number().min(1, "Selecione uma turma"),

  // --- CORREÇÃO AQUI ---
  // z.coerce.date() não aceita argumentos.
  // Ele já falha automaticamente se a data for inválida ou vazia.
  dataAula: z.coerce.date(),

  qtdNotebooks: z.coerce
    .number() // <- Removemos o objeto daqui
    .min(1, "A quantidade deve ser pelo menos 1"),
  // --- FIM DA CORREÇÃO ---
});

// 2. Tipo para o estado do formulário (erros, sucesso)
export type State = {
  errors?: {
    turmaId?: string[];
    dataAula?: string[];
    qtdNotebooks?: string[];
    geral?: string[]; // Erros de lógica (ex: sem notebooks)
  };
  message: string | null; // Mensagem de sucesso ou falha
};

// 3. A Server Action
export async function criarReserva(
  prevState: State,
  formData: FormData,
): Promise<State> {
  // 4. SEGURANÇA: Buscar o usuário (com ID Int) pela sessão
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { message: "Não autorizado", errors: { geral: ["Não autorizado"] } };
  }

  const professor = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }, // Só precisamos do ID (Int)
  });

  if (!professor) {
    return {
      message: "Professor não encontrado",
      errors: { geral: ["Professor não vinculado"] },
    };
  }

  // 5. Validar os dados do formulário
  const validatedFields = ReservaSchema.safeParse({
    turmaId: formData.get("turmaId"),
    dataAula: formData.get("dataAula"),
    qtdNotebooks: formData.get("qtdNotebooks"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Verifique os campos.",
    };
  }

  const { turmaId, dataAula, qtdNotebooks } = validatedFields.data;

  // 6. LÓGICA DE NEGÓCIO: Verificar disponibilidade
  try {
    const totalNotebooks = await prisma.notebook.count({
      where: { status: { not: "MANUTENCAO" } },
    });

    const notebooksJaReservados = await prisma.reserva.aggregate({
      _sum: {
        qtdNotebooks: true,
      },
      where: {
        dataAula: dataAula,
        status: "ATIVA",
      },
    });

    const notebooksUsados = notebooksJaReservados._sum.qtdNotebooks || 0;
    const notebooksDisponiveis = totalNotebooks - notebooksUsados;

    if (qtdNotebooks > notebooksDisponiveis) {
      return {
        errors: {
          geral: [
            `Falha na reserva. Há apenas ${notebooksDisponiveis} notebooks disponíveis para esta data.`,
          ],
        },
        message: "Não há notebooks suficientes.",
      };
    }

    // 7. SUCESSO: Criar a Reserva
    await prisma.reserva.create({
      data: {
        professorId: professor.id, // ID numérico (Int) do professor
        turmaId: turmaId,
        dataAula: dataAula,
        qtdNotebooks: qtdNotebooks,
        status: "ATIVA",
      },
    });

    // 8. Revalidar a página para mostrar a nova reserva na lista
    revalidatePath("/professor");
    return { message: "Reserva criada com sucesso!" };
  } catch (error) {
    console.error(error);
    return {
      errors: {
        geral: ["Ocorreu um erro no servidor. Tente novamente."],
      },
      message: "Erro ao criar reserva.",
    };
  }
}
// ---------------------------
// CANCELAR RESERVA
// ---------------------------
export async function cancelarReserva(id: string) {
  try {
    await prisma.reserva.update({
      where: { id: Number(id) },
      data: {
        status: "CANCELADA",
      },
    });

    // Atualiza a página
    revalidatePath("/professor");

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    return { success: false };
  }
}
