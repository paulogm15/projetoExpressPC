import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/* =========================
   LISTAR EMPRÉSTIMOS
========================= */
export async function GET() {
  try {
    const lista = await prisma.emprestimo.findMany({
      orderBy: { dataRetirada: "desc" },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            matricula: true,
            cpf: true,
          },
        },
        notebook: {
          select: {
            id: true,
            patrimonio: true,
            modelo: true,
            status: true,
          },
        },
        reserva: {
          include: {
            professor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            turma: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                semestre: true,
                ano: true,
              },
            },
            materia: {
              select: {
                id: true,
                nome: true,
                codigo: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(lista);
  } catch (error) {
    console.error("[GET_EMPRESTIMOS]", error);
    return NextResponse.json(
      { error: "Erro ao listar empréstimos" },
      { status: 500 }
    );
  }
}

/* =========================
   CRIAR EMPRÉSTIMO
========================= */
export async function POST(req: Request) {
  console.log("🚀 POST /api/emprestimos chamado!");

  try {
    const { alunoId, patrimonio } = await req.json();

    /* ---------- validação básica ---------- */
    if (!alunoId || !patrimonio) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      );
    }

    /* ---------- buscar notebook ---------- */
    const notebook = await prisma.notebook.findUnique({
      where: { patrimonio },
    });

    if (!notebook) {
      return NextResponse.json(
        { error: "Notebook não encontrado" },
        { status: 404 }
      );
    }

    /* ---------- REGRA: Validar se o notebook já possui empréstimo ativo ---------- */
    const emprestimoDuplicado = await prisma.emprestimo.findFirst({
      where: {
        notebookId: notebook.id,
        status: "ATIVO",
      },
    });

    if (notebook.status !== "DISPONIVEL" || emprestimoDuplicado) {
      return NextResponse.json(
        { error: "Este notebook já está em uso e não foi devolvido" },
        { status: 400 }
      );
    }

    /* ---------- janela do dia UTC ---------- */
    const agora = new Date();
    const hoje = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate(), 0, 0, 0));
    const amanha = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate(), 23, 59, 59));

    /* ---------- buscar reserva válida para o aluno ---------- */
    const reserva = await prisma.reserva.findFirst({
      where: {
        status: "ATIVA",
        dataAula: {
          gte: hoje,
          lte: amanha,
        },
        materia: {
          alunos: {
            some: {
              alunoId: Number(alunoId),
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            emprestimos: {
              where: { status: "ATIVO" }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    if (!reserva) {
      return NextResponse.json(
        { error: "Aluno não possui reserva válida para hoje" },
        { status: 400 }
      );
    }

    /* ---------- REGRA: Validar cota de equipamentos da reserva ---------- */
    // Verifica se a quantidade de notebooks já retirados atingiu o limite da reserva
    if (reserva._count.emprestimos >= reserva.qtdNotebooks) {
      return NextResponse.json(
        { error: `Limite de equipamentos (${reserva.qtdNotebooks}) atingido para esta reserva` },
        { status: 400 }
      );
    }

    /* ---------- transação: criar empréstimo + atualizar notebook ---------- */
    const novoEmprestimo = await prisma.$transaction(async (tx) => {
      // 1. Cria o registro de empréstimo
      const emp = await tx.emprestimo.create({
        data: {
          alunoId: Number(alunoId),
          notebookId: notebook.id,
          reservaId: reserva.id,
        },
        include: {
          aluno: {
            select: { id: true, nome: true, matricula: true, cpf: true },
          },
          notebook: true,
          reserva: {
            include: { professor: true, turma: true, materia: true },
          },
        },
      });

      // 2. Atualiza o status do notebook para EM_USO
      await tx.notebook.update({
        where: { id: notebook.id },
        data: { status: "EM_USO" },
      });

      return emp;
    });

    console.log("✅ Empréstimo criado com sucesso:", novoEmprestimo.id);

    return NextResponse.json(novoEmprestimo, { status: 201 });
  } catch (error) {
    console.error("[POST_EMPRESTIMO_FATAL]", error);
    return NextResponse.json(
      { error: "Erro interno ao processar empréstimo" },
      { status: 500 }
    );
  }
}