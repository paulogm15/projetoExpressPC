// app/admin/turmas/api/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { codigo, nome, semestre, ano, materiaIds } = await request.json();

    // ---------------- VALIDAÇÃO BÁSICA ----------------
    if (!codigo || !nome || !semestre || !ano) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      );
    }

    // ---------------- DUPLICIDADE ----------------
    const turmaExistente = await prisma.turma.findUnique({
      where: { codigo },
    });

    if (turmaExistente) {
      return NextResponse.json(
        { error: "Já existe uma turma com este código" },
        { status: 400 }
      );
    }

    // ---------------- CRIA TURMA ----------------
    const turma = await prisma.turma.create({
      data: {
        codigo,
        nome,
        semestre: Number(semestre),
        ano: Number(ano),

        // relação N:N opcional
        materias:
          Array.isArray(materiaIds) && materiaIds.length > 0
            ? {
                create: materiaIds.map((materiaId: number) => ({
                  materia: {
                    connect: { id: materiaId },
                  },
                })),
              }
            : undefined,
      },
      include: {
        materias: {
          include: {
            materia: true,
          },
        },
      },
    });

    // ---------------- NORMALIZA RESPOSTA ----------------
    const resposta = {
      ...turma,
      materias: turma.materias.map((tm) => tm.materia),
    };

    return NextResponse.json(resposta, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar turma:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
  
}
export async function GET() {
  try {
    const turmas = await prisma.turma.findMany({
      orderBy: { nome: 'asc' }
    });
    return NextResponse.json(turmas);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar turmas" }, { status: 500 });
  }
}