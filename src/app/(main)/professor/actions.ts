"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ----------------------------
// SCHEMA ATUALIZADO
// ----------------------------
const ReservaSchema = z.object({
  // --- CORREÇÃO 1: ADICIONADO 'turmaId' ---
  // Validamos a 'turmaId' que vem do form para garantir que foi selecionada.
  turmaId: z.coerce.number().min(1, "Selecione uma turma"),
  
  materiaId: z.coerce.number().min(1, "Selecione uma matéria"),
  dataAula: z.coerce.date(),
  qtdNotebooks: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1"),
  horario: z.string().min(1, "O horário é obrigatório"),
  turno: z.enum(["MANHA", "TARDE", "NOITE"]),
});

// Estado do form
export type State = {
  errors?: {
    // --- CORREÇÃO 2: ADICIONADO 'turmaId' ---
    // Isto corrige o erro do TypeScript no formulário.
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

// ----------------------------
// CRIAR RESERVA
// ----------------------------
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

  // Validar os dados recebidos
  const validatedFields = ReservaSchema.safeParse({
    // --- CORREÇÃO 3: ADICIONADO 'turmaId' ---
    // Passamos o 'turmaId' do formulário para o validador.
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

  // Note que 'turmaId' de 'validatedFields.data' não é usado
  // na lógica de criação. Usamos o 'materiaId' para encontrar o 'turmaId'
  // correto, o que é mais seguro.
  const { materiaId, dataAula, qtdNotebooks, horario, turno } =
    validatedFields.data;

  try {
    // Buscar a turma a partir da matéria (Lógica Perfeita!)
    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      select: { turmaId: true },
    });

    if (!materia) {
      return {
        message: "Matéria inválida",
        // Retorna o erro no campo 'materiaId'
        errors: { materiaId: ["Matéria não encontrada"] },
      };
    }

    const turmaId = materia.turmaId;

    // Verificar disponibilidade
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
        errors: {
          geral: [`Falha na reserva. Apenas ${disponiveis} notebooks disponíveis.`],
        },
        message: "Não há notebooks suficientes.",
      };
    }

    // Criar a reserva
    await prisma.reserva.create({
      data: {
        professorId: professor.id,
        materiaId,
        turmaId, // ← VEM AUTOMATICAMENTE DA MATÉRIA (Correto!)
        dataAula,
        qtdNotebooks,
        status: "ATIVA",
        horario,
        turno,
      },
    });

    revalidatePath("/professor");
    return { message: "Reserva criada com sucesso!", errors: {} }; // Limpa os erros
  } catch (error) {
    console.error(error);
    return {
      errors: { geral: ["Erro no servidor. Tente novamente."] },
      message: "Falha ao criar reserva.",
    };
  }
}

// ----------------------------
// CANCELAR RESERVA
// (Nenhuma alteração necessária)
// ----------------------------
// export async function cancelarReserva(id: string) {
//   try {
//     await prisma.reserva.update({
//       where: { id: Number(id) },
//       data: { status: "CANCELADA" },
//     });
    
//     // Revalida a página para a lista atualizar
//     revalidatePath("/professor"); 
//     return { success: true };
//   } catch {
//     return { success: false };
//   }
// }
// ----------------------------
// CANCELAR RESERVA (VERSÃO CORRIGIDA)
// ----------------------------
export async function cancelarReserva(id: number) { // <-- 1. Recebe 'number'
  // Validação simples
  if (typeof id !== "number" || id <= 0) {
    return { success: false, message: "ID de reserva inválido." };
  }

  try {
    await prisma.reserva.update({
      where: { id: id }, // <-- 2. Usa 'number' diretamente
      data: { status: "CANCELADA" },
    });

    revalidatePath("/professor");
    
    // 3. Retorna 'message' para o toast
    return { success: true, message: "Reserva cancelada com sucesso!" };
  } catch (error) {
    console.error(error);
    // 4. Retorna 'message' em caso de erro
    return {
      success: false,
      message: "Erro no servidor. Não foi possível cancelar.",
    };
  }
}
// Cole isto no seu arquivo 'actions.ts', junto com as outras funções

// ----------------------------
// EDITAR RESERVA
// ----------------------------
export async function editarReserva(
  id: string, // ID da reserva que estamos editando
  prevState: State,
  formData: FormData
): Promise<State> {
  // 1. AUTENTICAÇÃO
  // Garantir que o usuário está logado
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { message: "Não autorizado", errors: { geral: ["Não autorizado"] } };
  }

  // Buscar o ID do professor logado
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

  // 2. VALIDAÇÃO DOS DADOS
  // Usamos o MESMO schema da criação
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

  // Desestruturar os dados validados
  const { materiaId, dataAula, qtdNotebooks, horario, turno } =
    validatedFields.data;

  try {
    // 3. VERIFICAÇÃO DE PERMISSÃO
    // Buscar a reserva original para garantir que o professor é o "dono"
    const reservaOriginal = await prisma.reserva.findUnique({
      where: { id: Number(id) },
    });

    if (!reservaOriginal) {
      return {
        message: "Reserva não encontrada",
        errors: { geral: ["Reserva não encontrada"] },
      };
    }

    // Apenas o professor que criou pode editar
    if (reservaOriginal.professorId !== professor.id) {
      return {
        message: "Ação não permitida",
        errors: { geral: ["Você não pode editar esta reserva"] },
      };
    }

    // 4. LÓGICA DE NEGÓCIO
    // Buscar a turmaId a partir da matéria (igual à criação)
    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      select: { turmaId: true },
    });

    if (!materia) {
      return {
        message: "Matéria inválida",
        errors: { materiaId: ["Matéria não encontrada"] },
      };
    }
    const turmaId = materia.turmaId;

    // 5. VERIFICAR DISPONIBILIDADE (Lógica diferente da criação)
    // Contar o total de notebooks disponíveis
    const totalNotebooks = await prisma.notebook.count({
      where: { status: { not: "MANUTENCAO" } },
    });

    // Contar os notebooks já reservados NAQUELA DATA,
    // *EXCETO* os desta própria reserva que estamos editando.
    const notebooksJaReservados = await prisma.reserva.aggregate({
      _sum: { qtdNotebooks: true },
      where: {
        dataAula,
        status: "ATIVA",
        id: { not: Number(id) }, // <-- Ponto chave! Ignora a reserva atual da contagem.
      },
    });

    const usadosPorOutros = notebooksJaReservados._sum.qtdNotebooks || 0;
    const disponiveis = totalNotebooks - usadosPorOutros;

    // Agora sim, verificamos se a *nova* quantidade pedida cabe
    if (qtdNotebooks > disponiveis) {
      return {
        errors: {
          geral: [
            `Falha na edição. Apenas ${disponiveis} notebooks disponíveis para outros (sem contar os seus).`,
          ],
        },
        message: "Não há notebooks suficientes.",
      };
    }

    // 6. ATUALIZAR NO BANCO
    // Se tudo deu certo, atualiza a reserva
    await prisma.reserva.update({
      where: { id: Number(id) },
      data: {
        materiaId,
        turmaId,
        dataAula,
        qtdNotebooks,
        horario,
        turno,
        // O professorId e o status não mudam
      },
    });

    // 7. SUCESSO
    revalidatePath("/professor"); // Atualiza o cache da página
    return { message: "Reserva atualizada com sucesso!", errors: {} };
  } catch (error) {
    console.error(error);
    return {
      errors: { geral: ["Erro no servidor. Tente novamente."] },
      message: "Falha ao editar reserva.",
    };
  }
}