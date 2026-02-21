import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const materias = await prisma.materia.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        codigo: true,
      },
    });

    return NextResponse.json(materias);
  } catch (error) {
    console.error("[GET_MATERIAS]", error);
    return NextResponse.json(
      { error: "Erro ao buscar matérias" },
      { status: 500 }
    );
  }
}