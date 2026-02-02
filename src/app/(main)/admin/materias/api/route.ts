import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nome, codigo, professorId } = await req.json();

    // 1️⃣ Verificar se o usuário existe e é PROFESSOR
    const professor = await prisma.user.findFirst({
      where: {
        id: professorId,
        role: "PROFESSOR",
      },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Usuário informado não é um professor válido" },
        { status: 400 }
      );
    }

    // 2️⃣ Criar a matéria
    const materia = await prisma.materia.create({
      data: {
        nome,
        codigo,
        professorId,
      },
    });

    return NextResponse.json(materia, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar matéria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const materias = await prisma.materia.findMany({
      orderBy: { nome: "asc" },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(materias);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

