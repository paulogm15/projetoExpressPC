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

    if (!alunoId || !patrimonio) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      );
    }

    // Buscar notebook
    const notebook = await prisma.notebook.findUnique({
      where: { patrimonio },
    });

    if (!notebook) {
      return NextResponse.json(
        { error: "Notebook não encontrado" },
        { status: 404 }
      );
    }

    // Validar disponibilidade
    if (notebook.status !== "DISPONIVEL") {
      return NextResponse.json(
        { error: "Notebook não está disponível para empréstimo" },
        { status: 400 }
      );
    }

    // Buscar reserva ATIVA do dia
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const reserva = await prisma.reserva.findFirst({
      where: {
        status: "ATIVA",
        dataAula: {
          gte: hoje,
          lt: amanha,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!reserva) {
      return NextResponse.json(
        { error: "Nenhuma reserva ativa para hoje" },
        { status: 400 }
      );
    }

    // Criar empréstimo
    const emprestimo = await prisma.emprestimo.create({
      data: {
        alunoId,
        notebookId: notebook.id,
        reservaId: reserva.id,
      },
    });

    // Atualizar status do notebook
    await prisma.notebook.update({
      where: { id: notebook.id },
      data: { status: "EM_USO" },
    });

    console.log("✅ Empréstimo criado:", emprestimo.id);

    return NextResponse.json(emprestimo, { status: 201 });
  } catch (error) {
    console.error("[POST_EMPRESTIMO]", error);
    return NextResponse.json(
      { error: "Erro ao criar empréstimo" },
      { status: 500 }
    );
  }
}