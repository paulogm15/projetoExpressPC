import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/* =========================
   LISTAR EMPRÉSTIMOS + ATUALIZAR ATRASADOS
========================= */
export async function GET() {
  try {
    const agora = new Date();

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

    /*  Atualizar atrasados automaticamente */
    for (const e of lista) {
      if (e.status === "ATIVO" && !e.dataDevolucao && e.reserva?.turno) {
        const retirada = new Date(e.dataRetirada);
        const limite = new Date(retirada);
        const turno = e.reserva.turno;

        if (turno === "MANHA") {
          limite.setHours(12, 0, 0, 0);
        }

        if (turno === "NOITE") {
          limite.setHours(22, 30, 0, 0);
        }

        // Se passou do horário limite → vira ATRASADO
        if (agora > limite) {
          await prisma.emprestimo.update({
            where: { id: e.id },
            data: { status: "ATRASADO" },
          });

          e.status = "ATRASADO";
        }
      }
    }

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
  console.log("POST /api/emprestimos chamado!");

  try {
    const { alunoId, patrimonio } = await req.json();

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

    /* BLOQUEAR SE ESTIVER EM MANUTENÇÃO */
    if (notebook.status === "MANUTENCAO") {
      return NextResponse.json(
        { error: "Este notebook está em manutenção e não pode ser emprestado" },
        { status: 400 }
      );
    }

    /* ---------- verificar empréstimo ativo ---------- */
    const emprestimoDuplicado = await prisma.emprestimo.findFirst({
      where: {
        notebookId: notebook.id,
        status: "ATIVO",
      },
    });

    /* 
     BLOQUEAR SE NÃO ESTIVER DISPONÍVEL */
    if (notebook.status !== "DISPONIVEL" || emprestimoDuplicado) {
      return NextResponse.json(
        { error: "Este notebook não está disponível para empréstimo" },
        { status: 400 }
      );
    }

    /* ---------- janela do dia UTC ---------- */
    const agora = new Date();
    const inicioDia = new Date(
      Date.UTC(
        agora.getUTCFullYear(),
        agora.getUTCMonth(),
        agora.getUTCDate(),
        0,
        0,
        0
      )
    );

    const fimDia = new Date(
      Date.UTC(
        agora.getUTCFullYear(),
        agora.getUTCMonth(),
        agora.getUTCDate(),
        23,
        59,
        59
      )
    );

    /* ---------- buscar reserva válida ---------- */
    const reserva = await prisma.reserva.findFirst({
      where: {
        status: "ATIVA",
        dataAula: {
          gte: inicioDia,
          lte: fimDia,
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
              where: { status: "ATIVO" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!reserva) {
      return NextResponse.json(
        { error: "Aluno não possui reserva válida para hoje" },
        { status: 400 }
      );
    }

    /* ---------- validar limite de notebooks ---------- */
    if (reserva._count.emprestimos >= reserva.qtdNotebooks) {
      return NextResponse.json(
        {
          error: `Limite de equipamentos (${reserva.qtdNotebooks}) atingido para esta reserva`,
        },
        { status: 400 }
      );
    }

    /* ---------- transação ---------- */
    const novoEmprestimo = await prisma.$transaction(async (tx) => {
      const emp = await tx.emprestimo.create({
        data: {
          alunoId: Number(alunoId),
          notebookId: notebook.id,
          reservaId: reserva.id,
          status: "ATIVO",
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

      await tx.notebook.update({
        where: { id: notebook.id },
        data: { status: "EM_USO" },
      });

      return emp;
    });

    console.log("Empréstimo criado com sucesso:", novoEmprestimo.id);

    return NextResponse.json(novoEmprestimo, { status: 201 });
  } catch (error) {
    console.error("[POST_EMPRESTIMO_FATAL]", error);
    return NextResponse.json(
      { error: "Erro interno ao processar empréstimo" },
      { status: 500 }
    );
  }
}