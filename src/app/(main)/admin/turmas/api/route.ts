// app/admin/turmas/api/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. BUSCAR TURMAS (GET)
export async function GET() {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
        materias: {
          include: {
            materia: true,
          },
        },
      },
      orderBy: { nome: 'asc' }
    });
    return NextResponse.json(turmas);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar turmas" }, { status: 500 });
  }
}

// 2. CRIAR TURMA (POST)
export async function POST(request: NextRequest) {
  try {
    const { codigo, nome, semestre, ano } = await request.json();

    if (!codigo || !nome || !semestre || !ano) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const turmaExistente = await prisma.turma.findUnique({ where: { codigo } });
    if (turmaExistente) {
      return NextResponse.json({ error: "Já existe uma turma com este código" }, { status: 400 });
    }

    const turma = await prisma.turma.create({
      data: {
        codigo,
        nome,
        semestre: Number(semestre),
        ano: Number(ano),
      },
    });

    return NextResponse.json(turma, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// 3. ATUALIZAR TURMA (PUT) - ADICIONADO PARA RESOLVER O ERRO 405
export async function PUT(request: NextRequest) {
  try {
    const { id, codigo, nome, semestre, ano } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID da turma é obrigatório" }, { status: 400 });
    }

    const turmaAtualizada = await prisma.turma.update({
      where: { id: Number(id) },
      data: {
        codigo,
        nome,
        semestre: Number(semestre),
        ano: Number(ano),
      },
    });

    return NextResponse.json(turmaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);
    return NextResponse.json({ error: "Erro ao atualizar turma" }, { status: 500 });
  }
}

// 4. EXCLUIR TURMA (DELETE) - ADICIONADO
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.turma.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Turma excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    return NextResponse.json({ error: "Erro ao excluir turma" }, { status: 500 });
  }
}