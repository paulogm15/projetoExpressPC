import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Lista todos os notebooks ou filtra por status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const notebooks = await prisma.notebook.findMany({
      where: {
        // Se passar ?status=DISPONIVEL na URL, ele filtra automágico
        status: status ? (status as any) : undefined,
      },
      orderBy: {
        patrimonio: "asc",
      },
    });

    return NextResponse.json(notebooks);
  } catch (error) {
    console.error("Erro ao buscar notebooks:", error);
    return NextResponse.json({ error: "Erro interno ao buscar notebooks" }, { status: 500 });
  }
}

// POST: Cadastra um novo notebook
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patrimonio, modelo } = body;

    if (!patrimonio || !modelo) {
      return NextResponse.json({ error: "Patrimônio e modelo são obrigatórios" }, { status: 400 });
    }

    const novoNotebook = await prisma.notebook.create({
      data: {
        patrimonio,
        modelo,
        status: "DISPONIVEL", // Status inicial padrão conforme seu Enum
      },
    });

    return NextResponse.json(novoNotebook, { status: 201 });
  } catch (error: any) {
    // Tratamento para patrimônio duplicado (Unique Constraint)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Este patrimônio já está cadastrado" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar notebook" }, { status: 500 });
  }
}

// DELETE: Remove um notebook (opcional, via ID no corpo da requisição)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.notebook.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Notebook removido com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir notebook" }, { status: 500 });
  }
}